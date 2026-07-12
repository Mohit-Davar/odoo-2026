import { pool } from "../config/db.js";

/**
 * Helper to transform raw PostgreSQL snake_case rows into standard camelCase objects
 */
function parseUserRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        password: row.password,
        refreshToken: row.refresh_token,
        roleId: row.role_id,
        verified: row.verified,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

/**
 * Finds a single user by their email address
 * @param {string} email 
 * @param {Object} options - Option parameters
 * @param {boolean} options.includePassword - Safely drop password column from returned row
 * @returns {Promise<Object|null>} Plain user object
 */
export async function findUserByEmail(email, { includePassword = true } = {}) {
    const selectFields = includePassword
        ? "id, name, email, password, role_id, refresh_token, verified, created_at, updated_at"
        : "id, name, email, role_id, refresh_token, verified, created_at, updated_at";

    const sql = `
        SELECT ${selectFields} 
        FROM users 
        WHERE email = $1 
        LIMIT 1;
    `;
    const { rows } = await pool.query(sql, [email]);
    return parseUserRow(rows[0]);
}

/**
 * Finds a single user by their refresh token
 * @param {string} token 
 * @returns {Promise<Object|null>} Plain user object
 */
export async function findUserByRefreshToken(token) {
    const sql = `
        SELECT id, name, email, password, role_id, refresh_token, verified, created_at, updated_at 
        FROM users 
        WHERE refresh_token = $1 
        LIMIT 1;
    `;
    const { rows } = await pool.query(sql, [token]);
    return parseUserRow(rows[0]);
}

/**
 * Finds a single user by their unique primary key ID
 * @param {number|string} id 
 * @param {Object} options - Option parameters
 * @param {boolean} options.includePassword - Safely drop password column from returned row
 * @returns {Promise<Object|null>} Plain user object
 */
export async function findUserById(id, { includePassword = true } = {}) {
    const selectFields = includePassword
        ? "id, name, email, password, role_id, refresh_token, verified, created_at, updated_at"
        : "id, name, email, role_id, refresh_token, verified, created_at, updated_at";

    const sql = `
        SELECT ${selectFields} 
        FROM users 
        WHERE id = $1 
        LIMIT 1;
    `;
    const { rows } = await pool.query(sql, [id]);
    return parseUserRow(rows[0]);
}

/**
 * Creates a brand new user record in the database
 * @param {Object} userData 
 * @returns {Promise<Object>} Newly created user object
 */
export async function createUser(userData) {
    const sql = `
        INSERT INTO users (name, email, password, refresh_token, verified)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, password, role_id, refresh_token, verified, created_at, updated_at;
    `;
    const values = [
        userData.name,
        userData.email,
        userData.password,
        userData.refreshToken || null,
        userData.verified !== undefined ? userData.verified : false
    ];
    const { rows } = await pool.query(sql, values);
    return parseUserRow(rows[0]);
}

/**
 * Updates an existing user record in the database by their ID
 * @param {number|string} id 
 * @param {Object} updateData 
 * @returns {Promise<Object|null>} Updated user object
 */
export async function updateUser(id, updateData) {
    const sql = `
        UPDATE users 
        SET name = $1, 
            email = $2, 
            password = $3, 
            refresh_token = $4, 
            verified = $5, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING id, name, email, password, role_id, refresh_token, verified, created_at, updated_at;
    `;
    const values = [
        updateData.name,
        updateData.email,
        updateData.password,
        updateData.refreshToken,
        updateData.verified,
        id
    ];
    const { rows } = await pool.query(sql, values);
    return parseUserRow(rows[0]);
}
