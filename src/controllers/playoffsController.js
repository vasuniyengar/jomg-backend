import prisma from "../config/prisma.js";

// Helper: next power of 2 >= n
const nextPowerOf2 = (n) => {
  let p = 1;
  while (p < n) p *= 2;
  return p;
};

// Helper: round name by distance from final
const getRoundName = (roundsFromFinal) => {
  if (roundsFromFinal === 0) return "Final";
  if (roundsFromFinal === 1) return "Semifinal";
  if (roundsFromFinal === 2) return "Quarterfinal";
  return `Round of ${Math.pow(2, roundsFromFinal + 1)}`;
};

/**
 * POST /tournaments/:tournamentId/brackets/:bracketId/playoffs
 *
 * Generates a single-elimination playoff bracket seeded globally
 * by wins (tiebreak: pointsFor) across all pools in the bracket.
 * If team count is not a power of 2, the top seeds receive byes.
 */
const createPlayoffBracket = async (req, res) => {
  try {
    const tournamentId = Number(req.params.tournamentId);
    const bracketId = Number(req.params.bracketId);

    // --- 1. Validate bracket exists ---
    const bracket = await prisma.bracket.findFirst({
      where: { id: bracketId, tournamentId },
    });

    if (!bracket) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Bracket not found for this tournament.",
      });
    }

    // --- 2. Guard: no pools means no stats to seed from ---
    const pools = await prisma.pool.findMany({
      where: { bracketId, tournamentId },
      select: { id: true },
    });

    if (pools.length === 0) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "No pools found. Generate and complete round robin play before creating playoffs.",
      });
    }

    // --- 3. Guard: don't regenerate if playoff rounds already exist ---
    const existingPlayoffRounds = await prisma.round.findMany({
      where: { bracketId, type: "playoff" },
      select: { id: true },
    });

    if (existingPlayoffRounds.length > 0) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Playoff bracket already exists for this bracket. Delete it before regenerating.",
      });
    }

    // --- 4. Pull all PoolTeamStats across every pool in this bracket ---
    const poolIds = pools.map((p) => p.id);

    const allStats = await prisma.poolTeamStats.findMany({
      where: { poolId: { in: poolIds } },
      include: {
        team: true,
      },
    });

    if (allStats.length < 2) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Not enough teams with stats to generate a playoff bracket.",
      });
    }

    // --- 5. Sort: wins DESC, then pointsFor DESC as tiebreaker ---
    const sorted = [...allStats].sort((a, b) => {
      if (b.wins !== a.wins) return (b.wins ?? 0) - (a.wins ?? 0);
      return (b.pointsFor ?? 0) - (a.pointsFor ?? 0);
    });

    const seededTeams = sorted.map((s, i) => ({
      seed: i + 1,
      teamId: s.teamId,
      teamName: s.team.teamName,
      wins: s.wins ?? 0,
      pointsFor: s.pointsFor ?? 0,
    }));

    const teamCount = seededTeams.length;
    const bracketSize = nextPowerOf2(teamCount);
    const byeCount = bracketSize - teamCount;

    // --- 6. Build first-round matchups ---
    // Standard bracket pairing: 1 vs last, 2 vs second-last, etc.
    // Top `byeCount` seeds automatically advance (bye).
    // Remaining seeds play in round 1.
    //
    // Example: 6 teams, bracketSize=8, byeCount=2
    //   Seeds 1 & 2 get byes into round 2.
    //   Round 1 matches: 3 vs 6, 4 vs 5
    //
    // Bye teams are represented as null in the first-round slot;
    // they get a placeholder match record with type "bye".

    // Pad the seeded array to bracketSize with null (bye slots) at the END
    const paddedSeeds = [...seededTeams];
    while (paddedSeeds.length < bracketSize) {
      paddedSeeds.push(null); // bye slot
    }

    // Build matchup pairs for round 1: index i vs bracketSize-1-i
    const round1Matches = [];
    const half = bracketSize / 2;
    for (let i = 0; i < half; i++) {
      round1Matches.push({
        topSeed: paddedSeeds[i],         // higher seed (lower number)
        bottomSeed: paddedSeeds[bracketSize - 1 - i], // lower seed
      });
    }

    // Total playoff rounds needed
    const totalRounds = Math.log2(bracketSize);

    // --- 7. Create all Round rows up front so we can link matches ---
    // Round 1 = furthest from final, Round totalRounds = Final
    const roundRows = [];
    for (let r = 1; r <= totalRounds; r++) {
      const roundsFromFinal = totalRounds - r;
      const round = await prisma.round.create({
        data: {
          bracketId,
          roundNumber: r,
          status: "pending",
          type: "playoff",
          // poolId intentionally null for playoff rounds
        },
      });
      roundRows.push({ round, roundsFromFinal, name: getRoundName(roundsFromFinal) });
    }

    const round1Row = roundRows[0].round;

    // --- 8. Create Round 1 match records ---
    // For bye matches: the top seed automatically advances.
    // We still create a match record with type "bye" so the bracket
    // shape is complete — score submission logic can skip these.
    const matchRecords = [];

    for (const { topSeed, bottomSeed } of round1Matches) {
      const isBye = bottomSeed === null;

      if (isBye) {
        // Top seed gets a bye — record it but mark as completed immediately
        const byeMatch = await prisma.match.create({
          data: {
            team1Id: topSeed.teamId,
            team2Id: topSeed.teamId, // placeholder; same team indicates bye
            roundId: round1Row.id,
            poolId: null,
            status: "bye",
            type: "playoff",
            winnerTeamId: topSeed.teamId,
            loserTeamId: null,
          },
        });
        matchRecords.push({ match: byeMatch, topSeed, bottomSeed: null, isBye: true });
      } else {
        const match = await prisma.match.create({
          data: {
            team1Id: topSeed.teamId,
            team2Id: bottomSeed.teamId,
            roundId: round1Row.id,
            poolId: null,
            status: "not_started",
            type: "playoff",
          },
        });
        matchRecords.push({ match, topSeed, bottomSeed, isBye: false });
      }
    }

    // --- 9. Pre-create empty placeholder matches for rounds 2+ ---
    // These will be filled in as scores are submitted.
    // We need them now so the bracket shape exists in the DB.
    // Each subsequent round has half the matches of the previous.
    const futureRoundMatches = {};

    for (let r = 2; r <= totalRounds; r++) {
      const roundRow = roundRows[r - 1].round;
      const matchCount = bracketSize / Math.pow(2, r);
      futureRoundMatches[r] = [];

      for (let m = 0; m < matchCount; m++) {
        // Placeholder — team IDs will be filled in when prior round completes.
        // We use a sentinel value approach: store teamId as null workaround.
        // Since the schema requires team1Id/team2Id (Int, not nullable),
        // we'll skip pre-creating these and instead note that advancement
        // logic must create/update matches on score submission.
        // 
        // Instead, we return the bracket shape to the caller so the UI
        // can render empty slots for future rounds.
        futureRoundMatches[r].push({
          roundId: roundRow.id,
          roundName: roundRows[r - 1].name,
          matchIndex: m,
          status: "pending",
        });
      }
    }

    // --- 10. Build response payload ---
    const responseRounds = roundRows.map(({ round, name }) => {
      if (round.id === round1Row.id) {
        return {
          roundId: round.id,
          roundNumber: round.roundNumber,
          name,
          matches: matchRecords.map(({ match, topSeed, bottomSeed, isBye }) => ({
            matchId: match.id,
            isBye,
            team1: topSeed
              ? { teamId: topSeed.teamId, teamName: topSeed.teamName, seed: topSeed.seed }
              : null,
            team2: bottomSeed
              ? { teamId: bottomSeed.teamId, teamName: bottomSeed.teamName, seed: bottomSeed.seed }
              : null,
            status: match.status,
          })),
        };
      }

      return {
        roundId: round.id,
        roundNumber: round.roundNumber,
        name,
        matches: futureRoundMatches[round.roundNumber].map((m) => ({
          ...m,
          team1: null,
          team2: null,
        })),
      };
    });

    return res.status(201).json({
      error: false,
      code: 201,
      message: "Playoff bracket created successfully.",
      data: {
        bracketSize,
        totalTeams: teamCount,
        byeCount,
        seeds: seededTeams,
        rounds: responseRounds,
      },
    });
  } catch (error) {
    console.error("CREATE PLAYOFF BRACKET FAILED:", error.message);
    return res.status(500).json({ error: true, code: 500, message: error.message });
  }
};

