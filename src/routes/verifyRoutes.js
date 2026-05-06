import express from "express";

import userController from "../controllers/userController.js";

const router = express.Router();

router.get("/verify-email", userController.verifyEmail);

export default router;
