import { pool } from "../config/db.js";

/**
 * Transforms a raw PostgreSQL fuel log row into a camelCase object.
 * @param {object} row - The raw row object from the database.
 * @returns {object | null} A camelCase fuel log object or null if input is falsy.
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
 * Retrieves all fuel logs from the database, ordered by date.
 * @returns {Promise<object[]>} A promise that resolves to an array of fuel log objects.
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
 * Retrieves a single fuel log by its unique ID.
 * @param {number | string} id - The ID of the fuel log to retrieve.
 * @returns {Promise<object | null>} A promise that resolves to the fuel log object or null if not found.
 */
export async function findFuelLogById(id) {
    const sql = `
        SELECT id, vehicle_id, trip_id, fuel_date, litres, total_cost, created_at
        FROM fuel_logs
        WHERE id = $1
        LIMIT 1;
    `;
    const { rows } = await pool.query(sql, [id]);
    return parseFuelLogRow(rows[0]);
}

/**
 * Inserts a new fuel log into the database.
 * @param {object} fuelData - The data for the new fuel log.
 * @returns {Promise<object>} A promise that resolves to the newly created fuel log object.
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

/**
 * Updates an existing fuel log by its ID.
 * @param {number | string} id - The ID of the fuel log to update.
 * @param {object} fuelData - An object containing the fields to update.
 * @returns {Promise<object | null>} A promise that resolves to the updated fuel log object or null if not found.
 */
export async function updateFuelLog(id, fuelData) {
    const sql = `
        UPDATE fuel_logs
        SET vehicle_id = $1,
            trip_id    = $2,
            fuel_date  = $3,
            litres     = $4,
            total_cost = $5
        WHERE id = $6
        RETURNING id, vehicle_id, trip_id, fuel_date, litres, total_cost, created_at;
    `;
    const values = [
        fuelData.vehicleId,
        fuelData.tripId || null,
        fuelData.fuelDate,
        fuelData.litres,
        fuelData.totalCost,
        id
    ];
    const { rows } = await pool.query(sql, values);
    return parseFuelLogRow(rows[0]);
}

/**
 * Deletes a fuel log from the database by its ID.
 * @param {number | string} id - The ID of the fuel log to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if a row was deleted, false otherwise.
 */
export async function deleteFuelLog(id) {
    const sql = `DELETE FROM fuel_logs WHERE id = $1 RETURNING id;`;
    const { rows } = await pool.query(sql, [id]);
    return rows.length > 0;
}
