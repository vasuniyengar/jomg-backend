import Mailgen from "mailgen";
import sendEmail from "./sendEmail.js";

function createMailGenerator() {
  return new Mailgen({
    theme: "default",
    product: {
      name: "JOMG",
      link: process.env.FRONTEND_URL || "http://localhost:3000",
    },
  });
}

export function buildPaymentRegistrationMailContent({
  firstname,
  hostName,
  tournamentName,
  bracketName,
  startDate,
  endDate,
  amountDue,
  paymentPhone,
  zelleUsername,
  venmoUsername,
  organizerName,
  organizerPhone,
}) {
  const start = startDate
    ? new Date(startDate).toLocaleDateString("en-US", { dateStyle: "medium" })
    : "";
  const end = endDate
    ? new Date(endDate).toLocaleDateString("en-US", { dateStyle: "medium" })
    : "";
  const datesLine =
    start && end ? `${start} – ${end}` : start || end || "See tournament page";

  const amountFormatted = Number(amountDue || 0).toFixed(2);
  const payPhone = paymentPhone || organizerPhone || "";
  const tableData = [
    {
      Item: "Total amount to pay",
      Details: `$${amountFormatted}`,
    },
  ];
  if (payPhone) {
    tableData.push({ Item: "Pay via mobile", Details: payPhone });
  }
  if (zelleUsername) {
    tableData.push({ Item: "Zelle", Details: zelleUsername });
  }
  if (venmoUsername) {
    tableData.push({ Item: "Venmo", Details: venmoUsername });
  }
  if (tableData.length === 1) {
    tableData.push({
      Item: "Payment",
      Details: "Contact the organizer",
    });
  }

  const emailContent = {
    body: {
      name: firstname || "Player",
      intro: [
        `${hostName || organizerName || "Your tournament organizer"} has registered you for **${tournamentName}**.`,
        `**Division:** ${bracketName}`,
        `**Dates:** ${datesLine}`,
      ],
      table: {
        data: tableData,
        columns: {
          customWidth: {
            Item: "35%",
            Details: "65%",
          },
        },
      },
      outro: [
        "Please complete payment using the instructions above to confirm your spot.",
        organizerName
          ? `Questions? Contact ${organizerName}${organizerPhone ? ` at ${organizerPhone}` : ""}.`
          : "Contact the tournament organizer if you have questions.",
      ],
    },
  };

  const subject = `You're registered for ${tournamentName}`;
  return { subject, emailContent };
}

export function buildPaymentRegistrationMail(payload) {
  const mailGenerator = createMailGenerator();
  const { subject, emailContent } = buildPaymentRegistrationMailContent(payload);
  return {
    subject,
    html: mailGenerator.generate(emailContent),
    text: mailGenerator.generatePlaintext(emailContent),
  };
}

export async function sendBulkRegistrationPaymentEmail(payload) {
  const { subject, html, text } = buildPaymentRegistrationMail(payload);
  await sendEmail({
    to: payload.to,
    subject,
    html,
    text,
  });
}