/**
 * GET /tournaments/:tournamentId/brackets/:bracketId/playoffs
 *
 * Returns all playoff rounds and matches for the bracket.
 */
const getPlayoffBracket = async (req, res) => {
  try {
    const tournamentId = Number(req.params.tournamentId);
    const bracketId = Number(req.params.bracketId);

    const bracket = await prisma.bracket.findFirst({
      where: { id: bracketId, tournamentId },
    });

    if (!bracket) {
      return res.status(404).json({ error: true, code: 404, message: "Bracket not found." });
    }

    const rounds = await prisma.round.findMany({
      where: { bracketId, type: "playoff" },
      orderBy: { roundNumber: "asc" },
      include: {
        matches: {
          include: {
            team1: { include: { players: { include: { player: true } } } },
            team2: { include: { players: { include: { player: true } } } },
          },
        },
      },
    });

    if (rounds.length === 0) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "No playoff bracket found for this bracket.",
      });
    }

    const totalRounds = rounds.length;
    const formattedRounds = rounds.map((round) => ({
      roundId: round.id,
      roundNumber: round.roundNumber,
      name: getRoundName(totalRounds - round.roundNumber),
      status: round.status,
      matches: round.matches.map((match) => ({
        matchId: match.id,
        status: match.status,
        type: match.type,
        isBye: match.status === "bye",
        scoreTeam1: match.scoreTeam1,
        scoreTeam2: match.scoreTeam2,
        winnerTeamId: match.winnerTeamId,
        team1: match.status === "bye"
          ? null  // don't double-render bye team
          : match.team1
          ? {
              teamId: match.team1.id,
              teamName: match.team1.teamName,
              players: match.team1.players.map((tp) => ({
                userId: tp.player.id,
                name: `${tp.player.firstname} ${tp.player.lastname}`,
              })),
            }
          : null,
        team2:
          match.status === "bye" || !match.team2 || match.team2Id === match.team1Id
            ? null
            : {
                teamId: match.team2.id,
                teamName: match.team2.teamName,
                players: match.team2.players.map((tp) => ({
                  userId: tp.player.id,
                  name: `${tp.player.firstname} ${tp.player.lastname}`,
                })),
              },
      })),
    }));

    return res.status(200).json({
      error: false,
      code: 200,
      data: { rounds: formattedRounds },
    });
  } catch (error) {
    console.error("GET PLAYOFF BRACKET FAILED:", error.message);
    return res.status(500).json({ error: true, code: 500, message: error.message });
  }
};

