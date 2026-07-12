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
 * Creates a new maintenance log
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
 * Retrieves all maintenance logs
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
 * Retrieves a single maintenance log by ID
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
 * Updates a maintenance log
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
 * Deletes a maintenance log
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
