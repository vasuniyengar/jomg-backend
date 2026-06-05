import prisma from "../config/prisma.js";

const createRoundRobin = async (req, res) => {
  try {
    const { tournamentId, bracketId, teamsPerPool } = req.body;

    const parsedTournamentId = Number(tournamentId);
    const parsedBracketId = Number(bracketId);
    const parsedTeamsPerPool = Number(teamsPerPool);

    // Validate tournament and bracket exist
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
  where: {
    bracketId: parsedBracketId,
    tournamentId: parsedTournamentId,
  },
});
console.log("Existing pools found:", existingPools.length);

if (existingPools.length > 0) {
  return res.status(400).json({
    error: true,
    code: 400,
    message: "Round robin already generated for this bracket. Delete existing pools before regenerating.",
  });
}

    // Get all teams in this bracket
    let teams;
    try {
      teams = await prisma.team.findMany({
        where: { bracketId: parsedBracketId, tournamentId: parsedTournamentId },
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

    // Split teams into pools
    const shuffledTeams = teams.sort(() => Math.random() - 0.5);
    const perPool = parsedTeamsPerPool || 4;
    const poolGroups = [];

    for (let i = 0; i < shuffledTeams.length; i += perPool) {
      poolGroups.push(shuffledTeams.slice(i, i + perPool));
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
            data: {
              poolId: pool.id,
              teamId: team.id,
            },
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
          await prisma.match.createMany({
            data: poolRounds[r].map(({ team1, team2 }) => ({
              team1Id: team1.id,
              team2Id: team2.id,
              poolId: pool.id,
              roundId: round.id,
              status: "not_started",
              type: "pool",
            })),
          });
        } catch (e) {
          console.error(`FAILED AT match.createMany for round ${r + 1}:`, e.message);
          throw e;
        }

        poolRounds[r].roundId = round.id;
      }

      createdPools.push({
        pool,
        teams: poolTeams,
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

    let pools;
    try {
      pools = await prisma.pool.findMany({
        where: {
          bracketId,
          tournamentId,
        },
        include: {
          rounds: {
            orderBy: { roundNumber: "asc" },
            include: {
              matches: {
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
export default { createRoundRobin, getPoolsByBracket, deleteRoundRobin };