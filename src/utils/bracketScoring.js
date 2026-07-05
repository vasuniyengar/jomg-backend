import models from "../models/Associations.js";
import { parseTournamentSettings } from "./tournamentHub.js";
import {
  DEFAULT_MATCH_SCORING,
  parseScoringRules,
} from "./scoringRules.js";

const { ScoringList } = models;

function matchScoringFromTournament(tournament) {
  const { settings } = parseTournamentSettings(tournament?.organizerInfo);
  const ms = settings?.playRules?.matchScoring;
  if (ms && typeof ms === "object") {
    return {
      pool: ms.pool || DEFAULT_MATCH_SCORING.pool,
      playoff: ms.playoff || DEFAULT_MATCH_SCORING.playoff,
      semi: ms.semi || DEFAULT_MATCH_SCORING.semi,
      gold: ms.gold || DEFAULT_MATCH_SCORING.gold,
      bronze: ms.bronze || DEFAULT_MATCH_SCORING.bronze,
    };
  }
  return { ...DEFAULT_MATCH_SCORING };
}

export async function findOrCreateScoringList(label, transaction = null) {
  const trimmed = String(label || "").trim();
  if (!trimmed) {
    throw new Error("Scoring label is required");
  }

  const rules = parseScoringRules(trimmed);
  let row = await ScoringList.findOne({
    where: { name: trimmed },
    transaction,
  });

  if (row) {
    if (!row.rules) {
      await row.update({ rules }, { transaction });
    }
    return row;
  }

  row = await ScoringList.create(
    { name: trimmed, rules },
    { transaction }
  );
  return row;
}

/**
 * Build bracket scoring FKs + scoringConfig snapshot from tournament settings.
 */
export async function resolveBracketScoringFromTournament(
  tournament,
  transaction = null
) {
  const stages = matchScoringFromTournament(tournament);
  const scoringConfig = {};

  for (const [key, label] of Object.entries(stages)) {
    const row = await findOrCreateScoringList(label, transaction);
    scoringConfig[key] = {
      label: row.name,
      scoringListId: row.id,
    };
  }

  return {
    scoringListId: scoringConfig.pool.scoringListId,
    playoffMatchId: scoringConfig.playoff.scoringListId,
    semiFinalMatchId: scoringConfig.semi.scoringListId,
    bronzeMatchId: scoringConfig.bronze.scoringListId,
    goldMatchId: scoringConfig.gold.scoringListId,
    roundId: scoringConfig.pool.scoringListId,
    scoringConfig,
  };
}

/** Legacy fallback when tournament has no playRules. */
export async function resolveDefaultScoringIds(transaction = null) {
  const scoringList = await ScoringList.findOne({
    order: [["id", "ASC"]],
    transaction,
  });
  if (!scoringList) {
    const err = new Error(
      "Bracket metadata missing. Run database seed (scoring lists)."
    );
    err.status = 500;
    throw err;
  }

  const poolRow = await findOrCreateScoringList(
    DEFAULT_MATCH_SCORING.pool,
    transaction
  );
  const playoffRow = await findOrCreateScoringList(
    DEFAULT_MATCH_SCORING.playoff,
    transaction
  );
  const semiRow = await findOrCreateScoringList(
    DEFAULT_MATCH_SCORING.semi,
    transaction
  );
  const goldRow = await findOrCreateScoringList(
    DEFAULT_MATCH_SCORING.gold,
    transaction
  );
  const bronzeRow = await findOrCreateScoringList(
    DEFAULT_MATCH_SCORING.bronze,
    transaction
  );

  const scoringConfig = {
    pool: { label: poolRow.name, scoringListId: poolRow.id },
    playoff: { label: playoffRow.name, scoringListId: playoffRow.id },
    semi: { label: semiRow.name, scoringListId: semiRow.id },
    gold: { label: goldRow.name, scoringListId: goldRow.id },
    bronze: { label: bronzeRow.name, scoringListId: bronzeRow.id },
  };

  return {
    scoringListId: poolRow.id,
    playoffMatchId: playoffRow.id,
    semiFinalMatchId: semiRow.id,
    bronzeMatchId: bronzeRow.id,
    goldMatchId: goldRow.id,
    roundId: poolRow.id,
    scoringConfig,
  };
}
