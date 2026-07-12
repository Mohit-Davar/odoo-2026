import { pool } from "../config/db.js";
import { createTrip, getTripById, getAllTrips, updateTripStatusTransaction } from "../models/trip.model.js";
import { createDraftTripSchema, completeTripSchema } from "../schemas/trip.schema.js";
import { idParamSchema } from "../schemas/generic.schema.js";

// Utility to generate a unique trip code
function generateTripCode() {
    return 'TRP-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
}

/**
 * @typedef {import('zod').infer<typeof createDraftTripSchema>} CreateDraftTripBody
 * @typedef {import('express').Request<{}, {}, CreateDraftTripBody>} CreateDraftTripRequest
 * @typedef {import('express').Response} CreateDraftTripResponse
 */

/**
 * Creates a new trip in a 'DRAFT' state.
 * @param {CreateDraftTripRequest} req The Express request object, containing draft trip details in the body.
 * @param {CreateDraftTripResponse} res The Express response object.
 * @returns {Promise<void | CreateDraftTripResponse>}
 */
export const createDraftTrip = async (req, res) => {
    const validation = createDraftTripSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm } = validation.data;

    try {
        const vehicleRes = await pool.query('SELECT status, max_load_capacity_kg FROM vehicles WHERE id = $1', [vehicleId]);
        if (vehicleRes.rows.length === 0) {
            return res.status(404).json({ error: "Vehicle not found" });
        }
        if (parseFloat(vehicleRes.rows[0].max_load_capacity_kg) < parseFloat(cargoWeightKg)) {
            return res.status(400).json({ error: "Cargo weight exceeds vehicle capacity" });
        }

        const driverRes = await pool.query('SELECT status FROM drivers WHERE id = $1', [driverId]);
        if (driverRes.rows.length === 0) {
            return res.status(404).json({ error: "Driver not found" });
        }

        const tripCode = generateTripCode();

        const tripData = {
            tripCode,
            source,
            destination,
            vehicleId,
            driverId,
            cargoWeightKg,
            plannedDistanceKm,
            status: 'DRAFT'
        };

        const newTrip = await createTrip(tripData);
        return res.status(201).json({ message: "Draft trip created successfully", trip: newTrip });
    } catch (error) {
        console.error("Error creating draft trip:", error);
        return res.status(500).json({ error: "Failed to create trip" });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} DispatchTripParams
 * @typedef {import('express').Request<DispatchTripParams>} DispatchTripRequest
 * @typedef {import('express').Response} DispatchTripResponse
 */

/**
 * Dispatches a trip, changing its status from 'DRAFT' to 'DISPATCHED'.
 * @param {DispatchTripRequest} req The Express request object, containing the trip ID in params.
 * @param {DispatchTripResponse} res The Express response object.
 * @returns {Promise<void | DispatchTripResponse>}
 */
export const dispatchTrip = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const tripRes = await client.query('SELECT * FROM trips WHERE id = $1 FOR UPDATE', [id]);
        if (tripRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Trip not found" });
        }
        const trip = tripRes.rows[0];

        if (trip.status !== 'DRAFT') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Only draft trips can be dispatched" });
        }

        const vehicleRes = await client.query('SELECT status, max_load_capacity_kg FROM vehicles WHERE id = $1 FOR UPDATE', [trip.vehicle_id]);
        if (vehicleRes.rows.length === 0 || vehicleRes.rows[0].status !== 'AVAILABLE') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Assigned vehicle is not available" });
        }

        const driverRes = await client.query('SELECT status FROM drivers WHERE id = $1 FOR UPDATE', [trip.driver_id]);
        if (driverRes.rows.length === 0 || driverRes.rows[0].status !== 'AVAILABLE') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Assigned driver is not available" });
        }

        await client.query("UPDATE vehicles SET status = 'ON_TRIP' WHERE id = $1", [trip.vehicle_id]);
        await client.query("UPDATE drivers SET status = 'ON_TRIP' WHERE id = $1", [trip.driver_id]);

        const updatedTrip = await updateTripStatusTransaction(client, trip.id, 'DISPATCHED');

        await client.query('COMMIT');
        return res.status(200).json({ message: "Trip dispatched successfully", trip: updatedTrip });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error dispatching trip:", error);
        return res.status(500).json({ error: "Failed to dispatch trip" });
    } finally {
        client.release();
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} CompleteTripParams
 * @typedef {import('zod').infer<typeof completeTripSchema>} CompleteTripBody
 * @typedef {import('express').Request<CompleteTripParams, {}, CompleteTripBody>} CompleteTripRequest
 * @typedef {import('express').Response} CompleteTripResponse
 */

