"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function FuelExpensesPage() {
  const { vehicles, trips, fuelLogs, expenses, addFuelLog, addExpense } = useAppStore();

  const [isFuelOpen, setIsFuelOpen] = useState(false);
  const [isExpenseOpen, setIsExpenseOpen] = useState(false);

  // Fuel form state
  const [fuelVehicleId, setFuelVehicleId] = useState("");
  const [fuelDate, setFuelDate] = useState("");
  const [litres, setLitres] = useState("");
  const [fuelCost, setFuelCost] = useState("");
  const [isSubmittingFuel, setIsSubmittingFuel] = useState(false);

  // Expense form state
  const [expTripId, setExpTripId] = useState("");
  const [expType, setExpType] = useState<"TOLL" | "OTHER">("TOLL");
  const [expAmount, setExpAmount] = useState("");
  const [expDate, setExpDate] = useState("");
  const [isSubmittingExp, setIsSubmittingExp] = useState(false);

  const totalFuelCost = fuelLogs.reduce((sum, log) => sum + (log.totalCost || 0), 0);
  const totalExpensesCost = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalOperationalCost = totalFuelCost + totalExpensesCost;

  const handleAddFuel = async () => {
    if (!fuelVehicleId || !fuelDate || !litres || !fuelCost) return;
    setIsSubmittingFuel(true);
    const res = await addFuelLog({
      vehicleId: Number(fuelVehicleId),
      fuelDate: new Date(fuelDate).toISOString(),
      litres: Number(litres),
      totalCost: Number(fuelCost)
    });
    if (res.ok) {
      toast.success("Fuel log added");
      setIsFuelOpen(false);
      setFuelVehicleId("");
      setFuelDate("");
      setLitres("");
      setFuelCost("");
    } else {
      toast.error(res.message);
    }
    setIsSubmittingFuel(false);
  };

  const handleAddExpense = async () => {
    if (!expTripId || !expType || !expAmount || !expDate) return;
    setIsSubmittingExp(true);
    const res = await addExpense({
      tripId: Number(expTripId),
      expenseType: expType,
      amount: Number(expAmount),
      expenseDate: new Date(expDate).toISOString(),
    });
    if (res.ok) {
      toast.success("Expense added");
      setIsExpenseOpen(false);
      setExpTripId("");
      setExpAmount("");
      setExpDate("");
    } else {
      toast.error(res.message);
    }
    setIsSubmittingExp(false);
  };

  const handleNumKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') e.preventDefault();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 geist-mono tracking-tighter">
            Fuel & Expenses
          </h1>
        </div>
      </div>

      <div className="space-y-8">
        {/* Fuel Logs Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Fuel Logs</h4>
            <div className="flex gap-2">
              <Dialog open={isFuelOpen} onOpenChange={setIsFuelOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-full">
                    + Log Fuel
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Log Fuel</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Vehicle</Label>
                      <Select value={fuelVehicleId} onValueChange={setFuelVehicleId}>
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
                      <Label>Date</Label>
                      <Input type="date" value={fuelDate} onChange={e => setFuelDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Litres</Label>
                      <Input type="number" value={litres} onChange={e => setLitres(e.target.value)} onKeyDown={handleNumKeyDown} />
                    </div>
                    <div className="space-y-2">
                      <Label>Total Cost</Label>
                      <Input type="number" value={fuelCost} onChange={e => setFuelCost(e.target.value)} onKeyDown={handleNumKeyDown} />
                    </div>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white" 
                      onClick={handleAddFuel}
                      disabled={isSubmittingFuel || !fuelVehicleId || !fuelDate || !litres || !fuelCost}
                    >
                      {isSubmittingFuel ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isExpenseOpen} onOpenChange={setIsExpenseOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white rounded-full">
                    + Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Expense</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Trip</Label>
                      <Select value={expTripId} onValueChange={setExpTripId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select trip" />
                        </SelectTrigger>
                        <SelectContent>
                          {trips.map(t => (
                            <SelectItem key={t.id} value={t.id.toString()}>{t.tripCode}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Expense Type</Label>
                      <Select value={expType} onValueChange={(v: any) => setExpType(v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TOLL">Toll</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={expDate} onChange={e => setExpDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount</Label>
                      <Input type="number" value={expAmount} onChange={e => setExpAmount(e.target.value)} onKeyDown={handleNumKeyDown} />
                    </div>
                    <Button 
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white" 
                      onClick={handleAddExpense}
                      disabled={isSubmittingExp || !expTripId || !expDate || !expAmount}
                    >
                      {isSubmittingExp ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Vehicle</TableHead>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Date</TableHead>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Liters</TableHead>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Fuel Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fuelLogs.map(log => {
                    const vehicle = vehicles.find(v => v.id === log.vehicleId);
                    return (
                      <TableRow key={log.id} className="hover:bg-neutral-50/50">
                        <TableCell className="px-4 py-3 font-medium">{vehicle?.vehicleName || 'Unknown'}</TableCell>
                        <TableCell className="px-4 py-3">{log.fuelDate ? new Date(log.fuelDate).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell className="px-4 py-3">{log.litres?.toFixed(1)} L</TableCell>
                        <TableCell className="px-4 py-3">{log.totalCost?.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                  {fuelLogs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-neutral-500">
                        No fuel logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Other Expenses Section */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-4">Other Expenses (Toll / Misc)</h4>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Trip</TableHead>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Vehicle</TableHead>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Toll</TableHead>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Other</TableHead>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Maint. (Linked)</TableHead>
                    <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map(exp => {
                    const trip = trips.find(t => t.id === exp.tripId);
                    const vehicle = trip ? vehicles.find(v => v.id === trip.vehicleId) : null;
                    return (
                      <TableRow key={exp.id} className="hover:bg-neutral-50/50">
                        <TableCell className="px-4 py-3 font-medium">{trip?.tripCode || 'N/A'}</TableCell>
                        <TableCell className="px-4 py-3">{vehicle?.vehicleName || 'N/A'}</TableCell>
                        <TableCell className="px-4 py-3">{exp.expenseType === 'TOLL' ? exp.amount : 0}</TableCell>
                        <TableCell className="px-4 py-3">{exp.expenseType === 'OTHER' ? exp.amount : 0}</TableCell>
                        <TableCell className="px-4 py-3">0</TableCell>
                        <TableCell className="px-4 py-3 font-semibold">{exp.amount.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })}
                  {expenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                        No expenses found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center border-t border-neutral-200 pt-4">
          <h3 className="text-lg font-bold text-neutral-700 uppercase tracking-wide">
            Total Operational Cost (Auto) = Fuel + Maint + Exp
          </h3>
          <span className="text-2xl font-bold text-amber-600">
            {totalOperationalCost.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
