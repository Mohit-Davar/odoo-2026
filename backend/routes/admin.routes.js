import { Router } from "express";
import { addPerson, assignRole, getRoles, getUsers } from "../controllers/admin.controller.js";
import { verifyAccessToken, isAdmin } from "../middleware/auth.js";

const router = Router();

// Apply auth and admin middlewares to all routes in this file
router.use(verifyAccessToken, isAdmin);

router.post("/users", addPerson);
router.patch("/users/:id/role", assignRole);
router.get("/users", getUsers);
router.get("/roles", getRoles);

export default router;
