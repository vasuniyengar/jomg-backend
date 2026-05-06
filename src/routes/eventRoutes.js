import express from "express";

import middlewares from "../middlewares/authenticate.js";

import eventControllers from "../controllers/eventController.js";

const router = express.Router();

router.get("/details", eventControllers.getAllEvents);

export default router;
