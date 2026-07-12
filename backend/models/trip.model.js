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
        revenue: row.revenue ? parseFloat(row.revenue) : 0,
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

export async function getAllTrips(filters = {}) {
    const { search, status, sortBy = 'created_at', order = 'DESC' } = filters;
    let sql = `
        SELECT 
            t.*,
            v.vehicle_name,
            v.registration_number,
            d.full_name as driver_name
        FROM trips t
        LEFT JOIN vehicles v ON t.vehicle_id = v.id
        LEFT JOIN drivers d ON t.driver_id = d.id
    `;
    
    const values = [];
    const whereClauses = [];

    if (search) {
        values.push(`%${search}%`);
        const searchIndex = values.length;
        whereClauses.push(`(t.trip_code ILIKE ${searchIndex} OR t.source ILIKE ${searchIndex} OR t.destination ILIKE ${searchIndex} OR v.vehicle_name ILIKE ${searchIndex} OR d.full_name ILIKE ${searchIndex})`);
    }

    if (status) {
        values.push(status);
        whereClauses.push(`t.status = ${values.length}`);
    }

    if (whereClauses.length > 0) {
        sql += ` WHERE ${whereClauses.join(' AND ')}`;
    }

    const allowedSortBy = ['trip_code', 'source', 'destination', 'status', 'created_at', 'dispatched_at', 'completed_at'];
    const safeSortBy = allowedSortBy.includes(sortBy) ? `t.${sortBy}` : 't.created_at';
    const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${safeSortBy} ${safeOrder};`;

    const { rows } = await pool.query(sql, values);
    // The parse function needs to be adjusted to handle the joined fields
    return rows.map(row => ({
        ...parseTripRow(row),
        vehicleName: row.vehicle_name,
        registrationNumber: row.registration_number,
        driverName: row.driver_name
    }));
}

export async function updateTripStatusTransaction(client, tripId, status, extraData = {}) {
    // Transactional helper, assumes a client is passed
    let extraUpdates = "";
    if (status === 'DISPATCHED') extraUpdates = ", dispatched_at = CURRENT_TIMESTAMP";
    else if (status === 'COMPLETED') extraUpdates = ", completed_at = CURRENT_TIMESTAMP";

    if (extraData.revenue !== undefined) {
        extraUpdates += `, revenue = ${extraData.revenue}`;
    }

    const sql = `
        UPDATE trips
        SET status = $1, updated_at = CURRENT_TIMESTAMP ${extraUpdates}
        WHERE id = $2
        RETURNING *;
    `;
    const { rows } = await client.query(sql, [status, tripId]);
    return parseTripRow(rows[0]);
}
