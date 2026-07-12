import express from "express";
import {
    registerDriver,
    getDrivers,
    getDriverDetail,
    updateDriverDetails,
    deleteDriverRecord
} from "../controllers/driver.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

const router = express.Router();

// Define allowed roles based on description.md matrix
const viewRoles = ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"];
const crudRoles = ["SAFETY_OFFICER"];

router.use(verifyAccessToken);

router.get("/", requireRoles(viewRoles), getDrivers);
router.get("/:id", requireRoles(viewRoles), getDriverDetail);
router.post("/", requireRoles(crudRoles), registerDriver);
router.put("/:id", requireRoles(crudRoles), updateDriverDetails);
router.delete("/:id", requireRoles(crudRoles), deleteDriverRecord);

export default router;
