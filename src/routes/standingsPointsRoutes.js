import express from "express";
import standingsPointsController from "../controllers/standingsPointsController.js";
import middlewares from "../middlewares/authenticate.js";

const router = express.Router();

const ORGANIZER_ROLES = ["organizer", "super_admin", "host"];

router.put(
  "/:bracketId/matches/:matchId/apply-standings-points",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  standingsPointsController.applyStandingsPoints
);

router.post(
  "/:bracketId/recompute-standings-points",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  standingsPointsController.recomputeBracketStandingsPoints
);

export default router;
