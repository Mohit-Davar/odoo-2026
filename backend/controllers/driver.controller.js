import {
    createDriver,
    findDriverById,
    findDriverByLicenseNumber,
    getAllDrivers,
    updateDriver,
    deleteDriver
} from "../models/driver.model.js";
import { registerDriverSchema, updateDriverSchema } from "../schemas/driver.schema.js";
import { idParamSchema } from "../schemas/generic.schema.js";

/**
 * @typedef {import('zod').infer<typeof registerDriverSchema>} RegisterDriverBody
 * @typedef {import('express').Request<{}, {}, RegisterDriverBody>} RegisterDriverRequest
 * @typedef {import('express').Response} RegisterDriverResponse
 */

/**
 * Registers a new driver in the system.
 * @param {RegisterDriverRequest} req The Express request object, containing driver details in the body.
 * @param {RegisterDriverResponse} res The Express response object.
 * @returns {Promise<void | RegisterDriverResponse>}
 */
export const registerDriver = async (req, res) => {
    const validation = registerDriverSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const driverData = validation.data;

    try {
        const existingDriver = await findDriverByLicenseNumber(driverData.licenseNumber);
        if (existingDriver) {
            return res.status(400).json({
                msg: `A driver with license number '${driverData.licenseNumber}' is already registered.`
            });
        }

        const newDriver = await createDriver(driverData);

        return res.status(201).json({
            msg: "Driver registered successfully.",
            driver: newDriver
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error registering driver.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('express').Request} GetDriversRequest
 * @typedef {import('express').Response} GetDriversResponse
 */

/**
 * Retrieves all registered drivers.
 * @param {GetDriversRequest} req The Express request object.
 * @param {GetDriversResponse} res The Express response object.
 * @returns {Promise<GetDriversResponse>}
 */
export const getDrivers = async (req, res) => {
    try {
        const drivers = await getAllDrivers();
        return res.status(200).json(drivers);
    } catch (error) {
        return res.status(500).json({
            msg: "Error fetching drivers list.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} GetDriverDetailParams
 * @typedef {import('express').Request<GetDriverDetailParams>} GetDriverDetailRequest
 * @typedef {import('express').Response} GetDriverDetailResponse
 */

/**
 * Retrieves details for a single driver by their ID.
 * @param {GetDriverDetailRequest} req The Express request object, containing the driver ID in params.
 * @param {GetDriverDetailResponse} res The Express response object.
 * @returns {Promise<void | GetDriverDetailResponse>}
 */
export const getDriverDetail = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    try {
        const driver = await findDriverById(id);
        if (!driver) {
            return res.status(404).json({
                msg: "Driver not found."
            });
        }
        return res.status(200).json(driver);
    } catch (error) {
        return res.status(500).json({
            msg: "Error retrieving driver details.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} UpdateDriverParams
 * @typedef {import('zod').infer<typeof updateDriverSchema>} UpdateDriverBody
 * @typedef {import('express').Request<UpdateDriverParams, {}, UpdateDriverBody>} UpdateDriverRequest
 * @typedef {import('express').Response} UpdateDriverResponse
 */

/**
 * Updates a driver's details.
 * @param {UpdateDriverRequest} req The Express request object, containing the driver ID in params and updated details in the body.
 * @param {UpdateDriverResponse} res The Express response object.
 * @returns {Promise<void | UpdateDriverResponse>}
 */
export const updateDriverDetails = async (req, res) => {
    const paramsValidation = idParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({ errors: paramsValidation.error.format() });
    }
    const { id } = paramsValidation.data;

    const bodyValidation = updateDriverSchema.safeParse(req.body);
    if (!bodyValidation.success) {
        return res.status(400).json({ errors: bodyValidation.error.format() });
    }
    const updateData = bodyValidation.data;

    try {
        const existingDriver = await findDriverById(id);
        if (!existingDriver) {
            return res.status(404).json({
                msg: "Driver not found."
            });
        }

        if (updateData.licenseNumber && updateData.licenseNumber !== existingDriver.licenseNumber) {
            const taken = await findDriverByLicenseNumber(updateData.licenseNumber);
            if (taken) {
                return res.status(400).json({
                    msg: `License number '${updateData.licenseNumber}' is already registered to another driver.`
                });
            }
        }

        const updated = await updateDriver(id, { ...existingDriver, ...updateData });

        return res.status(200).json({
            msg: "Driver details updated successfully.",
            driver: updated
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error updating driver details.",
            error: error.message
        });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} DeleteDriverParams
 * @typedef {import('express').Request<DeleteDriverParams>} DeleteDriverRequest
 * @typedef {import('express').Response} DeleteDriverResponse
 */

/**
 * Deletes a driver by their ID.
 * @param {DeleteDriverRequest} req The Express request object, containing the driver ID in params.
 * @param {DeleteDriverResponse} res The Express response object.
 * @returns {Promise<void | DeleteDriverResponse>}
 */
export const deleteDriverRecord = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    try {
        const deleted = await deleteDriver(id);
        if (!deleted) {
            return res.status(404).json({
                msg: "Driver not found."
            });
        }
        return res.status(200).json({
            msg: "Driver deleted successfully."
        });
    } catch (error) {
        return res.status(500).json({
            msg: "Error deleting driver record.",
            error: error.message
        });
    }
};
