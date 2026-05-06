import express from "express";

import middleware from "../middlewares/authenticate.js";

import tournamentControllers from "../controllers/tournamentController.js";

import bracketController from "../controllers/bracketController.js";

import upload from "../middlewares/upload.js";

import tournamentValidations from "../validations/tournamentSchema.js";

import bracketValidations from "../validations/bracketSchema.js";

import multer from "multer";

const bracketUpload = multer();
const ORGANIZER_ROLES = ["organizer", "super_admin", "host"];

const router = express.Router();

//tournament creating route
router.post(
  "/create-tournament",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  upload.single("tournamentTumbnail"),
  tournamentValidations.tournamentCreateValidation,
  tournamentControllers.createTournament
);

router.post(
  "/:tournamentId/invite-players",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  tournamentControllers.invitePlayers
);

//tournament updating route
router.put(
  "/update/:tournamentId",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  upload.single("tournamentTumbnail"),
  tournamentValidations.tournamentUpdateValidation,
  tournamentControllers.updatingTournamentById
);

//tournament of host getting
router.get(
  "/host",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  tournamentControllers.getAllTournamentsOfHost
);

router.get("/active", tournamentControllers.getAllTournamentsOfStatusActive);

router.get("/", tournamentControllers.getAllTournaments);

router.get("/slug/:slug", tournamentControllers.getTournamentBySlug);

router.get(
  "/:tournamentId/bracket/:bracketId",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  bracketController.getBracketById
);

router.put(
  "/:tournamentId/brackets/:bracketId/update-bracket",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  bracketUpload.none(),
  bracketValidations.bracketValidation,
  bracketController.updatingBracket
);

router.get("/:tournamentId", tournamentControllers.getTournamentById);

router.get(
  "/tournament-bracket-data/:tournamentId",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  tournamentControllers.getTournamentAndBracketDataByTournamentId
);

router.post(
  "/:tournamentId/brackets/create-bracket",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  bracketUpload.none(),
  bracketValidations.bracketValidation,
  bracketController.createBracket
);

router.get(
  "/:tournamentId/brackets",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  bracketController.gettingAllBracketsOfTournament
);

// router.post(
//   "/:tournamentId/brackets/:bracketId/register",
//   middleware.authenticate,
//   teamPlayerController.createTeamPlayer
// );

router.put(
  "/update/:tournamentId",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  tournamentControllers.updatingTournamentById
);

export default router;
