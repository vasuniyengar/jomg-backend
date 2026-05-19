import express from "express"
import { sendUnpaidEmails } from "../controllers/paymentEmailController.js"
const router = express.Router();
router.post("/send-unpaid", async (req, res) => {
    const result = await sendUnpaidEmails();
    res.status(result.error ? 500 : 200).json(result);
});
export default router;

