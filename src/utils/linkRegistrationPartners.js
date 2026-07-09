import models from "../models/Associations.js";

const { PlayerRegistration, User } = models;

export function partnerMatchesRow(row, other) {
  const partner = String(row.partner || row.Partner || "").trim().toLowerCase();
  if (!partner || partner === "-") return false;
  const otherName = `${other.name || ""}`.trim().toLowerCase();
  const otherEmail = `${other.email || ""}`.trim().toLowerCase();
  return (
    partner === otherName ||
    partner === otherEmail ||
    otherName.includes(partner) ||
    partner.includes(otherName.split(" ")[0] || "")
  );
}

export async function linkBulkUploadPartners(batchRegs, tournamentId, transaction) {
  for (const item of batchRegs) {
    const partnerRaw = String(item.row?.partner || item.row?.Partner || "").trim();
    if (!partnerRaw || partnerRaw === "-") continue;

    let matchPlayerId = null;
    let matchRegistrationId = null;

    const batchMatch = batchRegs.find(
      (other) =>
        other.registrationId !== item.registrationId &&
        other.bracketId === item.bracketId &&
        partnerMatchesRow(item.row, { name: other.name, email: other.email })
    );

    if (batchMatch) {
      matchPlayerId = batchMatch.playerId;
      matchRegistrationId = batchMatch.registrationId;
    } else {
      const regs = await PlayerRegistration.findAll({
        where: { tournamentId, bracketId: item.bracketId },
        include: [
          {
            model: User,
            attributes: ["id", "firstname", "lastname", "email"],
          },
        ],
        transaction,
      });
      const existing = regs.find((r) => {
        if (r.playerId === item.playerId || !r.User) return false;
        const nm = `${r.User.firstname} ${r.User.lastname}`.trim();
        return partnerMatchesRow(item.row, { name: nm, email: r.User.email });
      });
      if (existing) {
        matchPlayerId = existing.playerId;
        matchRegistrationId = existing.id;
      }
    }

    if (!matchPlayerId) continue;

    await PlayerRegistration.update(
      { partnerId: matchPlayerId },
      { where: { id: item.registrationId }, transaction }
    );
    if (matchRegistrationId) {
      await PlayerRegistration.update(
        { partnerId: item.playerId },
        { where: { id: matchRegistrationId }, transaction }
      );
    }
  }
}
