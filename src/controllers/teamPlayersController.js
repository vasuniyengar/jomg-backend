// import { trace } from "joi";
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
} = models;

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

export default { generateTeams };
