import { pool } from "../config/db.js";

/**
 * Transforms a raw PostgreSQL maintenance log row into a camelCase object.
 * @param {object} row - The raw row object from the database.
 * @returns {object | null} A camelCase maintenance log object or null if input is falsy.
 */
function parseMaintenanceRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        vehicleId: row.vehicle_id,
        description: row.description,
        cost: parseFloat(row.cost),
        maintenanceDate: row.maintenance_date,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

/**
 * Retrieves a single maintenance log by its unique ID.
 * @param {number | string} id - The ID of the maintenance log to retrieve.
 * @returns {Promise<object | null>} A promise that resolves to the maintenance log object or null if not found.
 */
export async function findMaintenanceById(id) {
    const sql = `
        SELECT id, vehicle_id, description, cost, maintenance_date, status, created_at, updated_at
        FROM maintenance_logs
        WHERE id = $1
        LIMIT 1;
    `;
    const { rows } = await pool.query(sql, [id]);
    return parseMaintenanceRow(rows[0]);
}

/**
 * Retrieves all maintenance logs from the database, ordered by creation date.
 * @returns {Promise<object[]>} A promise that resolves to an array of maintenance log objects.
 */
export async function getAllMaintenanceLogs() {
    const sql = `
        SELECT id, vehicle_id, description, cost, maintenance_date, status, created_at, updated_at
        FROM maintenance_logs
        ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(sql);
    return rows.map(parseMaintenanceRow);
}

/**
 * Creates a new maintenance log and updates the corresponding vehicle's status within a transaction.
 * If the log status is 'ACTIVE', the vehicle status is set to 'IN_SHOP'.
 * @param {object} data - The data for the new maintenance log.
 * @returns {Promise<object>} A promise that resolves to the newly created maintenance log object.
 * @throws Will throw an error if the transaction fails.
 */
export async function createMaintenanceLog(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const sql = `
            INSERT INTO maintenance_logs (vehicle_id, description, cost, maintenance_date, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id, vehicle_id, description, cost, maintenance_date, status, created_at, updated_at;
        `;
        const values = [
            data.vehicleId,
            data.description,
            data.cost,
            data.maintenanceDate,
            data.status || 'ACTIVE'
        ];
        
        const { rows } = await client.query(sql, values);
        const newLog = rows[0];
        
        // Update vehicle status
        if (newLog.status === 'ACTIVE') {
            await client.query(`
                UPDATE vehicles 
                SET status = 'IN_SHOP', updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1 AND status != 'RETIRED'
            `, [data.vehicleId]);
        }
        
        await client.query('COMMIT');
        return parseMaintenanceRow(newLog);
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

/**
 * Updates an existing maintenance log and adjusts the vehicle's status accordingly within a transaction.
 * e.g., sets vehicle to 'AVAILABLE' if maintenance is 'COMPLETED'.
 * @param {number | string} id - The ID of the maintenance log to update.
 * @param {object} data - An object containing the fields to update.
 * @returns {Promise<object | null>} A promise that resolves to the updated maintenance log object or null if not found.
 * @throws Will throw an error if the transaction fails.
 */
export async function updateMaintenanceLog(id, data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        const sql = `
            UPDATE maintenance_logs
            SET vehicle_id = $1,
                description = $2,
                cost = $3,
                maintenance_date = $4,
                status = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $6
            RETURNING id, vehicle_id, description, cost, maintenance_date, status, created_at, updated_at;
        `;
        const values = [
            data.vehicleId,
            data.description,
            data.cost,
            data.maintenanceDate,
            data.status,
            id
        ];
        const { rows } = await client.query(sql, values);
        const updatedLog = rows[0];
        
        if (updatedLog) {
            if (updatedLog.status === 'COMPLETED') {
                await client.query(`
                    UPDATE vehicles 
                    SET status = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP 
                    WHERE id = $1 AND status = 'IN_SHOP'
                `, [updatedLog.vehicle_id]);
            } else if (updatedLog.status === 'ACTIVE') {
                await client.query(`
                    UPDATE vehicles 
                    SET status = 'IN_SHOP', updated_at = CURRENT_TIMESTAMP 
                    WHERE id = $1 AND status != 'RETIRED'
                `, [updatedLog.vehicle_id]);
            }
        }
        
        await client.query('COMMIT');
        return parseMaintenanceRow(updatedLog);
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

/**
 * Deletes a maintenance log by its ID and reverts vehicle status if necessary, within a transaction.
 * @param {number | string} id - The ID of the maintenance log to delete.
 * @returns {Promise<boolean>} A promise that resolves to true if a row was deleted, false otherwise.
 * @throws Will throw an error if the transaction fails.
 */
export async function deleteMaintenanceLog(id) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const sql = `
            DELETE FROM maintenance_logs
            WHERE id = $1
            RETURNING id, vehicle_id, status;
        `;
        const { rows } = await client.query(sql, [id]);
        const deletedLog = rows[0];
        
        if (deletedLog && deletedLog.status === 'ACTIVE') {
            await client.query(`
                UPDATE vehicles 
                SET status = 'AVAILABLE', updated_at = CURRENT_TIMESTAMP 
                WHERE id = $1 AND status = 'IN_SHOP'
            `, [deletedLog.vehicle_id]);
        }
        
        await client.query('COMMIT');
        return rows.length > 0;
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}
