import express from "express";
import {
    registerMaintenance,
    getMaintenanceLogs,
    getMaintenanceDetail,
    updateMaintenanceDetails,
    deleteMaintenanceRecord
} from "../controllers/maintenance.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

const router = express.Router();

const viewRoles = ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"];
const crudRoles = ["FLEET_MANAGER"];

router.use(verifyAccessToken);

router.get("/", requireRoles(viewRoles), getMaintenanceLogs);
router.get("/:id", requireRoles(viewRoles), getMaintenanceDetail);
router.post("/", requireRoles(crudRoles), registerMaintenance);
router.put("/:id", requireRoles(crudRoles), updateMaintenanceDetails);
router.delete("/:id", requireRoles(crudRoles), deleteMaintenanceRecord);

export default router;
