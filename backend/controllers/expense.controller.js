import {
    createExpense,
    getAllExpenses,
    findExpenseById,
    updateExpense,
    deleteExpense
} from "../models/expense.model.js";
import { createExpenseSchema, updateExpenseSchema } from "../schemas/expense.schema.js";
import { idParamSchema } from "../schemas/generic.schema.js";
import { pool } from "../config/db.js";

/**
 * @typedef {import('zod').infer<typeof createExpenseSchema>} CreateExpenseBody
 * @typedef {import('express').Request<{}, {}, CreateExpenseBody>} CreateExpenseRequest
 * @typedef {import('express').Response} CreateExpenseResponse
 */

/**
 * Logs a new operational expense record.
 * @param {CreateExpenseRequest} req - The Express request object.
 * @param {CreateExpenseResponse} res - The Express response object.
 * @returns {Promise<void | CreateExpenseResponse>}
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
 * @typedef {import('express').Request} GetExpensesRequest
 * @typedef {import('express').Response} GetExpensesResponse
 */

/**
 * Retrieves all expense records.
 * @param {GetExpensesRequest} req - The Express request object.
 * @param {GetExpensesResponse} res - The Express response object.
 * @returns {Promise<GetExpensesResponse>}
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

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} GetExpenseDetailParams
 * @typedef {import('express').Request<GetExpenseDetailParams>} GetExpenseDetailRequest
 * @typedef {import('express').Response} GetExpenseDetailResponse
 */

/**
 * Retrieves a single expense by ID.
 * @param {GetExpenseDetailRequest} req - The Express request object.
 * @param {GetExpenseDetailResponse} res - The Express response object.
 * @returns {Promise<void | GetExpenseDetailResponse>}
 */
export const getExpenseDetail = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    try {
        const expense = await findExpenseById(id);
        if (!expense) {
            return res.status(404).json({ msg: "Expense record not found." });
        }
        return res.status(200).json(expense);
    } catch (error) {
        return res.status(500).json({
            msg: "Error retrieving expense record.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} UpdateExpenseParams
 * @typedef {import('zod').infer<typeof updateExpenseSchema>} UpdateExpenseBody
 * @typedef {import('express').Request<UpdateExpenseParams, {}, UpdateExpenseBody>} UpdateExpenseRequest
 * @typedef {import('express').Response} UpdateExpenseResponse
 */

/**
 * Updates an existing expense record.
 * @param {UpdateExpenseRequest} req - The Express request object.
 * @param {UpdateExpenseResponse} res - The Express response object.
 * @returns {Promise<void | UpdateExpenseResponse>}
 */
export const updateExpenseDetails = async (req, res) => {
    const paramsValidation = idParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({ errors: paramsValidation.error.format() });
    }
    const { id } = paramsValidation.data;

    const bodyValidation = updateExpenseSchema.safeParse(req.body);
    if (!bodyValidation.success) {
        return res.status(400).json({ errors: bodyValidation.error.format() });
    }
    const updateData = bodyValidation.data;

    try {
        const existing = await findExpenseById(id);
        if (!existing) {
            return res.status(404).json({ msg: "Expense record not found." });
        }

        // Validate vehicle exists if being changed
        if (updateData.vehicleId) {
            const vehicleRes = await pool.query("SELECT id FROM vehicles WHERE id = $1", [updateData.vehicleId]);
            if (vehicleRes.rows.length === 0) {
                return res.status(404).json({ msg: "Vehicle not found." });
            }
        }

        // Validate trip exists if being changed
        if (updateData.tripId) {
            const tripRes = await pool.query("SELECT id FROM trips WHERE id = $1", [updateData.tripId]);
            if (tripRes.rows.length === 0) {
                return res.status(404).json({ msg: "Trip not found." });
            }
        }

        const merged = { ...existing, ...updateData };
        const updated = await updateExpense(id, merged);

        return res.status(200).json({
            msg: "Expense updated successfully.",
            expense: updated
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error updating expense record.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} DeleteExpenseParams
 * @typedef {import('express').Request<DeleteExpenseParams>} DeleteExpenseRequest
 * @typedef {import('express').Response} DeleteExpenseResponse
 */

/**
 * Deletes an expense record by ID.
 * @param {DeleteExpenseRequest} req - The Express request object.
 * @param {DeleteExpenseResponse} res - The Express response object.
 * @returns {Promise<void | DeleteExpenseResponse>}
 */
export const deleteExpenseRecord = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    try {
        const deleted = await deleteExpense(id);
        if (!deleted) {
            return res.status(404).json({ msg: "Expense record not found." });
        }
        return res.status(200).json({ msg: "Expense deleted successfully." });
    } catch (error) {
        return res.status(500).json({
            msg: "Error deleting expense record.",
            error: error.message
        });
    }
};
