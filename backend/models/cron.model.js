import { pool } from "../config/db.js";

export async function getDriversWithExpiringLicenses() {
    const intervals = [30, 15, 7, 3, 1, 0];
    const sql = `
        SELECT 
            full_name, 
            license_number, 
            license_expiry_date,
            (license_expiry_date - CURRENT_DATE) as days_remaining
        FROM drivers
        WHERE (license_expiry_date - CURRENT_DATE) IN (${intervals.join(',')})
        ORDER BY days_remaining ASC;
    `;
    const { rows } = await pool.query(sql);
    return rows;
}

export async function getAdminUsers() {
    const sql = `
        SELECT u.id, u.name, u.email, r.name as role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE r.name IN ('ADMIN', 'SAFETY_OFFICER');
    `;
    const { rows } = await pool.query(sql);
    return rows;
}
