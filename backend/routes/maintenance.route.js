import express from "express";
import {
    registerMaintenance,
    getMaintenanceLogs,
    getMaintenanceDetail,
    updateMaintenanceDetails,
    deleteMaintenanceRecord
} from "../controllers/maintenance.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/", verifyAccessToken, registerMaintenance);
router.get("/", verifyAccessToken, getMaintenanceLogs);
router.get("/:id", verifyAccessToken, getMaintenanceDetail);
router.put("/:id", verifyAccessToken, updateMaintenanceDetails);
router.delete("/:id", verifyAccessToken, deleteMaintenanceRecord);

export default router;
