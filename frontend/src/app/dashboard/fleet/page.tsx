"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { VehicleStatus } from "@/types";
import { toast } from "sonner";

export default function FleetPage() {
  const { vehicles, addVehicle, retireVehicle, deleteVehicle, trips, drivers, dispatchTrip, fetchDashboardData } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [regNo, setRegNo] = useState("");
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [capacity, setCapacity] = useState("");
  const [odometer, setOdometer] = useState("");
  const [cost, setCost] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // AI Optimizer State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any[] | null>(null);
  const [isOptimizeOpen, setIsOptimizeOpen] = useState(false);
  const [isDispatchingAI, setIsDispatchingAI] = useState<number | null>(null);

  const getStatusBadge = (status: VehicleStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'ON_TRIP':
        return <Badge className="bg-blue-500">On Trip</Badge>;
      case 'IN_SHOP':
        return <Badge className="bg-amber-500">In Shop</Badge>;
      case 'RETIRED':
        return <Badge className="bg-red-500">Retired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleRetire = async (id: number) => {
    if (!confirm("Are you sure you want to retire this vehicle? This action cannot be undone.")) return;
    const res = await retireVehicle(id);
    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vehicle record?")) return;
    const res = await deleteVehicle(id);
    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = (v.registrationNumber || v.registration_number)?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (v.vehicleName || v.vehicle_name)?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All" || (v.vehicleType || v.vehicle_type) === typeFilter;
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const uniqueTypes = Array.from(new Set(vehicles.map(v => v.vehicleType || v.vehicle_type)));

  const handleAddVehicle = async () => {
    if (!regNo || !name || !type || !capacity || !cost) return;
    
    if (regNo.length < 6) {
      toast.error("Registration Number must be at least 6 characters");
      return;
    }
    if (name.length < 3) {
      toast.error("Vehicle Name/Model must be at least 3 characters");
      return;
    }

    setIsSubmitting(true);
    const res = await addVehicle({
      registration_number: regNo,
      vehicle_name: name,
      vehicle_type: type,
      max_load_capacity_kg: Number(capacity),
      odometer_km: Number(odometer) || 0,
      acquisition_cost: Number(cost),
      status: 'AVAILABLE'
    } as any);
    if (res.ok) {
      toast.success("Vehicle added");
      setIsAddOpen(false);
      setRegNo("");
      setName("");
      setType("");
      setCapacity("");
      setOdometer("");
      setCost("");
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  const handleNumKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') e.preventDefault();
  };

  // Optimize Dispatch using backend route proxy
  const handleOptimizeDispatch = async () => {
    const draftTrips = trips.filter(t => t.status === 'DRAFT');
    if (draftTrips.length === 0) {
      toast.info("No draft/pending trips found to optimize.");
      return;
    }

    setIsOptimizing(true);
    setOptimizationResult(null);
    setIsOptimizeOpen(true);

    try {
      const axiosInstance = (await import('../../../../lib/axiosInstance')).default;
      const res = await axiosInstance.post('/ai/optimize-dispatch', {
        trips: draftTrips.map(t => ({
          id: t.id,
          origin: t.source,
          destination: t.destination,
          cargoWeightKg: t.cargo_weight_kg || t.cargoWeightKg || 0,
          plannedDistanceKm: t.planned_distance_km || t.plannedDistanceKm || 0
        }))
      });

      if (res.data && res.data.assignments) {
        setOptimizationResult(res.data.assignments);
        toast.success("AI optimization completed!");
      } else {
        toast.error("Invalid response from optimizer.");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.error || "AI Service is currently offline or unauthorized.");
      setIsOptimizeOpen(false);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Perform quick dispatch from optimization recommendation
  const handleApplyAIRecommendation = async (tripId: number, vehicleId: number, driverId: number) => {
    if (!vehicleId || !driverId) {
      toast.error("Selected vehicle or driver is invalid.");
      return;
    }

    setIsDispatchingAI(tripId);
    try {
      const axiosInstance = (await import('../../../lib/axiosInstance')).default;
      
      // Update draft trip vehicle and driver
      await axiosInstance.put(`/trips/${tripId}`, {
        vehicleId: Number(vehicleId),
        driverId: Number(driverId)
      });

      // Dispatch the trip
      const dispatchRes = await dispatchTrip(tripId);
      if (dispatchRes.ok) {
        toast.success("Trip successfully dispatched using AI recommendation!");
        // Update local list
        setOptimizationResult(prev => prev ? prev.filter(item => item.tripId !== tripId) : null);
        await fetchDashboardData();
      } else {
        toast.error(dispatchRes.message || "Failed to dispatch trip");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to assign AI recommendation");
    } finally {
      setIsDispatchingAI(null);
    }
  };

  const draftTripsCount = trips.filter(t => t.status === 'DRAFT').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 geist-mono tracking-tighter">
            Fleet Registry & Lifecycle
          </h1>
          <p className="text-sm text-neutral-500 mt-1">Manage vehicles and run AI-assisted dispatch optimization.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={handleOptimizeDispatch}
            className="bg-purple-700 hover:bg-purple-800 text-white rounded-full px-6 flex items-center gap-2 shadow-lg shadow-purple-200"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            AI Optimize Dispatch ({draftTripsCount})
          </Button>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6">
                + Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Vehicle</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Registration Number (Unique)</Label>
                  <Input value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="e.g. MH12AB1234" />
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Name / Model</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Tata Ace" />
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Type</Label>
                  <Input value={type} onChange={(e) => setType(e.target.value)} placeholder="e.g. Truck, Van" />
                </div>
                <div className="space-y-2">
                  <Label>Max Load Capacity (kg)</Label>
                  <Input type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} onKeyDown={handleNumKeyDown} />
                </div>
                <div className="space-y-2">
                  <Label>Initial Odometer (km)</Label>
                  <Input type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)} onKeyDown={handleNumKeyDown} />
                </div>
                <div className="space-y-2">
                  <Label>Acquisition Cost (₹)</Label>
                  <Input type="number" value={cost} onChange={(e) => setCost(e.target.value)} onKeyDown={handleNumKeyDown} />
                </div>
                <Button 
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white" 
                  onClick={handleAddVehicle}
                  disabled={isSubmitting || !regNo || !name || !type || !capacity || !cost}
                >
                  {isSubmitting ? "Adding..." : "Add Vehicle"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* AI Optimization Drawer / Dialog */}
      <Dialog open={isOptimizeOpen} onOpenChange={setIsOptimizeOpen}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-purple-800 geist-mono font-bold text-xl">
              ✨ AI Dispatch Optimizer Recommendations
            </DialogTitle>
          </DialogHeader>

          {isOptimizing ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
              <p className="text-neutral-600 font-medium animate-pulse">Running advanced logistical constraints solver...</p>
              <p className="text-xs text-neutral-400 max-w-sm text-center">Weighing cargo metrics, driver safety ratings, vehicle mileage, and license categories.</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {optimizationResult && optimizationResult.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-neutral-500">
                    Showing optimal pairings determined by AI for the {optimizationResult.length} pending draft trips:
                  </p>
                  <div className="space-y-4">
                    {optimizationResult.map((rec: any) => {
                      const tripObj = trips.find(t => t.id === rec.tripId);
                      return (
                        <div key={rec.tripId} className="border border-purple-100 bg-purple-50/20 p-4 rounded-xl space-y-3 relative hover:border-purple-200 transition-colors">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold font-mono">
                                {tripObj?.trip_code || `TRIP #${rec.tripId}`}
                              </span>
                              <h4 className="text-sm font-semibold text-neutral-800 mt-1">
                                {rec.origin} &rarr; {rec.destination}
                              </h4>
                            </div>
                            <Button
                              size="sm"
                              className="bg-purple-700 hover:bg-purple-800 text-white"
                              onClick={() => handleApplyAIRecommendation(rec.tripId, rec.assignedVehicleId, rec.assignedDriverId)}
                              disabled={isDispatchingAI === rec.tripId || rec.assignedVehicleId === 'None' || rec.assignedDriverId === 'None'}
                            >
                              {isDispatchingAI === rec.tripId ? "Dispatching..." : "Approve & Dispatch"}
                            </Button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="bg-white p-2 rounded border border-neutral-100">
                              <span className="font-semibold text-neutral-500 block uppercase tracking-wider text-[10px]">Assigned Vehicle</span>
                              <span className="font-medium text-neutral-800 text-sm">{rec.assignedVehicleName}</span>
                            </div>
                            <div className="bg-white p-2 rounded border border-neutral-100">
                              <span className="font-semibold text-neutral-500 block uppercase tracking-wider text-[10px]">Assigned Driver</span>
                              <span className="font-medium text-neutral-800 text-sm">{rec.assignedDriverName}</span>
                            </div>
                          </div>

                          <div className="text-xs text-neutral-600 bg-white/70 p-3 rounded-lg border border-purple-50">
                            <span className="font-bold text-purple-800 block mb-1">💡 Reason:</span>
                            {rec.recommendationReason}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-neutral-500">
                  No recommendations generated. Make sure available vehicles and drivers exist.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Type: All</SelectItem>
            {uniqueTypes.filter(Boolean).map((type, idx) => (
              <SelectItem key={`${type}-${idx}`} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Status: All</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="ON_TRIP">On Trip</SelectItem>
            <SelectItem value="IN_SHOP">In Shop</SelectItem>
            <SelectItem value="RETIRED">Retired</SelectItem>
          </SelectContent>
        </Select>

        <Input 
          placeholder="Search reg. no or name..." 
          className="max-w-xs"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">REG. NO (UNIQUE)</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">NAME/MODEL</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">TYPE</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">CAPACITY</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">ODOMETER</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">ACQ. COST</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">STATUS</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="hover:bg-neutral-50/50">
                  <TableCell className="px-4 py-3 font-medium">{vehicle.registrationNumber || vehicle.registration_number}</TableCell>
                  <TableCell className="px-4 py-3">{vehicle.vehicleName || vehicle.vehicle_name}</TableCell>
                  <TableCell className="px-4 py-3">{vehicle.vehicleType || vehicle.vehicle_type}</TableCell>
                  <TableCell className="px-4 py-3">{vehicle.maxLoadCapacityKg ?? vehicle.max_load_capacity_kg} kg</TableCell>
                  <TableCell className="px-4 py-3">{(vehicle.odometerKm ?? vehicle.odometer_km)?.toLocaleString()} km</TableCell>
                  <TableCell className="px-4 py-3">₹{(vehicle.acquisitionCost ?? vehicle.acquisition_cost)?.toLocaleString()}</TableCell>
                  <TableCell className="px-4 py-3">{getStatusBadge(vehicle.status)}</TableCell>
                  <TableCell className="px-4 py-3 space-x-2">
                    {vehicle.status !== 'RETIRED' && (
                      <Button size="sm" variant="outline" className="text-xs h-7 border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleRetire(vehicle.id)}>
                        Retire
                      </Button>
                    )}
                    {vehicle.status === 'RETIRED' && (
                      <Button size="sm" variant="destructive" className="text-xs h-7" onClick={() => handleDelete(vehicle.id)}>
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredVehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-neutral-500">
                    No vehicles found matching criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <p className="text-xs text-orange-600">Rule: Registration No. must be unique • Retired/In Shop vehicles are hidden from Trip Dispatcher</p>
    </div>
  );
}
