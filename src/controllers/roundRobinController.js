import prisma from "../config/prisma.js";
import { expandPairingToSeriesGames } from "../utils/seriesGames.js";

async function assertHostTournament(tournamentId, hostId) {
  const tournament = await prisma.tournament.findFirst({
    where: { id: Number(tournamentId), hostId: Number(hostId) },
  });
  if (!tournament) {
    const err = new Error("Tournament not found or access denied");
    err.status = 404;
    throw err;
  }
  return tournament;
}

// const createRoundRobin = async (req, res) => {
//   try {
//     const { tournamentId, bracketId, teamsPerPool } = req.body;

//     const parsedTournamentId = Number(tournamentId);
//     const parsedBracketId = Number(bracketId);
//     const parsedTeamsPerPool = Number(teamsPerPool);

//     await assertHostTournament(parsedTournamentId, req.user.id);
//     let bracket;
//     try {
//       bracket = await prisma.bracket.findFirst({
//         where: { id: parsedBracketId, tournamentId: parsedTournamentId },
//       });
//     } catch (e) {
//       console.error("FAILED AT bracket.findFirst:", e.message);
//       throw e;
//     }

//     if (!bracket) {
//       return res.status(404).json({
//         error: true,
//         code: 404,
//         message: "Bracket not found for this tournament",
//       });
//     }
//     console.log("Checking existing pools for:", { parsedBracketId, parsedTournamentId });
//     const existingPools = await prisma.pool.findMany({
//   where: {
//     bracketId: parsedBracketId,
//     tournamentId: parsedTournamentId,
//   },
// });
// console.log("Existing pools found:", existingPools.length);

// if (existingPools.length > 0) {
//   return res.status(400).json({
//     error: true,
//     code: 400,
//     message: "Round robin already generated for this bracket. Delete existing pools before regenerating.",
//   });
// }

//     // Get all teams in this bracket
//     let teams;
//     try {
//       teams = await prisma.team.findMany({
//         where: {
//           bracketId: parsedBracketId,
//           tournamentId: parsedTournamentId,
//           status: { notIn: ["waitlist", "withdrawn", "forfeited"] },
//         },
//       });
//     } catch (e) {
//       console.error("FAILED AT team.findMany:", e.message);
//       throw e;
//     }

//     if (teams.length < 2) {
//       return res.status(400).json({
//         error: true,
//         code: 400,
//         message: "Not enough teams to create round robin",
//       });
//     }

//     if (teams.length > bracket.maxTeams) {
//       return res.status(400).json({
//         error: true,
//         code: 400,
//         message: `Too many teams. This bracket allows a maximum of ${bracket.maxTeams} teams but has ${teams.length} registered.`,
//       });
//     }

//     // Split teams into pools
//     const shuffledTeams = teams.sort(() => Math.random() - 0.5);
//     const perPool = parsedTeamsPerPool || 4;
//     const poolGroups = [];

//     for (let i = 0; i < shuffledTeams.length; i += perPool) {
//       poolGroups.push(shuffledTeams.slice(i, i + perPool));
//     }

//     const createdPools = [];

//     for (let poolIndex = 0; poolIndex < poolGroups.length; poolIndex++) {
//       const poolTeams = poolGroups[poolIndex];
//       const poolName = `Pool ${String.fromCharCode(65 + poolIndex)}`;

//       // Create the pool
//       let pool;
//       try {
//         pool = await prisma.pool.create({
//           data: {
//             poolName,
//             bracketId: parsedBracketId,
//             tournamentId: parsedTournamentId,
//           },
//         });
//       } catch (e) {
//         console.error("FAILED AT pool.create:", e.message);
//         throw e;
//       }

//       // Add teams to pool
//       for (const team of poolTeams) {
//         try {
//           await prisma.poolTeam.create({
//             data: {
//               poolId: pool.id,
//               teamId: team.id,
//             },
//           });
//         } catch (e) {
//           console.error(`FAILED AT poolTeam.create for teamId ${team.id}:`, e.message);
//           throw e;
//         }
//       }

