import { Op } from "sequelize";
import sequelize from "../config/database.js";
import Match from "../models/Match.js";
import Team from "../models/Team.js";
import { isDreamBreakerGame, isSeriesGameType } from "../utils/seriesGames.js";


export function isMlpGamesWonScore(scoreTeam1, scoreTeam2) {
  const a = Number(scoreTeam1);
  const b = Number(scoreTeam2);
  if (Number.isNaN(a) || Number.isNaN(b)) return false;
  return a <= 3 && b <= 3 && a + b >= 3 && a + b <= 5 && a !== b;
}

export function isDreamBreakerScore(scoreTeam1, scoreTeam2) {
  return (
    Math.max(scoreTeam1, scoreTeam2) === 3 &&
    Math.min(scoreTeam1, scoreTeam2) === 2
  );
}

export function pointsForTeamInMatch(teamScore, oppScore, match = null, dreamBreaker) {
  if (teamScore == null || oppScore == null) return 0;
  if (teamScore === oppScore) return 0;

  const won = teamScore > oppScore;

  // Per-game Match row (round-robin series)
  if (match && isSeriesGameType(match.gameType)) {
    if (isDreamBreakerGame(match)) {
      return won ? 2 : 1;
    }
    // WD / MD / X1 / X2
    return won ? 3 : 0;
  }

  const wentToDreamBreaker =
    typeof dreamBreaker === "boolean"
      ? dreamBreaker
      : isDreamBreakerScore(teamScore, oppScore);

  // Legacy MLP aggregate (games wins stored on a single Match)
  if (isMlpGamesWonScore(teamScore, oppScore)) {
    if (wentToDreamBreaker) {
      return 2 * 3 + (won ? 2 : 1);
    }
    return teamScore * 3;
  }

  if (wentToDreamBreaker) {
    return won ? 2 : 1;
  }
  return won ? 3 : 0;
}

/**
 * Recompute a team's standings points from all completed pool matches.
 */
export async function recomputeTeamStandingsPoints(
  teamId,
  { dreamBreakerByMatchId = {}, transaction = null } = {}
) {
  const matches = await Match.findAll({
    where: {
      poolId: { [Op.ne]: null },
      status: "completed",
      [Op.or]: [{ team1Id: teamId }, { team2Id: teamId }],
    },
    transaction,
  });

  let standingsPoints = 0;

  for (const m of matches) {
    const isTeam1 = m.team1Id === teamId;
    const teamScore = isTeam1 ? m.scoreTeam1 : m.scoreTeam2;
    const oppScore = isTeam1 ? m.scoreTeam2 : m.scoreTeam1;
    const override = dreamBreakerByMatchId[m.id];
    standingsPoints += pointsForTeamInMatch(teamScore, oppScore, m, override);
  }

  await Team.update(
    { standingsPoints },
    { where: { id: teamId }, transaction }
  );

  return standingsPoints;
}

const applyStandingsPoints = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bracketId, matchId } = req.params;
    const dreamBreaker =
      typeof req.body?.dreamBreaker === "boolean"
        ? req.body.dreamBreaker
        : undefined;

    const match = await Match.findByPk(matchId, { transaction: t });
    if (!match) {
      await t.rollback();
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Match not found",
      });
    }

    if (!match.poolId) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Standings points only apply to pool matches",
      });
    }

    if (match.status !== "completed") {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Match must be completed before applying standings points",
      });
    }

    const team1 = await Team.findByPk(match.team1Id, { transaction: t });
    const team2 = await Team.findByPk(match.team2Id, { transaction: t });
    if (!team1 || !team2) {
      await t.rollback();
      return res.status(404).json({
        error: true,
        code: 404,
        message: "Match teams not found",
      });
    }

    if (
      String(team1.bracketId) !== String(bracketId) ||
      String(team2.bracketId) !== String(bracketId)
    ) {
      await t.rollback();
      return res.status(400).json({
        error: true,
        code: 400,
        message: "Match does not belong to this bracket",
      });
    }

    const wentToDreamBreaker =
      typeof dreamBreaker === "boolean"
        ? dreamBreaker
        : isDreamBreakerGame(match) ||
          isDreamBreakerScore(match.scoreTeam1, match.scoreTeam2);

    const dreamBreakerByMatchId = {
      [match.id]: wentToDreamBreaker,
    };

    const team1Points = await recomputeTeamStandingsPoints(match.team1Id, {
      dreamBreakerByMatchId,
      transaction: t,
    });
    const team2Points = await recomputeTeamStandingsPoints(match.team2Id, {
      dreamBreakerByMatchId,
      transaction: t,
    });

    const team1Award = pointsForTeamInMatch(
      match.scoreTeam1,
      match.scoreTeam2,
      match,
      wentToDreamBreaker
    );
    const team2Award = pointsForTeamInMatch(
      match.scoreTeam2,
      match.scoreTeam1,
      match,
      wentToDreamBreaker
    );

    await t.commit();

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Standings points applied successfully",
      data: {
        matchId: match.id,
        gameType: match.gameType,
        dreamBreaker: wentToDreamBreaker,
        awards: {
          team1Id: match.team1Id,
          team1Award,
          team2Id: match.team2Id,
          team2Award,
        },
        teams: [
          { teamId: match.team1Id, standingsPoints: team1Points },
          { teamId: match.team2Id, standingsPoints: team2Points },
        ],
      },
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message || "Failed to apply standings points",
    });
  }
};

/** Recalculate standings points for every team in a bracket from completed pool matches. */
const recomputeBracketStandingsPoints = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bracketId } = req.params;

    const teams = await Team.findAll({
      where: { bracketId },
      attributes: ["id"],
      transaction: t,
    });

    const results = [];
    for (const team of teams) {
      const standingsPoints = await recomputeTeamStandingsPoints(team.id, {
        transaction: t,
      });
      results.push({ teamId: team.id, standingsPoints });
    }

    await t.commit();

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Bracket standings points recomputed",
      data: results,
    });
  } catch (error) {
    await t.rollback();
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message || "Failed to recompute standings points",
    });
  }
};

export default {
  applyStandingsPoints,
  recomputeBracketStandingsPoints,
  recomputeTeamStandingsPoints,
  pointsForTeamInMatch,
  isDreamBreakerScore,
  isMlpGamesWonScore,
};
