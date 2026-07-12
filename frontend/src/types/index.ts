export type VehicleStatus = 'AVAILABLE' | 'ON_TRIP' | 'IN_SHOP' | 'RETIRED';
export type DriverStatus = 'AVAILABLE' | 'ON_TRIP' | 'OFF_DUTY' | 'SUSPENDED';
export type TripStatus = 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED';
export type MaintenanceStatus = 'ACTIVE' | 'COMPLETED';
export type ExpenseType = 'TOLL' | 'MAINTENANCE' | 'OTHER';

export interface Vehicle {
  id: number;
  registration_number: string;
  vehicle_name: string;
  vehicle_type: string;
  max_load_capacity_kg: number;
  odometer_km: number;
  acquisition_cost: number;
  status: VehicleStatus;
}

export interface Driver {
  id: number;
  full_name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  rating: number; // Safety Score (0-100)
  status: DriverStatus;
  tripCompletedCount?: number; // Add computed property for UI
}

export interface Trip {
  id: number;
  trip_code: string;
  source: string;
  destination: string;
  vehicle_id: number | null;
  driver_id: number | null;
  cargo_weight_kg: number;
  planned_distance_km: number;
  start_odometer_km?: number | null;
  end_odometer_km?: number | null;
  status: TripStatus;
  dispatched_at?: string | null;
  completed_at?: string | null;
  revenue?: number | null;
}

export interface MaintenanceLog {
  id: number;
  vehicle_id: number;
  description: string;
  cost: number;
  maintenance_date: string;
  status: MaintenanceStatus;
}

export interface FuelLog {
  id: number;
  vehicle_id: number;
  trip_id?: number | null;
  fuel_date: string;
  litres: number;
  total_cost: number;
}

export interface Expense {
  id: number;
  trip_id?: number | null;
  vehicle_id?: number | null;
  expense_type: ExpenseType;
  amount: number;
  expense_date: string;
  notes?: string;
}

// For Dashboard KPIs
export interface DashboardKPIs {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilizationPercent: number;
}