//       // Generate round robin matchups using circle method
//       let roundTeams = [...poolTeams];
//       if (roundTeams.length % 2 !== 0) {
//         roundTeams.push(null); // bye
//       }

//       const numRounds = roundTeams.length - 1;
//       const half = roundTeams.length / 2;
//       const poolRounds = [];

//       for (let round = 0; round < numRounds; round++) {
//         const roundMatches = [];

//         for (let match = 0; match < half; match++) {
//           const team1 = roundTeams[match];
//           const team2 = roundTeams[roundTeams.length - 1 - match];

//           if (team1 !== null && team2 !== null) {
//             roundMatches.push({ team1, team2 });
//           }
//         }

//         poolRounds.push(roundMatches);

//         const fixed = roundTeams[0];
//         const rotating = roundTeams.slice(1);
//         rotating.unshift(rotating.pop());
//         roundTeams = [fixed, ...rotating];
//       }

//       // Write rounds and matches to DB
//       for (let r = 0; r < poolRounds.length; r++) {
//         let round;
//         try {
//           round = await prisma.round.create({
//             data: {
//               poolId: pool.id,
//               bracketId: parsedBracketId,
//               roundNumber: r + 1,
//               status: "pending",
//               type: "pool",
//             },
//           });
//         } catch (e) {
//           console.error(`FAILED AT round.create for round ${r + 1}:`, e.message);
//           throw e;
//         }

//         try {
//           await prisma.match.createMany({
//             data: poolRounds[r].map(({ team1, team2 }) => ({
//               team1Id: team1.id,
//               team2Id: team2.id,
//               poolId: pool.id,
//               roundId: round.id,
//               status: "not_started",
//               type: "pool",
//             })),
//           });
//         } catch (e) {
//           console.error(`FAILED AT match.createMany for round ${r + 1}:`, e.message);
//           throw e;
//         }

//         poolRounds[r].roundId = round.id;
//       }

//       createdPools.push({
//         pool,
//         teams: poolTeams,
//         rounds: poolRounds.length,
//       });
//     }

//     res.status(201).json({
//       error: false,
//       code: 201,
//       message: "Round robin created successfully",
//       data: {
//         totalPools: createdPools.length,
//         pools: createdPools,
//       },
//     });
//   } catch (error) {
//     console.error("ROUND ROBIN CREATION FAILED:", error.message);
//     res.status(500).json({ error: true, code: 500, message: error.message });
//   }
// };

// const getPoolsByBracket = async (req, res) => {
//   try {
//     const tournamentId = Number(req.params.tournamentId);
//     const bracketId = Number(req.params.bracketId);

//     await assertHostTournament(tournamentId, req.user.id);

//     let pools;
//     try {
//       pools = await prisma.pool.findMany({
//         where: {
//           bracketId,
//           tournamentId,
//         },
//         include: {
//           rounds: {
//             orderBy: { roundNumber: "asc" },
//             include: {
//               matches: {
//                 include: {
//                   team1: true,
//                   team2: true,
//                 },
//               },
//             },
//           },
//         },
//       });
//     } catch (e) {
//       console.error("FAILED AT pool.findMany:", e.message);
//       throw e;
//     }

