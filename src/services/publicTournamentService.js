import { Op } from "sequelize";
import sequelize from "../config/database.js";
import models from "../models/Associations.js";
import { parseScoringConfig } from "../utils/scoringRules.js";
import {
  DEFAULT_PLAYER_INSTRUCTIONS,
  DEFAULT_PADDLE_POLICY_TEXT,
  parseTournamentSettings,
} from "../utils/tournamentHub.js";
import { mapSponsorsForPublic } from "../utils/sponsorSettings.js";
import { resolveMediaUrl } from "../services/tournamentMediaService.js";

const {
  Tournament,
  Bracket,
  Event,
  Team,
  TeamPlayer,
  Pool,
  PoolTeam,
  PoolTeamStats,
  Round,
  Match,
  PlayerRegistration,
  User,
} = models;

const BADGE = "CLUB VS CLUB";

const INACTIVE_TEAM_STATUSES = ["waitlist", "withdrawn", "forfeited"];

function activeTeamWhere(tournamentId, bracketId) {
  return {
    tournamentId,
    bracketId,
    [Op.or]: [
      { status: { [Op.notIn]: INACTIVE_TEAM_STATUSES } },
      { status: null },
    ],
  };
}

function initials(first, last) {
  return `${(first?.[0] || "").toUpperCase()}${(last?.[0] || "").toUpperCase()}`;
}

