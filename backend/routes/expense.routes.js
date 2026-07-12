import express from "express";
import {
    addExpense,
    getExpenses,
    getExpenseDetail,
    updateExpenseDetails,
    deleteExpenseRecord
} from "../controllers/expense.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";
import { requireRoles } from "../middleware/rbac.js";

const router = express.Router();

// Per description.md: Financial Analyst → CRUD; all others → View only
const viewRoles = ["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"];
const crudRoles = ["Financial Analyst"];

router.use(verifyAccessToken);

router.get("/", requireRoles(viewRoles), getExpenses);
router.get("/:id", requireRoles(viewRoles), getExpenseDetail);
router.post("/", requireRoles(crudRoles), addExpense);
router.put("/:id", requireRoles(crudRoles), updateExpenseDetails);
router.delete("/:id", requireRoles(crudRoles), deleteExpenseRecord);

export default router;
