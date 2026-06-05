import models from "../models/Associations.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import { enqueueEmail } from "../utils/enqueueEmail.js";
import { resolveScoringListIdForRound } from "../utils/scoringRules.js";
import { parseDuprRating } from "../utils/parseDuprRating.js";
import { linkBulkUploadPartners } from "../utils/linkRegistrationPartners.js";
import {
  buildPaymentEmailPayload,
  buildPaymentRegistrationJob,
  computeRegistrationAmountDue,
  getPaymentPhone,
} from "../utils/paymentRegistrationEmail.js";

const {
  PlayerRegistration,
  Bracket,
  Event,
  Tournament,
  User,
  Team,
  Pool,
  PoolTeam,
  Match,
  Round,
  ScoringList,
  PoolTeamStats,
  PlayoffSeeding,
  TeamPlayer,
  UserRole,
  Role,
} = models;

const addPlayerByHost = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tournamentId, bracketId } = req.params;

    const hostId = req.user.id;

    const body = req.body.data || req.body;
    const {
      firstname,
      lastname,
      email,
      phoneNumber,
      age,
      gender,
      partner,
      paymentStatus: paymentStatusInput,
      sendPaymentEmail = false,
      duprRating: duprRatingInput,
    } = body;

    const paymentStatus =
      paymentStatusInput === "paid" || paymentStatusInput === "refunded"
        ? paymentStatusInput
        : "unpaid";

    //validating tournament and bracket
    const tournament = await Tournament.findOne({
      where: {
        hostId,
        id: tournamentId,
      },
      transaction: t,
    });

    const bracket = await Bracket.findByPk(bracketId, {
      include: [
        {
          model: Event,
          attributes: ["eventName"],
        },
      ],
      transaction: t,
    });

    if (!tournament || !bracket) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Tournament or bracket not found!",
      });
    }

    if (["ongoing", "completed"].includes(tournament.status)) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Registration closed.Tournament is ongoing or completed",
      });
    }

    if (bracket.isPoolStarted) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message:
          "Registration for this bracket is closed.Bracket is ongoing or completed",
      });
    }

    const eventName = bracket?.Event?.eventName?.toLowerCase() || "";

    const existingRegistrations = await PlayerRegistration.count({
      where: { tournamentId, bracketId },
      transaction: t,
    });

    let playersPerTeam = 1;
    if (eventName.includes("double")) playersPerTeam = 2;

    const availableCapacity =
      bracket.maxTeams * playersPerTeam - existingRegistrations;

    if (availableCapacity <= 0) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: `Registrations for bracket is full ${existingRegistrations}/${
          bracket.maxTeams * playersPerTeam
        } players`,
      });
    }

    let player = null;
    let registration = null;

    player = await User.findOne({
      where: {
        email: email,
      },
      transaction: t,
    });

    let playerRoleId = await Role.findOne({
      where: {
        name: "player",
      },
      attributes: ["id"],
      transaction: t,
    });

    if (player) {
      if (/\bmen\b/.test(eventName) && player.gender.toLowerCase() !== "male") {
        await t.rollback();
        return res.status(400).json({
          error: true,
          code: 400,
          message: "only male players can register for this event",
        });
      }

      if (
        /\bwomen\b/.test(eventName) &&
        player.gender.toLowerCase() !== "female"
      ) {
        await t.rollback();
        return res.status(400).json({
          error: true,
          code: 400,
          message: "only female players can register for this event",
        });
      }

      await UserRole.findOrCreate({
        where: { userId: player.id, roleId: playerRoleId.id },
        transaction: t,
      });

      const alreadyRegistrated = await PlayerRegistration.findOne({
        where: {
          playerId: player.id,
          tournamentId,
          bracketId,
        },
        transaction: t,
      });

      if (alreadyRegistrated) {
        await t.rollback();
        return res.status(400).json({
          error: true,
          code: 400,
          message: "Player already registered for this tournament",
        });
      }

      const duprVal = parseDuprRating(duprRatingInput);
      if (duprVal !== null) {
        await player.update({ duprRating: duprVal }, { transaction: t });
      }

      registration = await PlayerRegistration.create(
        {
          playerId: player.id,
          tournamentId,
          bracketId,
          status: "registered",
          paymentStatus,
        },
        {
          transaction: t,
        }
      );

      const addedJob = {
        jobType: "existingUserRegistrationByHost",
        firstname: player.firstname,
        email: player.email,
        hostName: req.user.firstname,
        tournamentName: tournament.name,
        bracketName: bracket.name,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
      };

      await enqueueEmail(addedJob);
    } else {
      if (/\bmen\b/.test(eventName) && gender !== "male") {
        await t.rollback();
        return res.status(400).json({
          error: true,
          code: 400,
          message: "only male players can register for this event",
        });
      }

      if (/\bwomen\b/.test(eventName) && gender !== "female") {
        await t.rollback();
        return res.status(400).json({
          error: true,
          code: 400,
          message: "only female players can register for this event",
        });
      }

      const password = `${firstname}@12345`;

      const hashedPassword = await bcrypt.hash(password, 10);

      const verificationToken = crypto.randomBytes(32).toString("hex");

      player = await User.create(
        {
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: hashedPassword,
          age: age,
          gender: gender,
          phoneNumber: phoneNumber,
          isVerified: false,
          accountExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          verificationToken: verificationToken,
        },
        {
          transaction: t,
        }
      );

      await UserRole.create(
        { userId: player.id, roleId: playerRoleId.id },
        {
          transaction: t,
        }
      );

      const duprValNew = parseDuprRating(duprRatingInput);
      if (duprValNew !== null) {
        await player.update({ duprRating: duprValNew }, { transaction: t });
      }

      registration = await PlayerRegistration.create(
        {
          playerId: player.id,
          tournamentId,
          bracketId,
          status: "registered",
          paymentStatus,
        },
        {
          transaction: t,
        }
      );

      const verificationUrl = `${process.env.SERVER_BASE_URL}/auth/verify-email?token=${player.verificationToken}`;

      const combinedJob = {
        jobType: "newUserRegistrationByHost",
        firstname: player.firstname,
        email: player.email,
        hostName: req.user.firstname,
        tournamentName: tournament.name,
        bracketName: bracket.Event.eventName,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        verificationUrl: verificationUrl,
      };

      await enqueueEmail(combinedJob);
    }

    if (partner && String(partner).trim() && String(partner).trim() !== "-") {
      await linkBulkUploadPartners(
        [
          {
            registrationId: registration.id,
            playerId: player.id,
            bracketId: Number(bracketId),
            email: player.email,
            name: `${player.firstname} ${player.lastname}`.trim(),
            row: { partner: String(partner).trim() },
          },
        ],
        tournamentId,
        t
      );
    }

    if (paymentStatus === "unpaid" && sendPaymentEmail) {
      const paymentPhone = getPaymentPhone(tournament);
      if (!paymentPhone) {
        await t.rollback();
        return res.status(400).json({
          error: true,
          code: 400,
          message:
            "Payment phone not configured in tournament settings (Courts & Fees).",
        });
      }
      const amountDue = computeRegistrationAmountDue(bracket, tournament);
      const payload = buildPaymentEmailPayload({
        tournament,
        bracket,
        user: player,
        hostUser: req.user,
        amountDue,
        paymentPhone,
      });
      await enqueueEmail(buildPaymentRegistrationJob(registration.id, payload));
    }

    await t.commit();

    res.status(201).json({
      error: false,
      code: 201,
      message: `player ${player.firstname} ${player.lastname} added successfully`,
      data: { registrationId: registration.id, playerId: player.id },
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//host stats
const hostStats = async (req, res) => {
  try {
    const hostId = req.user.id;

    const { firstname, lastname, gender } = req.user;

    const totalCreated = await Tournament.count({
      where: { hostId: hostId },
    });

    const totalDrafts = await Tournament.count({
      where: {
        hostId,
        status: "draft",
      },
    });

    const totalActive = await Tournament.count({
      where: {
        hostId,
        status: "active",
      },
    });

    const totalCompleted = await Tournament.count({
      where: {
        hostId: hostId,
        status: "completed",
      },
    });

    const totalOngoing = await Tournament.count({
      where: {
        hostId,
        status: "ongoing",
      },
    });

    const hostTournamentIds = await Tournament.findAll({
      where: {
        hostId: hostId,
      },
      attributes: ["id"],
      raw: true,
    }).then((tournaments) => tournaments.map((t) => t.id));

    let totalRegisteredPlayers = 0;
    if (hostTournamentIds.length > 0) {
      totalRegisteredPlayers = await PlayerRegistration.count({
        where: {
          tournamentId: {
            [Op.in]: hostTournamentIds,
          },
        },
      });
    }

    res.status(200).json({
      error: false,
      code: 200,
      message: "host stats fetched",
      data: {
        name: `${firstname} ${lastname}`,
        gender: gender,
        totalTournamentsCompleted: totalCompleted,
        totalTournamentsCreated: totalCreated,
        totalPlayersRegisteredOverall: totalRegisteredPlayers,
        totalActive,
        totalDrafts,
        totalOngoing,
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

//check in player for event
const checkInPlayerForEvent = async (req, res) => {
  try {
    const { tournamentId, bracketId, playerId, eventId } = req.body;

    // Validate required fields
    if (!tournamentId || !bracketId || !playerId) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournamentId, bracketId, and playerId are required",
      });
    }

    // Find registration record
    const registration = await PlayerRegistration.findOne({
      where: { tournamentId, bracketId, playerId },
      include: [
        {
          model: Bracket,
          include: [{ model: Event }],
        },
      ],
    });

    if (!registration) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Player is not registered for this event or bracket",
      });
    }

    // Check if already checked in
    if (registration.checkInStatus === "checked_in") {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Player is already checked in for this event",
      });
    }

    // Perform check-in
    registration.checkInStatus = "checked_in";
    registration.checkInTime = new Date();
    await registration.save();

    res.status(200).json({
      error: false,
      code: 200,
      message: `Player checked in successfully for event: ${
        registration.Bracket.Event?.eventName || "N/A"
      }`,
      data: {
        playerId,
        tournamentId,
        bracketId,
        checkInStatus: registration.checkInStatus,
        checkInTime: registration.checkInTime,
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

const undoCheckInPlayer = async (req, res) => {
  try {
    const { tournamentId, bracketId, playerId } = req.body;

    if (!tournamentId || !bracketId || !playerId) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournamentId, bracketId, and playerId are required",
      });
    }

    const registration = await PlayerRegistration.findOne({
      where: { tournamentId, bracketId, playerId },
    });

    if (!registration) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Registration not found",
      });
    }

    registration.checkInStatus = "not_checked_in";
    registration.checkInTime = null;
    await registration.save();

    res.status(200).json({
      error: false,
      code: 200,
      message: "Check-in undone",
      data: {
        playerId,
        tournamentId,
        bracketId,
        checkInStatus: registration.checkInStatus,
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

//getting all brackets of tournament
const gettingAllBracketsOfTournamentByHost = async (req, res) => {
  try {
    const { gender, search } = req.query;

    const { tournamentId } = req.params;
    const bracketWhere = { tournamentId };
    if (search) {
      bracketWhere.name = { [Op.like]: `%${search}%` };
    }

    const eventWhere = {};

    if (gender) {
      eventWhere.eventName = { [Op.like]: `%${gender}%` };
    }

    const hostId = req.user.id;
    const tournament = await Tournament.findOne({
      where: {
        hostId,
        id: tournamentId,
      },
    });

    if (!tournament) {
      return res.status(404).json({
        code: 404,
        error: true,
        message: "tournament not found",
      });
    }

    const brackets = await Bracket.findAll({
      where: bracketWhere,
      include: [
        {
          model: Event,
          where: eventWhere,
          attributes: ["id", "eventName"],
        },
      ],
    });

    if (!brackets.length) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "brackets are not present for this tournament",
        data: { men: [], women: [], mixed: [] },
      });
    }

    const registrations = await PlayerRegistration.findAll({
      where: { tournamentId },
      attributes: ["id", "bracketId", "playerId"],
      include: [
        {
          model: User,
        },
      ],
    });

    const playersCountMap = {};

    registrations.forEach((reg) => {
      playersCountMap[reg.bracketId] =
        (playersCountMap[reg.bracketId] || 0) + 1;
    });

    const groupedData = {
      men: [],
      women: [],
      mixed: [],
    };

    brackets.forEach((b) => {
      let eventName = b.Event?.eventName || "unknownEvent";

      const lowerName = eventName.toLowerCase();

      const playersCount = playersCountMap[b.id] || 0;

      let playersPerTeam = 1;

      if (lowerName.includes("single")) playersPerTeam = 1;
      else if (lowerName.includes("double")) playersPerTeam = 2;

      const totalTeams = Math.ceil(playersCount / playersPerTeam);

      // console.log(totalTeams);

      const bracketData = {
        id: b.id,
        maxTeams: b.maxTeams,
        name: b.name,
        eventName: eventName,
        totalTeams,
        totalPlayers: playersCount,
        tournamentStartDate: tournament.startDate,
        poolStarted: b.poolStarted,
        status: b.status,
      };

      if (lowerName.includes("men")) groupedData.men.push(bracketData);
      else if (lowerName.includes("women")) groupedData.women.push(bracketData);
      else groupedData.mixed.push(bracketData);
    });

    res.status(200).json({
      error: false,
      message: "brackets fetched successfully",
      code: 200,
      data: groupedData,
    });
  } catch (error) {
    res.status(500).json({ code: 500, error: true, message: error.message });
  }
};

