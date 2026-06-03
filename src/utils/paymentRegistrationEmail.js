import { parseOrganizerInfo } from "./tournamentHub.js";

export const MAX_PAYMENT_EMAILS = 3;

export function getPaymentPhone(tournamentOrOrganizerInfo) {
  const organizerInfo =
    tournamentOrOrganizerInfo != null &&
    typeof tournamentOrOrganizerInfo === "object" &&
    "organizerInfo" in tournamentOrOrganizerInfo
      ? tournamentOrOrganizerInfo.organizerInfo
      : tournamentOrOrganizerInfo;
  const org = parseOrganizerInfo(organizerInfo);
  const phone = String(org.paymentPhone || org.phone || "").trim();
  return phone;
}

export function computeRegistrationAmountDue(bracket, tournament) {
  return Number(bracket?.registrationFee ?? tournament?.entryFee ?? 0);
}

export function buildPaymentEmailPayload({
  tournament,
  bracket,
  user,
  hostUser,
  amountDue,
  paymentPhone,
}) {
  const org = parseOrganizerInfo(tournament.organizerInfo);
  const hostName = hostUser?.firstname
    ? `${hostUser.firstname} ${hostUser.lastname || ""}`.trim()
    : org.name;

  return {
    to: user.email,
    firstname: user.firstname,
    hostName,
    tournamentName: tournament.name,
    bracketName: bracket.name,
    startDate: tournament.startDate,
    endDate: tournament.endDate,
    amountDue,
    paymentPhone,
    organizerName: org.name,
    organizerPhone: org.phone,
  };
}

export function buildPaymentRegistrationJob(registrationId, payload) {
  return {
    jobType: "paymentRegistration",
    registrationId,
    email: payload.to,
    to: payload.to,
    firstname: payload.firstname,
    hostName: payload.hostName,
    tournamentName: payload.tournamentName,
    bracketName: payload.bracketName,
    startDate: payload.startDate,
    endDate: payload.endDate,
    amountDue: payload.amountDue,
    paymentPhone: payload.paymentPhone,
    organizerName: payload.organizerName,
    organizerPhone: payload.organizerPhone,
  };
}
