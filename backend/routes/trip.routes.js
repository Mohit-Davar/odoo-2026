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

// Define allowed roles based on description.md matrix
const viewRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
const crudRoles = ["Dispatcher"];

// All endpoints require authentication
router.use(verifyAccessToken);
// View trips
router.get("/", requireRoles(viewRoles), listTrips);
router.get("/:id", requireRoles(viewRoles), fetchTripById);
// Manage trips
router.post("/", requireRoles(crudRoles), createDraftTrip);
router.post("/:id/dispatch", requireRoles(crudRoles), dispatchTrip);
router.post("/:id/complete", requireRoles(crudRoles), completeTrip);
router.post("/:id/cancel", requireRoles(crudRoles), cancelTrip);

export default router;
