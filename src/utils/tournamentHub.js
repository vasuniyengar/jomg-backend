/**
 * Hub list status mapping (UI) vs DB tournament.status
 */
import { mergeSponsorsConfig } from "./sponsorSettings.js";
export function computeHubStatus(tournament) {
  const status = tournament?.status;
  if (status === "draft") return "draft";
  if (status === "completed") return "completed";
  if (status === "ongoing") return "active";

  if (status === "active") {
    const start = tournament?.startDate
      ? new Date(tournament.startDate)
      : null;
    if (start) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      if (start > today) return "upcoming";
    }
    return "active";
  }

  return status || "draft";
}

export function hubStatusSortOrder(hubStatus) {
  const order = { active: 0, upcoming: 1, draft: 2, completed: 3 };
  return order[hubStatus] ?? 99;
}

export function serializeOrganizerInfo(value) {
  if (value == null) return JSON.stringify({ name: "", email: "", phone: "" });
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string") {
    try {
      JSON.parse(value);
      return value;
    } catch {
      return JSON.stringify({ name: value, email: "", phone: "" });
    }
  }
  return JSON.stringify({ name: "", email: "", phone: "" });
}

export function parseOrganizerInfo(value) {
  if (!value) return { name: "", email: "", phone: "" };
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return { name: value, email: "", phone: "" };
  }
}

export const DEFAULT_PLAYER_INSTRUCTIONS = [
  {
    label: "Stay & Travel",
    text: "Hampton Inn Austin (tournament rate code: APBO25).",
  },
  {
    label: "On-Site Food",
    text: "Food trucks on-site 8am–4pm. Water stations at every court.",
  },
  {
    label: "Parking & Arrival",
    text: "Free parking on-site. Shuttle available from Hampton Inn every 30 min.",
  },
  {
    label: "What to Bring",
    text: "Own paddle required. Tournament balls provided. Court-appropriate shoes mandatory.",
  },
  {
    label: "Waiver / Liability",
    text: "By registering, players agree to the Austin Pickleball Club liability waiver and release of claims.",
  },
];

export const DEFAULT_PADDLE_POLICY_TEXT = `Only USAPA & UPA-A approved paddles are allowed

USA Pickleball "delisted" the following paddles; Joola: Preseus 14mm Mod TA-15, Preseus 16mm Mod TA-15, Gearbox: Pro Power Elongated, Pro Kennex: Black Ace Ovation, Black Ace Pro, and Black Ace XF which players WILL NOT be allowed to use during medal matches. Selkirk Boomstick Elongated is allowed.

Since this is an amateur-only event, we will give players the opportunity to switch paddles (or choose to forfeit) rather than default to a forfeited game as stated in the USAPA rules, especially in light of paddles with an approved stamp that are no longer on the approved list.

Our event will follow USAPA rules (see: https://usapickleball.org/what-is-pickleball/official-rules/). Players may ask any questions they have or report any violations at the tournament desk. The tournament director may use their discretion in interpreting or modifying the USAPA rules to suit the specific scenario and ensure fun/competitive play.`;

function mergePlayerInstructions(saved) {
  if (!Array.isArray(saved) || !saved.length) {
    return DEFAULT_PLAYER_INSTRUCTIONS.map((block) => ({ ...block }));
  }
  return DEFAULT_PLAYER_INSTRUCTIONS.map((defaultBlock, index) => {
    const savedBlock = saved[index];
    if (savedBlock && typeof savedBlock === "object") {
      return {
        label: defaultBlock.label,
        text: String(savedBlock.text ?? defaultBlock.text),
      };
    }
    return { ...defaultBlock };
  });
}