//getting registrated players for bracket
const registeredPlayersForBracket = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;
    const { search } = req.query;

    // console.log("tournamentId", tournamentId);
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

    const bracket = await Bracket.findByPk(bracketId, {
      include: [{ model: Event }],
    });

    const eventName = bracket.Event.eventName;

    if (eventName.includes("single")) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "these event not allowed to make teams",
      });
    }

    if (!bracket) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "bracket doesn't exist!",
      });
    }

    // Build user filter
    const userWhere = {};
    if (search) {
      userWhere[Op.or] = [
        { firstname: { [Op.iLike]: `%${search}%` } },
        { lastname: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Fetch registrations
    const registrations = await PlayerRegistration.findAll({
      where: { tournamentId, bracketId },
      include: [
        {
          model: User,
          where: userWhere,
          attributes: ["id", "firstname", "lastname", "email"],
        },
      ],
      order: [["createdAt", "ASC"]],
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

    const playersList = registrations.map((reg) => ({
      playerId: reg.playerId,
      playerName: `${reg.User.firstname} ${reg.User.lastname}`,
      email: reg.User.email,
    }));

    res.status(200).json({
      error: false,
      code: 200,
      message: "Registered players with events fetched successfully",
      data: playersList,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//getting registered player who are not checked-in
const registeredPlayersWhoAreNotCheckin = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;

    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Tournament not found!",
      });
    }

    const bracket = await Bracket.findByPk(bracketId, {
      include: [{ model: Event }],
    });

    if (!bracket) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "bracket not found!",
      });
    }

    const registrations = await PlayerRegistration.findAll({
      where: { tournamentId, bracketId, checkInStatus: "not_checked_in" },
      include: [
        {
          model: User,
          attributes: ["id", "firstname", "lastname", "email"],
        },
        {
          model: Bracket,
          include: [{ model: Event, attributes: ["id", "eventName"] }],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    if (!registrations.length) {
      return res.status(200).json({
        error: false,
        code: 200,
        message: "No registered players found for this tournament",
        data: [],
      });
    }

    const playersMap = {};

    registrations.forEach((reg) => {
      const playerId = reg.User.id;
      const playerName = `${reg.User.firstname} ${reg.User.lastname}`;

      if (!playersMap[playerId]) {
        playersMap[playerId] = {
          playerId,
          playerName,
          email: reg.User.email,
          events: [],
        };
      }

      const event = reg.Bracket.Event;
      if (
        event &&
        !playersMap[playerId].events.some((e) => e.eventId === event.id)
      ) {
        playersMap[playerId].events.push({
          eventId: event.id,
          eventName: event.eventName,
        });
      }
    });

    const playerList = Object.values(playersMap);

    res.status(200).json({
      error: false,
      code: 200,
      message: "Registered players fetched successfully",
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

//making team by host
const manualAddTeam = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { tournamentId, bracketId } = req.params;

    const { players } = req.body; // e.g. [a, c]

    // console.log("players", players);

    if (!players || players.length !== 2) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Please provide exactly 2 player IDs.",
      });
    }

    const [playerA, playerC] = players;

    // Get all teams
    const teams = await Team.findAll({
      where: { tournamentId, bracketId },
      include: [{ model: TeamPlayer, as: "TeamPlayers" }],
      transaction: t,
    });

    // Finding teams of both players
    const teamOfA = teams.find((team) =>
      team.TeamPlayers.some((tp) => tp.playerId === playerA)
    );

    const teamOfC = teams.find((team) =>
      team.TeamPlayers.some((tp) => tp.playerId === playerC)
    );

    if (!teamOfA || !teamOfC) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "One or both players not found in existing teams.",
      });
    }

    //checking if both players are in same team
    if (teamOfA.id === teamOfC.id) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Both players arleady in same Team",
      });
    }

    // Find their teammates (if exist)
    const teammateOfA =
      teamOfA.TeamPlayers.find((tp) => tp.playerId !== playerA)?.playerId ||
      null;

    const teammateOfC =
      teamOfC.TeamPlayers.find((tp) => tp.playerId !== playerC)?.playerId ||
      null;

    //deleting link to team a of player A
    await TeamPlayer.destroy({
      where: { teamId: teamOfA.id, playerId: playerA },
      transaction: t,
    });

    //  Add playerA to teamOfC (so now teamOfC will have c + a)
    await TeamPlayer.create(
      {
        teamId: teamOfC.id,
        playerId: playerA,
        role: "partner",
      },
      { transaction: t }
    );

    //  If both had teammates, swap them (b ↔ d)
    if (teammateOfA && teammateOfC) {
      //deleting teamate d from team c
      await TeamPlayer.destroy({
        where: { teamId: teamOfC.id, playerId: teammateOfC },
        transaction: t,
      });

      //adding him to team a with other teamate
      await TeamPlayer.create(
        {
          teamId: teamOfA.id,
          playerId: teammateOfC,
          role: "partner",
        },
        { transaction: t }
      );
    }
    //  If only teamOfA had an extra player (b) and teamOfC had no extra (single player team)
    else if (teammateOfA && !teammateOfC) {
      // just leave teamOfA with b
    }
    //  If only teamOfC had an extra player (d) and teamOfA had no extra
    else if (!teammateOfA && teammateOfC) {
      // move d to teamOfA
      await TeamPlayer.destroy({
        where: { teamId: teamOfC.id, playerId: teammateOfC },
        transaction: t,
      });

      await TeamPlayer.create(
        {
          teamId: teamOfA.id,
          playerId: teammateOfC,
          role: "partner",
        },
        { transaction: t }
      );
    }

    //  Delete any team that is now empty
    const allTeamsAfter = await Team.findAll({
      where: { tournamentId, bracketId },
      include: [{ model: TeamPlayer, as: "TeamPlayers" }],
      transaction: t,
    });

    for (const team of allTeamsAfter) {
      if (team.TeamPlayers.length === 0) {
        await team.destroy({ transaction: t });
      }
    }

    //  Return updated team data
    const updatedTeams = await Team.findAll({
      where: { tournamentId, bracketId },
      include: [
        {
          model: TeamPlayer,
          as: "TeamPlayers",
          include: [{ model: User, as: "User" }],
        },
      ],
      transaction: t,
    });

    const response = updatedTeams.map((team) => ({
      teamId: team.id,
      teamName: team.teamName,
      players: team.TeamPlayers.map((tp) => ({
        playerId: tp.playerId,
        playerName: `${tp.User.firstname} ${tp.User.lastname}`,
      })),
    }));

    await t.commit();

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Team added successfully.",
      data: response,
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    res.status(500).json({ error: true, code: 500, message: error.message });
  }
};

