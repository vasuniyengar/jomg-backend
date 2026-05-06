import express from "express";

const router = express.Router();

import hostController from "../controllers/hostController.js";

import teamPlayersController from "../controllers/teamPlayersController.js";

import middlewares from "../middlewares/authenticate.js";

import bracketController from "../controllers/bracketController.js";

import addPlayerValidations from "../validations/addPlayerSchema.js";
const ORGANIZER_ROLES = ["organizer", "super_admin", "host"];

router.put("/checkin", hostController.checkInPlayerForEvent);

router.post(
  "/tournaments/:tournamentId/brackets/:bracketId/add-player",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  addPlayerValidations.addPlayerValidation,
  hostController.addPlayerByHost
);

router.get(
  "/stats",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.hostStats
);

router.get(
  "/:tournamentId/brackets",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.gettingAllBracketsOfTournamentByHost
);

router.post(
  "/tournaments/:tournamentId/brackets/:bracketId/generate-teams",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  teamPlayersController.generateTeams
);

router.get(
  "/tournaments/:tournamentId/brackets/:bracketId/registered-players",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.registeredPlayersForBracket
);

router.get(
  "/tournaments/:tournamentId/brackets/:bracketId/not-checked-in-players",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.registeredPlayersWhoAreNotCheckin
);

router.post(
  "/tournaments/:tournamentId/brackets/:bracketId/add-team",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.manualAddTeam
);

router.put(
  "/tournaments/:tournamentId/brackets/:bracketId/check-in-all",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.checkInAllPlayersForEvent
);

router.post(
  "/tournaments/:tournamentId/brackets/:bracketId/sync-teams",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.syncTeamsStatus
);

router.post(
  "/:tournamentId/create-bracket",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  bracketController.createBracket
);

router.post(
  "/tournaments/:tournamentId/brackets/:bracketId/create-round-robin",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.createRoundRobin
);

router.get(
  "/tournaments/:tournamentId/brackets/:bracketId/pools/teams",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.getTeamsWithPoolAndPlayers
);

router.get(
  "/tournaments/:tournamentId/brackets/:bracketId/pools/:poolId",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.getPoolDetails
);

router.get(
  "/tournaments/:tournamentId/brackets/:bracketId/pools",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.getPoolsWithTeams
);

router.get(
  "/:tournamentId/brackets/:bracketId/pools",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.getAllPools
);

router.get(
  "/matches/:matchId/match-details",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.getMatchDetails
);

router.put(
  "/:bracketId/matches/:matchId/update-match-score",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.updateMatchScore
);

router.put(
  "/matches/:matchId/reset-match-score",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.resetMatchScore
);

router.post(
  "/tournaments/:tournamentId/brackets/:bracketId/create-playoffs",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.getOrCreatePlayoffs
);

router.post(
  "/tournaments/:tournamentId/brackets/:bracketId/reset-playoffs",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.resetPlayoffs
);

router.get(
  "/tournaments/:tournamentId/brackets/:bracketId/final-standings",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  hostController.getFinalStandings
);

export default router;
