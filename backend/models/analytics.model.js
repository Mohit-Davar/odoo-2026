import { pool } from "../config/db.js";

/**
 * Calculates fuel efficiency for each vehicle.
 * Efficiency is defined as total kilometers driven per litre of fuel consumed.
 * @returns {Promise<object[]>} A promise that resolves to an array of vehicle efficiency objects.
 * Each object includes vehicle details, total litres consumed, total fuel cost,
 * total distance, and the calculated efficiency (km/L).
 */
export async function getFuelEfficiency() {
    const sql = `
        SELECT
            v.id                                AS vehicle_id,
            v.registration_number,
            v.vehicle_name,
            v.vehicle_type,
            COALESCE(SUM(fl.litres), 0)         AS total_litres,
            COALESCE(SUM(fl.total_cost), 0)     AS total_fuel_cost,
            -- Sum distance from completed trips linked to each fuel log
            COALESCE(SUM(t.planned_distance_km), 0) AS total_distance_km
        FROM vehicles v
        LEFT JOIN fuel_logs fl ON fl.vehicle_id = v.id
        LEFT JOIN trips     t  ON t.id = fl.trip_id AND t.status = 'COMPLETED'
        GROUP BY v.id, v.registration_number, v.vehicle_name, v.vehicle_type
        ORDER BY v.id;
    `;
    const { rows } = await pool.query(sql);
    return rows.map(r => {
        const litres = parseFloat(r.total_litres);
        const distanceKm = parseFloat(r.total_distance_km);
        return {
            vehicleId: r.vehicle_id,
            registrationNumber: r.registration_number,
            vehicleName: r.vehicle_name,
            vehicleType: r.vehicle_type,
            totalLitres: litres,
            totalFuelCost: parseFloat(r.total_fuel_cost),
            totalDistanceKm: distanceKm,
            efficiencyKmPerLitre: litres > 0 ? parseFloat((distanceKm / litres).toFixed(2)) : null
        };
    });
}

/**
 * Calculates fleet utilization metrics.
 * Utilization is the percentage of vehicles currently on a trip compared to the total fleet size.
 * @returns {Promise<object>} A promise that resolves to an object containing fleet utilization stats,
 * including total vehicles, and counts for on-trip, available, in-shop, and retired statuses.
 */
export async function getFleetUtilization() {
    const sql = `
        SELECT
            COUNT(*)                                                  AS total_vehicles,
            COUNT(*) FILTER (WHERE status = 'ON_TRIP')               AS on_trip,
            COUNT(*) FILTER (WHERE status = 'AVAILABLE')             AS available,
            COUNT(*) FILTER (WHERE status = 'IN_SHOP')               AS in_shop,
            COUNT(*) FILTER (WHERE status = 'RETIRED')               AS retired
        FROM vehicles;
    `;
    const { rows } = await pool.query(sql);
    const r = rows[0];
    const total = parseInt(r.total_vehicles, 10);
    const onTrip = parseInt(r.on_trip, 10);
    return {
        totalVehicles: total,
        onTrip,
        available: parseInt(r.available, 10),
        inShop: parseInt(r.in_shop, 10),
        retired: parseInt(r.retired, 10),
        utilizationPercent: total > 0 ? parseFloat(((onTrip / total) * 100).toFixed(2)) : 0
    };
}

/**
 * Calculates the breakdown of operational costs.
 * This includes total fuel costs, maintenance costs, and other categorized expenses.
 * @returns {Promise<object>} A promise that resolves to an object with a detailed cost breakdown,
 * including a grand total.
 */
export async function getOperationalCost() {
    const [fuelRes, maintRes, expRes] = await Promise.all([
        pool.query(`
            SELECT
                COALESCE(SUM(total_cost), 0) AS fuel_cost,
                COALESCE(SUM(litres), 0)     AS total_litres
            FROM fuel_logs
        `),
        pool.query(`
            SELECT COALESCE(SUM(cost), 0) AS maintenance_cost
            FROM maintenance_logs
        `),
        pool.query(`
            SELECT
                COALESCE(SUM(amount), 0)                                     AS total_expense,
                COALESCE(SUM(amount) FILTER (WHERE expense_type = 'TOLL'), 0) AS toll_cost,
                COALESCE(SUM(amount) FILTER (WHERE expense_type = 'MAINTENANCE'), 0) AS maintenance_expense,
                COALESCE(SUM(amount) FILTER (WHERE expense_type = 'OTHER'), 0) AS other_cost
            FROM expenses
        `)
    ]);

    const fuelCost = parseFloat(fuelRes.rows[0].fuel_cost);
    const maintenanceCost = parseFloat(maintRes.rows[0].maintenance_cost);
    const totalExpense = parseFloat(expRes.rows[0].total_expense);

    return {
        fuelCost,
        maintenanceCost,
        expenses: {
            total: totalExpense,
            toll: parseFloat(expRes.rows[0].toll_cost),
            maintenance: parseFloat(expRes.rows[0].maintenance_expense),
            other: parseFloat(expRes.rows[0].other_cost)
        },
        grandTotal: parseFloat((fuelCost + maintenanceCost + totalExpense).toFixed(2))
    };
}

/**
 * Calculates the Return on Investment (ROI) for each vehicle.
 * As revenue is not tracked, this function currently returns only the cost side of the equation.
 * The 'revenue' and 'roi' fields are returned as null to be populated by the frontend if data is available.
 * @returns {Promise<object[]>} A promise that resolves to an array of vehicle ROI objects,
 * detailing acquisition cost, total fuel and maintenance costs, and completed trips.
 */
export async function getVehicleROI() {
    const sql = `
        SELECT
            v.id,
            v.registration_number,
            v.vehicle_name,
            v.vehicle_type,
            v.acquisition_cost,
            COALESCE(SUM(fl.total_cost), 0)   AS total_fuel_cost,
            COALESCE(SUM(ml.cost), 0)          AS total_maintenance_cost,
            COUNT(DISTINCT t.id)               AS completed_trips
        FROM vehicles v
        LEFT JOIN fuel_logs       fl ON fl.vehicle_id = v.id
        LEFT JOIN maintenance_logs ml ON ml.vehicle_id = v.id
        LEFT JOIN trips           t  ON t.vehicle_id = v.id AND t.status = 'COMPLETED'
        GROUP BY v.id, v.registration_number, v.vehicle_name, v.vehicle_type, v.acquisition_cost
        ORDER BY v.id;
    `;
    const { rows } = await pool.query(sql);
    return rows.map(r => {
        const acquisitionCost = parseFloat(r.acquisition_cost);
        const fuelCost = parseFloat(r.total_fuel_cost);
        const maintCost = parseFloat(r.total_maintenance_cost);
        const totalCost = fuelCost + maintCost;
        return {
            vehicleId: r.id,
            registrationNumber: r.registration_number,
            vehicleName: r.vehicle_name,
            vehicleType: r.vehicle_type,
            acquisitionCost,
            totalFuelCost: fuelCost,
            totalMaintenanceCost: maintCost,
            totalCost: parseFloat(totalCost.toFixed(2)),
            completedTrips: parseInt(r.completed_trips, 10),
            // Revenue not tracked in schema — frontend can overlay when available
            revenue: null,
            roi: null
        };
    });
}
