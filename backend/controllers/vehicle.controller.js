import {
    createVehicle,
    findVehicleById,
    findVehicleByRegistrationNumber,
    getAllVehicles,
    updateVehicle,
    deleteVehicle
} from "../models/vehicle.model.js";

/**
 * Registers a new vehicle in the system
 */
export const registerVehicle = async (req, res) => {
    try {
        const {
            registrationNumber,
            vehicleName,
            vehicleType,
            maxLoadCapacityKg,
            odometerKm,
            acquisitionCost,
            status
        } = req.body;

        // Validation
        if (!registrationNumber || !vehicleName || !vehicleType || maxLoadCapacityKg === undefined || acquisitionCost === undefined) {
            return res.status(400).json({
                msg: "registrationNumber, vehicleName, vehicleType, maxLoadCapacityKg, and acquisitionCost are required fields."
            });
        }

        if (maxLoadCapacityKg <= 0) {
            return res.status(400).json({
                msg: "Max load capacity must be greater than 0."
            });
        }

        if (acquisitionCost < 0) {
            return res.status(400).json({
                msg: "Acquisition cost cannot be negative."
            });
        }

        if (odometerKm !== undefined && odometerKm < 0) {
            return res.status(400).json({
                msg: "Odometer reading cannot be negative."
            });
        }

        // Check if registration number already exists
        const existingVehicle = await findVehicleByRegistrationNumber(registrationNumber);
        if (existingVehicle) {
            return res.status(400).json({
                msg: `A vehicle with registration number '${registrationNumber}' is already registered.`
            });
        }

        const newVehicle = await createVehicle({
            registrationNumber,
            vehicleName,
            vehicleType,
            maxLoadCapacityKg,
            odometerKm,
            acquisitionCost,
            status
        });

        res.status(201).json({
            msg: "Vehicle registered successfully.",
            vehicle: newVehicle
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error registering vehicle.",
            error: error.message
        });
    }
};

/**
 * Retrieves all registered vehicles
 */
export const getVehicles = async (req, res) => {
    try {
        const vehicles = await getAllVehicles();
        res.status(200).json(vehicles);
    } catch (error) {
        res.status(500).json({
            msg: "Error fetching vehicles list.",
            error: error.message
        });
    }
};

/**
 * Retrieves a single vehicle details by ID
 */
export const getVehicleDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const vehicle = await findVehicleById(id);
        if (!vehicle) {
            return res.status(404).json({
                msg: "Vehicle not found."
            });
        }
        res.status(200).json(vehicle);
    } catch (error) {
        res.status(500).json({
            msg: "Error retrieving vehicle details.",
            error: error.message
        });
    }
};

/**
 * Updates an existing vehicle's details
 */
export const updateVehicleDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const existingVehicle = await findVehicleById(id);
        if (!existingVehicle) {
            return res.status(404).json({
                msg: "Vehicle not found."
            });
        }

        const {
            registrationNumber,
            vehicleName,
            vehicleType,
            maxLoadCapacityKg,
            odometerKm,
            acquisitionCost,
            status
        } = req.body;

        // Validation for update payload
        const updatedRegNumber = registrationNumber || existingVehicle.registrationNumber;
        const updatedVehicleName = vehicleName || existingVehicle.vehicleName;
        const updatedVehicleType = vehicleType || existingVehicle.vehicleType;
        const updatedMaxLoad = maxLoadCapacityKg !== undefined ? maxLoadCapacityKg : existingVehicle.maxLoadCapacityKg;
        const updatedOdometer = odometerKm !== undefined ? odometerKm : existingVehicle.odometerKm;
        const updatedCost = acquisitionCost !== undefined ? acquisitionCost : existingVehicle.acquisitionCost;
        const updatedStatus = status || existingVehicle.status;

        if (updatedMaxLoad <= 0) {
            return res.status(400).json({
                msg: "Max load capacity must be greater than 0."
            });
        }

        if (updatedCost < 0) {
            return res.status(400).json({
                msg: "Acquisition cost cannot be negative."
            });
        }

        if (updatedOdometer < 0) {
            return res.status(400).json({
                msg: "Odometer reading cannot be negative."
            });
        }

        // Check if the registration number changed and is already taken by another vehicle
        if (registrationNumber && registrationNumber !== existingVehicle.registrationNumber) {
            const taken = await findVehicleByRegistrationNumber(registrationNumber);
            if (taken) {
                return res.status(400).json({
                    msg: `Registration number '${registrationNumber}' is already registered to another vehicle.`
                });
            }
        }

        const updated = await updateVehicle(id, {
            registrationNumber: updatedRegNumber,
            vehicleName: updatedVehicleName,
            vehicleType: updatedVehicleType,
            maxLoadCapacityKg: updatedMaxLoad,
            odometerKm: updatedOdometer,
            acquisitionCost: updatedCost,
            status: updatedStatus
        });

        res.status(200).json({
            msg: "Vehicle details updated successfully.",
            vehicle: updated
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error updating vehicle details.",
            error: error.message
        });
    }
};

/**
 * Deletes a vehicle by its ID
 */
export const deleteVehicleRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteVehicle(id);
        if (!deleted) {
            return res.status(404).json({
                msg: "Vehicle not found."
            });
        }
        res.status(200).json({
            msg: "Vehicle deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error deleting vehicle.",
            error: error.message
        });
    }
};
