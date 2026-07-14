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
router.patch(
  "/:tournamentId/brackets/:bracketId/publish",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  roundRobinController.publishRoundRobin
);

router.patch(
  "/:tournamentId/brackets/:bracketId/unpublish",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  roundRobinController.unpublishRoundRobin
);

export default router;