function formatDateLabel(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatStartTime(timeValue) {
  if (!timeValue) return "TBD";
  const raw = String(timeValue).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return raw;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function startTimeSortKey(timeValue) {
  if (!timeValue) return "99:99";
  const raw = String(timeValue).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return raw;
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function sortBracketsByStartTime(brackets) {
  return [...brackets].sort((a, b) => {
    const timeCmp = startTimeSortKey(a.startTime).localeCompare(
      startTimeSortKey(b.startTime)
    );
    if (timeCmp !== 0) return timeCmp;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });
}

function buildDivisionLabel(bracket) {
  return bracket.name || bracket.Event?.eventName || "Division";
}

function buildDivisionSub(bracket) {
  const parts = [];
  if (bracket.maxRating != null) {
    parts.push(`Team cap ${Number(bracket.maxRating).toFixed(2)}`);
  }
  if (bracket.minRating != null) {
    parts.push(`Max individual ${Number(bracket.minRating).toFixed(2)}`);
  }
  return parts.join(" · ") || "";
}

function sanitizePlayer(user, { captain = false, sub = false } = {}) {
  if (!user) return null;
  return {
    firstName: user.firstname || "",
    lastName: user.lastname || "",
    initials: initials(user.firstname, user.lastname),
    dupr: Number(user.duprRating) || 0,
    captain,
    sub,
  };
}

function mapTeamDupr(players) {
  return players
    .reduce((sum, p) => sum + (Number(p.dupr) || 0), 0)
    .toFixed(1);
}

function isBracketPublic(bracket, showDivisionsPublicly) {
  if (!showDivisionsPublicly) return false;
  const cfg = parseScoringConfig(bracket);
  return cfg?.showPublic !== false;
}

export function assertPublicPageAccess(tournament, settings, { preview = false } = {}) {
  if (!tournament) {
    const err = new Error("Tournament not found");
    err.status = 404;
    throw err;
  }
  if (tournament.status === "draft" && !preview) {
    const err = new Error("Tournament not found");
    err.status = 404;
    throw err;
  }
  const vis = settings.visibility || {};
  if (vis.privateOnly || vis.publicTournamentPage === false) {
    const err = new Error("Tournament not found");
    err.status = 404;
    throw err;
  }
}

export function mapPlayRulesToFormat(playRules) {
  const mlp = playRules?.mlp || {};
  const tag = playRules?.mlpFormat ? "MLP · Team Play" : "Tournament Format";
  const intro = playRules?.mlpFormat
    ? "Major League Pickleball format — team play with men's doubles, women's doubles, and mixed doubles segments plus a Dream Breaker tiebreaker."
    : "Tournament match format and scoring rules configured by the organizer.";

  return {
    tag,
    intro,
    mlpScoring: playRules?.mlpFormat
      ? [
          { label: "Men's Doubles", value: mlp.mensDoubles || "—" },
          { label: "Women's Doubles", value: mlp.womensDoubles || "—" },
          { label: "Mixed Doubles 1", value: mlp.mixed1 || "—" },
          { label: "Mixed Doubles 2", value: mlp.mixed2 || "—" },
        ]
      : [],
    dreamBreaker: playRules?.mlpFormat
      ? [
          { label: "Scoring", value: mlp.dreamBreaker || "—" },
          { label: "Rotation", value: mlp.rotation || "—" },
          { label: "Trigger", value: mlp.trigger || "—" },
        ]
      : [],
    teamSetup: playRules?.mlpFormat
      ? [
          { label: "Starters", value: "2F + 2M" },
          { label: "Substitutes (Optional)", value: "1F & 1M" },
          { label: "Game Order", value: mlp.gameOrder || "—" },
        ]
      : [],
    scoringTiming: [
      { label: "Scoring Type", value: playRules?.scoringType || mlp.scoringType || "—" },
      {
        label: "Warm-up Time",
        value: `${playRules?.warmUpMinutes ?? mlp.warmUpMinutes ?? 3} min`,
      },
    ],
    notes: [
      {
        label: "Substitutions",
        text: mlp.substitutions
          ? "Allowed for injury or before the next match (not between games)."
          : "Substitutions per organizer rules.",
      },
      {
        label: "Coach on Court",
        text: mlp.coachOnCourt ? "Allowed during timeouts." : "Off — no non-playing coach during timeouts.",
      },
    ],
  };
}

async function countDistinctClubs(tournamentId) {
  return PlayerRegistration.count({
    where: {
      tournamentId,
      clubName: { [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }] },
    },
    distinct: true,
    col: "clubName",
  });
}

async function mapDivisionSummary(bracket, tournament, settings) {
  const teamWhere = activeTeamWhere(tournament.id, bracket.id);
  const teamCount = await Team.count({ where: teamWhere });
  const playerCount = await TeamPlayer.count({
    include: [
      {
        model: Team,
        as: "Team",
        where: teamWhere,
        required: true,
      },
    ],
  });
  const seeding = settings.playRules?.seedingMethod || "team DUPR";
  const teams = teamCount > 0 ? await fetchTeamsForBracket(tournament.id, bracket.id) : [];

  return {
    id: String(bracket.id),
    time: formatStartTime(bracket.startTime),
    name: buildDivisionLabel(bracket),
    sub: buildDivisionSub(bracket),
    teamCount,
    playerCount,
    barLabel: `${teamCount} teams · seeded by ${seeding}`,
    hasDetail: teamCount > 0 || Boolean(bracket.poolStarted),
    previewTeam: teams[0] || null,
    teams,
  };
}

function buildEventDayLabel(bracketsOnDay) {
  const eventNames = [
    ...new Set(bracketsOnDay.map((b) => b.Event?.eventName).filter(Boolean)),
  ];
  if (eventNames.length === 1) return eventNames[0];
  if (eventNames.length > 1) return eventNames.join(" · ");

  const names = bracketsOnDay.map((b) => b.name || "").filter(Boolean);
  if (names.length) {
    const prefix = names[0].split("·")[0].trim();
    if (prefix && names.every((name) => name.startsWith(prefix))) {
      return prefix;
    }
  }

  const dateKey = bracketsOnDay[0]?.startDate;
  return dateKey ? formatDateLabel(String(dateKey).slice(0, 10)) : "Event";
}

function buildInfoBar(tournament, publicBrackets, clubCount) {
  const items = [];
  const byDate = new Map();

  for (const bracket of publicBrackets) {
    const dateKey = bracket.startDate
      ? String(bracket.startDate).slice(0, 10)
      : String(tournament.startDate || "").slice(0, 10);
    if (!dateKey) continue;
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey).push(bracket);
  }

  for (const [dateKey, dayBrackets] of [...byDate.entries()].sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    items.push({
      icon: "calendar",
      label: buildEventDayLabel(dayBrackets),
      value: formatShortDate(dateKey),
    });
  }

  if (items.length === 0 && tournament.startDate) {
    items.push({
      icon: "calendar",
      label: formatDateLabel(String(tournament.startDate).slice(0, 10)),
      value: formatShortDate(String(tournament.startDate).slice(0, 10)),
    });
  }

  items.push({
    icon: "divisions",
    label: "Divisions",
    value: String(publicBrackets.length),
  });
  items.push({
    icon: "clubs",
    label: "Clubs",
    value: String(clubCount),
  });
  return items;
}

function formatWeekday(dateStr) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short" });
}

