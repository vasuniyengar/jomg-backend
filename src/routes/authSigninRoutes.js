import express from "express";
import userController from "../controllers/userController.js";
import authValidations from "../validations/authSchema.js";
import middleware from "../middlewares/authenticate.js";

const router = express.Router();

router.post(
  "/organizer/signin",
  authValidations.signinValidation,
  userController.organizerSignin
);

router.post(
  "/admin/signin",
  authValidations.signinValidation,
  userController.adminSignin
);

router.post(
  "/organizer/logout",
  middleware.authenticate,
  userController.organizerLogout
);

export default router;
