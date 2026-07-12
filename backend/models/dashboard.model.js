import { pool } from "../config/db.js";

/**
 * Retrieves key performance indicators (KPIs) for the dashboard overview.
 * This includes counts for vehicles, drivers, and trips by status.
 * @returns {Promise<object>} A promise that resolves to an object containing KPIs for vehicles, drivers, and trips.
 */
export async function getDashboardKPIs() {
    const sql = `
        SELECT
            -- Vehicle KPIs
            (SELECT COUNT(*)                                        FROM vehicles)                            AS total_vehicles,
            (SELECT COUNT(*) FILTER (WHERE status = 'AVAILABLE')   FROM vehicles)                            AS available_vehicles,
            (SELECT COUNT(*) FILTER (WHERE status = 'ON_TRIP')     FROM vehicles)                            AS active_vehicles,
            (SELECT COUNT(*) FILTER (WHERE status = 'IN_SHOP')     FROM vehicles)                            AS vehicles_in_maintenance,
            (SELECT COUNT(*) FILTER (WHERE status = 'RETIRED')     FROM vehicles)                            AS retired_vehicles,

            -- Driver KPIs
            (SELECT COUNT(*)                                        FROM drivers)                             AS total_drivers,
            (SELECT COUNT(*) FILTER (WHERE status = 'ON_TRIP')     FROM drivers)                             AS drivers_on_duty,
            (SELECT COUNT(*) FILTER (WHERE status = 'AVAILABLE')   FROM drivers)                             AS available_drivers,
            (SELECT COUNT(*) FILTER (WHERE status = 'SUSPENDED')   FROM drivers)                             AS suspended_drivers,

            -- Trip KPIs
            (SELECT COUNT(*) FROM trips WHERE status = 'DISPATCHED')                AS active_trips,
            (SELECT COUNT(*) FROM trips WHERE status = 'DRAFT')                     AS pending_trips,
            (SELECT COUNT(*) FROM trips WHERE status = 'COMPLETED')                 AS completed_trips;
    `;
    const { rows } = await pool.query(sql);
    const r = rows[0];

    const totalVehicles = parseInt(r.total_vehicles, 10);
    const activeVehicles = parseInt(r.active_vehicles, 10);

    return {
        vehicles: {
            total: totalVehicles,
            available: parseInt(r.available_vehicles, 10),
            onTrip: activeVehicles,
            inMaintenance: parseInt(r.vehicles_in_maintenance, 10),
            retired: parseInt(r.retired_vehicles, 10)
        },
        drivers: {
            total: parseInt(r.total_drivers, 10),
            onDuty: parseInt(r.drivers_on_duty, 10),
            available: parseInt(r.available_drivers, 10),
            suspended: parseInt(r.suspended_drivers, 10)
        },
        trips: {
            active: parseInt(r.active_trips, 10),
            pending: parseInt(r.pending_trips, 10),
            completed: parseInt(r.completed_trips, 10)
        },
        fleetUtilizationPercent:
            totalVehicles > 0
                ? parseFloat(((activeVehicles / totalVehicles) * 100).toFixed(2))
                : 0
    };
}

/**
 * Retrieves a list of the most recent trips, including associated vehicle and driver details.
 * @param {number} [limit=10] - The maximum number of recent trips to retrieve.
 * @returns {Promise<object[]>} A promise that resolves to an array of recent trip objects.
 */
export async function getRecentTrips(limit = 10) {
    const sql = `
        SELECT
            t.id,
            t.trip_code,
            t.source,
            t.destination,
            t.status,
            t.cargo_weight_kg,
            t.planned_distance_km,
            t.dispatched_at,
            t.completed_at,
            t.created_at,
            v.registration_number  AS vehicle_reg,
            v.vehicle_name,
            d.full_name            AS driver_name
        FROM trips t
        LEFT JOIN vehicles v ON v.id = t.vehicle_id
        LEFT JOIN drivers  d ON d.id = t.driver_id
        ORDER BY t.created_at DESC
        LIMIT $1;
    `;
    const { rows } = await pool.query(sql, [limit]);
    return rows.map(r => ({
        id: r.id,
        tripCode: r.trip_code,
        source: r.source,
        destination: r.destination,
        status: r.status,
        cargoWeightKg: parseFloat(r.cargo_weight_kg),
        plannedDistanceKm: parseFloat(r.planned_distance_km),
        dispatchedAt: r.dispatched_at,
        completedAt: r.completed_at,
        createdAt: r.created_at,
        vehicle: { registrationNumber: r.vehicle_reg, vehicleName: r.vehicle_name },
        driver: { fullName: r.driver_name }
    }));
}

/**
 * Retrieves the distribution of vehicles across different statuses (e.g., AVAILABLE, ON_TRIP).
 * Useful for generating charts on the dashboard.
 * @returns {Promise<object[]>} A promise that resolves to an array of objects, each with a status and a count.
 */
export async function getVehicleStatusDistribution() {
    const sql = `
        SELECT status, COUNT(*) AS count
        FROM vehicles
        GROUP BY status
        ORDER BY status;
    `;
    const { rows } = await pool.query(sql);
    return rows.map(r => ({ status: r.status, count: parseInt(r.count, 10) }));
}

/**
 * Retrieves aggregate operational statistics for the dashboard.
 * This includes total fuel cost, total litres consumed, total maintenance cost, and other expenses.
 * @returns {Promise<object>} A promise that resolves to an object containing key operational stats.
 */
export async function getOperationalStats() {
    const sql = `
        SELECT
            COALESCE(SUM(f.total_cost), 0)  AS total_fuel_cost,
            COALESCE(SUM(f.litres), 0)       AS total_litres,
            COALESCE(SUM(m.cost), 0)         AS total_maintenance_cost,
            COALESCE(SUM(e.amount), 0)       AS total_expense_amount
        FROM
            (SELECT 1) dummy
        LEFT JOIN fuel_logs    f ON TRUE
        LEFT JOIN maintenance_logs m ON TRUE
        LEFT JOIN expenses     e ON TRUE;
    `;
    // Simpler individual queries are cleaner here
    const [fuelRes, maintRes, expRes] = await Promise.all([
        pool.query(`SELECT COALESCE(SUM(total_cost),0) AS total_fuel_cost,
                           COALESCE(SUM(litres),0)     AS total_litres
                    FROM fuel_logs`),
        pool.query(`SELECT COALESCE(SUM(cost),0) AS total_maintenance_cost FROM maintenance_logs`),
        pool.query(`SELECT COALESCE(SUM(amount),0) AS total_expense_amount FROM expenses`)
    ]);
    return {
        totalFuelCost: parseFloat(fuelRes.rows[0].total_fuel_cost),
        totalLitres: parseFloat(fuelRes.rows[0].total_litres),
        totalMaintenanceCost: parseFloat(maintRes.rows[0].total_maintenance_cost),
        totalOtherExpenses: parseFloat(expRes.rows[0].total_expense_amount)
    };
}
