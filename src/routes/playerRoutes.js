import express from "express";

const router = express.Router();

import playerControllers from "../controllers/playerTournamentsController.js";

import middlewares from "../middlewares/authenticate.js";

router.get(
  "/tournaments",
  middlewares.authenticate,
  playerControllers.getPlayerTournaments
);

router;

export default router;
