import { Consumer } from "sqs-consumer";
import Mailgen from "mailgen";
import dotenv from "dotenv";
import sendEmail from "./src/utils/sendEmail.js";
import sequelize, { getDatabaseConnectionInfo } from "./src/config/database.js";
import { processPaymentRegistrationJob } from "./src/utils/paymentRegistrationWorker.js";
import { SQSClient, DeleteMessageCommand } from "@aws-sdk/client-sqs";

dotenv.config();

// Created shared SQS client for both Consumer and manual deletion
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION,
  maxAttempts: 3,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const handleMailJob = async (message) => {
  console.log("[Worker] Received message:", message);

  let job;
  try {
    job = JSON.parse(message.Body);
  } catch (err) {
    console.error("[Worker] Invalid message format, deleting:", err);
    // delete malformed message
    await sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: process.env.EMAIL_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      })
    );
    return;
  }

  console.log(`[Worker] Job type: ${job.jobType}`);

  const deleteMessage = async () => {
    await sqsClient.send(
      new DeleteMessageCommand({
        QueueUrl: process.env.EMAIL_QUEUE_URL,
        ReceiptHandle: message.ReceiptHandle,
      })
    );
    console.log(
      `[Worker] Message ${message.MessageId} deleted successfully from SQS`
    );
  };

  try {
    if (job.jobType === "paymentRegistration") {
      await processPaymentRegistrationJob(job);
      await deleteMessage();
      return;
    }

    const mailGenerator = new Mailgen({
      theme: "default",
      product: {
        name: "DrivePB",
        link: process.env.FRONTEND_URL || "https://yourapp.com",
        logo: "https://res.cloudinary.com/dwc9eudmh/image/upload/v1761650435/logo_wen27m.png",
      },
    });

    let emailContent;
    let subject;

    // Handle job types
    if (job.jobType === "verification") {
      subject = "Email Verification";
      emailContent = {
        body: {
          name: job.firstname,
          intro: "Welcome to DrivePB! We're very excited to have you on board.",
          action: {
            instructions:
              "To get started, please click the button below to verify your email address:",
            button: {
              color: "#22BC66",
              text: "Verify Your Email",
              link: job.url,
            },
          },
          outro:
            "If you did not create this account, you can safely ignore this email.",
        },
      };
    } else if (job.jobType === "passwordReset") {
      subject = "Password Reset Code";
      emailContent = {
        body: {
          name: job.firstname,
          intro: [
            "You requested a password reset.",
            `Your 6-digit reset code is: **${job.code}**`,
            "This code is valid for 10 minutes.",
          ],
          outro: "If you did not request this, please ignore this.",
        },
      };
    } else if (job.jobType === "tournamentInvitation") {
      subject = `Invitation: Join the ${job.tournamentName || "Tournament"}!`;
      emailContent = {
        body: {
          name: "Player",
          intro: `${
            job.hostName || "The host"
          } has invited you to join the tournament: **${
            job.tournamentName || ""
          }**.`,
          action: {
            instructions:
              "Click the button below to view tournament details and register:",
            button: {
              color: "#1a73e8",
              text: "View Tournament & Register",
              link: job.registrationLink,
            },
          },
          outro: "We hope to see you there!",
        },
      };
    } else if (job.jobType === "newUserRegistrationByHost") {
      subject = `Welcome to DrivePB! You've been registered for ${job.tournamentName}`;

      const startDate = new Date(job.startDate).toLocaleDateString("en-US", {
        dateStyle: "medium",
      });
      const endDate = new Date(job.endDate).toLocaleDateString("en-US", {
        dateStyle: "medium",
      });

      emailContent = {
        body: {
          name: job.firstname,
          intro: [
            `${job.hostName} has registered you for an account on DrivePB and added you to a tournament.`,
            `**Tournament:** ${job.tournamentName}`,
            `**Bracket:** ${job.bracketName}`,
            `**Dates:** ${startDate} - ${endDate}`,
          ],
          action: {
            instructions:
              "To activate your account and log in, you must first verify your email:",
            button: {
              color: "#22BC66",
              text: "Verify Your Account",
              link: job.verificationUrl,
            },
          },
          outro:
            "After verifying, you can use the 'Forgot Password' feature on our login page to set your password.",
        },
      };
    } else if (job.jobType === "existingUserRegistrationByHost") {
      subject = `You've been added to ${job.tournamentName}!`;

      const startDate = new Date(job.startDate).toLocaleDateString("en-US", {
        dateStyle: "medium",
      });
      const endDate = new Date(job.endDate).toLocaleDateString("en-US", {
        dateStyle: "medium",
      });

      emailContent = {
        body: {
          name: job.firstname,
          intro: [
            `${job.hostName} has registered you for a new tournament.`,
            `**Tournament:** ${job.tournamentName}`,
            `**Bracket:** ${job.bracketName}`,
            `**Dates:** ${startDate} - ${endDate}`,
          ],
          action: {
            instructions:
              "You can view the tournament details by logging into your account.",
            button: {
              color: "#1a73e8",
              text: "Go to Dashboard",
              link: process.env.FRONTEND_URL || "https://yourapp.com",
            },
          },
          outro: "Good luck!",
        },
      };
    } else {
      console.log(`[Worker] Unknown job type: ${job.jobType}`);
      return;
    }

    // Generate email content
    const emailBody = mailGenerator.generate(emailContent);
    const emailText = mailGenerator.generatePlaintext(emailContent);

    console.log(`[Worker] Sending ${job.jobType} email to ${job.email}...`);

    await sendEmail({
      to: job.email,
      subject,
      html: emailBody,
      text: emailText,
    });

    console.log(`[Worker] Email sent to ${job.email}`);

    await deleteMessage();
  } catch (error) {
    console.error(`[Worker] FAILED to send email:`, error);

    const transientErrors = ["ECONNRESET", "ETIMEDOUT", "ECONNREFUSED"];
    if (transientErrors.some((e) => (error.code || "").includes(e))) {
      console.log("[Worker] Transient error — letting SQS retry.");
      throw error; // let SQS retry
    }

    console.log("[Worker] Permanent error — not retrying this message.");
  }
};

