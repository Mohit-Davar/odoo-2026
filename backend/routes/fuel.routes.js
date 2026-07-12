import express from "express";
import {
    addFuelLog,
    getFuelLogs,
    getFuelLogDetail,
    updateFuelLogDetails,
    deleteFuelLogRecord
} from "../controllers/fuel.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

const router = express.Router();

// Per description.md: Financial Analyst → CRUD; all others → View only
const viewRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
const crudRoles = ["Financial Analyst"];

router.use(verifyAccessToken);

router.get("/", requireRoles(viewRoles), getFuelLogs);
router.get("/:id", requireRoles(viewRoles), getFuelLogDetail);
router.post("/", requireRoles(crudRoles), addFuelLog);
router.put("/:id", requireRoles(crudRoles), updateFuelLogDetails);
router.delete("/:id", requireRoles(crudRoles), deleteFuelLogRecord);

export default router;