const checkInAllPlayersForEvent = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;
    const { eventId, playerIds } = req.body;

    if (!tournamentId || !bracketId || !playerIds?.length) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournamentId, bracketId, and playerIds are required",
      });
    }

    const registrations = await PlayerRegistration.findAll({
      where: { tournamentId, bracketId, playerId: playerIds },
      include: [
        {
          model: Bracket,
          include: [{ model: Event }],
        },
      ],
    });

    if (!registrations.length) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "No matching registrations found for these players and event",
      });
    }

    const updatedPlayers = [];

    //  Update check-in status for players
    for (const reg of registrations) {
      if (reg.checkInStatus !== "checked_in") {
        reg.checkInStatus = "checked_in";
        reg.checkInTime = new Date();
        await reg.save();
      }

      updatedPlayers.push({
        playerId: reg.playerId,
        tournamentId: reg.tournamentId,
        bracketId: reg.bracketId,
        checkInStatus: reg.checkInStatus,
        checkInTime: reg.checkInTime,
      });
    }

    //  Now sync teams based on player check-ins
    const teams = await Team.findAll({
      where: { tournamentId, bracketId },
      include: [{ model: TeamPlayer, as: "TeamPlayers" }],
    });

    for (const team of teams) {
      const playerIdsInTeam = team.TeamPlayers.map((tp) => tp.playerId);

      // Find check-in status for all players in this team
      const players = await PlayerRegistration.findAll({
        where: {
          tournamentId,
          bracketId,
          playerId: playerIdsInTeam,
        },
      });

      const allCheckedIn = players.every(
        (p) => p.checkInStatus === "checked_in"
      );

      if (allCheckedIn && team.status !== "checked-in") {
        team.status = "checked-in";
        await team.save();
      }
    }

    res.status(200).json({
      error: false,
      code: 200,
      message: "Players (and teams) checked in successfully",
      data: updatedPlayers,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

const syncTeamsStatus = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;

    if (!tournamentId || !bracketId) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournamentId and bracketId are required",
      });
    }

    // Fetch all teams for this bracket
    const teams = await Team.findAll({
      where: { tournamentId, bracketId },
      include: [{ model: TeamPlayer, as: "TeamPlayers" }],
    });

    const updatedTeams = [];

    for (const team of teams) {
      const playerIds = team.TeamPlayers.map((tp) => tp.playerId);

      // Fetch players for this team
      const players = await PlayerRegistration.findAll({
        where: { tournamentId, bracketId, playerId: playerIds },
      });

      // Check if all players are checked-in
      const allCheckedIn = players.every(
        (p) => p.checkInStatus === "checked_in"
      );

      // Update team status if needed
      if (allCheckedIn && team.status !== "checked-in") {
        team.status = "checked-in";
        await team.save();
        updatedTeams.push({ teamId: team.id, teamName: team.teamName });
      }
    }

    res.status(200).json({
      error: false,
      code: 200,
      message: "Teams status synced based on player check-ins",
      data: updatedTeams,
    });
  } catch (error) {
    // console.error(error);
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//helper function for calculating particular team stats
const recomputeTeamStats = async (poolId, teamId, transaction = null) => {
  const matches = await Match.findAll({
    where: {
      poolId,
      [Op.or]: [{ team1Id: teamId }, { team2Id: teamId }],
    },
    transaction,
  });

  let wins = 0;
  let losses = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;

  for (const m of matches) {
    const isTeam1 = m.team1Id === teamId;
    const teamScore = isTeam1 ? m.scoreTeam1 : m.scoreTeam2;
    const oppScore = isTeam1 ? m.scoreTeam2 : m.scoreTeam1;

    pointsFor += teamScore || 0;
    pointsAgainst += oppScore || 0;

    if (m.status === "completed") {
      if (teamScore > oppScore) wins++;
      else if (teamScore < oppScore) losses++;
    }
  }

  const completedMatches = matches.filter(
    (m) => m.status === "completed"
  ).length;

  const pointDifference = pointsFor - pointsAgainst;
  const pdPercent =
    completedMatches === 0
      ? 0
      : pointsAgainst > 0
      ? (pointsFor / pointsAgainst) * 100
      : 100;

  await PoolTeamStats.upsert(
    {
      poolId,
      teamId,
      wins,
      losses,
      pointsFor,
      pointsAgainst,
      pointDifference,
      pdPercent,
    },
    { transaction }
  );
};

//calcaulting pool stats of all teams
const recomputePoolStats = async (poolId, transaction = null) => {
  const poolTeams = await PoolTeam.findAll({
    where: { poolId },
    attributes: ["teamId"],
    transaction,
  });

  for (const pt of poolTeams) {
    await recomputeTeamStats(poolId, pt.teamId, transaction);
  }
};

//helper function for round robin for creating rounds and pairs(matches)
function generateRoundRobin(teamIds) {
  const teams = [...teamIds];
  if (teams.length % 2 === 1) teams.push(null); // add bye if odd
  const n = teams.length;
  const rounds = [];

  for (let r = 0; r < n - 1; r++) {
    const pairs = [];
    for (let i = 0; i < n / 2; i++) {
      const home = teams[i];
      const away = teams[n - 1 - i];
      if (home && away) pairs.push({ home, away });
    }
    rounds.push(pairs);
    teams.splice(1, 0, teams.pop());
  }

  return rounds;
}

//create round robin
const createRoundRobin = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tournamentId, bracketId } = req.params;

    const teamsPerPool = parseInt(req.body.teamsPerPool || 6, 10);

    const force = req.body.force === true || req.query.force === "true";

    const tournament = await Tournament.findByPk(tournamentId);

    if (!tournament) throw new Error("Tournament not found");

    const bracket = await Bracket.findByPk(bracketId, {
      include: {
        model: Event,
      },
    });

    if (!bracket) throw new Error("Bracket not found");

    const lowerEventName = bracket?.Event?.eventName?.toLowerCase();

    let playersPerTeam = 1;
    if (lowerEventName.includes("double")) playersPerTeam = 2;

    const totalRequiredPlayers = bracket.maxTeams * playersPerTeam;

    // Check if pools already exist
    const existingPools = await Pool.findAll({
      where: { tournamentId, bracketId },
    });

    if (existingPools.length && !force) {
      return res.status(200).json({
        error: false,
        code: 200,
        message: "Pools already created",
        data: existingPools,
      });
    }

    const registeredPlayers = await PlayerRegistration.findAll({
      where: {
        tournamentId,
        bracketId,
        checkInStatus: "checked_in",
      },
      transaction: t,
    });

    const teams = await Team.findAll({
      where: { tournamentId, bracketId, status: "checked-in" },
      order: [["id", "ASC"]],
    });

    if (!teams.length) throw new Error("No checked-in teams found");

    if (
      bracket.maxTeams &&
      teams.length < bracket.maxTeams &&
      registeredPlayers.length !== totalRequiredPlayers
    ) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: `Cannot create pools. Only ${teams.length} teams are checked-in, but the bracket requires ${bracket.maxTeams} and need total ${totalRequiredPlayers} players. Please adjust bracket settings or wait for more teams.`,
      });
    }

    // If force, delete old pools
    if (force && (existingPools.length || bracket.poolStarted)) {
      const playoffRounds = await Round.findAll({
        where: { bracketId, type: { [Op.not]: "pool" } },
        attributes: ["id"],
        transaction: t,
      });

      const playoffRoundIds = playoffRounds.map((r) => r.id);

      if (playoffRoundIds.length > 0) {
        // Delete playoff matches
        await Match.destroy({
          where: { roundId: { [Op.in]: playoffRoundIds } },
          transaction: t,
        }); // Delete playoff rounds
        await Round.destroy({
          where: { id: { [Op.in]: playoffRoundIds } },
          transaction: t,
        });
      }

      const poolIds = existingPools.map((p) => p.id);
      await Match.destroy({
        where: { poolId: { [Op.in]: poolIds } },
        transaction: t,
      });
      await Round.destroy({
        where: { poolId: { [Op.in]: poolIds } },
        transaction: t,
      });
      await PoolTeamStats.destroy({
        where: { poolId: { [Op.in]: poolIds } },
        transaction: t,
      });
      await PoolTeam.destroy({
        where: { poolId: { [Op.in]: poolIds } },
        transaction: t,
      });
      await Pool.destroy({
        where: { id: { [Op.in]: poolIds } },
        transaction: t,
      });
    }

    // Create new pools
    const numPools = Math.ceil(teams.length / teamsPerPool);
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const poolBuckets = Array.from({ length: numPools }, () => []);

    for (let i = 0; i < shuffledTeams.length; i++) {
      poolBuckets[i % numPools].push(shuffledTeams[i]);
    }

    for (let p = 0; p < poolBuckets.length; p++) {
      const bucket = poolBuckets[p];

      const pool = await Pool.create(
        { poolName: `Pool ${p + 1}`, tournamentId, bracketId },
        { transaction: t }
      );

      // Pool teams
      const createdPoolTeams = await PoolTeam.bulkCreate(
        bucket.map((team) => ({ poolId: pool.id, teamId: team.id })),
        { transaction: t, returning: true }
      );

      // Default stats
      await PoolTeamStats.bulkCreate(
        createdPoolTeams.map((pt) => ({
          poolId: pool.id,
          teamId: pt.teamId,
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointDifference: 0,
          pdPercent: 0,
        })),
        { transaction: t }
      );

      // Generate rounds and matches
      const teamIds = bucket.map((t) => t.id);
      const rounds = generateRoundRobin(teamIds);

      for (let r = 0; r < rounds.length; r++) {
        const round = await Round.create(
          { poolId: pool.id, roundNumber: r + 1, status: "pending" },
          { transaction: t }
        );

        const matches = rounds[r].map((m) => ({
          poolId: pool.id,
          roundId: round.id,
          team1Id: m.home,
          team2Id: m.away,
          status: "not_started",
          scoreTeam1: 0,
          scoreTeam2: 0,
        }));

        await Match.bulkCreate(matches, { transaction: t });
      }
    }

    // Commit
    await t.commit();

    tournament.status = "ongoing";
    await tournament.save();

    bracket.poolStarted = true;
    bracket.status = "ongoing";
    await bracket.save();

    return res.status(201).json({
      error: false,
      code: 201,
      message: "Pools, rounds, matches, and default stats created successfully",
    });
  } catch (error) {
    await t.rollback();
    // console.error("createRoundRobin error:", error);
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//get all pools with teams and players
const getPoolsWithTeams = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;

    const tournament = await Tournament.findByPk(tournamentId);

    const bracket = await Bracket.findByPk(bracketId);

    if (!bracket || !tournament) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournament or bracket not found",
      });
    }

    const pools = await Pool.findAll({
      where: { tournamentId, bracketId },
      include: [
        {
          model: PoolTeam,
          attributes: ["poolId", "teamId"],
          include: [
            {
              model: Team,
              attributes: ["id", "teamName"],
              include: [
                {
                  model: TeamPlayer,
                  as: "TeamPlayers",
                  include: [
                    {
                      model: User,
                      as: "User",
                      attributes: ["id", "firstname", "lastname", "email"],
                    },
                  ],
                },
                {
                  model: PoolTeamStats,
                  attributes: [
                    "wins",
                    "losses",
                    "pointsFor",
                    "pointsAgainst",
                    "pointDifference",
                    "pdPercent",
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
  ["id", "ASC"],
],
    });

    const result = pools.map((pool) => ({
      id: pool.id,
      poolName: pool.poolName,
      teams: pool.PoolTeams.map((pt) => ({
        id: pt.Team.id,
        teamName: pt.Team.teamName,
        players: pt.Team.TeamPlayers.map((tp) => tp.User),
        stats: pt.Team.PoolTeamStat || {
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointDifference: 0,
          pdPercent: 0,
        },
      })),
    }));

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Pools with teams, players, and stats fetched successfully",
      data: result,
    });
  } catch (error) {
      
    // console.error("getPoolsWithTeams error:", error);
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//get particular pool details
const getPoolDetails = async (req, res) => {
  try {
    const { bracketId, tournamentId, poolId } = req.params;

    const tournament = await Tournament.findByPk(tournamentId);
    const bracket = await Bracket.findByPk(bracketId);

    if (!tournament || !bracket) {
      return res.status(404).json({
        error: true,
        message: "tournament or bracket doesn't exists!",
        code: 404,
      });
    }

    const poolScoringId =
      bracket.scoringListId || bracket.roundId;
    const scoring = poolScoringId
      ? await ScoringList.findByPk(poolScoringId)
      : null;
    const scoringLabel =
      scoring?.name ||
      (typeof bracket.scoringConfig === "object" &&
        bracket.scoringConfig?.pool?.label) ||
      "Pool play";

    const pool = await Pool.findOne({
      where: { bracketId, tournamentId, id: poolId },
      include: [
        {
         model: PoolTeam,
          attributes: ["poolId", "teamId"],
          include: [
            {
              model: Team,
              attributes: ["id", "teamName"],
              include: [
                {
                  model: TeamPlayer,
                  as: "TeamPlayers",
                  include: [
                    {
                      model: User,
                      as: "User",
                      attributes: ["id", "firstname", "lastname", "email"],
                    },
                  ],
                },
                {
                  model: PoolTeamStats,
                  as: "PoolTeamStat",
                  attributes: [
                    "wins",
                    "losses",
                    "pointsFor",
                    "pointsAgainst",
                    "pointDifference",
                    "pdPercent",
                  ],
                },
              ],
            },
          ],
        },
        {
          model: Round,
          include: [
            {
              model: Match,
              include: [
                {
                  // Team 1 with its players
                  model: Team,
                  as: "Team1",
                  attributes: ["id", "teamName"],
                  include: [
                    {
                      model: TeamPlayer,
                      as: "TeamPlayers",
                      include: [
                        {
                          model: User,
                          as: "User",
                          attributes: ["id", "firstname", "lastname", "email"],
                        },
                      ],
                    },
                  ],
                },
                {
                  // Team 2 with its players
                  model: Team,
                  as: "Team2",
                  attributes: ["id", "teamName"],
                  include: [
                    {
                      model: TeamPlayer,
                      as: "TeamPlayers",
                      include: [
                        {
                          model: User,
                          as: "User",
                          attributes: ["id", "firstname", "lastname", "email"],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [
        [sequelize.col("PoolTeams.Team.PoolTeamStat.wins"), "DESC"],
        [sequelize.col("PoolTeams.Team.PoolTeamStat.pointDifference"), "DESC"],
        [sequelize.col("PoolTeams.Team.PoolTeamStat.pointsFor"), "DESC"],

        // Sort Rounds by round number
        [sequelize.col("Rounds.roundNumber"), "ASC"],
      ],
    });

    if (!pool)
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Pool not found",
      });

    const result = {
      id: pool.id,
      poolName: pool.poolName,
      scoring: scoringLabel,
      teams: pool.PoolTeams.map((pt) => ({
        id: pt.Team.id,
        teamName: pt.Team.teamName,
        players: pt.Team.TeamPlayers.map((tp) => tp.User),
        stats: pt.Team.PoolTeamStat || {
          // Default stats object
          wins: 0,
          losses: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointDifference: 0,
          pdPercent: 0,
        },
      })),
      rounds: pool.Rounds.map((r) => ({
        id: r.id,
        roundNumber: r.roundNumber,
        roundStatus: r.status,
        matches: r.Matches.map((m) => ({
          id: m.id,
          status: m.status,
          scoreTeam1: m.scoreTeam1,
          scoreTeam2: m.scoreTeam2,
          team1: m.Team1,
          team2: m.Team2,
          winnerTeamId: m.winnerTeamId,
        })),
      })),
    };

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Pool details fetched successfully",
      data: result,
    });
  } catch (error) {
    // console.error("getPoolDetails error:", error);
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//only pool name,ids
const getAllPools = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;

    // console.log("tour", tournamentId);
    // console.log("brac", bracketId);

    const tournament = await Tournament.findByPk(tournamentId);
    if (!tournament) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournament not found",
      });
    }

    const bracket = await Bracket.findByPk(bracketId);
    if (!bracket) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "bracket not found",
      });
    }

    const pools = await Pool.findAll({
      where: { tournamentId, bracketId },
      attributes: ["id", "poolName"], // now this will work
      order: [["id", "ASC"]],
    });

    if (!pools.length) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "no pools found!",
      });
    }

    res.status(200).json({
      error: false,
      code: 200,
      message: "pools fetched",
      data: pools,
    });
  } catch (error) {
    res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

//getting all teams with teamplayers of all pools or particular pool
const getTeamsWithPoolAndPlayers = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;

    if (!tournamentId || !bracketId) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournamentId and bracketId are required",
      });
    }

    const { poolId, search } = req.query;

    // console.log("poolId", poolId);
    // console.log("search", search);

    const poolWhere = {};

    const teamWhere = {};

    if (poolId) poolWhere.id = poolId;

    if (search) {
      // 1. Remove all spaces from the user's search term
      const searchTerm = search.replace(/\s/g, "");

      teamWhere[Op.and] = [
        sequelize.where(
          sequelize.fn("REPLACE", sequelize.col("teamName"), " ", ""),
          { [Op.like]: `%${searchTerm}%` }
        ),
      ];
    }

    // Fetch all teams in this tournament/bracket with pool and players
    const teams = await Team.findAll({
      where: { tournamentId, bracketId, ...teamWhere },
      attributes: ["id", "teamName"], // Team basic info
      include: [
        {
          model: PoolTeam,
          required: !!poolId,
          include: [
            {
              model: Pool,
              where: poolWhere,
              required: !!poolId,
              attributes: ["id", "poolName"], // Pool info
            },
          ],
        },
        {
          model: TeamPlayer,
          as: "TeamPlayers",
          include: [
            {
              model: User,
              as: "User",
              attributes: ["id", "firstname", "lastname", "email"], // Player info
            },
          ],
        },
      ],
      order: [["id", "ASC"]],
    });

    // Transform for frontend
    const result = teams.map((team) => ({
      id: team.id,
      teamName: team.teamName,
      pool:
        team.PoolTeams.length > 0
          ? {
              id: team.PoolTeams[0].Pool.id,
              poolName: team.PoolTeams[0].Pool.poolName,
            }
          : null,
      players: team.TeamPlayers.map((tp) => tp.User),
    }));

    return res.status(200).json({
      message: "Teams with pools and players fetched successfully",
      data: result,
    });
  } catch (error) {
    // console.error("getTeamsWithPoolAndPlayers error:", error);
    return res.status(500).json({
      message: "Something went wrong while fetching teams",
      error: error.message,
    });
  }
};

