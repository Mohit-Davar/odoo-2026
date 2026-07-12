CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED');
CREATE TYPE driver_status AS ENUM ('AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED');
CREATE TYPE trip_status AS ENUM ('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED');
CREATE TYPE maintenance_status AS ENUM ('ACTIVE', 'COMPLETED');
CREATE TYPE expense_type AS ENUM ('TOLL', 'MAINTENANCE', 'OTHER');
-- ===========================
-- ROLES
-- ===========================
CREATE TABLE roles
    (
        id   SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE
    )
;
-- ===========================
-- USERS
-- ===========================
CREATE TABLE IF NOT EXISTS users
    (
        id            SERIAL PRIMARY KEY                                ,
        name          VARCHAR(100) NOT NULL                             ,
        email         VARCHAR(150) UNIQUE NOT NULL                      ,
        password      VARCHAR(255) NOT NULL                             , -- Hashed string storage
        role_id       INTEGER REFERENCES roles (id) NOT NULL DEFAULT 3  ,
        refresh_token TEXT DEFAULT NULL                                 ,
        verified      BOOLEAN NOT NULL DEFAULT FALSE                    ,
        created_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at    TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
;
-- ===========================
-- VEHICLES
-- ===========================
CREATE TABLE vehicles
    (
        id                        BIGSERIAL PRIMARY KEY                                     ,
        registration_number       VARCHAR(30) NOT NULL UNIQUE                               ,
        vehicle_name              VARCHAR(120) NOT NULL                                     ,
        vehicle_type              VARCHAR(50) NOT NULL                                      ,
        max_load_capacity_kg      NUMERIC(10, 2) NOT NULL CHECK (max_load_capacity_kg  > 0) ,
        odometer_km               NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (odometer_km >= 0),
        acquisition_cost          NUMERIC(14, 2) NOT NULL CHECK (acquisition_cost      >= 0),
        status vehicle_status NOT NULL DEFAULT 'AVAILABLE'                                  ,
        created_at                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP              ,
        updated_at                TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
;
-- ===========================
-- DRIVERS
-- ===========================
CREATE TABLE drivers
    (
        id                       BIGSERIAL PRIMARY KEY                                                     ,
        full_name                VARCHAR(120) NOT NULL                                                     ,
        license_number           VARCHAR(100) NOT NULL UNIQUE                                              ,
        license_category         VARCHAR(30) NOT NULL                                                      ,
        license_expiry_date      DATE NOT NULL                                                             ,
        contact_number           VARCHAR(20)                                                               ,
        rating                   NUMERIC(5, 2) NOT NULL DEFAULT 100 CHECK ( rating >= 0 AND rating <= 100 ),
        status driver_status NOT NULL DEFAULT 'AVAILABLE'                                                  ,
        created_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP                              ,
        updated_at               TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
;
-- ===========================
-- TRIPS
-- ===========================
CREATE TABLE trips
    (
        id                     BIGSERIAL PRIMARY KEY                                   ,
        trip_code              VARCHAR(30) NOT NULL UNIQUE                             ,
        source                 VARCHAR(255) NOT NULL                                   ,
        destination            VARCHAR(255) NOT NULL                                   ,
        vehicle_id             BIGINT REFERENCES vehicles (id)                         ,
        driver_id              BIGINT REFERENCES drivers (id)                          ,
        cargo_weight_kg        NUMERIC(10, 2) NOT NULL CHECK (cargo_weight_kg     >= 0),
        planned_distance_km    NUMERIC(10, 2) NOT NULL CHECK (planned_distance_km >= 0),
        start_odometer_km      NUMERIC(12, 2)                                          ,
        end_odometer_km        NUMERIC(12, 2)                                          ,
        revenue                NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (revenue >= 0)  ,
        status trip_status NOT NULL DEFAULT 'DRAFT'                                    ,
        dispatched_at          TIMESTAMP                                               ,
        completed_at           TIMESTAMP                                               ,
        created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP            ,
        updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
;
-- ===========================
-- MAINTENANCE LOGS
-- ===========================
CREATE TABLE maintenance_logs
    (
        id                            BIGSERIAL PRIMARY KEY                       ,
        vehicle_id                    BIGINT NOT NULL REFERENCES vehicles (id)    ,
        description                   TEXT NOT NULL                               ,
        cost                          NUMERIC(12, 2) NOT NULL CHECK (cost >= 0)   ,
        maintenance_date              DATE NOT NULL                               ,
        status maintenance_status NOT NULL DEFAULT 'ACTIVE'                       ,
        created_at                    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at                    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
;
-- ===========================
-- FUEL LOGS
-- ===========================
CREATE TABLE fuel_logs
    (
        id         BIGSERIAL PRIMARY KEY                          ,
        vehicle_id BIGINT NOT NULL REFERENCES vehicles (id)       ,
        trip_id    BIGINT REFERENCES trips (id)                   ,
        fuel_date  DATE NOT NULL                                  ,
        litres     NUMERIC(10, 2) NOT NULL CHECK (litres     > 0) ,
        total_cost NUMERIC(12, 2) NOT NULL CHECK (total_cost >= 0),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
;
-- ===========================
-- EXPENSES
-- ===========================
CREATE TABLE expenses
    (
        id                            BIGSERIAL PRIMARY KEY                      ,
        trip_id                       BIGINT REFERENCES trips (id)               ,
        vehicle_id                    BIGINT REFERENCES vehicles (id)            ,
        expense_type expense_type NOT NULL                                       ,
        amount                        NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
        expense_date                  DATE NOT NULL                              ,
        notes                         TEXT                                       ,
        created_at                    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
;
-- ===========================
-- INDEXES
-- ===========================
CREATE INDEX idx_vehicle_status
ON vehicles
    (
        status
    )
;
CREATE INDEX idx_driver_status
ON drivers
    (
        status
    )
;
CREATE INDEX idx_trip_status
ON trips
    (
        status
    )
;
CREATE INDEX idx_trip_vehicle
ON trips
    (
        vehicle_id
    )
;
CREATE INDEX idx_trip_driver
ON trips
    (
        driver_id
    )
;
CREATE INDEX idx_maintenance_vehicle
ON maintenance_logs
    (
        vehicle_id
    )
;
CREATE INDEX idx_fuel_vehicle
ON fuel_logs
    (
        vehicle_id
    )
;
CREATE INDEX idx_expense_vehicle
ON expenses
    (
        vehicle_id
    )
;
CREATE INDEX idx_expense_trip
ON expenses
    (
        trip_id
    );

-- ===========================
-- VEHICLE DOCUMENTS
-- ===========================
CREATE TABLE vehicle_documents (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    document_name VARCHAR(150) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    cloudinary_public_id VARCHAR(150) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vehicle_documents_vehicle_id ON vehicle_documents(vehicle_id);
