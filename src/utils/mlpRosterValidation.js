import models from "../models/Associations.js";

const { TeamPlayer, Team, Bracket, Event, User } = models;

export function isMlpEventName(eventName) {
  return /mlp/i.test(eventName || "");
}

export function countGendersFromUsers(users) {
  let males = 0;
  let females = 0;
  for (const u of users || []) {
    const g = String(u?.gender || "").toLowerCase();
    if (g.startsWith("m")) males += 1;
    else if (g.startsWith("f")) females += 1;
  }
  return { males, females };
}

export function mlpGenderBalanceError(males, females) {
  if (males < 2 || females < 2) {
    return "MLP teams require at least 2 male and 2 female players";
  }
  return null;
}

export async function validateMlpTeamRoster(teamId, transaction = null) {
  if (!teamId) return null;

  const team = await Team.findByPk(teamId, {
    include: [
      {
        model: Bracket,
        include: [{ model: Event, attributes: ["eventName"] }],
      },
    ],
    transaction,
  });
  if (!team) return null;

  const eventName = team.Bracket?.Event?.eventName || "";
  if (!isMlpEventName(eventName)) return null;

  const roster = await TeamPlayer.findAll({
    where: { teamId },
    include: [{ model: User, attributes: ["gender"] }],
    transaction,
  });

  const { males, females } = countGendersFromUsers(roster.map((r) => r.User));
  return mlpGenderBalanceError(males, females);
}
