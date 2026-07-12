import express from "express";
import {
    registerDriver,
    getDrivers,
    getDriverDetail,
    updateDriverDetails,
    deleteDriverRecord
} from "../controllers/driver.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to protect driver administration endpoints
router.post("/", verifyAccessToken, registerDriver);
router.get("/", verifyAccessToken, getDrivers);
router.get("/:id", verifyAccessToken, getDriverDetail);
router.put("/:id", verifyAccessToken, updateDriverDetails);
router.delete("/:id", verifyAccessToken, deleteDriverRecord);

export default router;
