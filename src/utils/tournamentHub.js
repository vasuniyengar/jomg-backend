/**
 * Hub list status mapping (UI) vs DB tournament.status
 */
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

/** Merged tournament settings from organizerInfo JSON (UI defaults for missing keys). */
export function parseTournamentSettings(organizerInfo) {
  const parsed = parseOrganizerInfo(organizerInfo);
  const defaults = {
    masterPush: false,
    numCourts: 8,
    playEnv: "Outdoor Open",
    netSetup: "Permanent",
    officialBall: "",
    officialBallUrl: "",
    paymentPhone: "",
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
      sponsors: [],
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
