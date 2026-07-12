import { pool } from "../config/db.js";

/**
 * Helper to transform raw PostgreSQL snake_case rows into standard camelCase objects
 */
function parseDriverRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        fullName: row.full_name,
        licenseNumber: row.license_number,
        licenseCategory: row.license_category,
        licenseExpiryDate: row.license_expiry_date,
        contactNumber: row.contact_number,
        rating: parseFloat(row.rating),
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

/**
 * Finds a single driver by their license number
 * @param {string} licenseNumber 
 * @returns {Promise<Object|null>} Plain driver object
 */
export async function findDriverByLicenseNumber(licenseNumber) {
    const sql = `
        SELECT id, full_name, license_number, license_category, license_expiry_date, contact_number, rating, status, created_at, updated_at
        FROM drivers
        WHERE license_number = $1
        LIMIT 1;
    `;
    const { rows } = await pool.query(sql, [licenseNumber]);
    return parseDriverRow(rows[0]);
}

/**
 * Finds a single driver by their primary key ID
 * @param {number|string} id 
 * @returns {Promise<Object|null>} Plain driver object
 */
export async function findDriverById(id) {
    const sql = `
        SELECT id, full_name, license_number, license_category, license_expiry_date, contact_number, rating, status, created_at, updated_at
        FROM drivers
        WHERE id = $1
        LIMIT 1;
    `;
    const { rows } = await pool.query(sql, [id]);
    return parseDriverRow(rows[0]);
}

/**
 * Retrieves all drivers in the database
 * @returns {Promise<Array>} List of drivers
 */
export async function getAllDrivers() {
    const sql = `
        SELECT id, full_name, license_number, license_category, license_expiry_date, contact_number, rating, status, created_at, updated_at
        FROM drivers
        ORDER BY created_at DESC;
    `;
    const { rows } = await pool.query(sql);
    return rows.map(parseDriverRow);
}

/**
 * Creates a brand new driver record in the database
 * @param {Object} driverData 
 * @returns {Promise<Object>} Newly created driver object
 */
export async function createDriver(driverData) {
    const sql = `
        INSERT INTO drivers (full_name, license_number, license_category, license_expiry_date, contact_number, rating, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, full_name, license_number, license_category, license_expiry_date, contact_number, rating, status, created_at, updated_at;
    `;
    const values = [
        driverData.fullName,
        driverData.licenseNumber,
        driverData.licenseCategory,
        driverData.licenseExpiryDate,
        driverData.contactNumber || null,
        driverData.rating !== undefined ? driverData.rating : 100.00,
        driverData.status || 'AVAILABLE'
    ];
    const { rows } = await pool.query(sql, values);
    return parseDriverRow(rows[0]);
}

/**
 * Updates an existing driver record in the database by their ID
 * @param {number|string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object|null>} Updated driver object
 */
export async function updateDriver(id, updateData) {
    const sql = `
        UPDATE drivers
        SET full_name = $1,
            license_number = $2,
            license_category = $3,
            license_expiry_date = $4,
            contact_number = $5,
            rating = $6,
            status = $7,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING id, full_name, license_number, license_category, license_expiry_date, contact_number, rating, status, created_at, updated_at;
    `;
    const values = [
        updateData.fullName,
        updateData.licenseNumber,
        updateData.licenseCategory,
        updateData.licenseExpiryDate,
        updateData.contactNumber,
        updateData.rating,
        updateData.status,
        id
    ];
    const { rows } = await pool.query(sql, values);
    return parseDriverRow(rows[0]);
}

/**
 * Deletes a driver by their ID
 * @param {number|string} id 
 * @returns {Promise<boolean>} True if deleted, false if not found
 */
export async function deleteDriver(id) {
    const sql = `
        DELETE FROM drivers
        WHERE id = $1
        RETURNING id;
    `;
    const { rows } = await pool.query(sql, [id]);
    return rows.length > 0;
}