function groupDivisionsByDay(brackets, tournament, settings) {
  const byDate = new Map();
  for (const bracket of brackets) {
    const dateKey = bracket.startDate
      ? String(bracket.startDate).slice(0, 10)
      : String(tournament.startDate).slice(0, 10);
    if (!byDate.has(dateKey)) byDate.set(dateKey, []);
    byDate.get(dateKey).push(bracket);
  }

  return Promise.all(
    [...byDate.entries()].sort(([a], [b]) => a.localeCompare(b)).map(async ([dateKey, dayBrackets]) => {
      const sortedBrackets = sortBracketsByStartTime(dayBrackets);
      const divisions = await Promise.all(
        sortedBrackets.map((b) => mapDivisionSummary(b, tournament, settings))
      );
      return {
        id: dateKey,
        label: formatDateLabel(dateKey),
        subtitle: `${formatWeekday(dateKey)} · ${divisions.length} division${divisions.length === 1 ? "" : "s"}`,
        divisions,
      };
    })
  );
}

export async function buildPublicTournamentPage(slug, { preview = false } = {}) {
  const tournament = await Tournament.findOne({
    where: { slug },
    include: [
      { model: User, attributes: ["id", "firstname", "lastname", "email", "phoneNumber"] },
      { model: Bracket, include: [{ model: Event }] },
    ],
  });

  const { organizer, settings } = parseTournamentSettings(tournament?.organizerInfo);
  assertPublicPageAccess(tournament, settings, { preview });

  const isPreview = preview || tournament.status === "draft";

  const showDivisions = settings.visibility?.showDivisionsPublicly !== false;
  const publicBrackets = showDivisions
    ? (tournament.Brackets || []).filter((b) => isBracketPublic(b, true))
    : [];

  const clubCount = await countDistinctClubs(tournament.id);
  const days = showDivisions
    ? await groupDivisionsByDay(publicBrackets, tournament, settings)
    : [];

  const host = tournament.User;
  const organizerName = organizer.name || `${host?.firstname || ""} ${host?.lastname || ""}`.trim();
  const organizerEmail = organizer.email || host?.email || "";
  const organizerPhone = organizer.phone || host?.phoneNumber || "";

  const rawThumb = tournament.getDataValue("tournamentTumbnail");
  const bannerUrl = resolveMediaUrl(rawThumb);

  const refund = settings.tournamentInfo?.refundPolicy || {};

  return {
    slug: tournament.slug,
    title: tournament.name,
    description: tournament.description,
    status: tournament.status,
    preview: isPreview,
    badge: BADGE,
    bannerUrl,
    venue: {
      name: tournament.venue || tournament.location,
      address: tournament.location,
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${tournament.venue || ""} ${tournament.location || ""}`.trim()
      )}`,
    },
    organizer: {
      initials: initials(organizerName.split(" ")[0], organizerName.split(" ").slice(1).join(" ")),
      name: organizerName,
      role: "Tournament Director",
      email: organizerEmail,
      phone: organizerPhone,
      phoneHref: organizerPhone ? `tel:${organizerPhone.replace(/\D/g, "")}` : "",
    },
    infoBar: buildInfoBar(tournament, publicBrackets, clubCount),
    tabs: {
      details: {
        courtDescription: settings.courtDescription || "",
        officialBall: settings.officialBall || "",
        officialBallUrl: settings.officialBallUrl || "",
        instructions:
          settings.tournamentInfo?.playerInstructions || DEFAULT_PLAYER_INSTRUCTIONS,
        paddlePolicyText: (() => {
          const raw = String(settings.paddlePolicyText || "");
          return raw.trim() ? raw : DEFAULT_PADDLE_POLICY_TEXT;
        })(),
        duprPolicyText: settings.tournamentInfo?.duprRequirementsText || "",
      },
      format: mapPlayRulesToFormat(settings.playRules),
      refund: {
        title: "WHAT IF I CAN'T MAKE IT?",
        blocks: [
          { label: "Full Refund Window", text: refund.fullWindow || "" },
          { label: "Replacement Players", text: refund.replacement || "" },
          { label: "Questions", text: refund.questions || "" },
        ],
      },
      sponsors: mapSponsorsForPublic(settings.tournamentInfo?.sponsors),
      divisions: {
        note: days.length > 1
          ? `The championship runs across ${days.length} separate event dates. Select a date below to see its divisions.`
          : "Select a date below to see its divisions.",
        days,
      },
      livePlay: { enabled: false },
    },
  };
}

