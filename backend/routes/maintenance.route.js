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

// Per description.md: Fleet Manager → CRUD; all others → View only
const viewRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
const crudRoles = ["Fleet Manager"];

router.use(verifyAccessToken);

router.get("/", requireRoles(viewRoles), getMaintenanceLogs);
router.get("/:id", requireRoles(viewRoles), getMaintenanceDetail);
router.post("/", requireRoles(crudRoles), registerMaintenance);
router.put("/:id", requireRoles(crudRoles), updateMaintenanceDetails);
router.delete("/:id", requireRoles(crudRoles), deleteMaintenanceRecord);

export default router;