/** Merged tournament settings from organizerInfo JSON (UI defaults for missing keys). */
export function parseTournamentSettings(organizerInfo) {
  const parsed = parseOrganizerInfo(organizerInfo);
  const defaults = {
    masterPush: false,
    numCourts: 8,
    playEnv: "Outdoor Open",
    netSetup: "Permanent",
    courtDescription: "",
    paddlePolicyText: DEFAULT_PADDLE_POLICY_TEXT,
    officialBall: "",
    officialBallUrl: "",
    paymentPhone: "",
    zelleUsername: "",
    venmoUsername: "",
    settingsConfirmed: false,
    settingsConfirmedAt: null,
    sectionPush: { pricing: false, playRules: false, dupr: false },
    pricing: {
      payForPartner: { enabled: false, mode: "optional" },
      payForTeam: { enabled: false, mode: "optional" },
      advanceTiers: [],
      bundles: [],
      prizes: { first: 0, second: 0, third: 0, medalsAwards: true },
    },
    playRules: {
      mlpFormat: false,
      autoGeneratePools: true,
    },
    notifications: {
      matchNotifications: true,
      liveScoring: true,
      emailNotifications: true,
      courtAssignmentText: false,
    },
    visibility: {
      publicTournamentPage: true,
      privateOnly: false,
      passwordProtected: false,
      waitlistEnabled: true,
    },
    tournamentInfo: {
      refundPolicy: {
        fullWindow:
          "Players or clubs receive a full refund up until the week before the tournament date. No refunds are issued after that.",
        replacement: "Players with a replacement can swap by reaching out to us.",
        questions: "Reach out to JOMG Pickleball at info@jomgpickleball.com.",
      },
      spectators: { ticketFee: 0, maxCapacity: "" },
      duprRequirementsText: "",
      duprRequirementsManual: false,
      playerInstructions: DEFAULT_PLAYER_INSTRUCTIONS.map((block) => ({ ...block })),
      sponsors: mergeSponsorsConfig(null),
      organizerOverride: false,
    },
  };

  const tournamentInfoDefaults = defaults.tournamentInfo;
  const parsedTournamentInfo = parsed.tournamentInfo || {};

  return {
    organizer: {
      name: parsed.name || "",
      email: parsed.email || "",
      phone: parsed.phone || "",
    },
    settings: {
      ...defaults,
      ...parsed,
      paddlePolicyText: (() => {
        const raw = String(parsed.paddlePolicyText ?? "");
        return raw.trim() ? raw : defaults.paddlePolicyText;
      })(),
      sectionPush: { ...defaults.sectionPush, ...(parsed.sectionPush || {}) },
      pricing: { ...defaults.pricing, ...(parsed.pricing || {}) },
      playRules: { ...defaults.playRules, ...(parsed.playRules || {}) },
      notifications: { ...defaults.notifications, ...(parsed.notifications || {}) },
      visibility: { ...defaults.visibility, ...(parsed.visibility || {}) },
      tournamentInfo: {
        ...tournamentInfoDefaults,
        ...parsedTournamentInfo,
        refundPolicy: {
          ...tournamentInfoDefaults.refundPolicy,
          ...(parsedTournamentInfo.refundPolicy || {}),
        },
        spectators: {
          ...tournamentInfoDefaults.spectators,
          ...(parsedTournamentInfo.spectators || {}),
        },
        playerInstructions: mergePlayerInstructions(
          parsedTournamentInfo.playerInstructions
        ),
        sponsors: mergeSponsorsConfig(parsedTournamentInfo.sponsors),
      },
    },
  };
}

const ALLOWED_STATUS_TRANSITIONS = {
  draft: ["active"],
  active: ["draft", "ongoing"],
  ongoing: ["completed"],
  completed: [],
};

export function canTransitionStatus(from, to) {
  return (ALLOWED_STATUS_TRANSITIONS[from] || []).includes(to);
}

export function displayStatusLabel(status) {
  switch (status) {
    case "draft":
      return "Draft";
    case "active":
      return "Published";
    case "ongoing":
      return "Live";
    case "completed":
      return "Completed";
    default:
      return status || "Draft";
  }
}

export function calendarDateString(date, timeZone) {
  const d = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function canStartTournamentLive(startDate, timeZone) {
  if (!startDate) {
    return {
      allowed: false,
      reason: "Set a tournament start date before going live.",
    };
  }
  const startDay = calendarDateString(startDate, timeZone);
  const [sy, sm, sd] = startDay.split("-").map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const earliestUtc = startUtc - 24 * 60 * 60 * 1000;
  const today = calendarDateString(new Date(), timeZone);
  const [ty, tm, td] = today.split("-").map(Number);
  const todayUtc = Date.UTC(ty, tm - 1, td);
  if (todayUtc < earliestUtc) {
    return {
      allowed: false,
      reason:
        "Go Live is available starting the calendar day before the tournament start date.",
    };
  }
  return { allowed: true, reason: null };
}