async function fetchTeamsForBracket(tournamentId, bracketId) {
  const teams = await Team.findAll({
    where: activeTeamWhere(tournamentId, bracketId),
    include: [
      { model: PoolTeamStats, as: "PoolTeamStat", required: false },
      {
        model: TeamPlayer,
        as: "TeamPlayers",
        include: [{ model: User, as: "User", attributes: ["firstname", "lastname", "duprRating"] }],
      },
    ],
    order: [["id", "ASC"]],
  });

  const mapped = teams.map((team, index) => {
    const players = team.TeamPlayers.filter((tp) => !tp.isSubstitute).map((tp) =>
      sanitizePlayer(tp.User, { captain: Boolean(tp.isCaptain) })
    ).filter(Boolean);
    const subs = team.TeamPlayers.filter((tp) => tp.isSubstitute)
      .map((tp) => sanitizePlayer(tp.User, { sub: true }))
      .filter(Boolean);
    const seed = team.PoolTeamStat?.playoffSeed || index + 1;
    return {
      seed,
      initials: team.teamName?.slice(0, 2)?.toUpperCase() || "TM",
      name: team.teamName,
      location: "",
      teamDupr: mapTeamDupr(players),
      players,
      subs,
    };
  });

  return mapped.sort((a, b) => a.seed - b.seed || String(a.name).localeCompare(String(b.name)));
}

async function fetchPoolsForBracket(tournamentId, bracketId) {
  const pools = await Pool.findAll({
    where: { tournamentId, bracketId },
    include: [
      {
        model: PoolTeam,
        include: [
          {
            model: Team,
            include: [{ model: PoolTeamStats, as: "PoolTeamStat" }],
          },
        ],
      },
    ],
    order: [["id", "ASC"]],
  });

  return pools.map((pool, poolIndex) => ({
    id: String.fromCharCode(97 + poolIndex),
    name: pool.poolName,
    rows: pool.PoolTeams.map((pt, idx) => {
      const stats = pt.Team?.PoolTeamStat;
      const wins = stats?.wins ?? 0;
      const losses = stats?.losses ?? 0;
      return {
        seed: idx + 1,
        initials: pt.Team?.teamName?.slice(0, 2)?.toUpperCase() || "TM",
        team: pt.Team?.teamName || "Team",
        w: wins,
        l: losses,
        games: `${stats?.pointsFor ?? 0}–${stats?.pointsAgainst ?? 0}`,
        pts: wins * 3,
        advance: Boolean(stats?.playoffSeed),
      };
    }).sort((a, b) => b.pts - a.pts || a.seed - b.seed),
  }));
}

async function fetchMatchesForBracket(tournamentId, bracketId) {
  const pools = await Pool.findAll({ where: { tournamentId, bracketId }, attributes: ["id"] });
  const poolIds = pools.map((p) => p.id);
  const matches = await Match.findAll({
    where: { poolId: { [Op.in]: poolIds } },
    include: [
      { model: Team, as: "Team1", attributes: ["id", "teamName"] },
      { model: Team, as: "Team2", attributes: ["id", "teamName"] },
      { model: Pool, attributes: ["poolName"] },
    ],
    order: [["id", "ASC"]],
  });

  return matches.map((m) => {
    const winner =
      m.winnerTeamId === m.team1Id ? 1 : m.winnerTeamId === m.team2Id ? 2 : 0;
    return {
      type: "pool",
      time: "—",
      court: "—",
      team1: {
        initials: m.Team1?.teamName?.slice(0, 2)?.toUpperCase() || "T1",
        name: m.Team1?.teamName || "TBD",
      },
      team2: {
        initials: m.Team2?.teamName?.slice(0, 2)?.toUpperCase() || "T2",
        name: m.Team2?.teamName || "TBD",
      },
      score: `${m.scoreTeam1 ?? 0}–${m.scoreTeam2 ?? 0}`,
      status: `Final · ${m.Pool?.poolName || "Pool"}`,
      winner,
    };
  });
}

