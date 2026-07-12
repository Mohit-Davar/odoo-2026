import { pool } from "../config/db.js";

/**
 * Helper to transform raw PostgreSQL snake_case rows into standard camelCase objects
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

export async function getAllMaintenanceLogs() {
    const sql = `
        SELECT id, vehicle_id, description, cost, maintenance_date, status, created_at, updated_at
        FROM maintenance_logs
        ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(sql);
    return rows.map(parseMaintenanceRow);
}

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
