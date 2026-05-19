import prisma from "../../config/prisma.js";

const roundRobin = async (poolId) => {

  const poolTeams = await prisma.poolTeam.findMany({
    where: { poolId },
    orderBy: { seed: "asc" },
  });

  
  const teamIds = poolTeams.map((pt) => pt.teamId);
  const n = teamIds.length;

  if (n < 2) {
    throw new Error("Need 2 or more teams to participate");
  }

  if (n % 2 !== 0) {
    teamIds.push(null);
  }

  const totalTeams = teamIds.length; 
  const totalRounds = totalTeams - 1;
  const matchesPerRound = totalTeams / 2;
  const schedule = [];
  const teams = [...teamIds];

  for (let round = 0; round < totalRounds; round++) {
    const roundMatches = [];

    for (let match = 0; match < matchesPerRound; match++) {
      const team1 = teams[match];
      const team2 = teams[totalTeams - 1 - match];

      if (team1 !== null && team2 !== null) {
        roundMatches.push({ team1Id: team1, team2Id: team2 });
      }
    }

    schedule.push({ round: round + 1, matches: roundMatches });

    const last = teams.pop();
    teams.splice(1, 0, last);
  }

  
  const pool = await prisma.pool.findUnique({ where: { id: poolId } }); 

  
  for (const roundData of schedule) {
    const round = await prisma.round.create({ 
      data: {
        poolId,
        bracketId: pool.bracketId,
        roundNumber: roundData.round,
        status: "pending",
        type: "pool",
      },
    });

    for (const match of roundData.matches) {
      await prisma.match.create({
        data: {
          roundId: round.id,
          poolId,
          team1Id: match.team1Id,
          team2Id: match.team2Id,
          status: "not_started",
        },
      });
    }
  }

  return schedule;
};

export default { roundRobin };