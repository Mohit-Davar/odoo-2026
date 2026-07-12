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

const analyticsRoles = ["FLEET_MANAGER", "FINANCIAL_ANALYST"];
const viewRoles = ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"];

router.use(verifyAccessToken);

router.get("/", requireRoles(analyticsRoles), getAnalyticsSummary);
router.get("/fuel-efficiency", requireRoles(viewRoles), getFuelEfficiencyReport);
router.get("/fleet-utilization", requireRoles(viewRoles), getFleetUtilizationReport);
router.get("/operational-cost", requireRoles(viewRoles), getOperationalCostReport);
router.get("/vehicle-roi", requireRoles(analyticsRoles), getVehicleROIReport);

export default router;
