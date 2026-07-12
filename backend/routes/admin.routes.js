import { Router } from "express";
import { addPerson, assignRole, getRoles, getUsers } from "../controllers/admin.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

const router = Router();

// Apply auth and admin middlewares to all routes in this file
router.use(verifyAccessToken, requireRoles([]));
router.post("/users", addPerson);
router.patch("/users/:id/role", assignRole);
router.get("/users", getUsers);
router.get("/roles", getRoles);

export default router;
