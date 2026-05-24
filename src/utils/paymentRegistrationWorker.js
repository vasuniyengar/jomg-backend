import models from "../models/Associations.js";
import { buildPaymentRegistrationMail } from "./bulkRegistrationEmail.js";
import sendEmail from "./sendEmail.js";
import { MAX_PAYMENT_EMAILS } from "./paymentRegistrationEmail.js";

const { PlayerRegistration } = models;

export async function processPaymentRegistrationJob(job) {
  const registrationId = job.registrationId;
  if (!registrationId) {
    throw new Error("paymentRegistration job missing registrationId");
  }

  const reg = await PlayerRegistration.findByPk(registrationId);
  if (!reg) {
    console.log(
      `[Worker] paymentRegistration: registration ${registrationId} not found, skipping`
    );
    return { skipped: true };
  }

  if (reg.paymentEmailSentCount >= MAX_PAYMENT_EMAILS) {
    console.log(
      `[Worker] paymentRegistration: limit reached for registration ${registrationId}, skipping`
    );
    return { skipped: true };
  }

  const to = job.to || job.email;
  if (!to) {
    throw new Error("paymentRegistration job missing recipient email");
  }

  const { subject, html, text } = buildPaymentRegistrationMail(job);

  await sendEmail({ to, subject, html, text });
  await reg.increment("paymentEmailSentCount");

  console.log(
    `[Worker] paymentRegistration email sent to ${to} (registration ${registrationId})`
  );
  return { sent: true };
}
