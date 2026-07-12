import { pool } from "../config/db.js";

/**
 * Transforms a raw PostgreSQL expense row into a camelCase object.
 * @param {object} row - The raw row object from the database.
 * @returns {object | null} A camelCase expense object or null if input is falsy.
 */
function parseExpenseRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        tripId: row.trip_id,
        vehicleId: row.vehicle_id,
        expenseType: row.expense_type,
        amount: parseFloat(row.amount),
        expenseDate: row.expense_date,
        notes: row.notes,
        createdAt: row.created_at
    };
}

/**
 * Retrieves all transport expense logs from the database, ordered by date.
 * @returns {Promise<object[]>} A promise that resolves to an array of expense objects.
 */
export async function getAllExpenses() {
    const sql = `
        SELECT id, trip_id, vehicle_id, expense_type, amount, expense_date, notes, created_at
        FROM expenses
        ORDER BY expense_date DESC, created_at DESC;
    `;
    const { rows } = await pool.query(sql);
    return rows.map(parseExpenseRow);
}

/**
 * Retrieves a single expense log by its unique ID.
 * @param {number | string} id - The ID of the expense to retrieve.
 * @returns {Promise<object | null>} A promise that resolves to the expense object or null if not found.
 */
export async function findExpenseById(id) {
    const sql = `
        SELECT id, trip_id, vehicle_id, expense_type, amount, expense_date, notes, created_at
        FROM expenses
        WHERE id = $1
        LIMIT 1;
    `;
    const { rows } = await pool.query(sql, [id]);
    return parseExpenseRow(rows[0]);
}

/**
 * Inserts a new transport expense log into the database.
 * @param {object} expenseData - The data for the new expense.
 * @returns {Promise<object>} A promise that resolves to the newly created expense object.
 */
export async function createExpense(expenseData) {
    const sql = `
        INSERT INTO expenses (trip_id, vehicle_id, expense_type, amount, expense_date, notes)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, trip_id, vehicle_id, expense_type, amount, expense_date, notes, created_at;
    `;
    const values = [
        expenseData.tripId || null,
        expenseData.vehicleId || null,
        expenseData.expenseType,
        expenseData.amount,
        expenseData.expenseDate,
        expenseData.notes || null
    ];
    const { rows } = await pool.query(sql, values);
    return parseExpenseRow(rows[0]);
}

/**
 * Updates an existing expense log by its ID.
 * @param {number | string} id - The ID of the expense to update.
 * @param {object} expenseData - An object containing the fields to update.
 * @returns {Promise<object | null>} A promise that resolves to the updated expense object or null if not found.
 */
export async function updateExpense(id, expenseData) {
    const sql = `
        UPDATE expenses
        SET trip_id      = $1,
            vehicle_id   = $2,
            expense_type = $3,
            amount       = $4,
            expense_date = $5,
            notes        = $6
        WHERE id = $7
        RETURNING id, trip_id, vehicle_id, expense_type, amount, expense_date, notes, created_at;
    `;
    const values = [
        expenseData.tripId || null,
        expenseData.vehicleId || null,
        expenseData.expenseType,
        expenseData.amount,
        expenseData.expenseDate,
        expenseData.notes || null,
        id
    ];
    const { rows } = await pool.query(sql, values);
    return parseExpenseRow(rows[0]);
}

/**
 * Deletes an expense log from the database by its ID.
 * @param {number | string} id - The ID of the expense to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if a row was deleted, false otherwise.
 */
export async function deleteExpense(id) {
    const sql = `DELETE FROM expenses WHERE id = $1 RETURNING id;`;
    const { rows } = await pool.query(sql, [id]);
    return rows.length > 0;
}