//getting particular match details like team,team players
const getMatchDetails = async (req, res) => {
  try {
    const { matchId } = req.params;
    if (!matchId)
      return res.status(400).json({ message: "matchId is required" });

    // Fetch match with teams and their players
    const match = await Match.findByPk(matchId, {
      include: [
        {
          model: Team,
          as: "Team1",
          attributes: ["id", "teamName"],
          include: [
            {
              model: TeamPlayer,
              as: "TeamPlayers",
              include: [
                {
                  model: User,
                  as: "User",
                  attributes: ["id", "firstname", "lastname"],
                },
              ],
            },
          ],
        },
        {
          model: Team,
          as: "Team2",
          attributes: ["id", "teamName"],
          include: [
            {
              model: TeamPlayer,
              as: "TeamPlayers",
              include: [
                {
                  model: User,
                  as: "User",
                  attributes: ["id", "firstname", "lastname"],
                },
              ],
            },
          ],
        },
      ],
    });

    if (!match) return res.status(404).json({ message: "Match not found" });

    // Fetch round and bracket
    const round = await Round.findByPk(match.roundId, {
      include: [
        {
          model: Pool,
          include: [
            {
              model: Bracket,
              include: [{ model: ScoringList, attributes: ["id", "name"] }],
            },
          ],
        },
        {
          model: Bracket,
          as: "Bracket",
        },
      ],
    });

    let scoringSetup = null;

    if (round) {
      if (round.type === "pool") {
        scoringSetup = round.Pool?.Bracket?.ScoringList?.name || null;
      } else {
        const bracket = round.Bracket;
        let scoringId;

        switch (round.type) {
          case "semifinal":
            scoringId = bracket?.semiFinalMatchId;
            break;
          case "gold":
            scoringId = bracket?.goldMatchId;
            break;
          case "bronze":
            scoringId = bracket?.bronzeMatchId;
            break;
          default:
            scoringId = bracket?.playoffMatchId;
            break;
        }

        if (scoringId) {
          const scoring = await ScoringList.findByPk(scoringId);
          scoringSetup = scoring?.name || null;
        }
      }
    }

    // Format response
    const formattedResponse = {
      matchId: match.id,
      status: match.status,
      scoreTeam1: match.scoreTeam1,
      scoreTeam2: match.scoreTeam2,
      teams: [
        {
          id: match.Team1.id,
          teamName: match.Team1.teamName,
          players: match.Team1.TeamPlayers.map((tp) => ({
            id: tp.User.id,
            firstname: tp.User.firstname,
            lastname: tp.User.lastname,
            role: tp.role,
          })),
        },
        {
          id: match.Team2.id,
          teamName: match.Team2.teamName,
          players: match.Team2.TeamPlayers.map((tp) => ({
            id: tp.User.id,
            firstname: tp.User.firstname,
            lastname: tp.User.lastname,
            role: tp.role,
          })),
        },
      ],
      scoringSetup,
    };

    return res.status(200).json({
      message: "Match details fetched successfully",
      data: formattedResponse,
    });
  } catch (error) {
    // console.error("getMatchDetails error:", error);
    res.status(500).json({ message: error.message });
  }
};

