import { pool } from "../config/db.js";

/**
 * Helper to transform raw PostgreSQL snake_case rows into standard camelCase objects
 */
function parseVehicleRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        registrationNumber: row.registration_number,
        vehicleName: row.vehicle_name,
        vehicleType: row.vehicle_type,
        maxLoadCapacityKg: parseFloat(row.max_load_capacity_kg),
        odometerKm: parseFloat(row.odometer_km),
        acquisitionCost: parseFloat(row.acquisition_cost),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

/**
 * Finds a single vehicle by its registration number
 * @param {string} regNum 
 * @returns {Promise<Object|null>} Plain vehicle object
 */
export async function findVehicleByRegistrationNumber(regNum) {
    const sql = `
        SELECT id, registration_number, vehicle_name, vehicle_type, max_load_capacity_kg, odometer_km, acquisition_cost, status, created_at, updated_at
        FROM vehicles
        WHERE registration_number = $1
        LIMIT 1;
    `;
    const { rows } = await pool.query(sql, [regNum]);
    return parseVehicleRow(rows[0]);
}

/**
 * Finds a single vehicle by its primary key ID
 * @param {number|string} id 
 * @returns {Promise<Object|null>} Plain vehicle object
 */
export async function findVehicleById(id) {
    const sql = `
        SELECT id, registration_number, vehicle_name, vehicle_type, max_load_capacity_kg, odometer_km, acquisition_cost, status, created_at, updated_at
        FROM vehicles
        WHERE id = $1
        LIMIT 1;
    `;
    const { rows } = await pool.query(sql, [id]);
    return parseVehicleRow(rows[0]);
}

/**
 * Retrieves all vehicles in the database with optional filtering, searching, and sorting
 * @param {object} filters - Optional filters for the query
 * @param {string} filters.search - A search term to match against registration number or name
 * @param {string} filters.status - A specific vehicle status to filter by
 * @param {string} filters.sortBy - The column to sort by (default: 'created_at')
 * @param {string} filters.order - The sort order ('ASC' or 'DESC', default: 'DESC')
 * @returns {Promise<Array>} List of vehicles
 */
export async function getAllVehicles(filters = {}) {
    const { search, status, sortBy = 'created_at', order = 'DESC' } = filters;
    let sql = `
        SELECT id, registration_number, vehicle_name, vehicle_type, max_load_capacity_kg, odometer_km, acquisition_cost, status, created_at, updated_at
        FROM vehicles
    `;
    
    const values = [];
    const whereClauses = [];

    if (search) {
        values.push(`%${search}%`);
        whereClauses.push(`(registration_number ILIKE ${values.length} OR vehicle_name ILIKE ${values.length})`);
    }

    if (status) {
        values.push(status);
        whereClauses.push(`status = ${values.length}`);
    }

    if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    // Basic protection against SQL injection in sortBy
    const allowedSortBy = ['registration_number', 'vehicle_name', 'vehicle_type', 'max_load_capacity_kg', 'odometer_km', 'status', 'created_at'];
    const safeSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${safeSortBy} ${safeOrder};`;

    const { rows } = await pool.query(sql, values);
    return rows.map(parseVehicleRow);
}

/**
 * Creates a brand new vehicle record in the database
 * @param {Object} vehicleData 
 * @returns {Promise<Object>} Newly created vehicle object
 */
export async function createVehicle(vehicleData) {
    const sql = `
        INSERT INTO vehicles (registration_number, vehicle_name, vehicle_type, max_load_capacity_kg, odometer_km, acquisition_cost, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, registration_number, vehicle_name, vehicle_type, max_load_capacity_kg, odometer_km, acquisition_cost, status, created_at, updated_at;
    `;
    const values = [
        vehicleData.registrationNumber,
        vehicleData.vehicleName,
        vehicleData.vehicleType,
        vehicleData.maxLoadCapacityKg,
        vehicleData.odometerKm || 0,
        vehicleData.acquisitionCost,
        vehicleData.status || 'AVAILABLE'
    ];
    const { rows } = await pool.query(sql, values);
    return parseVehicleRow(rows[0]);
}

/**
 * Updates an existing vehicle record in the database by its ID
 * @param {number|string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object|null>} Updated vehicle object
 */
export async function updateVehicle(id, updateData) {
    const sql = `
        UPDATE vehicles
        SET registration_number = $1,
            vehicle_name = $2,
            vehicle_type = $3,
            max_load_capacity_kg = $4,
            odometer_km = $5,
            acquisition_cost = $6,
            status = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING id, registration_number, vehicle_name, vehicle_type, max_load_capacity_kg, odometer_km, acquisition_cost, status, created_at, updated_at;
    `;
    const values = [
        updateData.registrationNumber,
        updateData.vehicleName,
        updateData.vehicleType,
        updateData.maxLoadCapacityKg,
        updateData.odometerKm,
        updateData.acquisitionCost,
        updateData.status,
        id
    ];
    const { rows } = await pool.query(sql, values);
    return parseVehicleRow(rows[0]);
}

/**
 * Deletes a vehicle by its ID
 * @param {number|string} id 
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteVehicle(id) {
    const sql = `
        DELETE FROM vehicles
        WHERE id = $1
        RETURNING id;
    `;
    const { rows } = await pool.query(sql, [id]);
    return rows.length > 0;
}
