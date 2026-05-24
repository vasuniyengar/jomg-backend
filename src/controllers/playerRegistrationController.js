import models from "../models/Associations.js";

import { Op } from "sequelize";

import sequelize from "../config/database.js";

const {
  PlayerRegistration,
  Tournament,
  Bracket,
  User,
  Event,
  Pool,
  TeamPlayer,
  Match,
  Round,
} = models;

const registerForBracket = async (req, res) => {
  try {
    const playerId = req.user.id;
    const roles = req.user.roles;

    if (!roles || !roles.includes("player")) {
      return res.status(403).json({
        error: true,
        code: 403,
        message: "access denied",
      });
    }

    const { tournamentId, bracketId } = req.body;

    // Check player exists
    const player = await User.findByPk(playerId);
    if (!player) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Player not found",
      });
    }

    // Check tournament and bracket
    const tournament = await Tournament.findByPk(tournamentId);

    if (["ongoing", "completed"].includes(tournament.status)) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "registration closed.Tournament already started",
      });
    }

    const bracket = await Bracket.findByPk(bracketId, {
      include: [{ model: Event }],
    });

    if (!tournament || !bracket) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Tournament or bracket not found",
      });
    }

    const poolsExist = await Pool.count({ where: { tournamentId, bracketId } });

    if (poolsExist > 0) {
      // Pools exist  round robin created  block registration
      return res.status(400).json({
        message: "Registration closed. Round Robin has already been created.",
      });
    }

    const eventName = bracket.Event?.eventName?.toLowerCase() || "";

    // Gender validation
    if (/\bmen\b/.test(eventName) && player.gender.toLowerCase() !== "male") {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Only male players can register for this event",
      });
    }

    if (
      /\bwomen\b/.test(eventName) &&
      player.gender.toLowerCase() !== "female"
    ) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Only female players can register for this event",
      });
    }

    // Check if already registered
    const existing = await PlayerRegistration.findOne({
      where: { playerId, tournamentId, bracketId },
    });

    if (existing) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Player already registered for this bracket",
      });
    }

    // Capacity check
    const existingRegistrations = await PlayerRegistration.count({
      where: { bracketId },
    });

    // Determine how many players fit per team
    let playersPerTeam = 1; // default singles
    if (eventName.includes("double")) playersPerTeam = 2;
    if (eventName.includes("mixed")) playersPerTeam = 2;
    if (eventName.includes("triple")) playersPerTeam = 3; // optional

    const currentTeams = Math.floor(existingRegistrations / playersPerTeam);
    const remainderPlayers = existingRegistrations % playersPerTeam;
    const maxTeams = bracket.maxTeams;

    // If we already have all full teams and no space for new one
    if (currentTeams >= maxTeams && remainderPlayers === 0) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: `Registration full for this bracket. (${currentTeams}/${maxTeams} Teams)`,
      });
    }
    // Create new registration
    const registration = await PlayerRegistration.create({
      playerId,
      tournamentId,
      bracketId,
      status: "registered",
      paymentStatus: "paid",
    });

    return res.status(201).json({
      error: false,
      code: 201,
      message: "Player successfully registered for this bracket",
      data: registration,
      tournament,
      bracket,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

const registeredPlayersForTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { checkInStatus, paymentStatus, gender, search, bracketId } =
      req.query;

    // console.log("check", checkInStatus);
    // console.log("pay", paymentStatus), console.log("gender", gender);
    // console.log("usersearch", search);
    // console.log("bracketId", bracketId);

    // Check if tournament exists
    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Tournament doesn't exist!",
      });
    }

    // Build user filter
    const userWhere = {};
    if (gender) userWhere.gender = gender;
    if (search) {
      userWhere[Op.or] = [
        { firstname: { [Op.like]: `%${search}%` } },
        { lastname: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }

    // Build registration filter
    const registrationWhere = { tournamentId };
    if (checkInStatus) registrationWhere.checkInStatus = checkInStatus;
    if (paymentStatus) registrationWhere.paymentStatus = paymentStatus;
    if (bracketId) registrationWhere.bracketId = bracketId;

    // Fetch registrations
    const registrations = await PlayerRegistration.findAll({
      where: registrationWhere,
      include: [
        {
          model: User,
          where: userWhere,
          attributes: [
            "id",
            "firstname",
            "lastname",
            "email",
            "gender",
            "age",
            "phoneNumber",
          ],
        },
        {
          model: Bracket,
          include: [{ model: Event, attributes: ["id", "eventName"] }],
        },
      ],
      order: [["checkInStatus", "ASC"]],
    });

    if (!registrations.length) {
      return res.status(200).json({
        error: false,
        code: 200,
        message: "No registered players found for this tournament",
        data: [],
      });
    }

    // Group by player
    const playersMap = {};

    registrations.forEach((reg) => {
      const playerId = reg.User.id;

      if (!playersMap[playerId]) {
        playersMap[playerId] = {
          playerId: playerId,
          name: `${reg.User.firstname} ${reg.User.lastname}`,
          email: reg.User.email,
          phoneNumber: reg.User.phoneNumber,
          age: reg.User.age,
          gender: reg.User.gender,
          events: [],
        };
      }

      // Add all events/brackets
      playersMap[playerId].events.push({
        registrationId: reg.id,
        bracketId: reg.Bracket.id,
        bracketName: reg.Bracket.name,
        eventId: reg.Bracket.Event?.id || null,
        eventName: reg.Bracket.Event?.eventName || null,
        status: reg.status,
        paymentStatus: reg.paymentStatus,
        paymentEmailSentCount: reg.paymentEmailSentCount ?? 0,
        checkInStatus: reg.checkInStatus,
        checkInTime: reg.checkInTime || null,
      });
    });

    const playerList = Object.values(playersMap).sort((a, b) => {
      const aStatus = a.events[0]?.checkInStatus;
      const bStatus = b.events[0]?.checkInStatus;
      return aStatus === bStatus ? 0 : aStatus === "not_checked_in" ? -1 : 1;
    });

    res.status(200).json({
      error: false,
      code: 200,
      message: "Registered players with events fetched successfully",
      data: playerList,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

const getPlayerEvents = async (req, res) => {
  try {
    const { playerId, bracketId } = req.params;

    // Fetch all registrations for this player
    const registrations = await PlayerRegistration.findAll({
      where: { playerId, bracketId },
      include: [
        {
          model: Bracket,
          attributes: ["id"],
          include: [{ model: Event, attributes: ["id", "eventName"] }],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!registrations.length) {
      return res.status(200).json({
        error: false,
        code: 200,
        message: "No events found for this player",
        data: [],
      });
    }

    // console.log(registrations);

    const eventMap = {};
    registrations.forEach((reg) => {
      if (reg.Bracket && reg.Bracket.Event) {
        const eventId = reg.Bracket.Event.id;
        if (!eventMap[eventId]) {
          eventMap[eventId] = {
            eventId,
            eventName: reg.Bracket.Event.eventName,
            bracketId: reg.bracketId, // use PlayerRegistration's foreign key
          };
        }
      }
    });

    const events = Object.values(eventMap);

    res.status(200).json({
      error: false,
      code: 200,
      message: "Player events fetched successfully",
      data: events,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

const playerStats = async (req, res) => {
  try {
    const playerId = req.user.id;

    const { firstname, lastname, gender } = req.user;

    //first get teamIds of player
    const playerTeamLinks = await TeamPlayer.findAll({
      where: {
        playerId: playerId,
      },
      attributes: ["teamId"],
      raw: true,
    });

    //we get as plain objects so we are mapping in array of objects and getting teamIds
    const playerTeamIds = playerTeamLinks.map((link) => link.teamId);

    if (!playerTeamIds.length) {
      return res.status(200).json({
        error: false,
        code: 200,
        data: {
          matchesPlayed: 0,
          wins: 0,
          losses: 0,
          winningRate: 0,
          goldMedals: 0,
          silverMedals: 0,
          bronzeMedals: 0,
          totalMedals: 0,
          name: `${firstname} ${lastname}`,
          // email: email,
          gender: gender,
        },
      });
    }

    //now get matches with the teamIds
    const playedMatches = await Match.findAll({
      where: {
        status: "completed",
        [Op.or]: [
          {
            team1Id: {
              [Op.in]: playerTeamIds,
            },
            team2Id: {
              [Op.in]: playerTeamIds,
            },
          },
        ],
      },
      include: [
        {
          model: Round,
          attributes: ["type"],
        },
      ],
    });

    const matchesPlayed = playedMatches.length;
    let wins = 0;
    let goldMedals = 0;
    let bronzeMedals = 0;
    let silverMedals = 0;

    //looping through each match for calculation of stats
    for (const match of playedMatches) {
      const playerWon = playerTeamIds.includes(match.winnerTeamId);

      if (playerWon) {
        wins++;

        if (match.Round.type === "gold") {
          goldMedals++;
        } else if (match.Round.type === "bronze") {
          bronzeMedals++;
        }
      } else {
        if (match.Round.type === "gold") {
          silverMedals++;
        }
      }
    }

    const losses = matchesPlayed - wins;

    const winningRate = matchesPlayed > 0 ? (wins / matchesPlayed) * 100 : 0;

    const totalMedals = goldMedals + silverMedals + bronzeMedals;

    res.status(200).json({
      error: false,
      code: 200,
      data: {
        matchesPlayed,
        wins,
        losses,
        winningRate,
        totalMedals,
        goldMedals,
        silverMedals,
        bronzeMedals,
        name: `${firstname} ${lastname}`,
        // email: email,
        gender: gender,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

export default {
  registerForBracket,
  registeredPlayersForTournament,
  getPlayerEvents,
  playerStats,
};
