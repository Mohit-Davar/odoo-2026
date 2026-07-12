import { create } from 'zustand';
import { Vehicle, Driver, Trip, MaintenanceLog, FuelLog, Expense } from '../types';
import axiosInstance from '../../lib/axiosInstance';

interface AppState {
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  
  dashboardStats: any;
  analyticsStats: any;
  
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<{ ok: boolean; message: string }>;
  updateVehicle: (id: number, data: Partial<Vehicle>) => Promise<{ ok: boolean; message: string }>;
  
  addDriver: (driver: Omit<Driver, 'id'>) => Promise<{ ok: boolean; message: string }>;
  updateDriver: (id: number, data: Partial<Driver>) => Promise<{ ok: boolean; message: string }>;
  
  addTrip: (trip: any) => Promise<{ ok: boolean; message: string; data?: any }>;
  updateTrip: (id: number, data: Partial<Trip>) => Promise<{ ok: boolean; message: string }>;
  
  dispatchTrip: (id: number) => Promise<{ ok: boolean; message: string }>;
  completeTrip: (id: number, data?: { endOdometerKm?: number, revenue?: number }) => Promise<{ ok: boolean; message: string }>;
  cancelTrip: (id: number) => Promise<{ ok: boolean; message: string }>;
  
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id'>) => Promise<{ ok: boolean; message: string }>;
  updateMaintenanceLog: (id: number, data: Partial<MaintenanceLog>) => Promise<{ ok: boolean; message: string }>;
  
  addFuelLog: (log: Omit<FuelLog, 'id'>) => Promise<{ ok: boolean; message: string }>;
  addExpense: (expense: Omit<Expense, 'id'>) => Promise<{ ok: boolean; message: string }>;
}

export const useAppStore = create<AppState>((set, get) => ({
  vehicles: [],
  drivers: [],
  trips: [],
  maintenanceLogs: [],
  fuelLogs: [],
  expenses: [],
  
  dashboardStats: null,
  analyticsStats: null,
  
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [vehiclesRes, driversRes, tripsRes, maintRes, fuelRes, expRes, dashRes, analyticsRes] = await Promise.all([
        axiosInstance.get('/vehicles'),
        axiosInstance.get('/drivers'),
        axiosInstance.get('/trips'),
        axiosInstance.get('/maintenance'),
        axiosInstance.get('/fuel'),
        axiosInstance.get('/expenses'),
        axiosInstance.get('/dashboard'),
        axiosInstance.get('/analytics')
      ]);

      set({
        vehicles: vehiclesRes.data,
        drivers: driversRes.data,
        trips: tripsRes.data.trips || tripsRes.data,
        maintenanceLogs: maintRes.data,
        fuelLogs: fuelRes.data,
        expenses: expRes.data,
        dashboardStats: dashRes.data,
        analyticsStats: analyticsRes.data,
        isLoading: false
      });
    } catch (error: any) {
      console.error("Failed to fetch dashboard data:", error);
      set({ error: error.message || "Failed to load data", isLoading: false });
    }
  },

  addVehicle: async (vehicle) => {
    try {
      const res = await axiosInstance.post('/vehicles', vehicle);
      set((state) => ({ vehicles: [...state.vehicles, res.data.vehicle || res.data] }));
      return { ok: true, message: "Vehicle added" };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to add vehicle" };
    }
  },
  
  updateVehicle: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/vehicles/${id}`, data);
      set((state) => ({
        vehicles: state.vehicles.map(v => v.id === id ? { ...v, ...data, ...(res.data.vehicle || res.data) } : v)
      }));
      return { ok: true, message: "Vehicle updated" };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to update vehicle" };
    }
  },

  addDriver: async (driver) => {
    try {
      const res = await axiosInstance.post('/drivers', driver);
      set((state) => ({ drivers: [...state.drivers, res.data.driver || res.data] }));
      return { ok: true, message: "Driver added" };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to add driver" };
    }
  },

  updateDriver: async (id, data) => {
    try {
      const res = await axiosInstance.put(`/drivers/${id}`, data);
      set((state) => ({
        drivers: state.drivers.map(d => d.id === id ? { ...d, ...data, ...(res.data.driver || res.data) } : d)
      }));
      return { ok: true, message: "Driver updated" };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to update driver" };
    }
  },

  addTrip: async (trip) => {
    try {
      const res = await axiosInstance.post('/trips', trip);
      set((state) => ({ trips: [...state.trips, res.data.trip || res.data] }));
      return { ok: true, message: "Trip drafted", data: res.data.trip || res.data };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to add trip", data: null };
    }
  },

  updateTrip: async (id, data) => {
    try {
      // For general updates if supported, else optimistic
      set((state) => ({
        trips: state.trips.map(t => t.id === id ? { ...t, ...data } : t)
      }));
      return { ok: true, message: "Trip updated" };
    } catch (err: any) {
      return { ok: false, message: "Failed to update trip" };
    }
  },

  dispatchTrip: async (id) => {
    try {
      await axiosInstance.post(`/trips/${id}/dispatch`);
      // Refetch or update optimistic
      await get().fetchDashboardData();
      return { ok: true, message: "Trip dispatched" };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to dispatch trip" };
    }
  },

  completeTrip: async (id, data) => {
    try {
      await axiosInstance.post(`/trips/${id}/complete`, data || {});
      await get().fetchDashboardData();
      return { ok: true, message: "Trip completed" };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to complete trip" };
    }
  },

  cancelTrip: async (id) => {
    try {
      await axiosInstance.post(`/trips/${id}/cancel`);
      await get().fetchDashboardData();
      return { ok: true, message: "Trip cancelled" };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to cancel trip" };
    }
  },

  addMaintenanceLog: async (log) => {
    try {
      const res = await axiosInstance.post('/maintenance', log);
      // Wait for backend or optimistically add, then refetch since vehicle status changes
      await get().fetchDashboardData();
      return { ok: true, message: "Maintenance log added" };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to add maintenance log" };
    }
  },

  updateMaintenanceLog: async (id, data) => {
    try {
      await axiosInstance.put(`/maintenance/${id}`, data);
      await get().fetchDashboardData();
      return { ok: true, message: "Maintenance log updated" };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to update maintenance log" };
    }
  },

  addFuelLog: async (log) => {
    try {
      const res = await axiosInstance.post('/fuel', log);
      set((state) => ({ fuelLogs: [...state.fuelLogs, res.data.fuelLog || res.data] }));
      return { ok: true, message: "Fuel log added" };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to add fuel log" };
    }
  },

  addExpense: async (expense) => {
    try {
      const res = await axiosInstance.post('/expenses', expense);
      set((state) => ({ expenses: [...state.expenses, res.data.expense || res.data] }));
      return { ok: true, message: "Expense added" };
    } catch (err: any) {
      return { ok: false, message: err.response?.data?.error || "Failed to add expense" };
    }
  },
}));
