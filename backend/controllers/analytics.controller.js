import {
    getFuelEfficiency,
    getFleetUtilization,
    getOperationalCost,
    getVehicleROI
} from "../models/analytics.model.js";
import { reportFormatSchema } from "../schemas/analytics.schema.js";
import PDFDocument from 'pdfkit';

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
 * Sends data as a PDF download response.
 * @param {import('express').Response} res - The Express response object.
 * @param {string} filename - The desired filename for the download.
 * @param {object[]} data - The data to include in the PDF.
 * @param {string} title - The title of the report.
 */
function sendPDF(res, filename, data, title) {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();

    // Table
    if (data && data.length > 0) {
        const tableTop = doc.y;
        const headers = Object.keys(data[0]);
        const colWidths = headers.map(() => (doc.page.width - 60) / headers.length);

        // Draw headers
        doc.fontSize(10).font('Helvetica-Bold');
        headers.forEach((header, i) => {
            doc.text(header.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), doc.x + (i === 0 ? 0 : 10), doc.y, { width: colWidths[i], align: 'left' });
            doc.x += colWidths[i];
            doc.y = tableTop;
        });
        doc.moveDown();
        const headerBottom = doc.y;
        doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(30, headerBottom).lineTo(doc.page.width - 30, headerBottom).stroke();
        
        // Draw rows
        doc.font('Helvetica');
        data.forEach(row => {
            const rowTop = doc.y;
            headers.forEach((header, i) => {
                const text = (row[header] === null || row[header] === undefined) ? 'N/A' : String(row[header]);
                doc.text(text, 30 + colWidths.slice(0, i).reduce((a, b) => a + b, 0), rowTop, { width: colWidths[i], align: 'left' });
            });
            doc.moveDown();
            const rowBottom = doc.y;
            doc.strokeColor("#eeeeee").lineWidth(0.5).moveTo(30, rowBottom).lineTo(doc.page.width - 30, rowBottom).stroke();
        });
    } else {
        doc.fontSize(12).text('No data available for this report.', { align: 'center' });
    }

    doc.end();
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
        if (validation.data.format === "pdf") {
            return sendPDF(res, "fuel_efficiency.pdf", data, "Fuel Efficiency Report");
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
        if (validation.data.format === "pdf") {
            // pdfkit works better with an array of objects
            return sendPDF(res, "fleet_utilization.pdf", [data], "Fleet Utilization Report");
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
        const flatData = [{
            fuelCost: data.fuelCost,
            maintenanceCost: data.maintenanceCost,
            expensesToll: data.expenses.toll,
            expensesMaintenance: data.expenses.maintenance,
            expensesOther: data.expenses.other,
            expensesTotal: data.expenses.total,
            grandTotal: data.grandTotal
        }];

        if (validation.data.format === "csv") {
            return sendCSV(res, "operational_cost.csv", flatData);
        }
        if (validation.data.format === "pdf") {
            return sendPDF(res, "operational_cost.pdf", flatData, "Operational Cost Report");
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
        if (validation.data.format === "pdf") {
            return sendPDF(res, "vehicle_roi.pdf", data, "Vehicle ROI Report");
        }
        return res.status(200).json(data);
    } catch (error) {
        return res.status(500).json({ msg: "Error fetching vehicle ROI report.", error: error.message });
    }
};
