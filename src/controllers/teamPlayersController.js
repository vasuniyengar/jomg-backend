// import { trace } from "joi";
import { Op } from "sequelize";
import sequelize from "../config/database.js";
import models from "../models/Associations.js";

const {
  Bracket,
  Tournament,
  Team,
  TeamPlayer,
  PlayerRegistration,
  Event,
  User,
  PoolTeam,
  PoolTeamStats,
} = models;

const INACTIVE_TEAM_STATUSES = ["waitlist", "withdrawn", "forfeited"];

const generateTeams = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bracketId, tournamentId } = req.params;

    const { search } = req.query;
    if (search) {
      const normalize = (s) =>
        String(s || "")
          .toLowerCase()
          .replace(/\s+/g, "") // remove spaces
          .replace(/[^a-z0-9]/g, ""); // remove non alphanumeric

      const searchTerm = normalize(search);
    }

    // console.log("bracketId", bracketId);

    // console.log("tournamentId", tournamentId);

    const tournament = await Tournament.findByPk(tournamentId, {
      transaction: t,
    });
    if (!tournament) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournament not found!",
      });
    }

    const bracket = await Bracket.findByPk(bracketId, {
      include: [
        {
          model: Event,
        },
      ],
      transaction: t,
    });

    if (!bracket) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "bracket not found!",
      });
    }

    const lowerEventName = bracket.Event.eventName.toLowerCase();

    // console.log(lowerEventName);

    const registartedPlayers = await PlayerRegistration.findAll({
      where: {
        bracketId,
        tournamentId,
        status: "registered",
        paymentStatus: "paid",
      },
      include: [
        {
          model: User,
          attributes: ["id", "firstname", "lastname"],
        },
      ],
      order: [["createdAt", "ASC"]],
      transaction: t,
    });

    // console.log("reg", registartedPlayers);

    if (!registartedPlayers.length) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "their is no player registrations to create teams",
        bracketData: {
          bracketName: bracket.name,
          tournamentStartDate: tournament.startDate,
          tournamentEndDate: tournament.endDate,
          maxTeams: bracket.maxTeams,
          totalPlayersRequired: bracket?.Event?.eventName
            ?.toLowerCase()
            .includes("double")
            ? bracket.maxTeams * 2
            : bracket.maxTeams,
          totalRegistered: registartedPlayers.length,
        },
      });
    }

    const existingTeams = await Team.findAll({
      where: {
        tournamentId,
        bracketId,
        status: { [Op.notIn]: ["waitlist", "withdrawn", "forfeited"] },
      },
      include: [
        {
          model: TeamPlayer,
          as: "TeamPlayers",
          include: [{ model: User, as: "User" }],
        },
      ],
      transaction: t,
    });

    // console.log("exis", existingTeams);

    const assignedPlayerIds = new Set();

    existingTeams.forEach((team) => {
      team.TeamPlayers.forEach((tp) => assignedPlayerIds.add(tp.playerId));
    });

    const newPlayers = registartedPlayers.filter(
      (pr) => !assignedPlayerIds.has(pr.playerId)
    );

    // console.log("newplayers", newPlayers);

    let teamCount = existingTeams.length;

    const finalTeams = [
      ...existingTeams.map((team) => ({
        teamName: team.teamName,
        teamId: team.id,
        players: team.TeamPlayers.map((tp) => ({
          playerId: tp.playerId,
          playerName: `${tp.User.firstname} ${tp.User.lastname}`,
        })),
      })),
    ];

    // console.log("fina", finalTeams);

    const shuffled = newPlayers.sort(() => Math.random() - 0.5);

    // let teamCount = 0;
    // const finalTeams = [];

    if (lowerEventName.includes("single")) {
      for (const player of shuffled) {
        if (teamCount >= bracket.maxTeams) break;

        teamCount++;

        // console.log(teamCount);

        const team = await Team.create(
          {
            bracketId,
            tournamentId,
            teamName: `Team ${teamCount}`,
            isComplete: true,
          },
          {
            transaction: t,
          }
        );

        await TeamPlayer.create(
          {
            teamId: team.id,
            playerId: player.playerId,
            role: "player",
          },
          {
            transaction: t,
          }
        );

        finalTeams.push({
          teamName: team.teamName,
          teamId: team.id,
          players: [
            {
              playerId: player.playerId,
              playerName: `${player.User.firstname} ${player.User.lastname}`,
            },
          ],
        });
      }

      // console.log("final teams for single", finalTeams);
    } else if (lowerEventName.includes("double")) {
      const individualPlayers = [];
      const pairedPlayers = new Set();

      for (const regPlayer of shuffled) {
        if (teamCount >= bracket.maxTeams) break;

        if (pairedPlayers.has(regPlayer.playerId)) continue;

        if (regPlayer.partnerId) {
          const partner = shuffled.find(
            (p) => p.playerId === regPlayer.partnerId
          );

          if (!partner) {
            individualPlayers.push(regPlayer);
            continue;
          }

          teamCount++;

          // console.log(teamCount);

          const team = await Team.create(
            {
              teamName: `Team ${teamCount}`,
              tournamentId,
              bracketId,
              isComplete: true,
            },
            {
              transaction: t,
            }
          );

          await TeamPlayer.bulkCreate(
            [
              {
                teamId: team.id,
                playerId: regPlayer.playerId,
                role: "player",
              },
              {
                teamId: team.id,
                playerId: partner.playerId,
                role: "partner",
              },
            ],
            {
              transaction: t,
            }
          );

          finalTeams.push({
            teamName: team.teamName,
            teamId: team.id,
            players: [
              {
                playerId: regPlayer.playerId,
                playerName: `${regPlayer.User.firstname} ${regPlayer.User.lastname}`,
              },
              {
                playerId: partner.playerId,
                playerName: `${partner.User.firstname} ${partner.User.lastname}`,
              },
            ],
          });

          // console.log("double final", finalTeams);

          pairedPlayers.add(regPlayer.playerId);
          pairedPlayers.add(partner.playerId);
        } else {
          individualPlayers.push(regPlayer);
        }
      }

      const inCompleteTeams = existingTeams.filter(
        (team) => !team.isComplete && team.TeamPlayers.length == 1
      );

      for (const team of inCompleteTeams) {
        if (individualPlayers.length === 0) break;

        const playerToAdd = individualPlayers.shift();

        await TeamPlayer.create(
          {
            teamId: team.id,
            playerId: playerToAdd.playerId,
            role: "player",
          },
          {
            transaction: t,
          }
        );

        await Team.update(
          {
            isComplete: true,
          },
          {
            where: { id: team.id },
            transaction: t,
          }
        );

        const teamInFinalList = finalTeams.find((t) => t.teamId === team.id);

        if (teamInFinalList) {
          teamInFinalList.players.push({
            playerId: playerToAdd.playerId,
            playerName: `${playerToAdd.User.firstname} ${playerToAdd.User.lastname}`,
          });
        }
      }

      for (let i = 0; i < individualPlayers.length; i += 2) {
        if (teamCount >= bracket.maxTeams) break;

        teamCount++;

        const player1 = individualPlayers[i];
        const player2 = individualPlayers[i + 1];

        const isComplete = !!player2;

        const team = await Team.create(
          {
            tournamentId,
            bracketId,
            teamName: `Team ${teamCount}`,
            isComplete,
          },
          {
            transaction: t,
          }
        );

        await TeamPlayer.create(
          {
            playerId: player1.playerId,
            teamId: team.id,
            role: "player",
          },
          {
            transaction: t,
          }
        );

        const players = [
          {
            playerName: `${player1.User.firstname} ${player1.User.lastname}`,
            playerId: player1.playerId,
          },
        ];

        if (player2) {
          await TeamPlayer.create(
            {
              teamId: team.id,
              playerId: player2.playerId,
              role: "player",
            },
            {
              transaction: t,
            }
          );

          players.push({
            playerName: `${player2.User.firstname} ${player2.User.lastname}`,
            playerId: player2.playerId,
          });
        }

        finalTeams.push({
          teamName: team.teamName,
          teamId: team.id,
          players,
        });
      }
    } else {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "unsupported event send correct event",
      });
    }
    let filteredTeams = finalTeams;

    if (search) {
      // Normalize search term: lowercase, remove spaces and non-alphanumeric chars
      const normalize = (s) =>
        String(s || "")
          .toLowerCase()
          .replace(/\s+/g, "") // remove spaces
          .replace(/[^a-z0-9]/g, ""); // remove non-alphanumeric

      const searchTerm = normalize(search);

      filteredTeams = finalTeams.filter((team) => {
        // Normalize team name (e.g., "Team 1","team1")
        const normalizedTeamName = normalize(team.teamName);

        const matchTeamName = normalizedTeamName.includes(searchTerm);

        // Normalize and check each player name
        const teamPlayersMatch = team.players.some((p) => {
          const normalizedPlayerName = normalize(p.playerName);
          return normalizedPlayerName.includes(searchTerm);
        });

        return matchTeamName || teamPlayersMatch;
      });
    }

    // console.log("filtered teams", filteredTeams);

    await t.commit();

    res.status(201).json({
      error: false,
      code: 201,
      message: "teams generated successfully!",
      data: filteredTeams,
      bracketData: {
        bracketName: bracket.name,
        tournamentStartDate: tournament.startDate,
        tournamentEndDate: tournament.endDate,
        maxTeams: bracket.maxTeams,
        totalPlayersRequired: bracket?.Event?.eventName
          ?.toLowerCase()
          .includes("double")
          ? bracket.maxTeams * 2
          : bracket.maxTeams,
        totalRegistered: registartedPlayers.length,
      },
      totalTeams: finalTeams.length,
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

function eventTypeFromName(eventName = "") {
  const lower = String(eventName).toLowerCase();
  if (lower.includes("mlp")) return "mlp";
  if (lower.includes("double") || lower.includes("mixed")) return "double";
  if (lower.includes("single")) return "single";
  return "unknown";
}

function formatTeamResponse(team) {
  return {
    id: team.id,
    teamName: team.teamName,
    status: team.status,
    isComplete: team.isComplete,
    pool: null,
    players: (team.TeamPlayers || []).map((tp) => tp.User).filter(Boolean),
  };
}

const ALLOWED_TEAM_STATUSES = new Set([
  "registered",
  "checked-in",
  "active",
  "waitlist",
  "pending_payment",
  "withdrawn",
  "forfeited",
]);

const UI_STATUS_TO_API = {
  confirmed: "registered",
  pending: "pending_payment",
  waitlist: "waitlist",
  late: "registered",
  withdrawn: "withdrawn",
  forfeited: "forfeited",
};

const updateTeamStatus = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tournamentId, bracketId, teamId } = req.params;
    const { status: rawStatus } = req.body || {};

    const apiStatus = UI_STATUS_TO_API[rawStatus] || rawStatus;
    if (!apiStatus || !ALLOWED_TEAM_STATUSES.has(apiStatus)) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Invalid team status",
      });
    }

    const bracket = await Bracket.findByPk(bracketId, { transaction: t });
    if (!bracket || String(bracket.tournamentId) !== String(tournamentId)) {
      await t.rollback();
      return res.status(404).json({
        error: true,
        code: 404,
        message: "bracket not found!",
      });
    }

    if (bracket.poolStarted) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Bracket is published — roster is locked",
      });
    }

    const team = await Team.findOne({
      where: { id: teamId, tournamentId, bracketId },
      transaction: t,
    });
    if (!team) {
      await t.rollback();
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Team not found in this division",
      });
    }

    await team.update({ status: apiStatus }, { transaction: t });

    const updated = await Team.findByPk(team.id, {
      include: [
        {
          model: TeamPlayer,
          as: "TeamPlayers",
          include: [
            {
              model: User,
              as: "User",
              attributes: ["id", "firstname", "lastname", "email", "duprRating", "gender"],
            },
          ],
        },
      ],
      transaction: t,
    });

    await t.commit();

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Team status updated",
      data: formatTeamResponse(updated),
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

