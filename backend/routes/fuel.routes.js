import express from "express";
import { addFuelLog, getFuelLogs } from "../controllers/fuel.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to protect fuel log endpoints
router.use(verifyAccessToken);

router.post("/", addFuelLog);
router.get("/", getFuelLogs);

export default router;