//updating round status
const updateRoundStatus = async (roundId, transaction = null) => {
  const matches = await Match.findAll({ where: { roundId }, transaction });

  if (!matches.length) return;

  const allCompleted = matches.every((m) => m.status === "completed");
  const anyOngoingOrCompleted = matches.some(
    (m) => m.status === "completed" || m.status === "ongoing"
  );
  const allPending = matches.every((m) => m.status === "pending"); // optional if we want each match to also have status pending

  let newStatus = "pending"; // default at start
  if (allCompleted) newStatus = "completed";
  else if (anyOngoingOrCompleted) newStatus = "ongoing";
  else newStatus = "pending"; // all matches pending

  await Round.update(
    { status: newStatus },
    { where: { id: roundId }, transaction }
  );
};

//reseting scores for particular match teams
const resetMatchScore = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { matchId } = req.params;

    //  Find the match with team details
    const match = await Match.findByPk(matchId, {
      include: [
        { model: Team, as: "Team1", attributes: ["id", "teamName"] },
        { model: Team, as: "Team2", attributes: ["id", "teamName"] },
      ],
      transaction: t,
    });

    if (!match) {
      await t.rollback();
      return res.status(404).json({ message: "Match not found" });
    }

    //  Ensure it’s a pool match (no playoff logic)
    if (!match.poolId) {
      await t.rollback();
      return res.status(400).json({
        message:
          "This API only resets pool matches. Playoff matches are excluded.",
      });
    }

    // Reset match fields
    match.scoreTeam1 = 0;
    match.scoreTeam2 = 0;
    match.winnerTeamId = null;
    match.loserTeamId = null;
    match.status = "not_started";
    await match.save({ transaction: t });

    //  Update round status (if needed)
    await updateRoundStatus(match.roundId, t);

    //  Recompute pool stats for both teams
    await recomputeTeamStats(match.poolId, match.team1Id, t);
    await recomputeTeamStats(match.poolId, match.team2Id, t);

    //  Commit transaction
    await t.commit();

    //  Send response
    return res.status(200).json({
      message:
        "Pool match scores have been reset and stats recomputed successfully",
      data: {
        matchId: match.id,
        poolId: match.poolId,
        team1: {
          id: match.Team1.id,
          name: match.Team1.teamName,
          score: 0,
        },
        team2: {
          id: match.Team2.id,
          name: match.Team2.teamName,
          score: 0,
        },
        winnerTeamId: null,
        loserTeamId: null,
        status: match.status,
      },
    });
  } catch (error) {
    await t.rollback();
    // console.error("resetMatchScore error:", error);
    res.status(500).json({ message: error.message });
  }
};

