import { pool } from "../config/db.js";

/**
 * Helper to transform raw PostgreSQL fuel log rows to standard camelCase objects
 */
function parseFuelLogRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        vehicleId: row.vehicle_id,
        tripId: row.trip_id,
        fuelDate: row.fuel_date,
        litres: parseFloat(row.litres),
        totalCost: parseFloat(row.total_cost),
        createdAt: row.created_at
    };
}

/**
 * Retrieves all fuel logs in the database
 */
export async function getAllFuelLogs() {
    const sql = `
        SELECT id, vehicle_id, trip_id, fuel_date, litres, total_cost, created_at
        FROM fuel_logs
        ORDER BY fuel_date DESC, created_at DESC;
    `;
    const { rows } = await pool.query(sql);
    return rows.map(parseFuelLogRow);
}

/**
 * Inserts a new fuel log into the database
 */
export async function createFuelLog(fuelData) {
    const sql = `
        INSERT INTO fuel_logs (vehicle_id, trip_id, fuel_date, litres, total_cost)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, vehicle_id, trip_id, fuel_date, litres, total_cost, created_at;
    `;
    const values = [
        fuelData.vehicleId,
        fuelData.tripId || null,
        fuelData.fuelDate,
        fuelData.litres,
        fuelData.totalCost
    ];
    const { rows } = await pool.query(sql, values);
    return parseFuelLogRow(rows[0]);
}
