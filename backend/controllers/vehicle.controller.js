import {
    createVehicle,
    findVehicleById,
    findVehicleByRegistrationNumber,
    getAllVehicles,
    updateVehicle,
    deleteVehicle
} from "../models/vehicle.model.js";
import { registerVehicleSchema, updateVehicleSchema } from "../schemas/vehicle.schema.js";
import { idParamSchema } from "../schemas/generic.schema.js";

/**
 * @typedef {import('zod').infer<typeof registerVehicleSchema>} RegisterVehicleBody
 * @typedef {import('express').Request<{}, {}, RegisterVehicleBody>} RegisterVehicleRequest
 * @typedef {import('express').Response} RegisterVehicleResponse
 */

/**
 * Registers a new vehicle in the system.
 * @param {RegisterVehicleRequest} req The Express request object, containing vehicle details in the body.
 * @param {RegisterVehicleResponse} res The Express response object.
 * @returns {Promise<void | RegisterVehicleResponse>}
 */
export const registerVehicle = async (req, res) => {
    const validation = registerVehicleSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const vehicleData = validation.data;

    try {
        const existingVehicle = await findVehicleByRegistrationNumber(vehicleData.registrationNumber);
        if (existingVehicle) {
            return res.status(400).json({
                msg: `A vehicle with registration number '${vehicleData.registrationNumber}' is already registered.`
            });
        }

        const newVehicle = await createVehicle(vehicleData);

        return res.status(201).json({
            msg: "Vehicle registered successfully.",
            vehicle: newVehicle
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error registering vehicle.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('express').Request} GetVehiclesRequest
 * @typedef {import('express').Response} GetVehiclesResponse
 */

/**
 * Retrieves all registered vehicles.
 * @param {GetVehiclesRequest} req The Express request object.
 * @param {GetVehiclesResponse} res The Express response object.
 * @returns {Promise<GetVehiclesResponse>}
 */
export const getVehicles = async (req, res) => {
    try {
        const vehicles = await getAllVehicles();
        return res.status(200).json(vehicles);
    } catch (error) {
        return res.status(500).json({
            msg: "Error fetching vehicles list.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} GetVehicleDetailParams
 * @typedef {import('express').Request<GetVehicleDetailParams>} GetVehicleDetailRequest
 * @typedef {import('express').Response} GetVehicleDetailResponse
 */

/**
 * Retrieves a single vehicle's details by its ID.
 * @param {GetVehicleDetailRequest} req The Express request object, containing the vehicle ID in params.
 * @param {GetVehicleDetailResponse} res The Express response object.
 * @returns {Promise<void | GetVehicleDetailResponse>}
 */
export const getVehicleDetail = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    try {
        const vehicle = await findVehicleById(id);
        if (!vehicle) {
            return res.status(404).json({
                msg: "Vehicle not found."
            });
        }
        return res.status(200).json(vehicle);
    } catch (error) {
        return res.status(500).json({
            msg: "Error retrieving vehicle details.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} UpdateVehicleParams
 * @typedef {import('zod').infer<typeof updateVehicleSchema>} UpdateVehicleBody
 * @typedef {import('express').Request<UpdateVehicleParams, {}, UpdateVehicleBody>} UpdateVehicleRequest
 * @typedef {import('express').Response} UpdateVehicleResponse
 */

/**
 * Updates an existing vehicle's details.
 * @param {UpdateVehicleRequest} req The Express request object, containing the vehicle ID in params and updated details in the body.
 * @param {UpdateVehicleResponse} res The Express response object.
 * @returns {Promise<void | UpdateVehicleResponse>}
 */
export const updateVehicleDetails = async (req, res) => {
    const paramsValidation = idParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({ errors: paramsValidation.error.format() });
    }
    const { id } = paramsValidation.data;

    const bodyValidation = updateVehicleSchema.safeParse(req.body);
    if (!bodyValidation.success) {
        return res.status(400).json({ errors: bodyValidation.error.format() });
    }
    const updateData = bodyValidation.data;

    try {
        const existingVehicle = await findVehicleById(id);
        if (!existingVehicle) {
            return res.status(404).json({
                msg: "Vehicle not found."
            });
        }

        if (updateData.registrationNumber && updateData.registrationNumber !== existingVehicle.registrationNumber) {
            const taken = await findVehicleByRegistrationNumber(updateData.registrationNumber);
            if (taken) {
                return res.status(400).json({
                    msg: `Registration number '${updateData.registrationNumber}' is already registered to another vehicle.`
                });
            }
        }

        const updated = await updateVehicle(id, { ...existingVehicle, ...updateData });

        return res.status(200).json({
            msg: "Vehicle details updated successfully.",
            vehicle: updated
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error updating vehicle details.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} DeleteVehicleParams
 * @typedef {import('express').Request<DeleteVehicleParams>} DeleteVehicleRequest
 * @typedef {import('express').Response} DeleteVehicleResponse
 */

/**
 * Deletes a vehicle by its ID.
 * @param {DeleteVehicleRequest} req The Express request object, containing the vehicle ID in params.
 * @param {DeleteVehicleResponse} res The Express response object.
 * @returns {Promise<void | DeleteVehicleResponse>}
 */
export const deleteVehicleRecord = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    try {
        const deleted = await deleteVehicle(id);
        if (!deleted) {
            return res.status(404).json({
                msg: "Vehicle not found."
            });
        }
        return res.status(200).json({
            msg: "Vehicle deleted successfully."
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error deleting vehicle.",
            error: error.message
        });
    }
};
