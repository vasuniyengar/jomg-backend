/** Canonical scoring preset labels (mirrors frontend tournamentSettings SCORING_OPTIONS). */
export const SCORING_OPTIONS = [
  "1 game to 11, win by 1",
  "1 game to 11, win by 2",
  "1 game to 15, win by 1",
  "1 game to 15, win by 2",
  "1 game to 21, win by 1",
  "1 game to 21, win by 2",
  "Best of 3 to 11, win by 1",
  "Best of 3 to 11, win by 2",
  "Best of 3 to 15, win by 1",
  "Best of 3 to 15, win by 2",
  "Best of 3 to 21, win by 2",
  "Best of 5 to 11, win by 2",
  "Best of 5 to 15, win by 2",
  "Rally scoring to 21, win by 2",
  "Rally scoring to 25, win by 2",
  "Timed match — 20 min, point capped",
  "Timed match — 30 min, point capped",
];

export const DEFAULT_MATCH_SCORING = {
  pool: "1 game to 15, win by 2",
  playoff: "1 game to 15, win by 2",
  semi: "1 game to 15, win by 2",
  gold: "Best of 3 to 11, win by 2",
  bronze: "1 game to 15, win by 2",
};

/** Parse a scoring label into structured rules for storage / validation hints. */
export function parseScoringRules(label) {
  const name = String(label || "").trim();
  const lower = name.toLowerCase();

  if (lower.includes("best of")) {
    const gamesMatch = lower.match(/best of (\d+)/);
    const games = gamesMatch ? parseInt(gamesMatch[1], 10) : 3;
    const pointsTo = parseInt(lower.match(/to (\d+)/)?.[1] || "11", 10);
    const winBy = parseInt(lower.match(/win by (\d+)/)?.[1] || "2", 10);
    return {
      format: "best_of",
      games,
      pointsTo,
      winBy,
      label: name,
    };
  }

  if (lower.includes("timed match")) {
    const mins = parseInt(lower.match(/(\d+)\s*min/)?.[1] || "20", 10);
    return { format: "timed", minutes: mins, label: name };
  }

  const pointsTo = parseInt(lower.match(/to (\d+)/)?.[1] || "11", 10);
  const winBy = parseInt(lower.match(/win by (\d+)/)?.[1] || "1", 10);
  return { format: "single", pointsTo, winBy, label: name };
}

/** Map Round.type to scoringConfig / bracket FK key. */
export function scoringStageKeyForRoundType(roundType) {
  const t = String(roundType || "pool").toLowerCase();
  if (t === "pool") return "pool";
  if (t === "bronze") return "bronze";
  if (t === "gold" || t === "final" || t === "round_of_2") return "gold";
  if (t === "semifinal" || t === "semifinals" || t === "round_of_4") return "semi";
  if (
    t === "quarterfinal" ||
    t === "quarterfinals" ||
    t.startsWith("round_of_")
  ) {
    return "playoff";
  }
  return "playoff";
}

export function parseScoringConfig(bracket) {
  const raw = bracket?.scoringConfig;
  if (!raw) return null;
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Resolve scoringListId for a match from bracket snapshot + legacy FKs. */
export function resolveScoringListIdForRound(bracket, roundType) {
  const stage = scoringStageKeyForRoundType(roundType);
  const config = parseScoringConfig(bracket);
  if (config?.[stage]?.scoringListId) {
    return config[stage].scoringListId;
  }

  switch (stage) {
    case "pool":
      return bracket.scoringListId;
    case "semi":
      return bracket.semiFinalMatchId;
    case "gold":
      return bracket.goldMatchId;
    case "bronze":
      return bracket.bronzeMatchId;
    case "playoff":
    default:
      return bracket.playoffMatchId;
  }
}

export function scoringLabelForRound(bracket, roundType) {
  const stage = scoringStageKeyForRoundType(roundType);
  const config = parseScoringConfig(bracket);
  if (config?.[stage]?.label) return config[stage].label;
  return null;
}
