import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  console.log("Starting database seeding...");
  
  try {
    // 1. Clean existing records (Cascade will clear dependent tables)
    console.log("Cleaning existing tables...");
    await pool.query(`
      TRUNCATE TABLE expenses, fuel_logs, maintenance_logs, trips, users, drivers, vehicles, roles 
      RESTART IDENTITY CASCADE;
    `);
    console.log("Tables cleaned successfully.");

    // 2. Seed Roles
    console.log("Seeding roles...");
    const roleInsertQuery = `
      INSERT INTO roles (id, name) VALUES 
      (1, 'Admin'),
      (2, 'Dispatcher'),
      (3, 'Fleet Manager'),
      (4, 'Safety Officer'),
      (5, 'Financial Analyst')
      ON CONFLICT (id) DO NOTHING;
    `;
    await pool.query(roleInsertQuery);

    // 3. Seed Users (Hash password: "password123")
    console.log("Hashing passwords for users...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    
    console.log("Seeding users...");
    const userInsertQuery = `
      INSERT INTO users (name, email, password, role_id, verified) VALUES 
      ('System Administrator', 'admin@transitops.com', $1, 1, true),
      ('Chief Dispatcher', 'dispatcher@transitops.com', $1, 2, true),
      ('Fleet Manager', 'manager@transitops.com', $1, 3, true),
      ('Safety Officer', 'safety@transitops.com', $1, 4, true),
      ('Financial Analyst', 'finance@transitops.com', $1, 5, true);
    `;
    await pool.query(userInsertQuery, [hashedPassword]);

    // 4. Seed Vehicles
    console.log("Seeding vehicles...");
    const vehicleInsertQuery = `
      INSERT INTO vehicles (registration_number, vehicle_name, vehicle_type, max_load_capacity_kg, odometer_km, acquisition_cost, status) VALUES 
      ('MH-12-AB-1111', 'Tata Prima 4930.S', 'Heavy Truck', 35000.00, 12500.50, 45000.00, 'AVAILABLE'),
      ('DL-01-XY-2222', 'Mahindra Blazo X 35', 'Dumper', 25000.00, 8400.20, 38000.00, 'AVAILABLE'),
      ('KA-03-ZZ-3333', 'Ashok Leyland Partner', 'Light Truck', 7000.00, 32100.80, 18000.00, 'AVAILABLE'),
      ('HR-26-CD-4444', 'Eicher Pro 6028', 'Medium Truck', 15000.00, 15300.00, 29000.00, 'ON_TRIP'),
      ('MH-02-EF-5555', 'BharatBenz 2823C', 'Tipper', 18000.00, 450.00, 32000.00, 'IN_SHOP'),
      ('UP-16-GH-6666', 'Force Kargo King', 'Pickup Van', 3000.00, 48000.60, 9500.00, 'RETIRED');
    `;
    await pool.query(vehicleInsertQuery);

    // 5. Seed Drivers
    console.log("Seeding drivers...");
    const driverInsertQuery = `
      INSERT INTO drivers (full_name, license_number, license_category, license_expiry_date, contact_number, rating, status) VALUES 
      ('Rajesh Sharma', 'DL-12345678901', 'Heavy Transport', '2030-05-15', '+919876543210', 98.50, 'AVAILABLE'),
      ('Amit Patel', 'MH-98765432102', 'Commercial Medium', '2028-09-22', '+918765432109', 92.00, 'AVAILABLE'),
      ('Sukhwinder Singh', 'PB-55443322110', 'Heavy Transport', '2027-11-10', '+917654321098', 99.00, 'ON_TRIP'),
      ('Michael Dsouza', 'KA-09876543214', 'Commercial Light', '2029-01-30', '+916543210987', 88.00, 'OFF_DUTY'),
      ('Vikram Rathore', 'RJ-11223344556', 'Heavy Transport', '2026-03-12', '+915432109876', 75.00, 'SUSPENDED');
    `;
    await pool.query(driverInsertQuery);

    // 6. Seed Trips
    console.log("Seeding trips...");
    const tripInsertQuery = `
      INSERT INTO trips (trip_code, source, destination, vehicle_id, driver_id, cargo_weight_kg, planned_distance_km, status, dispatched_at, completed_at) VALUES 
      ('TRP-100001', 'Mumbai Port Depot', 'Delhi Gateway Hub', 4, 3, 12000.00, 1420.50, 'DISPATCHED', CURRENT_TIMESTAMP - INTERVAL '2 hours', NULL),
      ('TRP-100002', 'Bangalore Storage B', 'Chennai Warehouse 2', 3, 1, 6000.00, 345.00, 'COMPLETED', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '18 hours'),
      ('TRP-100003', 'Kolkata Depot 1', 'Patna Logistics Park', 1, 2, 28000.00, 580.00, 'DRAFT', NULL, NULL);
    `;
    await pool.query(tripInsertQuery);

    // 7. Seed Maintenance Logs
    console.log("Seeding maintenance logs...");
    const maintenanceInsertQuery = `
      INSERT INTO maintenance_logs (vehicle_id, description, cost, maintenance_date, status) VALUES 
      (5, 'Engine overhaul and fuel injector replacement', 1200.00, '2026-07-10', 'ACTIVE'),
      (1, 'Routine brake pad change and oil servicing', 350.00, '2026-06-25', 'COMPLETED'),
      (3, 'Tire replacement (front left & right)', 450.00, '2026-07-02', 'COMPLETED');
    `;
    await pool.query(maintenanceInsertQuery);

    // 8. Seed Fuel Logs
    console.log("Seeding fuel logs...");
    const fuelInsertQuery = `
      INSERT INTO fuel_logs (vehicle_id, fuel_date, litres, total_cost) VALUES 
      (1, '2026-07-10', 120.00, 110.50),
      (3, '2026-07-11', 45.50, 42.00),
      (4, '2026-07-12', 90.00, 83.50);
    `;
    await pool.query(fuelInsertQuery);

    // 9. Seed Expenses
    console.log("Seeding expenses...");
    const expenseInsertQuery = `
      INSERT INTO expenses (trip_id, expense_type, amount, expense_date, notes) VALUES 
      (1, 'TOLL', 75.00, '2026-07-12', 'National Highway Toll Plaza Charges'),
      (2, 'OTHER', 30.00, '2026-07-11', 'Driver refreshment allowance'),
      (2, 'TOLL', 45.00, '2026-07-11', 'State border checkpost entry tax');
    `;
    await pool.query(expenseInsertQuery);

    console.log("\nDatabase seeded successfully!");
    console.log("-------------------------------------------------");
    console.log("Mock User Credentials (Password for all: 'password123'):");
    console.log("- Admin: admin@transitops.com");
    console.log("- Dispatcher: dispatcher@transitops.com");
    console.log("- Fleet Manager: manager@transitops.com");
    console.log("- Safety Officer: safety@transitops.com");
    console.log("- Financial Analyst: finance@transitops.com");
    console.log("-------------------------------------------------");
    
  } catch (error) {
    console.error("Seeding failed with error:", error);
  } finally {
    await pool.end();
  }
}

seed();
