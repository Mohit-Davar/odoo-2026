"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MaintenanceLog } from "@/types";

import { toast } from "sonner";

export default function MaintenancePage() {
  const { vehicles, maintenanceLogs, addMaintenanceLog } = useAppStore();
  
  const [vehicleId, setVehicleId] = useState<string>("");
  const [serviceType, setServiceType] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"Active" | "Completed">("Active");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!vehicleId || !serviceType || !cost || !date) return;
    
    setIsSubmitting(true);

    const newLog = {
      vehicleId: Number(vehicleId),
      maintenanceType: serviceType,
      description: serviceType,
      cost: Number(cost),
      maintenanceDate: date,
      status: status === "Active" ? "IN_PROGRESS" : "COMPLETED",
    };

    const res = await addMaintenanceLog(newLog as any);
    
    if (res.ok) {
      toast.success("Maintenance log added successfully");
      // Reset form
      setVehicleId("");
      setServiceType("");
      setCost("");
      setDate("");
      setStatus("Active");
    } else {
      toast.error(res.message);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 geist-mono tracking-tighter">
            Maintenance
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Log Service Record Form */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="uppercase text-sm tracking-wider text-neutral-600">Log Service Record</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Vehicle</Label>
                <Select value={vehicleId} onValueChange={setVehicleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map(v => (
                      <SelectItem key={v.id} value={v.id.toString()}>{v.vehicleName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Service Type</Label>
                <Input value={serviceType} onChange={e => setServiceType(e.target.value)} placeholder="e.g. Oil Change" />
              </div>
              <div className="space-y-2">
                <Label>Cost</Label>
                <Input type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="e.g. 2500" onKeyDown={(e) => { if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') e.preventDefault(); }} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={status} onValueChange={(val: "Active" | "Completed") => setStatus(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleSave} 
                disabled={!vehicleId || !serviceType || !cost || !date || isSubmitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </CardContent>
          </Card>

          <div className="text-sm font-medium">
            <div className="flex items-center gap-4 text-green-600 mb-2">
              <span className="w-20">Available</span>
              <span className="text-neutral-400">───── (creating active record) ─────&gt;</span>
              <span className="text-amber-600">In Shop</span>
            </div>
            <div className="flex items-center gap-4 text-amber-600">
              <span className="w-20">In Shop</span>
              <span className="text-neutral-400">───── (closing record/completed) ─────&gt;</span>
              <span className="text-green-600">Available</span>
            </div>
            <p className="text-xs text-amber-600 mt-4">Note: In Shop vehicles are removed from the dispatch pool.</p>
          </div>
        </div>

        {/* Right: Service Log Table */}
        <div className="lg:col-span-2 space-y-6">
          <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-4">Service Log</h4>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Vehicle</TableHead>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Service</TableHead>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Cost</TableHead>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceLogs.map(log => {
                    const vehicle = vehicles.find(v => v.id === log.vehicle_id);
                    // Infer status from vehicle status if we don't have a status on log
                    const isCompleted = vehicle?.status !== 'IN_SHOP';
                    return (
                      <TableRow key={log.id} className="hover:bg-neutral-50/50">
                        <TableCell className="px-4 py-3 font-medium">{vehicle?.vehicleName || 'Unknown'}</TableCell>
                        <TableCell className="px-4 py-3">{log.description}</TableCell>
                        <TableCell className="px-4 py-3">{log.cost.toLocaleString()}</TableCell>
                        <TableCell className="px-4 py-3">
                          {isCompleted ? (
                            <Badge className="bg-green-500">Completed</Badge>
                          ) : (
                            <Badge className="bg-amber-500 text-white hover:bg-amber-600">In Shop</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {maintenanceLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-neutral-500">
                        No service records found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
