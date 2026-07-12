import { pool } from "../config/db.js";
import { createTrip, getTripById, getAllTrips, updateTripStatusTransaction } from "../models/trip.model.js";

// Utility to generate a unique trip code
function generateTripCode() {
    return 'TRP-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000);
}

export const createDraftTrip = async (req, res) => {
    try {
        const { source, destination, vehicleId, driverId, cargoWeightKg, plannedDistanceKm } = req.body;

        if (!source || !destination || !vehicleId || !driverId || cargoWeightKg === undefined || plannedDistanceKm === undefined) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Basic validation: Check if vehicle and driver exist
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
        res.status(201).json({ message: "Draft trip created successfully", trip: newTrip });
    } catch (error) {
        console.error("Error creating draft trip:", error);
        res.status(500).json({ error: "Failed to create trip" });
    }
};

export const dispatchTrip = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        
        await client.query('BEGIN');
        
        // 1. Get trip
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

        // 2. Validate Vehicle availability
        const vehicleRes = await client.query('SELECT status, max_load_capacity_kg FROM vehicles WHERE id = $1 FOR UPDATE', [trip.vehicle_id]);
        if (vehicleRes.rows.length === 0 || vehicleRes.rows[0].status !== 'AVAILABLE') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Assigned vehicle is not available" });
        }

        // 3. Validate Driver availability
        const driverRes = await client.query('SELECT status FROM drivers WHERE id = $1 FOR UPDATE', [trip.driver_id]);
        if (driverRes.rows.length === 0 || driverRes.rows[0].status !== 'AVAILABLE') {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Assigned driver is not available" });
        }

        // 4. Update statuses
        await client.query("UPDATE vehicles SET status = 'ON_TRIP' WHERE id = $1", [trip.vehicle_id]);
        await client.query("UPDATE drivers SET status = 'ON_TRIP' WHERE id = $1", [trip.driver_id]);
        
        const updatedTrip = await updateTripStatusTransaction(client, trip.id, 'DISPATCHED');
        
        await client.query('COMMIT');
        res.status(200).json({ message: "Trip dispatched successfully", trip: updatedTrip });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error dispatching trip:", error);
        res.status(500).json({ error: "Failed to dispatch trip" });
    } finally {
        client.release();
    }
};

export const completeTrip = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        const { endOdometerKm } = req.body; // optionally we can track this
        
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
        res.status(200).json({ message: "Trip completed successfully", trip: updatedTrip });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error completing trip:", error);
        res.status(500).json({ error: "Failed to complete trip" });
    } finally {
        client.release();
    }
};

export const cancelTrip = async (req, res) => {
    const client = await pool.connect();
    try {
        const { id } = req.params;
        
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
            // Revert driver and vehicle status
            await client.query("UPDATE vehicles SET status = 'AVAILABLE' WHERE id = $1", [trip.vehicle_id]);
            await client.query("UPDATE drivers SET status = 'AVAILABLE' WHERE id = $1", [trip.driver_id]);
        }
        
        const updatedTrip = await updateTripStatusTransaction(client, trip.id, 'CANCELLED');
        
        await client.query('COMMIT');
        res.status(200).json({ message: "Trip cancelled successfully", trip: updatedTrip });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error cancelling trip:", error);
        res.status(500).json({ error: "Failed to cancel trip" });
    } finally {
        client.release();
    }
};

export const listTrips = async (req, res) => {
    try {
        const trips = await getAllTrips();
        res.status(200).json({ trips });
    } catch (error) {
        console.error("Error listing trips:", error);
        res.status(500).json({ error: "Failed to fetch trips" });
    }
};

export const fetchTripById = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await getTripById(id);
        if (!trip) {
            return res.status(404).json({ error: "Trip not found" });
        }
        res.status(200).json({ trip });
    } catch (error) {
        console.error("Error fetching trip:", error);
        res.status(500).json({ error: "Failed to fetch trip" });
    }
};
