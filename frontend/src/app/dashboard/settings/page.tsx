"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 geist-mono tracking-tighter">
            Settings & RBAC
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* General Settings */}
        <div className="space-y-6">
          <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">General</h4>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="uppercase text-xs text-neutral-500 tracking-wide">Depot Name</Label>
              <Input defaultValue="Gandhinagar Depot GJ4" />
            </div>
            
            <div className="space-y-2">
              <Label className="uppercase text-xs text-neutral-500 tracking-wide">Currency</Label>
              <Select defaultValue="inr">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inr">INR (Rs)</SelectItem>
                  <SelectItem value="usd">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="uppercase text-xs text-neutral-500 tracking-wide">Distance Unit</Label>
              <Select defaultValue="km">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="km">Kilometers</SelectItem>
                  <SelectItem value="mi">Miles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4">
              <Button className="bg-blue-400 hover:bg-blue-500 text-white w-full sm:w-auto px-8">
                Save changes
              </Button>
            </div>
          </div>
        </div>

        {/* Role-Based Access Control */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-6">Role-Based Access (RBAC)</h4>
          
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="uppercase text-xs tracking-wider font-semibold">Role</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold">Fleet</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold">Driver</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold">Trip</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold">Fuel/Exp</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold">Analytics</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium text-sm">Fleet Manager</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-sm">Dispatcher</TableCell>
                <TableCell>View</TableCell>
                <TableCell>-</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-sm">Safety Officer</TableCell>
                <TableCell>-</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>View</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium text-sm">Financial Analyst</TableCell>
                <TableCell>View</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>✓</TableCell>
                <TableCell>✓</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
