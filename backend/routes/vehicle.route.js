import express from "express";
import {
    registerVehicle,
    getVehicles,
    getVehicleDetail,
    updateVehicleDetails,
    deleteVehicleRecord
} from "../controllers/vehicle.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to protect vehicle administration endpoints
router.post("/", verifyAccessToken, registerVehicle);
router.get("/", verifyAccessToken, getVehicles);
router.get("/:id", verifyAccessToken, getVehicleDetail);
router.put("/:id", verifyAccessToken, updateVehicleDetails);
router.delete("/:id", verifyAccessToken, deleteVehicleRecord);

export default router;
