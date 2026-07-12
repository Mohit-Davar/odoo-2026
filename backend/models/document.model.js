import { pool } from "../config/db.js";

export async function addDocument(docData) {
    const sql = `
        INSERT INTO vehicle_documents (vehicle_id, document_name, file_url, cloudinary_public_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const values = [
        docData.vehicle_id,
        docData.document_name,
        docData.file_url,
        docData.cloudinary_public_id,
    ];
    const { rows } = await pool.query(sql, values);
    return rows[0];
}

export async function getDocumentById(id) {
    const sql = `SELECT * FROM vehicle_documents WHERE id = $1;`;
    const { rows } = await pool.query(sql, [id]);
    return rows[0];
}

export async function deleteDocumentById(id) {
    const sql = `DELETE FROM vehicle_documents WHERE id = $1;`;
    await pool.query(sql, [id]);
}

export async function getDocumentsByVehicleId(vehicleId) {
    const sql = `SELECT * FROM vehicle_documents WHERE vehicle_id = $1 ORDER BY created_at DESC;`;
    const { rows } = await pool.query(sql, [vehicleId]);
    return rows;
}
