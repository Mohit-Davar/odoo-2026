import express from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

const router = express.Router();

const allRoles = ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"];

router.use(verifyAccessToken);

router.get("/", requireRoles(allRoles), getDashboard);

export default router;
