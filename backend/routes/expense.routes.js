import express from "express";
import { addExpense, getExpenses } from "../controllers/expense.controller.js";
import { verifyAccessToken } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to protect expense log endpoints
router.use(verifyAccessToken);

router.post("/", addExpense);
router.get("/", getExpenses);

export default router;