/**
 * DELETE /tournaments/:tournamentId/brackets/:bracketId/playoffs
 *
 * Removes all playoff rounds and matches for the bracket.
 */
const deletePlayoffBracket = async (req, res) => {
  try {
    const tournamentId = Number(req.params.tournamentId);
    const bracketId = Number(req.params.bracketId);

    const playoffRounds = await prisma.round.findMany({
      where: { bracketId, type: "playoff" },
      select: { id: true },
    });

    if (playoffRounds.length === 0) {
      return res.status(404).json({
        error: true,
        code: 404,
        message: "No playoff bracket found to delete.",
      });
    }

    const roundIds = playoffRounds.map((r) => r.id);

    await prisma.match.deleteMany({ where: { roundId: { in: roundIds } } });
    await prisma.round.deleteMany({ where: { id: { in: roundIds } } });

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Playoff bracket deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE PLAYOFF BRACKET FAILED:", error.message);
    return res.status(500).json({ error: true, code: 500, message: error.message });
  }
};

/**
 * POST /tournaments/:tournamentId/brackets/:bracketId/playoffs/advance
 *
 * Called after a playoff match score is submitted.
 * Finds the next round's match slot for the winner and fills it in.
 * If both teams in a next-round slot are filled, that match becomes "not_started".
 *
 * Body: { matchId, scoreTeam1, scoreTeam2 }
 */