//Initialize single SQS consumer instance
const app = Consumer.create({
  queueUrl: process.env.EMAIL_QUEUE_URL,
  handleMessage: handleMailJob,
  sqs: sqsClient, // use the same shared client
});

// Logging and event handling
app.on("error", (err, message) => {
  console.error(
    `SQS Consumer Error (msg: ${message?.MessageId || "N/A"}):`,
    err
  );
});

app.on("processing_error", (err, message) => {
  console.error(
    `Processing Error for message ${message?.MessageId || "N/A"}:`,
    err.message
  );
});

app.on("timeout_error", (err, message) => {
  console.error(`[SQS] Timeout for ${message?.MessageId}:`, err);
});

app.on("message_received", (message) => {
  console.log(`[SQS] Message received: ${message.MessageId}`);
});

app.on("message_processed", (message) => {
  console.log(`[SQS] Message processed successfully: ${message.MessageId}`);
});

app.on("empty", () => {
  console.log("[Worker] Queue is empty.");
});

app.on("stopped", () => {
  console.log("[Worker] Stopped.");
});

const startWorker = async () => {
  try {
    const dbInfo = getDatabaseConnectionInfo();
    console.log(
      `[Worker] DB config host=${dbInfo.host} port=${dbInfo.port} db=${dbInfo.database} dialect=${dbInfo.dialect} ssl=${dbInfo.sslEnabled ? "enabled" : "disabled"} source=${dbInfo.source}`
    );
    await sequelize.authenticate();
    console.log("[Worker] Database connected");
  } catch (err) {
    console.error("[Worker] Database connection failed:", err);
    process.exit(1);
  }

  console.log("[Worker] Starting SQS Email Worker...");
  app.start();
};

startWorker();

const stopWorker = () => {
  console.log("[Worker] Stopping on shutdown signal...");
  app.stop();
};

process.on("SIGINT", stopWorker);
process.on("SIGTERM", stopWorker);
