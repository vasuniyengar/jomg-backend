import models from "../models/Associations.js";
import { parseTournamentSettings } from "./tournamentHub.js";

const { Bracket, Tournament } = models;

/**
 * When masterPush / pricing section push is enabled, sync registrationFee (and optional tiers in scoringConfig).
 */
export async function pushPricingToDivisions(
  tournamentId,
  organizerInfo,
  { bracketIds } = {},
  transaction = null
) {
  const { settings } = parseTournamentSettings(organizerInfo);
  const shouldPush =
    settings?.masterPush === true || settings?.sectionPush?.pricing === true;
  if (!shouldPush) return { updated: 0 };

  const tournament = await Tournament.findByPk(tournamentId, { transaction });
  if (!tournament) return { updated: 0 };

  const entryFee = Number(tournament.entryFee || 0);
  const advanceTiers = settings?.pricing?.advanceTiers || [];

  const where = { tournamentId, poolStarted: false };
  if (Array.isArray(bracketIds) && bracketIds.length) {
    where.id = bracketIds;
  }

  const brackets = await Bracket.findAll({ where, transaction });

  let updated = 0;
  for (const bracket of brackets) {
    if (["ongoing", "completed"].includes(bracket.status)) continue;

    const existingConfig =
      bracket.scoringConfig && typeof bracket.scoringConfig === "object"
        ? { ...bracket.scoringConfig }
        : {};

    if (existingConfig.useGlobalSettings === false) continue;

    await bracket.update(
      {
        registrationFee: entryFee,
        scoringConfig: {
          ...existingConfig,
          pricingTiers: advanceTiers,
          payForPartner: settings?.pricing?.payForPartner,
          payForTeam: settings?.pricing?.payForTeam,
        },
      },
      { transaction }
    );
    updated += 1;
  }

  return { updated };
}