const advancePlayoffWinner = async (req, res) => {
  try {
    const tournamentId = Number(req.params.tournamentId);
    const bracketId = Number(req.params.bracketId);
    const { matchId, scoreTeam1, scoreTeam2 } = req.body;

    if (scoreTeam1 === scoreTeam2) {
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Playoff matches cannot end in a tie.",
      });
    }

    // Load the match with its round
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: { round: true },
    });

    if (!match || match.round.bracketId !== bracketId) {
      return res.status(404).json({ error: true, code: 404, message: "Match not found." });
    }

    if (match.status === "completed") {
      return res.status(400).json({ error: true, code: 400, message: "Match already completed." });
    }

    const winnerId = scoreTeam1 > scoreTeam2 ? match.team1Id : match.team2Id;
    const loserId = scoreTeam1 > scoreTeam2 ? match.team2Id : match.team1Id;

    // Update the match as completed
    await prisma.match.update({
      where: { id: matchId },
      data: {
        scoreTeam1,
        scoreTeam2,
        status: "completed",
        winnerTeamId: winnerId,
        loserTeamId: loserId,
      },
    });

    // Find the next round for this bracket
    const currentRound = match.round;

    const nextRound = await prisma.round.findFirst({
      where: {
        bracketId,
        type: "playoff",
        roundNumber: currentRound.roundNumber + 1,
      },
      include: { matches: true },
    });

    if (!nextRound) {
      // This was the final — tournament is over
      return res.status(200).json({
        error: false,
        code: 200,
        message: "Final match completed. Tournament winner determined.",
        data: { winnerId, matchId },
      });
    }

    // Determine this match's position index within its round
    // so we can map it to the correct next-round slot.
    const currentRoundMatches = await prisma.match.findMany({
      where: { roundId: currentRound.id },
      orderBy: { id: "asc" },
    });

    const matchIndex = currentRoundMatches.findIndex((m) => m.id === matchId);
    const nextMatchIndex = Math.floor(matchIndex / 2);
    const isTeam1Slot = matchIndex % 2 === 0; // even index → team1, odd → team2

    // Check if a next-round match at this slot already exists
    const nextRoundMatches = await prisma.match.findMany({
      where: { roundId: nextRound.id },
      orderBy: { id: "asc" },
    });

    if (nextRoundMatches[nextMatchIndex]) {
      // Slot exists — fill in the missing team
      const existingMatch = nextRoundMatches[nextMatchIndex];
      await prisma.match.update({
        where: { id: existingMatch.id },
        data: {
          ...(isTeam1Slot ? { team1Id: winnerId } : { team2Id: winnerId }),
          // Once both teams are set, mark as ready
          status: "not_started",
        },
      });
    } else {
      // Slot doesn't exist yet — create it with winner in correct position
      await prisma.match.create({
        data: {
          team1Id: isTeam1Slot ? winnerId : winnerId, // will be corrected by second winner
          team2Id: isTeam1Slot ? winnerId : winnerId, // placeholder until opponent arrives
          roundId: nextRound.id,
          poolId: null,
          status: "waiting",
          type: "playoff",
          ...(isTeam1Slot ? { team1Id: winnerId } : { team2Id: winnerId }),
        },
      });
    }

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Match completed and winner advanced.",
      data: { winnerId, loserId, nextRoundId: nextRound.id },
    });
  } catch (error) {
    console.error("ADVANCE PLAYOFF WINNER FAILED:", error.message);
    return res.status(500).json({ error: true, code: 500, message: error.message });
  }
};

export default {
  createPlayoffBracket,
  getPlayoffBracket,
  deletePlayoffBracket,
  advancePlayoffWinner,
};