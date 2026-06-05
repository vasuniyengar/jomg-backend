import express from "express";
import roundRobinController from "../controllers/roundRobinController.js";

const router = express.Router();
router.get(
  "/:tournamentId/brackets/:bracketId/pools",
  roundRobinController.getPoolsByBracket
);



router.post("/roundrobin", roundRobinController.createRoundRobin);

router.delete(
  "/:tournamentId/brackets/:bracketId",
  roundRobinController.deleteRoundRobin
);

export default router;