/** Read-only playoff bracket (does not create rounds). */
const getPlayoffRounds = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;
    const bracket = await Bracket.findByPk(bracketId);
    if (!bracket) {
      return res.status(404).json({ message: "Bracket not found" });
    }

    const rounds = await Round.findAll({
      where: { bracketId, type: { [Op.not]: "pool" } },
      include: [
        {
          model: Match,
          include: [
            {
              model: Team,
              as: "Team1",
              include: [
                {
                  model: TeamPlayer,
                  as: "TeamPlayers",
                  include: [
                    {
                      model: User,
                      as: "User",
                      attributes: ["firstname", "lastname"],
                    },
                  ],
                },
              ],
            },
            {
              model: Team,
              as: "Team2",
              include: [
                {
                  model: TeamPlayer,
                  as: "TeamPlayers",
                  include: [
                    {
                      model: User,
                      as: "User",
                      attributes: ["firstname", "lastname"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [["roundNumber", "ASC"]],
    });

    const frontendData = await mapRoundsToFrontend(rounds);
    return res.status(200).json({
      message: rounds.length ? "Playoffs fetched" : "No playoff rounds yet",
      data: frontendData,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// If playoffs exist, return them. If not, try to create them (if pools are complete) and return.
const getOrCreatePlayoffs = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tournamentId, bracketId } = req.params;

    const bracket = await Bracket.findByPk(bracketId, { transaction: t });

    if (!bracket) throw new Error("Bracket not found");

    // Fetch existing playoff rounds (exclude pool rounds)
    let rounds = await Round.findAll({
      where: { bracketId, type: { [Op.not]: "pool" } },
      include: [
        {
          model: Match,
          include: [
            {
              model: Team,
              as: "Team1",
              include: [
                {
                  model: TeamPlayer,
                  as: "TeamPlayers",
                  include: [
                    {
                      model: User,
                      as: "User",
                      attributes: ["firstname", "lastname"],
                    },
                  ],
                },
              ],
            },
            {
              model: Team,
              as: "Team2",
              include: [
                {
                  model: TeamPlayer,
                  as: "TeamPlayers",
                  include: [
                    {
                      model: User,
                      as: "User",
                      attributes: ["firstname", "lastname"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      order: [["roundNumber", "ASC"]],
      transaction: t,
    });

    // console.log("rounds from line:1518", rounds);

    // If rounds exist, return them (host clicked playoffs tab)
    if (rounds.length) {
      const frontendData = await mapRoundsToFrontend(rounds);
      await t.commit();
      return res
        .status(200)
        .json({ message: "Playoffs fetched", data: frontendData });
    }

    // If no rounds exist,fetching all pools
    const pools = await Pool.findAll({
      where: { tournamentId, bracketId },
      transaction: t,
    });
    if (!pools.length) throw new Error("No pools found");

    // checking all pools of matches are completed or not
    for (const pool of pools) {
      const poolRounds = await Round.findAll({
        where: { poolId: pool.id },
        transaction: t,
      });
      if (poolRounds.some((r) => r.status !== "completed"))
        throw new Error(`Pool ${pool.poolName} is not completed yet`);
    }

    const seeding = await PlayoffSeeding.findByPk(bracket.playoffSeedingId, {
      transaction: t,
    });

    // console.log("seeding from line:1553", seeding);

    if (!seeding) throw new Error("Playoff seeding not found");

    // Collect teams advancing based on seeding.name like top one,top two,top three,top 4,seeded elimination
    let playoffTeams = [];
    for (const pool of pools) {
      const poolTeams = await PoolTeam.findAll({
        where: { poolId: pool.id },
        include: [{ model: PoolTeamStats, as: "stats" }],
        order: [
          [{ model: PoolTeamStats, as: "stats" }, "wins", "DESC"],
          [{ model: PoolTeamStats, as: "stats" }, "pointDifference", "DESC"],
          [{ model: PoolTeamStats, as: "stats" }, "pdPercent", "DESC"],
        ],
        transaction: t,
      });

      const extractStats = (pt) => {
        if (!pt) return {};

        const statsInst = pt.stats;
        let sPlain = {};
        if (!statsInst) {
          sPlain = {};
        } else if (typeof statsInst.get === "function") {
          sPlain = statsInst.get({ plain: true });
        } else if (statsInst.dataValues) {
          sPlain = statsInst.dataValues;
        } else {
          sPlain = statsInst;
        }

        return {
          wins: Number(sPlain.wins || 0),
          pointDifference: Number(sPlain.pointDifference || 0),
          pdPercent: Number(sPlain.pdPercent || 0),
          playoffSeed: sPlain.playoffSeed ?? null,
        };
      };

      poolTeams.forEach((pt) => {
        pt._safeStats = extractStats(pt);
      });

      poolTeams.sort((a, b) => {
        const A = a._safeStats,
          B = b._safeStats;
        if (B.wins !== A.wins) return B.wins - A.wins;
        if (B.pointDifference !== A.pointDifference)
          return B.pointDifference - A.pointDifference;
        return B.pdPercent - A.pdPercent;
      });

      switch (seeding.name) {
        case "Top One":
          playoffTeams.push(poolTeams[0]);
          break;
        case "Top Two":
          playoffTeams.push(...poolTeams.slice(0, 2));
          break;
        case "Top Three":
          playoffTeams.push(...poolTeams.slice(0, 3));
          break;
        case "Top Four":
          playoffTeams.push(...poolTeams.slice(0, 4));
          break;
        case "Seeded Elimination":
          playoffTeams.push(...poolTeams);
          break;
        case "Medal Round Only":
          playoffTeams.push(
            ...poolTeams.slice(0, Math.min(poolTeams.length, 2))
          );
          break;
      }

      // console.log("playoffTeams from line:1594", playoffTeams);
    }

    // Sort globally teams because creating matches between top and least
    playoffTeams.sort((a, b) => {
      const aStats = a._safeStats,
        bStats = b._safeStats;
      if (bStats.wins !== aStats.wins) return bStats.wins - aStats.wins;
      if (bStats.pointDifference !== aStats.pointDifference)
        return bStats.pointDifference - aStats.pointDifference;
      return bStats.pdPercent - aStats.pdPercent;
    });

    try {
      const updatePromises = [];
      for (let i = 0; i < playoffTeams.length; i++) {
        const team = playoffTeams[i]; // This is a PoolTeam instance
        const seed = i + 1; // The 1-based playoff seed

        // team.stats is the PoolTeamStats instance
        if (team.stats) {
          team.stats.playoffSeed = seed;
          // Add the save operation to an array of promises
          updatePromises.push(team.stats.save({ transaction: t }));
        }
      }
      // Wait for all database updates to complete
      await Promise.all(updatePromises);
    } catch (err) {
      // Handle potential error during save
      // console.error("Error saving playoff seeds:", err);
      throw new Error("Could not save playoff seeds");
    }

    const teamIds = playoffTeams.map((t) => t.teamId);

    // console.log("teamIds from line:1609", teamIds);

    const n = teamIds.length;

    if (n < 2) throw new Error("Not enough teams to create playoffs."); // Find the next power of 2 (e.g., 7 teams to  8, 13 teams to 16)

    const nextPowerOf2 = Math.pow(2, Math.ceil(Math.log2(n))); // Calculate how many teams get a "bye" (an auto-win)
    const byes = nextPowerOf2 - n; // Calculate how many actual matches are in the first round
    const matchesInRound1 = (n - byes) / 2; // Determine first round type based on the bracket size

    let firstRoundType;
    if (nextPowerOf2 === 2) firstRoundType = "final";
    else if (nextPowerOf2 === 4) firstRoundType = "semifinal";
    else if (nextPowerOf2 === 8) firstRoundType = "quarterfinal";
    else firstRoundType = `round_of_${nextPowerOf2}`; //creating round

    const firstRound = await Round.create(
      {
        bracketId,
        poolId: null,
        roundNumber: 1,
        status: "pending",
        type: firstRoundType, // Use new correct type
      },
      { transaction: t }
    ); // console.log("firstround from line:1628", firstRound);

    const matches = []; // 1. Create "Bye" matches for the top-seeded teams

    for (let i = 0; i < byes; i++) {
      matches.push({
        roundId: firstRound.id,
        team1Id: teamIds[i], // The top-seeded team (e.g., Seed 1)
        team2Id: null, // No opponent
        status: "completed", // It's an automatic win
        winnerId: teamIds[i], // The winner is the team itself
        scoreTeam1: 0,
        scoreTeam2: 0,
      });
    } // 2. Create actual matches for the remaining teams

    const playingTeamIds = teamIds.slice(byes); // Get all teams that don't have a bye
    const numPlaying = playingTeamIds.length; // This will always be an even number

    for (let i = 0; i < numPlaying / 2; i++) {
      matches.push({
        roundId: firstRound.id,
        team1Id: playingTeamIds[i], // First team from the remaining list (e.g., Seed 2)
        team2Id: playingTeamIds[numPlaying - 1 - i], // Last team from the remaining list (e.g., Seed 7)
        status: "not_started",
        scoreTeam1: 0,
        scoreTeam2: 0,
      });
    }
    await Match.bulkCreate(matches, { transaction: t });

    const savedMatches = await Match.findAll({
      where: { roundId: firstRound.id },
      include: [
        {
          model: Team,
          as: "Team1",
          include: [
            {
              model: TeamPlayer,
              as: "TeamPlayers",
              include: [
                {
                  model: User,
                  as: "User",
                  attributes: ["firstname", "lastname"],
                },
              ],
            },
          ],
        },
        {
          model: Team,
          as: "Team2",
          include: [
            {
              model: TeamPlayer,
              as: "TeamPlayers",
              include: [
                {
                  model: User,
                  as: "User",
                  attributes: ["firstname", "lastname"],
                },
              ],
            },
          ],
        },
      ],
      transaction: t,
    });

    // bracket.poolStarted = true;
    // await bracket.save({ transaction: t });

    // console.log("matches line 1648", matches);

    rounds = [{ ...firstRound.toJSON(), savedMatches: savedMatches }];

    const frontendData = await mapRoundsToFrontend(rounds);
    await t.commit();
    return res
      .status(200)
      .json({ message: "Playoffs created", data: frontendData });
  } catch (err) {
    await t.rollback();
    // console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

// Helper to map rounds to frontend format
const mapRoundsToFrontend = async (rounds) => {
  return Promise.all(
    rounds.map(async (r) => {
      // For existing rounds, fetch matches; for newly created, use savedMatches
      const matches = r.savedMatches
        ? r.savedMatches
        : await Match.findAll({
            where: { roundId: r.id },

            include: [
              {
                model: Team,
                as: "Team1",
                include: [
                  {
                    model: TeamPlayer,
                    as: "TeamPlayers",
                    include: [
                      {
                        model: User,
                        as: "User",
                        attributes: ["firstname", "lastname"],
                      },
                    ],
                  },
                ],
              },
              {
                model: Team,
                as: "Team2",
                include: [
                  {
                    model: TeamPlayer,
                    as: "TeamPlayers",
                    include: [
                      {
                        model: User,
                        as: "User",
                        attributes: ["firstname", "lastname"],
                      },
                    ],
                  },
                ],
              },
            ],
          });

      return {
        roundNumber: r.roundNumber,
        type: r.type,
        status: r.status,
        matches: matches.map((m) => ({
          matchId: m.id,
          scoreTeam1: m.scoreTeam1,
          scoreTeam2: m.scoreTeam2,
          // Handling NULL teams (Byes)
          Team1: m.Team1 // Team1 should always exist in playoffs
            ? {
                team1Id: m.Team1.id,
                teamName: m.Team1.teamName,
                players: m.Team1.TeamPlayers.map(
                  (tp) => `${tp.User.firstname} ${tp.User.lastname}`
                ),
              }
            : null,
          Team2: m.Team2 // Team2 will be NULL for a "Bye"
            ? {
                team2Id: m.Team2.id,
                teamName: m.Team2.teamName,
                players: m.Team2.TeamPlayers.map(
                  (tp) => `${tp.User.firstname} ${tp.User.lastname}`
                ),
              }
            : null, // This is a "BYE"
          winnerTeamId: m.winnerTeamId,
        })),
      };
    })
  );
};

// update match score
const updateMatchScore = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bracketId, matchId } = req.params;
    const scoreTeam1 = parseInt(req.body.scoreTeam1, 10);
    const scoreTeam2 = parseInt(req.body.scoreTeam2, 10);

    if (scoreTeam1 < 0 || scoreTeam2 < 0) {
      await t.rollback();
      return res.status(400).json({
        message: "Scores cannot be negative",
      });
    }

    if (isNaN(scoreTeam1) || isNaN(scoreTeam2)) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Both team scores are required and must be numbers" });
    }

    // fetching match,round,bracket
    const match = await Match.findByPk(matchId, { transaction: t });
    if (!match) {
      await t.rollback();
      return res.status(404).json({ message: "Match not found" });
    }

    const round = await Round.findByPk(match.roundId, { transaction: t });
    if (!round) throw new Error("Round not found");

    const bracket = await Bracket.findByPk(bracketId, { transaction: t });
    if (!bracket) throw new Error("Bracket not found");

    const scoringListId = resolveScoringListIdForRound(
      bracket,
      match.poolId ? "pool" : round.type
    );

    // Now, fetch the scoring rule using the ID we just found
    const scoring = scoringListId
      ? await ScoringList.findByPk(scoringListId, { transaction: t })
      : null;

    // determine winning conditions
    let completed = false;
    let winnerTeamId = null;
    let loserTeamId = null;

    if (scoring && scoring.name) {
      const scoringName = scoring.name.toLowerCase();
      const isBestOf = scoringName.includes("best of");

      if (isBestOf) {
        // "BEST OF X"
        const bestOfMatch = scoringName.match(/best of (\d+)/);
        let gamesToWin = 2; // Default "Best of 3"
        if (bestOfMatch && bestOfMatch[1]) {
          const numGames = parseInt(bestOfMatch[1], 10);
          gamesToWin = Math.ceil(numGames / 2);
        }
        if (scoreTeam1 === gamesToWin || scoreTeam2 === gamesToWin) {
          completed = true;
          winnerTeamId =
            scoreTeam1 > scoreTeam2 ? match.team1Id : match.team2Id;
          loserTeamId = scoreTeam1 > scoreTeam2 ? match.team2Id : match.team1Id;
        }
      } else {
        //"ONE GAME TO X WIN BY Y"
        const matchTo = parseInt(scoringName.match(/to (\d+)/)?.[1] || 11);
        const winBy = parseInt(scoringName.match(/win by (\d+)/)?.[1] || 1);

        if (scoreTeam1 < matchTo && scoreTeam2 < matchTo) {
          await t.rollback();
          return res.status(400).json({
            error: true,
            code: 400,
            message: `Invalid score: At least one team must reach ${matchTo} points.`,
          });
        }

        // Check points differential
        if (Math.abs(scoreTeam1 - scoreTeam2) < winBy) {
          await t.rollback();
          return res.status(400).json({
            error: true,
            code: 400,
            message: `Invalid score: The points difference must be at least ${winBy}.`,
          });
        }

        const team1Wins =
          scoreTeam1 >= matchTo && scoreTeam1 >= scoreTeam2 + winBy;
        const team2Wins =
          scoreTeam2 >= matchTo && scoreTeam2 >= scoreTeam1 + winBy;

        if (team1Wins || team2Wins) {
          completed = true;
          winnerTeamId = team1Wins ? match.team1Id : match.team2Id;
          loserTeamId = team1Wins ? match.team2Id : match.team1Id;
        }
      }
    } else {
      await t.rollback(); // Stop the transaction
      // console.error(
      //   `Scoring rule not found for match ${matchId} in round ${round.id} (type: ${round.type}). 'scoringListId' was ${scoringListId}.`
      // );
      return res.status(400).json({
        message: `Cannot update score: No scoring rule is set for this round (type: ${round.type}).`,
      });
    }

    // UPDATE MATCH
    match.scoreTeam1 = scoreTeam1;
    match.scoreTeam2 = scoreTeam2;
    match.status = completed ? "completed" : "ongoing";
    match.winnerTeamId = winnerTeamId;
    match.loserTeamId = loserTeamId;
    await match.save({ transaction: t });

    //  UPDATE ROUND STATUS
    const matchesInRound = await Match.findAll({
      where: { roundId: round.id },
      order: [["id", "ASC"]],
      transaction: t,
    });

    const allCompleted = matchesInRound.every((m) => m.status === "completed");
    const anyOngoing = matchesInRound.some(
      (m) => m.status === "ongoing" || m.status === "completed"
    );
    round.status = allCompleted
      ? "completed"
      : anyOngoing
      ? "ongoing"
      : "pending";
    await round.save({ transaction: t });

    // POOL OR PLAYOFF LOGIC
    if (match.poolId) {
      await recomputeTeamStats(match.poolId, match.team1Id, t);
      await recomputeTeamStats(match.poolId, match.team2Id, t);
    } else if (completed) {
      // Call helper to update stats and rank
      await handlePlayoffMatch(match, round, t);
    }

    //  CREATE NEXT ROUND WHEN NEEDED
    if (allCompleted) {
      if (round.type === "gold") {
        const tournament = await Tournament.findByPk(bracket.tournamentId, {
          transaction: t,
        });
        if (tournament) {
          tournament.status = "completed";
          await tournament.save({ transaction: t });
        }
        bracket.status = "completed";

        await bracket.save({ transaction: t });
      }

      //Filter winners array to remove nulls
      const winners = matchesInRound.map((m) => m.winnerTeamId).filter(Boolean);
      const losers = matchesInRound.map((m) => m.loserTeamId).filter(Boolean);

      if (winners.length === 2 && round.type === "semifinal") {
        // GOLD ROUND
        const goldRound = await Round.create(
          {
            bracketId: round.bracketId,
            poolId: null,
            roundNumber: round.roundNumber + 1,
            status: "pending",
            type: "gold",
          },
          { transaction: t }
        );
        await Match.create(
          {
            roundId: goldRound.id,
            team1Id: winners[0],
            team2Id: winners[1],
            status: "not_started",
            scoreTeam1: 0,
            scoreTeam2: 0,
          },
          { transaction: t }
        );

        // BRONZE ROUND
        const bronzeRound = await Round.create(
          {
            bracketId: round.bracketId,
            poolId: null,
            roundNumber: round.roundNumber + 2,
            status: "pending",
            type: "bronze",
          },
          { transaction: t }
        );
        await Match.create(
          {
            roundId: bronzeRound.id,
            team1Id: losers[0],
            team2Id: losers[1],
            status: "not_started",
            scoreTeam1: 0,
            scoreTeam2: 0,
          },
          { transaction: t }
        );
        // } else {
        //   // NORMAL NEXT ROUND
        //   const existingNextRound = await Round.findOne({
        //     where: {
        //       bracketId: round.bracketId,
        //       roundNumber: round.roundNumber + 1,
        //     },
        //     transaction: t,
        //   });

        //   if (!existingNextRound && winners.length > 1) {
        //     const nextRoundType =
        //       winners.length === 2
        //         ? "gold"
        //         : winners.length === 4
        //         ? "semifinal"
        //         : winners.length === 8
        //         ? "quarterfinal"
        //         : `round_of_${winners.length}`;

        //     const nextRound = await Round.create(
        //       {
        //         bracketId: round.bracketId,
        //         poolId: null,
        //         roundNumber: round.roundNumber + 1,
        //         status: "pending",
        //         type: nextRoundType,
        //       },
        //       { transaction: t }
        //     );

        //     const n = winners.length;
        //     const nextMatches = [];
        //     for (let i = 0; i < Math.floor(n / 2); i++) {
        //       nextMatches.push({
        //         roundId: nextRound.id,
        //         team1Id: winners[i],
        //         team2Id: winners[n - 1 - i],
        //         status: "not_started",
        //         scoreTeam1: 0,
        //         scoreTeam2: 0,
        //       });
        //     }
        //     await Match.bulkCreate(nextMatches, { transaction: t });
        //   }
      }
    }

    await t.commit();
    return res.status(200).json({
      message: "Match score updated successfully",
      data: match,
    });
  } catch (err) {
    await t.rollback();
    // console.error("updateMatchScore error:", err);
    return res.status(500).json({ message: err.message });
  }
};

//handle playoff matches
const handlePlayoffMatch = async (match, round, transaction) => {
  try {
    const { winnerTeamId, loserTeamId, scoreTeam1, scoreTeam2 } = match;
    // Determine the winner's and loser's scores
    const winnerScore = Math.max(scoreTeam1, scoreTeam2);
    const loserScore = Math.min(scoreTeam1, scoreTeam2);

    // 1. Find stats for BOTH teams
    const winnerStats = await PoolTeamStats.findOne({
      where: { teamId: winnerTeamId },
      transaction,
    });
    const loserStats = await PoolTeamStats.findOne({
      where: { teamId: loserTeamId },
      transaction,
    });

    // 2.updating winner stats
    if (winnerStats) {
      winnerStats.playoffWins = (winnerStats.playoffWins || 0) + 1;
      winnerStats.playoffPointsFor =
        (winnerStats.playoffPointsFor || 0) + winnerScore;
      winnerStats.playoffPointsAgainst =
        (winnerStats.playoffPointsAgainst || 0) + loserScore;
      winnerStats.playoffPointDifference =
        winnerStats.playoffPointsFor - winnerStats.playoffPointsAgainst;

      // save final rank
      if (round.type === "gold") {
        winnerStats.finalRank = 1; // Gold
      } else if (round.type === "bronze") {
        winnerStats.finalRank = 3; // Bronze
      }
      await winnerStats.save({ transaction });
    }

    // 3. Update LOSER's stats
    if (loserStats) {
      // Loser's wins do not increase
      loserStats.playoffPointsFor =
        (loserStats.playoffPointsFor || 0) + loserScore;
      loserStats.playoffPointsAgainst =
        (loserStats.playoffPointsAgainst || 0) + winnerScore;
      loserStats.playoffPointDifference =
        loserStats.playoffPointsFor - loserStats.playoffPointsAgainst;

      //save final rank
      if (round.type === "gold") {
        loserStats.finalRank = 2; // Silver
      } else if (round.type === "bronze") {
        loserStats.finalRank = 4; // 4th Place
      }
      await loserStats.save({ transaction });
    }
  } catch (error) {
    // console.error("Error in handlePlayoffMatch:", error);
    throw error; // Re-throw to be caught by updateMatchScore's transaction
  }
};

//reseting playoffs creating new by destroying all rounds,matches,poolTeamStats
const resetPlayoffs = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bracketId } = req.params;

    //  Fetch bracket
    const bracket = await Bracket.findByPk(bracketId, { transaction: t });
    if (!bracket) throw new Error("Bracket not found");

    //  Fetch all playoff rounds (exclude pool rounds)
    const playoffRounds = await Round.findAll({
      where: { bracketId, type: { [Op.not]: "pool" } },
      transaction: t,
    });

    const playoffRoundIds = playoffRounds.map((r) => r.id);

    //  Delete all matches in these rounds
    if (playoffRoundIds.length > 0) {
      await Match.destroy({
        where: { roundId: { [Op.in]: playoffRoundIds } },
        transaction: t,
      });

      //  Delete the rounds themselves
      await Round.destroy({
        where: { id: { [Op.in]: playoffRoundIds } },
        transaction: t,
      });
    }

    //  Reset bracket status (from "completed" back to "ongoing")
    bracket.status = "ongoing";
    await bracket.save({ transaction: t });

    // 1. Find all pools associated with this bracket
    const pools = await Pool.findAll({
      where: { bracketId },
      attributes: ["id"], // We only need the pool IDs
      transaction: t,
    });

    const poolIds = pools.map((p) => p.id);

    // 2. Reset stats for all teams belonging to those pools
    if (poolIds.length > 0) {
      await PoolTeamStats.update(
        {
          playoffSeed: null,
          playoffWins: 0,
          playoffPointsFor: 0,
          playoffPointsAgainst: 0,
          playoffPointDifference: 0,
          finalRank: null,
        },
        {
          where: { poolId: { [Op.in]: poolIds } }, // Update based on poolId
          transaction: t,
        }
      );
    }

    await t.commit();
    return res.status(200).json({ message: "Playoffs reset successfully" });
  } catch (err) {
    await t.rollback();
    // console.error(err);
    return res.status(500).json({ message: err.message });
  }
};

//final standings
const getFinalStandings = async (req, res) => {
  try {
    const { tournamentId, bracketId } = req.params;

    const tournament = await Tournament.findByPk(tournamentId);

    const bracket = await Bracket.findByPk(bracketId);

    if (!bracket || !tournament) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournament or bracket not found",
      });
    }

    // logic to find all poolIds for this bracketId
    const pools = await Pool.findAll({
      where: { tournamentId, bracketId },
      attributes: ["id"],
    });

    const poolIds = pools.map((p) => p.id);

    const stats = await PoolTeamStats.findAll({
      where: { poolId: { [Op.in]: poolIds } },
      include: [
        {
          model: Team,
          attributes: ["id", "teamName"],
          include: [
            {
              model: TeamPlayer,
              as: "TeamPlayers",
              include: [
                {
                  model: User,
                  as: "User",
                  attributes: ["firstname", "lastname"],
                },
              ],
            },
          ],
        },
        {
          model: Pool,
          attributes: ["poolName"],
        },
      ],
      order: [
        // 1. Put teams with a finalRank (1, 2, 3) at the very top
        [sequelize.fn("ISNULL", sequelize.col("finalRank")), "ASC"],
        ["finalRank", "ASC"],

        // 2. Put teams that made the playoffs (playoffSeed IS NOT NULL)
        //    before teams that didn't (playoffSeed IS NULL)
        [sequelize.fn("ISNULL", sequelize.col("playoffSeed")), "ASC"],

        // 3. For teams in the playoffs, sort by playoff wins, then original seed
        ["playoffWins", "DESC"],
        ["playoffSeed", "ASC"],

        // 4. For teams that DIDN'T make the playoffs (and have null for all
        //    the above), sort by their pool performance.
        ["wins", "DESC"],
        ["pointDifference", "DESC"],
        ["pdPercent", "DESC"],
      ],
    }); // Map and assign medals

    const standings = stats.map((team, index) => {
      let medal = null;
      if (team.finalRank === 1) medal = "Gold";
      else if (team.finalRank === 2) medal = "Silver";
      else if (team.finalRank === 3) medal = "Bronze";

      return {
        position: index + 1, // The array index is now the correct position
        medal,
        poolName: team.Pool ? team.Pool.poolName.replace(/[^0-9]/g, "") : null,
        teamId: team.Team.id,
        teamName: team.Team.teamName,
        players: team.Team.TeamPlayers.map(
          (tp) => `${tp.User.firstname} ${tp.User.lastname}`
        ),
        wins: team.wins,
        losses: team.losses,
        pointsFor: team.pointsFor,
        pointsAgainst: team.pointsAgainst,
        pointDifference: team.pointDifference,
        pdPercent: team.pdPercent,
        playoffWins: team.playoffWins,
        playoffSeed: team.playoffSeed, // Good to include
        finalRank: team.finalRank, // Good to include
        playoffPointDifference: team.playoffPointDifference,
        playoffPointsFor: team.playoffPointsFor,
        playoffPointsAgainst: team.playoffPointsAgainst,
      };
    });

    return res.status(200).json({
      success: true,
      standings,
    });
  } catch (error) {
    // console.error("Error in getFinalStandings:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  checkInPlayerForEvent,
  undoCheckInPlayer,
  gettingAllBracketsOfTournamentByHost,
  registeredPlayersForBracket,
  registeredPlayersWhoAreNotCheckin,
  manualAddTeam,
  checkInAllPlayersForEvent,
  syncTeamsStatus,
  createRoundRobin,
  getPoolDetails,
  getTeamsWithPoolAndPlayers,
  getPoolsWithTeams,
  getAllPools,
  getMatchDetails,
  updateMatchScore,
  resetMatchScore,
  getPlayoffRounds,
  getOrCreatePlayoffs,
  resetPlayoffs,
  getFinalStandings,
  hostStats,
  addPlayerByHost,
};
