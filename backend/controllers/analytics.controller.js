import {
    getFuelEfficiency,
    getFleetUtilization,
    getOperationalCost,
    getVehicleROI
} from "../models/analytics.model.js";
import { reportFormatSchema } from "../schemas/analytics.schema.js";

// ─── CSV helper ────────────────────────────────────────────────────────────────

/**
 * Converts an array of flat objects to a CSV string.
 * @param {object[]} rows
 * @returns {string}
 */
function toCSV(rows) {
    if (!rows || rows.length === 0) return "";
    const headers = Object.keys(rows[0]);
    const csvRows = [
        headers.join(","),
        ...rows.map(row =>
            headers
                .map(h => {
                    const val = row[h];
                    if (val === null || val === undefined) return "";
                    const str = String(val);
                    // Wrap in quotes if contains comma, quote or newline
                    return str.includes(",") || str.includes('"') || str.includes("\n")
                        ? `"${str.replace(/"/g, '""')}"`
                        : str;
                })
                .join(",")
        )
    ];
    return csvRows.join("\n");
}

/**
 * Sends data as a CSV download response.
 * @param {import('express').Response} res - The Express response object.
 * @param {string} filename - The desired filename for the download.
 * @param {object[]} data - The data to convert to CSV.
 */
function sendCSV(res, filename, data) {
    const csv = toCSV(data);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.status(200).send(csv);
}

/**
 * @typedef {import('express').Request} GetAnalyticsSummaryRequest
 * @typedef {import('express').Response} GetAnalyticsSummaryResponse
 */

/**
 * Returns all analytics in one payload.
 * @param {GetAnalyticsSummaryRequest} req - The Express request object.
 * @param {GetAnalyticsSummaryResponse} res - The Express response object.
 * @returns {Promise<GetAnalyticsSummaryResponse>}
 */
export const getAnalyticsSummary = async (req, res) => {
    try {
        const [fuelEfficiency, fleetUtilization, operationalCost, vehicleROI] = await Promise.all([
            getFuelEfficiency(),
            getFleetUtilization(),
            getOperationalCost(),
            getVehicleROI()
        ]);

        return res.status(200).json({
            fuelEfficiency,
            fleetUtilization,
            operationalCost,
            vehicleROI
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error fetching analytics.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof reportFormatSchema>} ReportFormatQuery
 * @typedef {import('express').Request<{}, {}, {}, ReportFormatQuery>} ReportRequest
 * @typedef {import('express').Response} ReportResponse
 */

/**
 * Gets the fuel efficiency report, optionally in CSV format.
 * @param {ReportRequest} req - The Express request object.
 * @param {ReportResponse} res - The Express response object.
 * @returns {Promise<void | ReportResponse>}
 */
export const getFuelEfficiencyReport = async (req, res) => {
    const validation = reportFormatSchema.safeParse(req.query);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }

    try {
        const data = await getFuelEfficiency();
        if (validation.data.format === "csv") {
            return sendCSV(res, "fuel_efficiency.csv", data);
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ msg: "Error fetching fuel efficiency report.", error: error.message });
    }
};

/**
 * Gets the fleet utilization report, optionally in CSV format.
 * @param {ReportRequest} req - The Express request object.
 * @param {ReportResponse} res - The Express response object.
 * @returns {Promise<void | ReportResponse>}
 */
export const getFleetUtilizationReport = async (req, res) => {
    const validation = reportFormatSchema.safeParse(req.query);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }

    try {
        const data = await getFleetUtilization();
        if (validation.data.format === "csv") {
            return sendCSV(res, "fleet_utilization.csv", [data]);
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ msg: "Error fetching fleet utilization report.", error: error.message });
    }
};

/**
 * Gets the operational cost report, optionally in CSV format.
 * @param {ReportRequest} req - The Express request object.
 * @param {ReportResponse} res - The Express response object.
 * @returns {Promise<void | ReportResponse>}
 */
export const getOperationalCostReport = async (req, res) => {
    const validation = reportFormatSchema.safeParse(req.query);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }

    try {
        const data = await getOperationalCost();
        if (validation.data.format === "csv") {
            // Flatten nested expenses object for CSV
            const flat = [{
                fuelCost: data.fuelCost,
                maintenanceCost: data.maintenanceCost,
                expensesToll: data.expenses.toll,
                expensesMaintenance: data.expenses.maintenance,
                expensesOther: data.expenses.other,
                expensesTotal: data.expenses.total,
                grandTotal: data.grandTotal
            }];
            return sendCSV(res, "operational_cost.csv", flat);
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ msg: "Error fetching operational cost report.", error: error.message });
    }
};

/**
 * Gets the vehicle ROI report, optionally in CSV format.
 * @param {ReportRequest} req - The Express request object.
 * @param {ReportResponse} res - The Express response object.
 * @returns {Promise<void | ReportResponse>}
 */
export const getVehicleROIReport = async (req, res) => {
    const validation = reportFormatSchema.safeParse(req.query);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }

    try {
        const data = await getVehicleROI();
        if (validation.data.format === "csv") {
            return sendCSV(res, "vehicle_roi.csv", data);
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ msg: "Error fetching vehicle ROI report.", error: error.message });
    }
};
