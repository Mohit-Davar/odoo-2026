import { createExpense, getAllExpenses } from "../models/expense.model.js";
import { createExpenseSchema } from "../schemas/expense.schema.js";
import { pool } from "../config/db.js";

/**
 * Logs a new operational expense record
 */
export const addExpense = async (req, res) => {
    const validation = createExpenseSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const expenseData = validation.data;

    try {
        // Validate vehicle exists if provided
        if (expenseData.vehicleId) {
            const vehicleRes = await pool.query("SELECT id FROM vehicles WHERE id = $1", [expenseData.vehicleId]);
            if (vehicleRes.rows.length === 0) {
                return res.status(404).json({ msg: "Vehicle not found." });
            }
        }

        // Validate trip exists if provided
        if (expenseData.tripId) {
            const tripRes = await pool.query("SELECT id FROM trips WHERE id = $1", [expenseData.tripId]);
            if (tripRes.rows.length === 0) {
                return res.status(404).json({ msg: "Trip not found." });
            }
        }

        const newExpense = await createExpense(expenseData);
        return res.status(201).json({
            msg: "Expense logged successfully.",
            expense: newExpense
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error logging expense.",
            error: error.message
        });
    }
};

/**
 * Retrieves all expense records
 */
export const getExpenses = async (req, res) => {
    try {
        const expenses = await getAllExpenses();
        return res.status(200).json(expenses);
    } catch (error) {
        return res.status(500).json({
            msg: "Error fetching expense records.",
            error: error.message
        });
    }
};
