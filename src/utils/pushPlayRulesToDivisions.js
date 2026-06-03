import models from "../models/Associations.js";
import { parseTournamentSettings } from "./tournamentHub.js";
import { resolveBracketScoringFromTournament } from "./bracketScoring.js";

const { Bracket, Tournament } = models;

/**
 * When masterPush / playRules section push is enabled, sync scoring FKs + scoringConfig
 * on all non-started brackets for this tournament.
 */
export async function pushPlayRulesToDivisions(tournamentId, organizerInfo, transaction = null) {
  const { settings } = parseTournamentSettings(organizerInfo);
  const shouldPush =
    settings?.masterPush === true || settings?.sectionPush?.playRules === true;
  if (!shouldPush) return { updated: 0 };

  const tournament = await Tournament.findByPk(tournamentId, { transaction });
  if (!tournament) return { updated: 0 };

  const scoring = await resolveBracketScoringFromTournament(tournament, transaction);

  const brackets = await Bracket.findAll({
    where: { tournamentId, poolStarted: false },
    transaction,
  });

  let updated = 0;
  for (const bracket of brackets) {
    if (["ongoing", "completed"].includes(bracket.status)) continue;
    await bracket.update(
      {
        scoringListId: scoring.scoringListId,
        playoffMatchId: scoring.playoffMatchId,
        semiFinalMatchId: scoring.semiFinalMatchId,
        bronzeMatchId: scoring.bronzeMatchId,
        goldMatchId: scoring.goldMatchId,
        roundId: scoring.roundId,
        scoringConfig: scoring.scoringConfig,
      },
      { transaction }
    );
    updated += 1;
  }

  return { updated };
}
