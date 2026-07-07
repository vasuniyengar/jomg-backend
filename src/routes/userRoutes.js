import express from "express";

import userController from "../controllers/userController.js";

import middlewares from "../middlewares/authenticate.js";

import userValidations from "../validations/userSchema.js";

const router = express.Router();
const ORGANIZER_ROLES = ["organizer", "super_admin", "host"];

router.post(
  "/signup",
  userValidations.userSignupValidation,
  userController.signup
);

router.post(
  "/login",
  userValidations.userLoginValidation,
  userController.login
);

router.post("/forgot-password", userController.forgotPassword);

router.post("/verify-reset-code", userController.verifyResetCode);

router.post("/reset-password", userController.resetPassword);

router.put(
  "/change-password",
  middlewares.authenticate,
  userValidations.changePasswordValidation,
  userController.changePassword
);

router.get("/me", middlewares.authenticate, userController.getCurrentUser);

router.put(
  "/profile",
  middlewares.authenticate,
  userController.completeProfile
);

router.post(
  "/check/role",
  middlewares.authenticate,
  userController.identifyingRole
);

router.post(
  "/register/role",
  middlewares.authenticate,
  userController.registerRole
);

router.post(
  "/verify-host-role",
  middlewares.authenticate,
  middlewares.authorizeRole(ORGANIZER_ROLES),
  userController.verifyingRole
);

export default router;
