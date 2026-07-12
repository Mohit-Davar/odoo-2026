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

const viewRoles = ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"];
const crudRoles = ["FLEET_MANAGER"];

router.use(verifyAccessToken);
router.get("/", requireRoles(viewRoles), getVehicles);
router.get("/:id", requireRoles(viewRoles), getVehicleDetail);
router.post("/", requireRoles(crudRoles), registerVehicle);
router.put("/:id", requireRoles(crudRoles), updateVehicleDetails);
router.delete("/:id", requireRoles(crudRoles), deleteVehicleRecord);

export default router;