/**
 * Completes a trip, changing its status from 'DISPATCHED' to 'COMPLETED'.
 * @param {CompleteTripRequest} req The Express request object, containing trip ID in params and optional end odometer in body.
 * @param {CompleteTripResponse} res The Express response object.
 * @returns {Promise<void | CompleteTripResponse>}
 */
export const completeTrip = async (req, res) => {
    const paramsValidation = idParamSchema.safeParse(req.params);
    if (!paramsValidation.success) {
        return res.status(400).json({ errors: paramsValidation.error.format() });
    }
    const { id } = paramsValidation.data;

    const bodyValidation = completeTripSchema.safeParse(req.body);
    if (!bodyValidation.success) {
        return res.status(400).json({ errors: bodyValidation.error.format() });
    }
    const { endOdometerKm } = bodyValidation.data;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const tripRes = await client.query('SELECT * FROM trips WHERE id = $1 FOR UPDATE', [id]);
        if (tripRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Trip not found" });
        }
        const trip = tripRes.rows[0];

        if (trip.status !== 'DISPATCHED') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Only dispatched trips can be completed" });
        }

        await client.query("UPDATE vehicles SET status = 'AVAILABLE' WHERE id = $1", [trip.vehicle_id]);
        if (endOdometerKm) {
            await client.query("UPDATE vehicles SET odometer_km = $1 WHERE id = $2", [endOdometerKm, trip.vehicle_id]);
            await client.query("UPDATE trips SET end_odometer_km = $1 WHERE id = $2", [endOdometerKm, trip.id]);
        }
        await client.query("UPDATE drivers SET status = 'AVAILABLE' WHERE id = $1", [trip.driver_id]);

        const updatedTrip = await updateTripStatusTransaction(client, trip.id, 'COMPLETED');

        await client.query('COMMIT');
        return res.status(200).json({ message: "Trip completed successfully", trip: updatedTrip });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error completing trip:", error);
        return res.status(500).json({ error: "Failed to complete trip" });
    } finally {
        client.release();
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} CancelTripParams
 * @typedef {import('express').Request<CancelTripParams>} CancelTripRequest
 * @typedef {import('express').Response} CancelTripResponse
 */

/**
 * Cancels a trip.
 * @param {CancelTripRequest} req The Express request object, containing the trip ID in params.
 * @param {CancelTripResponse} res The Express response object.
 * @returns {Promise<void | CancelTripResponse>}
 */
export const cancelTrip = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const tripRes = await client.query('SELECT * FROM trips WHERE id = $1 FOR UPDATE', [id]);
        if (tripRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: "Trip not found" });
        }
        const trip = tripRes.rows[0];

        if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Trip cannot be cancelled" });
        }

        if (trip.status === 'DISPATCHED') {
            await client.query("UPDATE vehicles SET status = 'AVAILABLE' WHERE id = $1", [trip.vehicle_id]);
            await client.query("UPDATE drivers SET status = 'AVAILABLE' WHERE id = $1", [trip.driver_id]);
        }

        const updatedTrip = await updateTripStatusTransaction(client, trip.id, 'CANCELLED');

        await client.query('COMMIT');
        return res.status(200).json({ message: "Trip cancelled successfully", trip: updatedTrip });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error cancelling trip:", error);
        return res.status(500).json({ error: "Failed to cancel trip" });
    } finally {
        client.release();
    }
};

/**
 * @typedef {import('express').Request} ListTripsRequest
 * @typedef {import('express').Response} ListTripsResponse
 */

/**
 * Lists all trips.
 * @param {ListTripsRequest} req The Express request object.
 * @param {ListTripsResponse} res The Express response object.
 * @returns {Promise<ListTripsResponse>}
 */
export const listTrips = async (req, res) => {
    try {
        const trips = await getAllTrips();
        return res.status(200).json({ trips });
    } catch (error) {
        console.error("Error listing trips:", error);
        return res.status(500).json({ error: "Failed to fetch trips" });
    }
};

/**
 * @typedef {import('zod').infer<typeof idParamSchema>} FetchTripByIdParams
 * @typedef {import('express').Request<FetchTripByIdParams>} FetchTripByIdRequest
 * @typedef {import('express').Response} FetchTripByIdResponse
 */

/**
 * Fetches a single trip by its ID.
 * @param {FetchTripByIdRequest} req The Express request object, containing the trip ID in params.
 * @param {FetchTripByIdResponse} res The Express response object.
 * @returns {Promise<void | FetchTripByIdResponse>}
 */
export const fetchTripById = async (req, res) => {
    const validation = idParamSchema.safeParse(req.params);
    if (!validation.success) {
        return res.status(400).json({ errors: validation.error.format() });
    }
    const { id } = validation.data;

    try {
        const trip = await getTripById(id);
        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }
        return res.status(200).json({ trip });
    } catch (error) {
        console.error("Error fetching trip:", error);
        return res.status(500).json({ error: "Failed to fetch trip" });
    }
};
