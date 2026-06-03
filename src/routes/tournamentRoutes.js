import express from "express";

import middleware from "../middlewares/authenticate.js";

import tournamentControllers from "../controllers/tournamentController.js";

import bracketController from "../controllers/bracketController.js";

import divisionController from "../controllers/divisionController.js";

import upload from "../middlewares/upload.js";

import tournamentValidations from "../validations/tournamentSchema.js";

import bracketValidations from "../validations/bracketSchema.js";
import divisionValidations from "../validations/divisionSchema.js";

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

router.delete(
  "/:tournamentId",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  tournamentControllers.deleteTournamentById
);

//tournament of host getting
router.get(
  "/host",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  tournamentControllers.getAllTournamentsOfHost
);

router.get(
  "/bracket-meta",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  divisionController.getBracketMeta
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
  "/:tournamentId/divisions",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  divisionController.listDivisions
);

router.post(
  "/:tournamentId/divisions",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  divisionValidations.validateCreateDivision,
  divisionController.createDivision
);

router.put(
  "/:tournamentId/divisions/:bracketId",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  divisionValidations.validateUpdateDivision,
  divisionController.updateDivision
);

router.patch(
  "/:tournamentId/registrations/:registrationId/payment",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  divisionValidations.validatePaymentPatch,
  divisionController.updateRegistrationPayment
);

router.patch(
  "/:tournamentId/registrations/payment-bulk",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  divisionValidations.validateBulkPaymentPatch,
  divisionController.bulkUpdateRegistrationPayments
);

router.delete(
  "/:tournamentId/divisions/:bracketId",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  divisionController.deleteDivision
);

router.post(
  "/:tournamentId/players/bulk-upload",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  divisionController.bulkUploadPlayers
);

router.post(
  "/:tournamentId/players/resend-payment-emails",
  middleware.authenticate,
  middleware.authorizeRole(ORGANIZER_ROLES),
  divisionController.resendPaymentEmails
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

export default router;