//     res.status(200).json({
//       error: false,
//       code: 200,
//       data: { pools: pools.map((pool) => ({ pool, rounds: pool.rounds })) },
//     });
//   } catch (error) {
//     console.error("GET POOLS FAILED:", error.message);
//     res.status(500).json({ error: true, code: 500, message: error.message });
//   }
// };
const createRoundRobin = async (req, res) => {
  try {
    const { tournamentId, bracketId, teamsPerPool } = req.body;

    const parsedTournamentId = Number(tournamentId);
    const parsedBracketId = Number(bracketId);
    const parsedTeamsPerPool = Number(teamsPerPool);

    await assertHostTournament(parsedTournamentId, req.user.id);

    let bracket;
    try {
      bracket = await prisma.bracket.findFirst({
        where: { id: parsedBracketId, tournamentId: parsedTournamentId },
      });
    } catch (e) {
      console.error("FAILED AT bracket.findFirst:", e.message);
      throw e;
    }

    if (!bracket) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Bracket not found for this tournament",
      });
    }

    console.log("Checking existing pools for:", { parsedBracketId, parsedTournamentId });
    const existingPools = await prisma.pool.findMany({
      where: { bracketId: parsedBracketId, tournamentId: parsedTournamentId },
    });
    console.log("Existing pools found:", existingPools.length);

    if (existingPools.length > 0) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Round robin already generated for this bracket. Delete existing pools before regenerating.",
      });
    }

    // Get all teams with their starter players' DUPR ratings
    let teams;
    try {
      teams = await prisma.team.findMany({
        where: {
          bracketId: parsedBracketId,
          tournamentId: parsedTournamentId,
          status: { notIn: ["waitlist", "withdrawn", "forfeited"] },
        },
        include: {
          players: {
            where: { role: "starter" },
            include: {
              player: {
                select: { duprRating: true },
              },
            },
          },
        },
      });
    } catch (e) {
      console.error("FAILED AT team.findMany:", e.message);
      throw e;
    }

    if (teams.length < 2) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Not enough teams to create round robin",
      });
    }

    if (teams.length > bracket.maxTeams) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: `Too many teams. This bracket allows a maximum of ${bracket.maxTeams} teams but has ${teams.length} registered.`,
      });
    }

    // Calculate total DUPR rating for each team's starters
    const teamsWithRatings = teams.map((team) => {
      const totalDupr = team.players.reduce((sum, tp) => {
        return sum + (tp.player.duprRating ? Number(tp.player.duprRating) : 0);
      }, 0);
      return { ...team, totalDupr };
    });
    

    // Sort teams from highest to lowest total DUPR
    teamsWithRatings.sort((a, b) => b.totalDupr - a.totalDupr);

    // Split into top half and bottom half
    const midpoint = Math.ceil(teamsWithRatings.length / 2);
    const topHalf = teamsWithRatings.slice(0, midpoint);    // highest DUPR
    const bottomHalf = teamsWithRatings.slice(midpoint);    // lowest DUPR
    

    const buildPairs = (half) => {
  const pairs = [];
  let lo = 0;
  let hi = half.length - 1;
  while (lo <= hi) {
    if (lo === hi) {
      pairs.push([half[lo]]);
    } else {
      pairs.push([half[lo], half[hi]]);
    }
    lo++;
    hi--;
  }
  return pairs;
};

const topPairs = buildPairs(topHalf);
const bottomPairs = buildPairs(bottomHalf);

// Interleave top and bottom pairs so each pool gets one from each half
const allPairs = [];
const maxLen = Math.max(topPairs.length, bottomPairs.length);
for (let i = 0; i < maxLen; i++) {
  if (i < topPairs.length)    allPairs.push(...topPairs[i]);
  if (i < bottomPairs.length) allPairs.push(...bottomPairs[i]);
}

// Fill pools of teamsPerPool size
const perPool = parsedTeamsPerPool || 4;
const poolGroups = [];
let currentPool = [];