function mapPlayoffRounds(rounds) {
  const roundLabels = { semifinal: "Semifinals", final: "Final", gold: "Final", bronze: "Bronze" };
  return rounds.map((r) => ({
    round: roundLabels[r.type] || `Round ${r.roundNumber}`,
    matches: (r.Matches || []).map((m) => ({
      teams: [
        {
          initials: m.Team1?.teamName?.slice(0, 2)?.toUpperCase() || "T1",
          name: m.Team1?.teamName || "TBD",
          score: m.scoreTeam1 ?? 0,
          win: m.winnerTeamId === m.team1Id,
        },
        {
          initials: m.Team2?.teamName?.slice(0, 2)?.toUpperCase() || "T2",
          name: m.Team2?.teamName || "TBD",
          score: m.scoreTeam2 ?? 0,
          win: m.winnerTeamId === m.team2Id,
        },
      ],
    })),
  }));
}

async function fetchPlayoffs(tournamentId, bracketId) {
  const rounds = await Round.findAll({
    where: { bracketId, type: { [Op.ne]: "pool" } },
    include: [
      {
        model: Match,
        include: [
          { model: Team, as: "Team1", attributes: ["id", "teamName"] },
          { model: Team, as: "Team2", attributes: ["id", "teamName"] },
        ],
      },
    ],
    order: [["roundNumber", "ASC"]],
  });
  return mapPlayoffRounds(rounds);
}

async function fetchStandings(tournamentId, bracketId) {
  const pools = await Pool.findAll({ where: { tournamentId, bracketId }, attributes: ["id"] });
  const poolIds = pools.map((p) => p.id);
  const stats = await PoolTeamStats.findAll({
    where: { poolId: { [Op.in]: poolIds } },
    include: [{ model: Team, as: "Team", attributes: ["teamName"] }],
    order: [
      [sequelize.fn("ISNULL", sequelize.col("finalRank")), "ASC"],
      ["finalRank", "ASC"],
    ],
  });

  const medals = ["🥇", "🥈", "🥉", "4"];
  return stats.slice(0, 4).map((s, i) => ({
    medal: medals[i] || String(i + 1),
    place: `${i + 1}${i === 0 ? "st" : i === 1 ? "nd" : i === 2 ? "rd" : "th"} Place`,
    team: s.Team?.teamName || "Team",
    location: "",
    gold: i === 0,
  }));
}

export async function buildPublicDivisionDetail(slug, bracketId, { preview = false } = {}) {
  const tournament = await Tournament.findOne({
    where: { slug },
    include: [{ model: User, attributes: ["id", "firstname", "lastname"] }],
  });

  const bracket = await Bracket.findOne({
    where: { id: bracketId, tournamentId: tournament?.id },
    include: [{ model: Event }],
  });
  const { settings } = parseTournamentSettings(tournament?.organizerInfo);
  assertPublicPageAccess(tournament, settings, { preview });
  if (!bracket) {
    const err = new Error("Division not found");
    err.status = 404;
    throw err;
  }
  if (!isBracketPublic(bracket, settings.visibility?.showDivisionsPublicly !== false)) {
    const err = new Error("Division not found");
    err.status = 404;
    throw err;
  }

  const teams = await fetchTeamsForBracket(tournament.id, bracketId);
  const pools = await fetchPoolsForBracket(tournament.id, bracketId);
  const matches = await fetchMatchesForBracket(tournament.id, bracketId);
  const playoffs = await fetchPlayoffs(tournament.id, bracketId);
  const standings = await fetchStandings(tournament.id, bracketId);

  const playerCount = teams.reduce(
    (sum, t) => sum + t.players.length + (t.subs?.length || 0),
    0
  );

  return {
    title: buildDivisionLabel(bracket),
    subtitle: `${teams.length} teams · ${playerCount} players · ${formatStartTime(bracket.startTime)}`,
    overview: {
      cards: [
        { label: "Format", value: bracket.BracketFormat?.name || "Round Robin" },
        { label: "Teams", value: `${teams.length} · ${playerCount} players` },
        { label: "Pool Play", value: parseScoringConfig(bracket)?.pool?.label || "Pool play" },
        { label: "Status", value: bracket.status || "—" },
      ],
      howItWorks: tournament.description || "",
      status: bracket.status === "completed" ? "Completed · final standings posted" : `${bracket.status || "Scheduled"}`,
      champion: standings[0]?.team || "—",
    },
    teams,
    pools,
    matches,
    brackets: playoffs,
    playoffs,
    standings,
  };
}
