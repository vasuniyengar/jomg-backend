import express from "express";
import savePlayerController from "../controllers/savePlayerController.js";

const router = express.Router();

router.post("/import-players", savePlayerController.importPlayers);
router.get("/get-players", savePlayerController.getPlayers);



export default router;