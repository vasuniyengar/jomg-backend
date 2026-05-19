
import express from "express";
import roundRobinService from "../../services/mlp/scheduleGenerator.js";

const router = express.Router();

router.post("/generate-schedule/:poolId", async (req, res) => {
  try {
    const poolId = parseInt(req.params.poolId);
    const schedule = await roundRobinService.roundRobin(poolId);

    return res.status(200).json({
      error: false,
      code: 200,
      message: "Schedule generated successfully",
      data: schedule,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      code: 500,
      message: error.message,
    });
  }
});

export default router;