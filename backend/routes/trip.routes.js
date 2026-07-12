import express from "express";
import {
    createDraftTrip,
    dispatchTrip,
    completeTrip,
    cancelTrip,
    listTrips,
    fetchTripById
} from "../controllers/trip.controller.js";

import { verifyAccessToken } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

const router = express.Router();

const viewRoles = ["FLEET_MANAGER", "DISPATCHER", "SAFETY_OFFICER", "FINANCIAL_ANALYST"];
const crudRoles = ["DISPATCHER"];

router.use(verifyAccessToken);
router.get("/", requireRoles(viewRoles), listTrips);
router.get("/:id", requireRoles(viewRoles), fetchTripById);
router.post("/", requireRoles(crudRoles), createDraftTrip);
router.post("/:id/dispatch", requireRoles(crudRoles), dispatchTrip);
router.post("/:id/complete", requireRoles(crudRoles), completeTrip);
router.post("/:id/cancel", requireRoles(crudRoles), cancelTrip);

export default router;
