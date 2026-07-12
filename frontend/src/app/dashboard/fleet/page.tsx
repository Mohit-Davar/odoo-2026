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
  const { vehicles, addVehicle } = useAppStore();
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

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.registration_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.vehicle_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "All" || v.vehicle_type === typeFilter;
    const matchesStatus = statusFilter === "All" || v.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const uniqueTypes = Array.from(new Set(vehicles.map(v => v.vehicle_type)));

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
    });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 geist-mono tracking-tighter">
            Fleet Registry & Lifecycle
          </h1>
        </div>
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

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type: All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Type: All</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="hover:bg-neutral-50/50">
                  <TableCell className="px-4 py-3 font-medium">{vehicle.registration_number}</TableCell>
                  <TableCell className="px-4 py-3">{vehicle.vehicle_name}</TableCell>
                  <TableCell className="px-4 py-3">{vehicle.vehicle_type}</TableCell>
                  <TableCell className="px-4 py-3">{vehicle.max_load_capacity_kg} kg</TableCell>
                  <TableCell className="px-4 py-3">{vehicle.odometer_km?.toLocaleString()} km</TableCell>
                  <TableCell className="px-4 py-3">₹{vehicle.acquisition_cost?.toLocaleString()}</TableCell>
                  <TableCell className="px-4 py-3">{getStatusBadge(vehicle.status)}</TableCell>
                </TableRow>
              ))}
              {filteredVehicles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
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
