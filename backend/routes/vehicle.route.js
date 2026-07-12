import express from "express";
import {
    registerVehicle,
    getVehicles,
    getVehicleDetail,
    updateVehicleDetails,
    deleteVehicleRecord
} from "../controllers/vehicle.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

const router = express.Router();

// Define allowed roles based on description.md matrix
const viewRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
const crudRoles = ["Fleet Manager"];

// All endpoints require authentication
router.use(verifyAccessToken);
// View Vehicles
router.get("/", requireRoles(viewRoles), getVehicles);
router.get("/:id", requireRoles(viewRoles), getVehicleDetail);
// Manage Vehicles
router.post("/", requireRoles(crudRoles), registerVehicle);
router.put("/:id", requireRoles(crudRoles), updateVehicleDetails);
router.delete("/:id", requireRoles(crudRoles), deleteVehicleRecord);

export default router;
