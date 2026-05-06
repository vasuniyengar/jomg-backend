import express from "express";
import controller from "../controllers/playerRegistrationController.js";
import middlewares from "../middlewares/authenticate.js";
import playerTournamentsController from "../controllers/playerTournamentsController.js";

const router = express.Router();
const ORGANIZER_ROLES = ["organizer", "super_admin", "host"];

router.get("/player-stats", middlewares.authenticate, controller.playerStats);

router.post(
  "/register",
  middlewares.authenticate,
  controller.registerForBracket
);

router.get(
  "/registered-tournaments",
  middlewares.authenticate,
  playerTournamentsController.recentlyPlayersTournaments
);

router.get(
  "/tournaments",
  middlewares.authenticate,
  playerTournamentsController.getPlayerTournaments
);

router.get(
  "/tournaments/:tournamentId",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  controller.registeredPlayersForTournament
);

router.get(
  "/:playerId/bracket/:bracketId/events",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  controller.getPlayerEvents
);

export default router;