for (const team of allPairs) {
  currentPool.push(team);
  if (currentPool.length === perPool) {
    poolGroups.push(currentPool);
    currentPool = [];
  }
}
if (currentPool.length > 0) {
  poolGroups.push(currentPool);
}
    const createdPools = [];

    for (let poolIndex = 0; poolIndex < poolGroups.length; poolIndex++) {
      const poolTeams = poolGroups[poolIndex];
      const poolName = `Pool ${String.fromCharCode(65 + poolIndex)}`;

      // Create the pool
      let pool;
      try {
        pool = await prisma.pool.create({
          data: {
            poolName,
            bracketId: parsedBracketId,
            tournamentId: parsedTournamentId,
          },
        });
      } catch (e) {
        console.error("FAILED AT pool.create:", e.message);
        throw e;
      }

      // Add teams to pool
      for (const team of poolTeams) {
        try {
          await prisma.poolTeam.create({
            data: { poolId: pool.id, teamId: team.id },
          });
        } catch (e) {
          console.error(`FAILED AT poolTeam.create for teamId ${team.id}:`, e.message);
          throw e;
        }
      }

      // Generate round robin matchups using circle method
      let roundTeams = [...poolTeams];
      if (roundTeams.length % 2 !== 0) {
        roundTeams.push(null); // bye
      }

      const numRounds = roundTeams.length - 1;
      const half = roundTeams.length / 2;
      const poolRounds = [];

      for (let round = 0; round < numRounds; round++) {
        const roundMatches = [];

        for (let match = 0; match < half; match++) {
          const team1 = roundTeams[match];
          const team2 = roundTeams[roundTeams.length - 1 - match];

          if (team1 !== null && team2 !== null) {
            roundMatches.push({ team1, team2 });
          }
        }

        poolRounds.push(roundMatches);

        const fixed = roundTeams[0];
        const rotating = roundTeams.slice(1);
        rotating.unshift(rotating.pop());
        roundTeams = [fixed, ...rotating];
      }

      // Write rounds and matches to DB
      for (let r = 0; r < poolRounds.length; r++) {
        let round;
        try {
          round = await prisma.round.create({
            data: {
              poolId: pool.id,
              bracketId: parsedBracketId,
              roundNumber: r + 1,
              status: "pending",
              type: "pool",
            },
          });
        } catch (e) {
          console.error(`FAILED AT round.create for round ${r + 1}:`, e.message);
          throw e;
        }

        try {
          const seriesRows = poolRounds[r].flatMap(({ team1, team2 }) =>
            expandPairingToSeriesGames({
              poolId: pool.id,
              roundId: round.id,
              team1Id: team1.id,
              team2Id: team2.id,
              type: "pool",
            })
          );
          await prisma.match.createMany({
            data: seriesRows,
          });
        } catch (e) {
          console.error(`FAILED AT match.createMany for round ${r + 1}:`, e.message);
          throw e;
        }

        poolRounds[r].roundId = round.id;
      }

      createdPools.push({
        pool,
        teams: poolTeams.map((t) => ({ id: t.id, teamName: t.teamName, totalDupr: t.totalDupr })),
        rounds: poolRounds.length,
      });
    }

    res.status(201).json({
      error: false,
      code: 201,
      message: "Round robin created successfully",
      data: {
        totalPools: createdPools.length,
        pools: createdPools,
      },
    });
  } catch (error) {
    console.error("ROUND ROBIN CREATION FAILED:", error.message);
    res.status(500).json({ error: true, code: 500, message: error.message });
  }
};
const getPoolsByBracket = async (req, res) => {
  try {
    const tournamentId = Number(req.params.tournamentId);
    const bracketId = Number(req.params.bracketId);

    await assertHostTournament(tournamentId, req.user.id);

    let pools;
    try {
      pools = await prisma.pool.findMany({
        where: { bracketId, tournamentId },
        include: {
          rounds: {
            orderBy: { roundNumber: "asc" },
            include: {
              matches: {
                orderBy: [{ gameType: "asc" }, { id: "asc" }],
                include: {
                  team1: true,
                  team2: true,
                },
              },
            },
          },
        },
      });
    } catch (e) {
      console.error("FAILED AT pool.findMany:", e.message);
      throw e;
    }

    res.status(200).json({
      error: false,
      code: 200,
      data: { pools: pools.map((pool) => ({ pool, rounds: pool.rounds })) },
    });
  } catch (error) {
    console.error("GET POOLS FAILED:", error.message);
    res.status(500).json({ error: true, code: 500, message: error.message });
  }
};
const deleteRoundRobin = async (req, res) => {
  try {
    const tournamentId = Number(req.params.tournamentId);
    const bracketId = Number(req.params.bracketId);

    await assertHostTournament(tournamentId, req.user.id);

    // Get all pools for this bracket
    const pools = await prisma.pool.findMany({
      where: { bracketId, tournamentId },
      select: { id: true },
    });

    const poolIds = pools.map((p) => p.id);

    if (poolIds.length === 0) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "No round robin found for this bracket.",
      });
    }

    // Delete in order to respect foreign keys
    await prisma.match.deleteMany({ where: { poolId: { in: poolIds } } });
    await prisma.round.deleteMany({ where: { poolId: { in: poolIds } } });
    await prisma.poolTeam.deleteMany({ where: { poolId: { in: poolIds } } });
    await prisma.pool.deleteMany({ where: { id: { in: poolIds } } });

    res.status(200).json({
      error: false,
      code: 200,
      message: "Round robin deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE ROUND ROBIN FAILED:", error.message);
    res.status(500).json({ error: true, code: 500, message: error.message });
  }
};
const publishRoundRobin = async (req, res) => {
  try {
    const tournamentId = Number(req.params.tournamentId);
    const bracketId = Number(req.params.bracketId);

    await assertHostTournament(tournamentId, req.user.id);

    const bracket = await prisma.bracket.findFirst({
      where: { id: bracketId, tournamentId },
    });

    if (!bracket) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Bracket not found for this tournament",
      });
    }

    // Get all pools for this bracket
    const pools = await prisma.pool.findMany({
      where: { bracketId, tournamentId },
      select: { id: true },
    });

    const poolIds = pools.map((p) => p.id);

    if (poolIds.length === 0) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "No round robin found for this bracket. Generate one before publishing.",
      });
    }

    // Publish all matches belonging to this bracket's pools
    let updated;
    try {
      updated = await prisma.match.updateMany({
        where: { poolId: { in: poolIds } },
        data: { publishedStatus: "published" },
      });
    } catch (e) {
      console.error("FAILED AT match.updateMany (publish):", e.message);
      throw e;
    }

    // Mark the bracket itself as published
    let updatedBracket;
    try {
      updatedBracket = await prisma.bracket.update({
        where: { id: bracketId },
        data: { status: "published" },
      });
    } catch (e) {
      console.error("FAILED AT bracket.update (publish):", e.message);
      throw e;
    }

    res.status(200).json({
      error: false,
      code: 200,
      message: "Round robin published successfully",
      data: {
        bracket: updatedBracket,
        matchesPublished: updated.count,
      },
    });
  } catch (error) {
    console.error("PUBLISH ROUND ROBIN FAILED:", error.message);
    res.status(500).json({ error: true, code: 500, message: error.message });
  }
};

