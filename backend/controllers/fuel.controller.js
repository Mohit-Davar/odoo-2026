import { createFuelLog, getAllFuelLogs } from "../models/fuel.model.js";
import { createFuelLogSchema } from "../schemas/fuel.schema.js";
import { pool } from "../config/db.js";

/**
 * Registers a new fuel log
 */
export const addFuelLog = async (req, res) => {
    const validation = createFuelLogSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const fuelData = validation.data;

    try {
        // Validate vehicle exists
        const vehicleRes = await pool.query("SELECT id FROM vehicles WHERE id = $1", [fuelData.vehicleId]);
        if (vehicleRes.rows.length === 0) {
            return res.status(404).json({ msg: "Vehicle not found." });
        }

        // Validate trip exists if provided
        if (fuelData.tripId) {
            const tripRes = await pool.query("SELECT id FROM trips WHERE id = $1", [fuelData.tripId]);
            if (tripRes.rows.length === 0) {
                return res.status(404).json({ msg: "Trip not found." });
            }
        }

        const newLog = await createFuelLog(fuelData);
        return res.status(201).json({
            msg: "Fuel log recorded successfully.",
            fuelLog: newLog
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error recording fuel log.",
            error: error.message
        });
    }
};

/**
 * Retrieves all fuel logs
 */
export const getFuelLogs = async (req, res) => {
    try {
        const logs = await getAllFuelLogs();
        return res.status(200).json(logs);
    } catch (error) {
        return res.status(500).json({
            msg: "Error fetching fuel logs.",
            error: error.message
        });
    }
};
