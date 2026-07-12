import {
    createFuelLog,
    getAllFuelLogs,
    findFuelLogById,
    updateFuelLog,
    deleteFuelLog
} from "../models/fuel.model.js";
import { createFuelLogSchema, updateFuelLogSchema } from "../schemas/fuel.schema.js";
import { idParamSchema } from "../schemas/generic.schema.js";
import { pool } from "../config/db.js";

/**
 * @typedef {import('zod').infer<typeof createFuelLogSchema>} CreateFuelLogBody
 * @typedef {import('express').Request<{}, {}, CreateFuelLogBody>} CreateFuelLogRequest
 * @typedef {import('express').Response} CreateFuelLogResponse
 */

/**
 * Registers a new fuel log.
 * @param {CreateFuelLogRequest} req - The Express request object.
 * @param {CreateFuelLogResponse} res - The Express response object.
 * @returns {Promise<void | CreateFuelLogResponse>}
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
 * @typedef {import('express').Request} GetFuelLogsRequest
 * @typedef {import('express').Response} GetFuelLogsResponse
 */

/**
 * Retrieves all fuel logs.
 * @param {GetFuelLogsRequest} req - The Express request object.
 * @param {GetFuelLogsResponse} res - The Express response object.
 * @returns {Promise<GetFuelLogsResponse>}
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

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} GetFuelLogDetailParams
 * @typedef {import('express').Request<GetFuelLogDetailParams>} GetFuelLogDetailRequest
 * @typedef {import('express').Response} GetFuelLogDetailResponse
 */

/**
 * Retrieves a single fuel log by ID.
 * @param {GetFuelLogDetailRequest} req - The Express request object.
 * @param {GetFuelLogDetailResponse} res - The Express response object.
 * @returns {Promise<void | GetFuelLogDetailResponse>}
 */
export const getFuelLogDetail = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    try {
        const log = await findFuelLogById(id);
        if (!log) {
            return res.status(404).json({ msg: "Fuel log not found." });
        }
        return res.status(200).json(log);
    } catch (error) {
        return res.status(500).json({
            msg: "Error retrieving fuel log.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} UpdateFuelLogParams
 * @typedef {import('zod').infer<typeof updateFuelLogSchema>} UpdateFuelLogBody
 * @typedef {import('express').Request<UpdateFuelLogParams, {}, UpdateFuelLogBody>} UpdateFuelLogRequest
 * @typedef {import('express').Response} UpdateFuelLogResponse
 */

/**
 * Updates an existing fuel log.
 * @param {UpdateFuelLogRequest} req - The Express request object.
 * @param {UpdateFuelLogResponse} res - The Express response object.
 * @returns {Promise<void | UpdateFuelLogResponse>}
 */
export const updateFuelLogDetails = async (req, res) => {
    const paramsValidation = idParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({ errors: paramsValidation.error.format() });
    }
    const { id } = paramsValidation.data;

    const bodyValidation = updateFuelLogSchema.safeParse(req.body);
    if (!bodyValidation.success) {
        return res.status(400).json({ errors: bodyValidation.error.format() });
    }
    const updateData = bodyValidation.data;

    try {
        const existing = await findFuelLogById(id);
        if (!existing) {
            return res.status(404).json({ msg: "Fuel log not found." });
        }

        // Validate vehicle exists if being changed
        if (updateData.vehicleId) {
            const vehicleRes = await pool.query("SELECT id FROM vehicles WHERE id = $1", [updateData.vehicleId]);
            if (vehicleRes.rows.length === 0) {
                return res.status(404).json({ msg: "Vehicle not found." });
            }
        }

        // Validate trip exists if being changed
        if (updateData.tripId) {
            const tripRes = await pool.query("SELECT id FROM trips WHERE id = $1", [updateData.tripId]);
            if (tripRes.rows.length === 0) {
                return res.status(404).json({ msg: "Trip not found." });
            }
        }

        const merged = { ...existing, ...updateData };
        const updated = await updateFuelLog(id, merged);

        return res.status(200).json({
            msg: "Fuel log updated successfully.",
            fuelLog: updated
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error updating fuel log.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} DeleteFuelLogParams
 * @typedef {import('express').Request<DeleteFuelLogParams>} DeleteFuelLogRequest
 * @typedef {import('express').Response} DeleteFuelLogResponse
 */

/**
 * Deletes a fuel log by ID.
 * @param {DeleteFuelLogRequest} req - The Express request object.
 * @param {DeleteFuelLogResponse} res - The Express response object.
 * @returns {Promise<void | DeleteFuelLogResponse>}
 */
export const deleteFuelLogRecord = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    try {
        const deleted = await deleteFuelLog(id);
        if (!deleted) {
            return res.status(404).json({ msg: "Fuel log not found." });
        }
        return res.status(200).json({ msg: "Fuel log deleted successfully." });
    } catch (error) {
        return res.status(500).json({
            msg: "Error deleting fuel log.",
            error: error.message
        });
    }
};
