import { pool } from "../config/db.js";

export async function addPerson(userData) {
    const sql = `
        INSERT INTO users (name, email, password, role_id, verified)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, email, role_id, verified, created_at, updated_at;
    `;
    const values = [
        userData.name,
        userData.email,
        userData.password,
        userData.roleId || 3,
        userData.verified !== undefined ? userData.verified : true
    ];
    const { rows } = await pool.query(sql, values);
    return rows[0];
}

export async function assignRole(userId, roleId) {
    const sql = `
        UPDATE users 
        SET role_id = $1, 
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING id, name, email, role_id, verified, created_at, updated_at;
    `;
    const { rows } = await pool.query(sql, [roleId, userId]);
    return rows[0];
}

export async function getAllRoles() {
    const sql = `SELECT id, name FROM roles ORDER BY id ASC;`;
    const { rows } = await pool.query(sql);
    return rows;
}

export async function getAllUsers() {
    const sql = `
        SELECT u.id, u.name, u.email, u.role_id, r.name as role_name, u.verified, u.created_at, u.updated_at 
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.id
        ORDER BY u.id DESC;
    `;
    const { rows } = await pool.query(sql);
    return rows;
}
