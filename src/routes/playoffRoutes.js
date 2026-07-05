
import express from "express";
import playoffController from "../controllers/playoffsController.js";
 
const router = express.Router({ mergeParams: true });
 

 
router.post("/:tournamentId/brackets/:bracketId/playoffs", playoffController.createPlayoffBracket);
router.get("/:tournamentId/brackets/:bracketId/playoffs", playoffController.getPlayoffBracket);
router.delete("/:tournamentId/brackets/:bracketId/playoffs", playoffController.deletePlayoffBracket);
router.post("/:tournamentId/brackets/:bracketId/playoffs/advance", playoffController.advancePlayoffWinner);
export default router;
 