const unpublishRoundRobin = async (req, res) => {
  try {
    const tournamentId = Number(req.params.tournamentId);
    const bracketId = Number(req.params.bracketId);

    await assertHostTournament(tournamentId, req.user.id);

    const bracket = await prisma.bracket.findFirst({
      where: { id: bracketId, tournamentId },
    });

    if (!bracket) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Bracket not found for this tournament",
      });
    }

    const pools = await prisma.pool.findMany({
      where: { bracketId, tournamentId },
      select: { id: true },
    });

    const poolIds = pools.map((p) => p.id);

    let updated = { count: 0 };
    if (poolIds.length > 0) {
      try {
        updated = await prisma.match.updateMany({
          where: { poolId: { in: poolIds } },
          data: { publishedStatus: "unpublished" },
        });
      } catch (e) {
        console.error("FAILED AT match.updateMany (unpublish):", e.message);
        throw e;
      }
    }

    let updatedBracket;
    try {
      updatedBracket = await prisma.bracket.update({
        where: { id: bracketId },
        data: { status: "draft" },
      });
    } catch (e) {
      console.error("FAILED AT bracket.update (unpublish):", e.message);
      throw e;
    }

    res.status(200).json({
      error: false,
      code: 200,
      message: "Round robin unpublished successfully",
      data: {
        bracket: updatedBracket,
        matchesUnpublished: updated.count,
      },
    });
  } catch (error) {
    console.error("UNPUBLISH ROUND ROBIN FAILED:", error.message);
    res.status(500).json({ error: true, code: 500, message: error.message });
  }
};

export default {
  createRoundRobin,
  getPoolsByBracket,
  deleteRoundRobin,
  publishRoundRobin,
  unpublishRoundRobin,
};