const createTeamFromPlayers = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bracketId, tournamentId } = req.params;
    const { playerIds = [], partnerNeeded = false } = req.body || {};

    if (!Array.isArray(playerIds) || playerIds.length === 0) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "playerIds must be a non-empty array",
      });
    }

    const uniqueIds = [...new Set(playerIds.map((id) => Number(id)).filter(Boolean))];
    if (uniqueIds.length !== playerIds.length) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Duplicate player IDs are not allowed",
      });
    }

    const tournament = await Tournament.findByPk(tournamentId, { transaction: t });
    if (!tournament) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "tournament not found!",
      });
    }

    const bracket = await Bracket.findByPk(bracketId, {
      include: [{ model: Event }],
      transaction: t,
    });
    if (!bracket) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "bracket not found!",
      });
    }

    const eventType = eventTypeFromName(bracket.Event?.eventName);
    if (eventType === "unknown") {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "unsupported event — send correct event",
      });
    }

    const existingTeamCount = await Team.count({
      where: {
        tournamentId,
        bracketId,
        status: { [Op.notIn]: ["waitlist", "withdrawn", "forfeited"] },
      },
      transaction: t,
    });
    if (existingTeamCount >= bracket.maxTeams) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Division is full — cannot add more teams",
      });
    }

    if (eventType === "single" && uniqueIds.length !== 1) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Singles divisions require exactly 1 player",
      });
    }

    if (eventType === "double") {
      if (partnerNeeded && uniqueIds.length !== 1) {
        await t.rollback();
        return res.status(400).json({
          error: true,
          code: 400,
          message: "Needs-partner teams require exactly 1 player",
        });
      }
      if (!partnerNeeded && uniqueIds.length !== 2) {
        await t.rollback();
        return res.status(400).json({
          error: true,
          code: 400,
          message: "Doubles divisions require exactly 2 players",
        });
      }
    }

    if (eventType === "mlp") {
      if (uniqueIds.length < 2 || uniqueIds.length > 6) {
        await t.rollback();
        return res.status(400).json({
          error: true,
          code: 400,
          message: "MLP teams require between 2 and 6 players",
        });
      }
    }

    const registrations = await PlayerRegistration.findAll({
      where: {
        bracketId,
        tournamentId,
        playerId: uniqueIds,
        status: "registered",
      },
      include: [
        {
          model: User,
          attributes: ["id", "firstname", "lastname", "email", "duprRating", "gender"],
        },
      ],
      transaction: t,
    });

    if (registrations.length !== uniqueIds.length) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "One or more players are not registered for this division",
      });
    }

    const existingAssignments = await TeamPlayer.findAll({
      include: [
        {
          model: Team,
          as: "Team",
          where: { tournamentId, bracketId },
          attributes: ["id"],
        },
      ],
      where: { playerId: uniqueIds },
      transaction: t,
    });

    if (existingAssignments.length > 0) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "One or more players are already on a team in this division",
      });
    }

    if (eventType === "mlp") {
      const males = registrations.filter((r) =>
        String(r.User?.gender || "").toLowerCase().startsWith("m")
      ).length;
      const females = registrations.filter((r) =>
        String(r.User?.gender || "").toLowerCase().startsWith("f")
      ).length;
      if (males < 2 || females < 2) {
        await t.rollback();
        return res.status(400).json({
          error: true,
          code: 400,
          message: "MLP teams require at least 2 male and 2 female players",
        });
      }
    }

    const teamNumber = existingTeamCount + 1;
    const isComplete =
      eventType === "single" ||
      (eventType === "double" && !partnerNeeded) ||
      (eventType === "mlp" && uniqueIds.length >= 4);

    const team = await Team.create(
      {
        bracketId,
        tournamentId,
        teamName: `Team ${teamNumber}`,
        isComplete,
      },
      { transaction: t }
    );

    const roles = ["player", "partner"];
    await TeamPlayer.bulkCreate(
      uniqueIds.map((playerId, index) => ({
        teamId: team.id,
        playerId,
        role: index === 0 ? "player" : roles[Math.min(index, 1)] || "player",
      })),
      { transaction: t }
    );

    const created = await Team.findByPk(team.id, {
      include: [
        {
          model: TeamPlayer,
          as: "TeamPlayers",
          include: [
            {
              model: User,
              as: "User",
              attributes: ["id", "firstname", "lastname", "email", "duprRating", "gender"],
            },
          ],
        },
      ],
      transaction: t,
    });

    await t.commit();

    return res.status(201).json({
      error: false,
      code: 201,
      message: "Team created successfully",
      data: formatTeamResponse(created),
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

const deleteTeam = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tournamentId, bracketId, teamId } = req.params;

    const bracket = await Bracket.findByPk(bracketId, { transaction: t });
    if (!bracket || String(bracket.tournamentId) !== String(tournamentId)) {
      await t.rollback();
      return res.status(404).json({
        error: true,
        code: 404,
        message: "bracket not found!",
      });
    }

    if (bracket.poolStarted) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Bracket is published — roster is locked",
      });
    }

    const team = await Team.findOne({
      where: { id: teamId, tournamentId, bracketId },
      transaction: t,
    });
    if (!team) {
      await t.rollback();
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Team not found in this division",
      });
    }

    await TeamPlayer.destroy({ where: { teamId: team.id }, transaction: t });
    await PoolTeamStats.destroy({ where: { teamId: team.id }, transaction: t });
    await PoolTeam.destroy({ where: { teamId: team.id }, transaction: t });
    await team.destroy({ transaction: t });

    await t.commit();

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Team removed",
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
};

export default {
  generateTeams,
  createTeamFromPlayers,
  updateTeamStatus,
  deleteTeam,
};
