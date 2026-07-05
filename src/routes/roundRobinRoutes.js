import express from "express";
import roundRobinController from "../controllers/roundRobinController.js";
import middlewares from "../middlewares/authenticate.js";

const router = express.Router();
const ORGANIZER_ROLES = ["organizer", "super_admin", "host"];

router.get(
  "/:tournamentId/brackets/:bracketId/pools",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  roundRobinController.getPoolsByBracket
);

router.post(
  "/roundrobin",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  roundRobinController.createRoundRobin
);

router.delete(
  "/:tournamentId/brackets/:bracketId",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  roundRobinController.deleteRoundRobin
);

export default router;
