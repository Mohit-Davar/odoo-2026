import express from "express";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

const router = express.Router();

// All authenticated roles can view the dashboard
const allRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

router.use(verifyAccessToken);

router.get("/", requireRoles(allRoles), getDashboard);

export default router;
