import express from "express";

import clubController from "../controllers/clubController.js";
import authenticationMiddlewares from "../middlewares/authenticate.js";
import clubValidation from "../validations/clubSchema.js";

const router = express.Router();
const ORGANIZER_ROLES = ["organizer", "super_admin", "host"];

router.post(
  "/create",
  authenticationMiddlewares.authenticate,
  authenticationMiddlewares.authorizeRole(ORGANIZER_ROLES),
  clubValidation.clubUpdateValidation,
  clubController.createClub
);
router.get(
  "/",
  authenticationMiddlewares.authenticate,
  authenticationMiddlewares.authorizeRole(ORGANIZER_ROLES),
  clubController.getAllClubs
);
router.get(
  "/:id",
  authenticationMiddlewares.authenticate,
  authenticationMiddlewares.authorizeRole(ORGANIZER_ROLES),
  clubController.getClubById
);
router.put(
  "/update/:id",
  authenticationMiddlewares.authenticate,
  authenticationMiddlewares.authorizeRole(ORGANIZER_ROLES),
  clubController.updateClub
);
router.delete(
  "/delete/:id",
  authenticationMiddlewares.authenticate,
  authenticationMiddlewares.authorizeRole(ORGANIZER_ROLES),
  clubController.deleteClub
);

export default router;
