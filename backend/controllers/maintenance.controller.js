import {
    createMaintenanceLog,
    findMaintenanceById,
    getAllMaintenanceLogs,
    updateMaintenanceLog,
    deleteMaintenanceLog
} from "../models/maintenance.model.js";
import { findVehicleById } from "../models/vehicle.model.js";
import { registerMaintenanceSchema, updateMaintenanceSchema } from "../schemas/maintenance.schema.js";
import { idParamSchema } from "../schemas/generic.schema.js";

/**
 * @typedef {import('zod').infer<typeof registerMaintenanceSchema>} RegisterMaintenanceBody
 * @typedef {import('express').Request<{}, {}, RegisterMaintenanceBody>} RegisterMaintenanceRequest
 * @typedef {import('express').Response} RegisterMaintenanceResponse
 */

/**
 * Creates a new maintenance log.
 * @param {RegisterMaintenanceRequest} req - The Express request object.
 * @param {RegisterMaintenanceResponse} res - The Express response object.
 * @returns {Promise<void | RegisterMaintenanceResponse>}
 */
export const registerMaintenance = async (req, res) => {
    const validation = registerMaintenanceSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const data = validation.data;

    try {
        const vehicle = await findVehicleById(data.vehicleId);
        if (!vehicle) {
            return res.status(404).json({ msg: "Vehicle not found." });
        }
        if (vehicle.status === 'RETIRED') {
            return res.status(400).json({ msg: "Cannot create maintenance log for a retired vehicle." });
        }
        if (vehicle.status === 'ON_TRIP') {
            return res.status(400).json({ msg: "Cannot create maintenance log for a vehicle that is currently on an active trip." });
        }
        
        const newLog = await createMaintenanceLog(data);

        return res.status(201).json({
            msg: "Maintenance log created successfully.",
            maintenanceLog: newLog
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error creating maintenance log.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('express').Request} GetMaintenanceLogsRequest
 * @typedef {import('express').Response} GetMaintenanceLogsResponse
 */

/**
 * Retrieves all maintenance logs.
 * @param {GetMaintenanceLogsRequest} req - The Express request object.
 * @param {GetMaintenanceLogsResponse} res - The Express response object.
 * @returns {Promise<GetMaintenanceLogsResponse>}
 */
export const getMaintenanceLogs = async (req, res) => {
    try {
        const logs = await getAllMaintenanceLogs();
        return res.status(200).json(logs);
    } catch (error) {
        return res.status(500).json({
            msg: "Error fetching maintenance logs.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} GetMaintenanceDetailParams
 * @typedef {import('express').Request<GetMaintenanceDetailParams>} GetMaintenanceDetailRequest
 * @typedef {import('express').Response} GetMaintenanceDetailResponse
 */

/**
 * Retrieves a single maintenance log by ID.
 * @param {GetMaintenanceDetailRequest} req - The Express request object.
 * @param {GetMaintenanceDetailResponse} res - The Express response object.
 * @returns {Promise<void | GetMaintenanceDetailResponse>}
 */
export const getMaintenanceDetail = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    try {
        const log = await findMaintenanceById(id);
        if (!log) {
            return res.status(404).json({ msg: "Maintenance log not found." });
        }
        return res.status(200).json(log);
    } catch (error) {
        return res.status(500).json({
            msg: "Error retrieving maintenance details.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} UpdateMaintenanceParams
 * @typedef {import('zod').infer<typeof updateMaintenanceSchema>} UpdateMaintenanceBody
 * @typedef {import('express').Request<UpdateMaintenanceParams, {}, UpdateMaintenanceBody>} UpdateMaintenanceRequest
 * @typedef {import('express').Response} UpdateMaintenanceResponse
 */

/**
 * Updates a maintenance log.
 * @param {UpdateMaintenanceRequest} req - The Express request object.
 * @param {UpdateMaintenanceResponse} res - The Express response object.
 * @returns {Promise<void | UpdateMaintenanceResponse>}
 */
export const updateMaintenanceDetails = async (req, res) => {
    const paramsValidation = idParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({ errors: paramsValidation.error.format() });
    }
    const { id } = paramsValidation.data;

    const bodyValidation = updateMaintenanceSchema.safeParse(req.body);
    if (!bodyValidation.success) {
        return res.status(400).json({ errors: bodyValidation.error.format() });
    }
    const updateData = bodyValidation.data;

    try {
        const existingLog = await findMaintenanceById(id);
        if (!existingLog) {
            return res.status(404).json({ msg: "Maintenance log not found." });
        }

        if (updateData.vehicleId && updateData.vehicleId !== existingLog.vehicleId) {
            const vehicle = await findVehicleById(updateData.vehicleId);
            if (!vehicle) {
                return res.status(404).json({ msg: "Vehicle not found." });
            }
            if (vehicle.status === 'RETIRED') {
                return res.status(400).json({ msg: "Cannot reassign maintenance log to a retired vehicle." });
            }
            if (vehicle.status === 'ON_TRIP') {
                return res.status(400).json({ msg: "Cannot reassign maintenance log to a vehicle currently on an active trip." });
            }
        }

        const updatedLog = await updateMaintenanceLog(id, { ...existingLog, ...updateData });

        return res.status(200).json({
            msg: "Maintenance details updated successfully.",
            maintenanceLog: updatedLog
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error updating maintenance log.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} DeleteMaintenanceParams
 * @typedef {import('express').Request<DeleteMaintenanceParams>} DeleteMaintenanceRequest
 * @typedef {import('express').Response} DeleteMaintenanceResponse
 */

/**
 * Deletes a maintenance log.
 * @param {DeleteMaintenanceRequest} req - The Express request object.
 * @param {DeleteMaintenanceResponse} res - The Express response object.
 * @returns {Promise<void | DeleteMaintenanceResponse>}
 */
export const deleteMaintenanceRecord = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    try {
        const deleted = await deleteMaintenanceLog(id);
        if (!deleted) {
            return res.status(404).json({ msg: "Maintenance log not found." });
        }
        return res.status(200).json({
            msg: "Maintenance log deleted successfully."
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error deleting maintenance log.",
            error: error.message
        });
    }
};
