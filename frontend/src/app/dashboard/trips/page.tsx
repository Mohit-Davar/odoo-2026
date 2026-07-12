"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { TripStatus } from "@/types";
import { toast } from "sonner";

export default function TripsPage() {
  const { vehicles, drivers, trips, addTrip, dispatchTrip, completeTrip, cancelTrip } = useAppStore();
  
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState<string>("");
  const [driverId, setDriverId] = useState<string>("");
  const [cargoWeight, setCargoWeight] = useState("");
  const [plannedDistance, setPlannedDistance] = useState("");

  const availableVehicles = vehicles.filter(v => v.status === 'AVAILABLE');
  const availableDrivers = drivers.filter(d => d.status === 'AVAILABLE');

  const selectedVehicle = vehicles.find(v => v.id.toString() === vehicleId);
  const isCapacityExceeded = selectedVehicle && Number(cargoWeight) > selectedVehicle.maxLoadCapacityKg;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDispatch = async () => {
    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance || isCapacityExceeded) {
      return;
    }
    
    setIsSubmitting(true);

    const newTrip = {
      source,
      destination,
      vehicleId: Number(vehicleId),
      driverId: Number(driverId),
      cargoWeightKg: Number(cargoWeight),
      plannedDistanceKm: Number(plannedDistance),
    };

    const addRes = await addTrip(newTrip as any);
    
    if (addRes.ok && addRes.data?.id) {
      const dispatchRes = await dispatchTrip(addRes.data.id);
      if (dispatchRes.ok) {
        toast.success("Trip successfully dispatched!");
        // Reset form
        setSource("");
        setDestination("");
        setVehicleId("");
        setDriverId("");
        setCargoWeight("");
        setPlannedDistance("");
      } else {
        toast.error(dispatchRes.message);
      }
    } else {
      toast.error(addRes.message);
    }
    
    setIsSubmitting(false);
  };

  const handleDispatchDraft = async (tripId: number) => {
    setIsSubmitting(true);
    const res = await dispatchTrip(tripId);
    if (res.ok) {
      toast.success("Trip successfully dispatched!");
    } else {
      toast.error(res.message || "Failed to dispatch trip");
    }
    setIsSubmitting(false);
  };

  const handleComplete = async (tripId: number) => {
    const revenueStr = window.prompt("Enter total trip revenue (₹):");
    if (revenueStr === null) return; // user cancelled

    const endOdoStr = window.prompt("Enter ending odometer reading (km, optional):");
    
    const data: any = {};
    if (endOdoStr && !isNaN(Number(endOdoStr))) data.endOdometerKm = Number(endOdoStr);
    if (revenueStr && !isNaN(Number(revenueStr))) data.revenue = Number(revenueStr);
    
    const res = await completeTrip(tripId, data);
    if (res.ok) {
      toast.success("Trip completed successfully!");
    } else {
      toast.error(res.message);
    }
  };

  const handleCancelTrip = async (tripId: number) => {
    if (!confirm("Are you sure you want to cancel this trip?")) return;
    const res = await cancelTrip(tripId);
    if (res.ok) {
      toast.success("Trip cancelled successfully!");
    } else {
      toast.error(res.message);
    }
  };

  const getStatusBadge = (status: TripStatus) => {
    switch (status) {
      case 'DRAFT':
        return <Badge className="bg-neutral-500">Draft</Badge>;
      case 'DISPATCHED':
        return <Badge className="bg-blue-500">Dispatched</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-500">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 geist-mono tracking-tighter">
            Trip Dispatcher
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Trip Form */}
        <div className="space-y-6">
          
          <div className="flex items-center space-x-4 mb-6">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold w-32">Trip Lifecycle</h4>
            <div className="flex-1 flex items-center justify-between relative">
               <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-neutral-200 -z-10 -translate-y-1/2"></div>
               <div className="flex flex-col items-center">
                 <div className="w-3 h-3 rounded-full bg-green-500 mb-1"></div>
                 <span className="text-[10px] text-green-600 font-medium uppercase">Draft</span>
               </div>
               <div className="flex flex-col items-center">
                 <div className="w-3 h-3 rounded-full bg-blue-500 mb-1"></div>
                 <span className="text-[10px] text-blue-600 font-medium uppercase">Dispatched</span>
               </div>
               <div className="flex flex-col items-center">
                 <div className="w-3 h-3 rounded-full bg-neutral-400 mb-1"></div>
                 <span className="text-[10px] text-neutral-500 font-medium uppercase">Completed</span>
               </div>
               <div className="flex flex-col items-center">
                 <div className="w-3 h-3 rounded-full bg-neutral-400 mb-1"></div>
                 <span className="text-[10px] text-neutral-500 font-medium uppercase">Cancelled</span>
               </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="uppercase text-sm tracking-wider text-neutral-600">Create Trip</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Input value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. Gandhinagar Depot" />
              </div>
              <div className="space-y-2">
                <Label>Destination</Label>
                <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Ahmedabad Hub" />
              </div>
              <div className="space-y-2">
                <Label>Vehicle (Available Only)</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map(v => (
                      <SelectItem key={v.id} value={v.id.toString()}>{v.vehicleName} - {v.maxLoadCapacityKg} kg</SelectItem>
                    ))}
                    {availableVehicles.length === 0 && <SelectItem value="none" disabled>No vehicles available</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Driver (Available Only)</Label>
                <Select value={driverId} onValueChange={setDriverId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map(d => (
                      <SelectItem key={d.id} value={d.id.toString()}>{d.fullName}</SelectItem>
                    ))}
                    {availableDrivers.length === 0 && <SelectItem value="none" disabled>No drivers available</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cargo Weight (kg)</Label>
                <Input type="number" value={cargoWeight} onChange={e => setCargoWeight(e.target.value)} placeholder="700" />
              </div>
              <div className="space-y-2">
                <Label>Planned Distance (km)</Label>
                <Input type="number" value={plannedDistance} onChange={e => setPlannedDistance(e.target.value)} placeholder="38" />
              </div>

              {selectedVehicle && (
                <div className={`p-4 rounded-md border text-sm mt-4 ${isCapacityExceeded ? 'bg-red-50 border-red-200 text-red-600' : 'bg-neutral-50 border-neutral-200 text-neutral-600'}`}>
                  <p>Vehicle Capacity: {selectedVehicle.maxLoadCapacityKg} kg</p>
                  <p>Cargo Weight: {cargoWeight || 0} kg</p>
                  {isCapacityExceeded && (
                    <p className="font-semibold mt-1">❌ Capacity exceeded by {Number(cargoWeight) - selectedVehicle.maxLoadCapacityKg} kg — dispatch blocked</p>
                  )}
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button 
                  onClick={handleDispatch} 
                  disabled={!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance || !!isCapacityExceeded || isSubmitting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? "Dispatching..." : "Dispatch"}
                </Button>
                <Button variant="outline" className="flex-1" disabled={isSubmitting}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Board */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-4">Live Board</h4>
          <div className="space-y-4">
            {trips.slice().reverse().map(trip => {
              const vehicle = vehicles.find(v => v.id === trip.vehicleId);
              const driver = drivers.find(d => d.id === trip.driverId);
              
              return (
                <Card key={trip.id} className="border-dashed border-2 bg-transparent shadow-none hover:bg-neutral-50/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-mono font-semibold text-neutral-700">{trip.tripCode}</div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wider font-medium">
                        {vehicle?.vehicleName || 'Unassigned'} / {driver?.fullName?.toUpperCase() || 'No Driver'}
                      </div>
                    </div>
                    <div className="text-sm text-neutral-600 mb-4 font-medium">
                      {trip.source} &rarr; {trip.destination}
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      {getStatusBadge(trip.status)}
                      <div className="flex items-center gap-3">
                        {trip.status === 'DRAFT' && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-blue-500 text-blue-600 hover:bg-blue-50" onClick={() => handleDispatchDraft(trip.id)} disabled={isSubmitting}>
                            Start Trip
                          </Button>
                        )}
                        {trip.status === 'DISPATCHED' && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-green-500 text-green-600 hover:bg-green-50" onClick={() => handleComplete(trip.id)}>
                            Complete Trip
                          </Button>
                        )}
                        {(trip.status === 'DRAFT' || trip.status === 'DISPATCHED') && (
                          <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-red-500 text-red-600 hover:bg-red-50" onClick={() => handleCancelTrip(trip.id)}>
                            Cancel
                          </Button>
                        )}
                        <div className="text-xs text-neutral-400">
                          {trip.status === 'DISPATCHED' ? 'In transit' : 
                           trip.status === 'DRAFT' ? 'Awaiting dispatch' :
                           trip.status === 'COMPLETED' ? 'Completed' :
                           trip.status === 'CANCELLED' ? 'Cancelled' : ''}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          <p className="text-xs text-neutral-500 mt-6 mt-8">On Complete: odometer &rarr; fuel log &rarr; expenses &rarr; Vehicle & Driver Available</p>
        </div>
      </div>
    </div>
  );
}
