import express from "express";

import middlewares from "../middlewares/authenticate.js";

import defaultbracketCreationDetailsController from "../controllers/defaultbracketCreationDetailsController.js";

const router = express.Router();
const ORGANIZER_ROLES = ["organizer", "super_admin", "host"];

router.get(
  "/details",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  defaultbracketCreationDetailsController.defaultBracketCreationDetails
);

export default router;
