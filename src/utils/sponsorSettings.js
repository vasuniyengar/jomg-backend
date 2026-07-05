import crypto from "crypto";
import { resolveMediaUrl } from "../services/tournamentMediaService.js";

export const SPONSOR_TIER_KEYS = [
  "title",
  "ball",
  "championshipCourt",
  "hydration",
  "division",
];

export const SPONSOR_TIER_LABELS = {
  title: "Title Sponsor",
  ball: "Ball Sponsor",
  championshipCourt: "Championship Court",
  hydration: "Hydration Partner",
  division: "Division Sponsors",
};

export function newSponsorItemId() {
  return `spon-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
}

export function defaultSponsorTiers() {
  return {
    title: { items: [] },
    ball: { items: [] },
    championshipCourt: { items: [] },
    hydration: { items: [] },
    division: { items: [] },
  };
}

export function defaultSponsorsConfig() {
  return {
    intro: "",
    tiers: defaultSponsorTiers(),
  };
}

/** Normalize legacy array or object sponsors into tier map. */
export function mergeSponsorsConfig(raw) {
  const defaults = defaultSponsorsConfig();
  if (!raw) return defaults;
  if (Array.isArray(raw)) {
    return { ...defaults, tiers: { ...defaults.tiers } };
  }
  const tiers = { ...defaultSponsorTiers() };
  for (const key of SPONSOR_TIER_KEYS) {
    const tier = raw.tiers?.[key];
    tiers[key] = {
      items: Array.isArray(tier?.items)
        ? tier.items.map((item) => ({
            id: item.id || newSponsorItemId(),
            name: String(item.name || "").trim(),
            url: String(item.url || "#").trim() || "#",
            logoKey: item.logoKey || item.logo || "",
            darkLogo: Boolean(item.darkLogo),
          }))
        : [],
    };
  }
  return {
    intro: String(raw.intro || defaults.intro),
    tiers,
  };
}

export function mapSponsorsForPublic(sponsors) {
  const merged = mergeSponsorsConfig(sponsors);

  const tiers = SPONSOR_TIER_KEYS.map((key) => ({
    name: SPONSOR_TIER_LABELS[key],
    feature: key === "title",
    items: merged.tiers[key].items
      .filter((item) => item.name || item.logoKey)
      .map((item) => ({
        name: item.name || "Sponsor",
        url: item.url || "#",
        logo: resolveMediaUrl(item.logoKey),
        darkLogo: item.darkLogo,
      })),
  })).filter((tier) => tier.items.length > 0);

  return { tiers };
}
