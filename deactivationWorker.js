import cron from "node-cron";
import { Op } from "sequelize";
// Adjust these paths to match your project structure
import models from "./src/models/Associations.js";

const { User } = models;

console.log("[DeactivationWorker] Started.");
console.log("[DeactivationWorker] Waiting to run job...");

// Schedule the job to run every hour (at minute 0)
// You can adjust the schedule (e.g., '*/5 * * * *' for every 5 minutes during testing)
cron.schedule("0 * * * *", async () => {
  console.log("[DeactivationWorker] Running hourly check...");
  try {
    // 1. Find users who are NOT verified AND whose expiry date is in the PAST
    const usersToDelete = await User.findAll({
      where: {
        isVerified: false,
        accountExpiresAt: {
          [Op.lt]: new Date(), // 'lt' means "less than" (now)
        },
      },
    });

    if (usersToDelete.length === 0) {
      console.log("[DeactivationWorker] No expired, unverified users found.");
      return; // Nothing to do
    }

    // 2. Delete the found users
    for (const user of usersToDelete) {
      console.log(
        `[DeactivationWorker] Deleting expired user: ${user.email} (ID: ${user.id})`
      );
      await user.destroy(); // Permanently delete
      // Alternatively, you could just mark them inactive:
      // user.isActive = false; await user.save();
    }
    console.log(
      `[DeactivationWorker] Deleted ${usersToDelete.length} expired users.`
    );
  } catch (error) {
    console.error("[DeactivationWorker] Error during check:", error);
  }
});

const shutdown = (signal) => {
  console.log(`[DeactivationWorker] Received ${signal}. Exiting worker...`);
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
