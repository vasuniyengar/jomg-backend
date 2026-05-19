import cron from "node-cron";
import { sendUnpaidEmails } from "../controllers/paymentEmailController.js";

const dailyEmailJob = () => {
  cron.schedule("0 14 * * 1", async () => {
    console.log("Running unpaid email job");
    try {
      const result = await sendUnpaidEmails();
      console.log("Email job completed:", result);
    } catch (err) {
      console.error("Email job failed:", err);
    }
  }, {
    timezone: "America/Detroit"  // ← third argument to cron.schedule
  });
  console.log("Unpaid email job scheduled — runs daily at 1 PM ET");
};

export default dailyEmailJob;