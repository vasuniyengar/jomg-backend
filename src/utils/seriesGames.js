/**
 * MLP series game types (stored as Matches.gameType int):
 * 1 = Women's Doubles
 * 2 = Men's Doubles
 * 3 = Mixed Doubles 1
 * 4 = Mixed Doubles 2
 * 5 = Dream Breaker
 */
export const GAME_TYPE = {
  WD: 1,
  MD: 2,
  X1: 3,
  X2: 4,
  DB: 5,
};

export const SERIES_GAME_DEFS = [
  { gameType: GAME_TYPE.WD, label: "Women's Doubles", short: "WD", key: "wd" },
  { gameType: GAME_TYPE.MD, label: "Men's Doubles", short: "MD", key: "md" },
  { gameType: GAME_TYPE.X1, label: "Mixed Doubles 1", short: "X1", key: "x1" },
  { gameType: GAME_TYPE.X2, label: "Mixed Doubles 2", short: "X2", key: "x2" },
  { gameType: GAME_TYPE.DB, label: "Dreambreaker", short: "DB", key: "db" },
];

export function isDreamBreakerGame(match) {
  return Number(match?.gameType) === GAME_TYPE.DB;
}

export function isRegulationSeriesGame(match) {
  const t = Number(match?.gameType);
  return Number.isFinite(t) && t >= GAME_TYPE.WD && t <= GAME_TYPE.X2;
}

export function isSeriesGameType(gameType) {
  const t = Number(gameType);
  return Number.isFinite(t) && t >= GAME_TYPE.WD && t <= GAME_TYPE.DB;
}

/** Group key for the 5 games that make up one team vs team series. */
export function seriesKey(match) {
  return `${match.poolId ?? "x"}:${match.roundId}:${match.team1Id}:${match.team2Id}`;
}

export function expandPairingToSeriesGames({
  poolId,
  roundId,
  team1Id,
  team2Id,
  type = "pool",
}) {
  return SERIES_GAME_DEFS.map((g) => ({
    poolId,
    roundId,
    team1Id,
    team2Id,
    type,
    status: "not_started",
    scoreTeam1: 0,
    scoreTeam2: 0,
    gameType: g.gameType,
  }));
}
