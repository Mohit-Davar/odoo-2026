import { pool } from "../config/db.js";

function parseTripRow(row) {
    if (!row) return null;
    return {
        id: row.id,
        tripCode: row.trip_code,
        source: row.source,
        destination: row.destination,
        vehicleId: row.vehicle_id,
        driverId: row.driver_id,
        cargoWeightKg: parseFloat(row.cargo_weight_kg),
        plannedDistanceKm: parseFloat(row.planned_distance_km),
        startOdometerKm: row.start_odometer_km ? parseFloat(row.start_odometer_km) : null,
        endOdometerKm: row.end_odometer_km ? parseFloat(row.end_odometer_km) : null,
        status: row.status,
        dispatchedAt: row.dispatched_at,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}

export async function createTrip(tripData) {
    const sql = `
        INSERT INTO trips (
            trip_code, source, destination, vehicle_id, driver_id, 
            cargo_weight_kg, planned_distance_km, status
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const values = [
        tripData.tripCode,
        tripData.source,
        tripData.destination,
        tripData.vehicleId,
        tripData.driverId,
        tripData.cargoWeightKg,
        tripData.plannedDistanceKm,
        tripData.status || 'DRAFT'
    ];
    const { rows } = await pool.query(sql, values);
    return parseTripRow(rows[0]);
}

export async function getTripById(id) {
    const sql = `SELECT * FROM trips WHERE id = $1 LIMIT 1;`;
    const { rows } = await pool.query(sql, [id]);
    return parseTripRow(rows[0]);
}

export async function getAllTrips() {
    const sql = `SELECT * FROM trips ORDER BY created_at DESC;`;
    const { rows } = await pool.query(sql);
    return rows.map(parseTripRow);
}

export async function updateTripStatusTransaction(client, tripId, status) {
    // Transactional helper, assumes a client is passed
    let extraUpdates = "";
    if (status === 'DISPATCHED') extraUpdates = ", dispatched_at = CURRENT_TIMESTAMP";
    else if (status === 'COMPLETED') extraUpdates = ", completed_at = CURRENT_TIMESTAMP";

    const sql = `
        UPDATE trips
        SET status = $1, updated_at = CURRENT_TIMESTAMP ${extraUpdates}
        WHERE id = $2
        RETURNING *;
    `;
    const { rows } = await client.query(sql, [status, tripId]);
    return parseTripRow(rows[0]);
}
