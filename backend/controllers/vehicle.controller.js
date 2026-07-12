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

        // Thorough validation checks
        if (!registrationNumber || typeof registrationNumber !== 'string' || !registrationNumber.trim()) {
            return res.status(400).json({ msg: "registrationNumber must be a non-empty string." });
        }
        if (!vehicleName || typeof vehicleName !== 'string' || !vehicleName.trim()) {
            return res.status(400).json({ msg: "vehicleName must be a non-empty string." });
        }
        if (!vehicleType || typeof vehicleType !== 'string' || !vehicleType.trim()) {
            return res.status(400).json({ msg: "vehicleType must be a non-empty string." });
        }
        if (maxLoadCapacityKg === undefined || maxLoadCapacityKg === null || typeof maxLoadCapacityKg !== 'number' || isNaN(maxLoadCapacityKg) || maxLoadCapacityKg <= 0) {
            return res.status(400).json({ msg: "maxLoadCapacityKg must be a positive number." });
        }
        if (acquisitionCost === undefined || acquisitionCost === null || typeof acquisitionCost !== 'number' || isNaN(acquisitionCost) || acquisitionCost < 0) {
            return res.status(400).json({ msg: "acquisitionCost must be a non-negative number." });
        }
        if (odometerKm !== undefined && odometerKm !== null && (typeof odometerKm !== 'number' || isNaN(odometerKm) || odometerKm < 0)) {
            return res.status(400).json({ msg: "odometerKm must be a non-negative number." });
        }
        
        const validStatuses = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];
        const formattedStatus = status ? status.toUpperCase() : 'AVAILABLE';
        if (status && !validStatuses.includes(formattedStatus)) {
            return res.status(400).json({ msg: `status must be one of: ${validStatuses.join(', ')}` });
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
            status: formattedStatus
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
        if (registrationNumber !== undefined && (typeof registrationNumber !== 'string' || !registrationNumber.trim())) {
            return res.status(400).json({ msg: "registrationNumber must be a non-empty string." });
        }
        if (vehicleName !== undefined && (typeof vehicleName !== 'string' || !vehicleName.trim())) {
            return res.status(400).json({ msg: "vehicleName must be a non-empty string." });
        }
        if (vehicleType !== undefined && (typeof vehicleType !== 'string' || !vehicleType.trim())) {
            return res.status(400).json({ msg: "vehicleType must be a non-empty string." });
        }
        if (maxLoadCapacityKg !== undefined && (typeof maxLoadCapacityKg !== 'number' || isNaN(maxLoadCapacityKg) || maxLoadCapacityKg <= 0)) {
            return res.status(400).json({ msg: "maxLoadCapacityKg must be a positive number." });
        }
        if (acquisitionCost !== undefined && (typeof acquisitionCost !== 'number' || isNaN(acquisitionCost) || acquisitionCost < 0)) {
            return res.status(400).json({ msg: "acquisitionCost must be a non-negative number." });
        }
        if (odometerKm !== undefined && (typeof odometerKm !== 'number' || isNaN(odometerKm) || odometerKm < 0)) {
            return res.status(400).json({ msg: "odometerKm must be a non-negative number." });
        }
        
        const validStatuses = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];
        const formattedStatus = status ? status.toUpperCase() : undefined;
        if (status !== undefined && (!formattedStatus || !validStatuses.includes(formattedStatus))) {
            return res.status(400).json({ msg: `status must be one of: ${validStatuses.join(', ')}` });
        }

        const updatedRegNumber = registrationNumber ? registrationNumber.trim() : existingVehicle.registrationNumber;
        const updatedVehicleName = vehicleName ? vehicleName.trim() : existingVehicle.vehicleName;
        const updatedVehicleType = vehicleType ? vehicleType.trim() : existingVehicle.vehicleType;
        const updatedMaxLoad = maxLoadCapacityKg !== undefined ? maxLoadCapacityKg : existingVehicle.maxLoadCapacityKg;
        const updatedOdometer = odometerKm !== undefined ? odometerKm : existingVehicle.odometerKm;
        const updatedCost = acquisitionCost !== undefined ? acquisitionCost : existingVehicle.acquisitionCost;
        const updatedStatus = formattedStatus || existingVehicle.status;

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
