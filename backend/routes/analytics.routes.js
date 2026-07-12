import express from "express";
import {
    getAnalyticsSummary,
    getFuelEfficiencyReport,
    getFleetUtilizationReport,
    getOperationalCostReport,
    getVehicleROIReport
} from "../controllers/analytics.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

const router = express.Router();

// Per description.md: Fleet Manager + Financial Analyst get full analytics; others get View
const analyticsRoles = ["Fleet Manager", "Financial Analyst"];
const viewRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];

router.use(verifyAccessToken);

// Combined summary
router.get("/", requireRoles(analyticsRoles), getAnalyticsSummary);

// Individual reports — all roles can view; ?format=csv for CSV download
router.get("/fuel-efficiency", requireRoles(viewRoles), getFuelEfficiencyReport);
router.get("/fleet-utilization", requireRoles(viewRoles), getFleetUtilizationReport);
router.get("/operational-cost", requireRoles(viewRoles), getOperationalCostReport);
router.get("/vehicle-roi", requireRoles(analyticsRoles), getVehicleROIReport);

export default router;
