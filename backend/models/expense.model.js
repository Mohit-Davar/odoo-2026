import { pool } from "../config/db.js";

/**
 * Helper to transform raw PostgreSQL expense rows to standard camelCase objects
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
 * Retrieves all transport expense logs
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
 * Inserts a new transport expense log into the database
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
