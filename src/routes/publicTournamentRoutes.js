import express from "express";
import rateLimit from "express-rate-limit";
import publicTournamentController from "../controllers/publicTournamentController.js";

const router = express.Router();

router.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: Number(process.env.PUBLIC_RATE_LIMIT_MAX || 100),
    standardHeaders: true,
    legacyHeaders: false,
  })
);

router.get("/:slug", publicTournamentController.getPublicTournamentPage);
router.get(
  "/:slug/divisions/:bracketId",
  publicTournamentController.getPublicDivisionDetail
);

export default router;
