import {
    createDriver,
    findDriverById,
    findDriverByLicenseNumber,
    getAllDrivers,
    updateDriver,
    deleteDriver
} from "../models/driver.model.js";

/**
 * Registers a new driver in the system
 */
export const registerDriver = async (req, res) => {
    try {
        const {
            fullName,
            licenseNumber,
            licenseCategory,
            licenseExpiryDate,
            contactNumber,
            rating,
            status
        } = req.body;

        // Thorough validation checks
        if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
            return res.status(400).json({ msg: "fullName must be a non-empty string." });
        }
        if (!licenseNumber || typeof licenseNumber !== 'string' || !licenseNumber.trim()) {
            return res.status(400).json({ msg: "licenseNumber must be a non-empty string." });
        }
        if (!licenseCategory || typeof licenseCategory !== 'string' || !licenseCategory.trim()) {
            return res.status(400).json({ msg: "licenseCategory must be a non-empty string." });
        }
        if (!licenseExpiryDate || isNaN(Date.parse(licenseExpiryDate))) {
            return res.status(400).json({ msg: "licenseExpiryDate must be a valid date." });
        }
        if (contactNumber !== undefined && contactNumber !== null && typeof contactNumber !== 'string') {
            return res.status(400).json({ msg: "contactNumber must be a string." });
        }
        if (rating !== undefined && rating !== null && (typeof rating !== 'number' || isNaN(rating) || rating < 0 || rating > 100)) {
            return res.status(400).json({ msg: "rating must be a number between 0 and 100." });
        }
        
        const validStatuses = ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'];
        const formattedStatus = status ? status.toUpperCase() : 'AVAILABLE';
        if (status && !validStatuses.includes(formattedStatus)) {
            return res.status(400).json({ msg: `status must be one of: ${validStatuses.join(', ')}` });
        }

        // Check if license number already exists
        const existingDriver = await findDriverByLicenseNumber(licenseNumber);
        if (existingDriver) {
            return res.status(400).json({
                msg: `A driver with license number '${licenseNumber}' is already registered.`
            });
        }

        const newDriver = await createDriver({
            fullName,
            licenseNumber,
            licenseCategory,
            licenseExpiryDate,
            contactNumber,
            rating,
            status: formattedStatus
        });

        res.status(201).json({
            msg: "Driver registered successfully.",
            driver: newDriver
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error registering driver.",
            error: error.message
        });
    }
};

/**
 * Retrieves all registered drivers
 */
export const getDrivers = async (req, res) => {
    try {
        const drivers = await getAllDrivers();
        res.status(200).json(drivers);
    } catch (error) {
        res.status(500).json({
            msg: "Error fetching drivers list.",
            error: error.message
        });
    }
};

/**
 * Retrieves details for a single driver
 */
export const getDriverDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const driver = await findDriverById(id);
        if (!driver) {
            return res.status(404).json({
                msg: "Driver not found."
            });
        }
        res.status(200).json(driver);
    } catch (error) {
        res.status(500).json({
            msg: "Error retrieving driver details.",
            error: error.message
        });
    }
};

/**
 * Updates a driver's details
 */
export const updateDriverDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const existingDriver = await findDriverById(id);
        if (!existingDriver) {
            return res.status(404).json({
                msg: "Driver not found."
            });
        }

        const {
            fullName,
            licenseNumber,
            licenseCategory,
            licenseExpiryDate,
            contactNumber,
            rating,
            status
        } = req.body;

        // Validation for update payload
        if (fullName !== undefined && (typeof fullName !== 'string' || !fullName.trim())) {
            return res.status(400).json({ msg: "fullName must be a non-empty string." });
        }
        if (licenseNumber !== undefined && (typeof licenseNumber !== 'string' || !licenseNumber.trim())) {
            return res.status(400).json({ msg: "licenseNumber must be a non-empty string." });
        }
        if (licenseCategory !== undefined && (typeof licenseCategory !== 'string' || !licenseCategory.trim())) {
            return res.status(400).json({ msg: "licenseCategory must be a non-empty string." });
        }
        if (licenseExpiryDate !== undefined && (!licenseExpiryDate || isNaN(Date.parse(licenseExpiryDate)))) {
            return res.status(400).json({ msg: "licenseExpiryDate must be a valid date." });
        }
        if (contactNumber !== undefined && contactNumber !== null && typeof contactNumber !== 'string') {
            return res.status(400).json({ msg: "contactNumber must be a string." });
        }
        if (rating !== undefined && (typeof rating !== 'number' || isNaN(rating) || rating < 0 || rating > 100)) {
            return res.status(400).json({ msg: "rating must be a number between 0 and 100." });
        }
        
        const validStatuses = ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'];
        const formattedStatus = status ? status.toUpperCase() : undefined;
        if (status !== undefined && (!formattedStatus || !validStatuses.includes(formattedStatus))) {
            return res.status(400).json({ msg: `status must be one of: ${validStatuses.join(', ')}` });
        }

        const updatedName = fullName ? fullName.trim() : existingDriver.fullName;
        const updatedLicenseNumber = licenseNumber ? licenseNumber.trim() : existingDriver.licenseNumber;
        const updatedCategory = licenseCategory ? licenseCategory.trim() : existingDriver.licenseCategory;
        const updatedExpiry = licenseExpiryDate || existingDriver.licenseExpiryDate;
        const updatedContact = contactNumber !== undefined ? contactNumber : existingDriver.contactNumber;
        const updatedRating = rating !== undefined ? rating : existingDriver.rating;
        const updatedStatus = formattedStatus || existingDriver.status;

        // Check if updated license number is already taken by another driver
        if (licenseNumber && licenseNumber !== existingDriver.licenseNumber) {
            const taken = await findDriverByLicenseNumber(licenseNumber);
            if (taken) {
                return res.status(400).json({
                    msg: `License number '${licenseNumber}' is already registered to another driver.`
                });
            }
        }

        const updated = await updateDriver(id, {
            fullName: updatedName,
            licenseNumber: updatedLicenseNumber,
            licenseCategory: updatedCategory,
            licenseExpiryDate: updatedExpiry,
            contactNumber: updatedContact,
            rating: updatedRating,
            status: updatedStatus
        });

        res.status(200).json({
            msg: "Driver details updated successfully.",
            driver: updated
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error updating driver details.",
            error: error.message
        });
    }
};

/**
 * Deletes a driver by ID
 */
export const deleteDriverRecord = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteDriver(id);
        if (!deleted) {
            return res.status(404).json({
                msg: "Driver not found."
            });
        }
        res.status(200).json({
            msg: "Driver deleted successfully."
        });
    } catch (error) {
        res.status(500).json({
            msg: "Error deleting driver record.",
            error: error.message
        });
    }
};
