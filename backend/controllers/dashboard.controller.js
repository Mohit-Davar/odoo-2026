import {
    getDashboardKPIs,
    getRecentTrips,
    getVehicleStatusDistribution,
    getOperationalStats
} from "../models/dashboard.model.js";
import { dashboardQuerySchema } from "../schemas/dashboard.schema.js";

/**
 * @typedef {import('zod').infer<typeof dashboardQuerySchema>} DashboardQuery
 * @typedef {import('express').Request<{}, {}, {}, DashboardQuery>} DashboardRequest
 * @typedef {import('express').Response} DashboardResponse
 */

/**
 * Returns complete dashboard data: KPIs, recent trips, vehicle distribution, operational stats.
 * Supports optional ?limit=N query param for recent trips count.
 * @param {DashboardRequest} req - The Express request object.
 * @param {DashboardResponse} res - The Express response object.
 * @returns {Promise<DashboardResponse>}
 */
export const getDashboard = async (req, res) => {
    const validation = dashboardQuerySchema.safeParse(req.query);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { limit = 10 } = validation.data;

    try {
        const [kpis, recentTrips, vehicleStatusDistribution, operationalStats] = await Promise.all([
            getDashboardKPIs(),
            getRecentTrips(limit),
            getVehicleStatusDistribution(),
            getOperationalStats()
        ]);

        return res.status(200).json({
            kpis,
            recentTrips,
            vehicleStatusDistribution,
            operationalStats
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error fetching dashboard data.",
            error: error.message
        });
    }
};
