"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { DriverStatus } from "@/types";
import { toast } from "sonner";

export default function DriversPage() {
  const { drivers, addDriver } = useAppStore();
  const [searchTerm, setSearchTerm] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [licenseCategory, setLicenseCategory] = useState("");
  const [licenseExpiryDate, setLicenseExpiryDate] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStatusBadge = (status: DriverStatus) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-green-500">Available</Badge>;
      case 'ON_TRIP':
        return <Badge className="bg-blue-500">On Trip</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-orange-500">Suspended</Badge>;
      case 'OFF_DUTY':
        return <Badge className="bg-neutral-500">Off Duty</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredDrivers = drivers.filter(d => 
    d.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDriver = async () => {
    if (!fullName || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) return;
    
    if (licenseNumber.length < 5) {
      toast.error("License Number must be at least 5 characters");
      return;
    }
    
    // Validate contact number: min 10 digits, no leading 0 (ignoring optional country code for this simple check)
    const cleanedContact = contactNumber.replace(/\D/g, ''); // strip non-digits for check
    if (cleanedContact.length < 10) {
      toast.error("Contact number must be at least 10 digits");
      return;
    }
    // Check if the actual input string starts with 0 after potential + or space
    if (contactNumber.trim().startsWith('0') || contactNumber.trim().startsWith('+0')) {
      toast.error("Contact number shouldn't start with 0");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(licenseExpiryDate);
    if (expiry < today) {
      toast.error("License expiry date cannot be in the past");
      return;
    }

    setIsSubmitting(true);
    const res = await addDriver({
      fullName,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate: new Date(licenseExpiryDate).toISOString(),
      contactNumber,
      rating: 100, // Default rating for new drivers
      status: 'AVAILABLE'
    });
    if (res.ok) {
      toast.success("Driver added");
      setIsAddOpen(false);
      setFullName("");
      setLicenseNumber("");
      setLicenseCategory("");
      setLicenseExpiryDate("");
      setContactNumber("");
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
            Drivers & Safety Profiles
          </h1>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6">
              + Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Driver</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. John Doe" />
              </div>
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. DL12345678" />
              </div>
              <div className="space-y-2">
                <Label>License Category</Label>
                <Input value={licenseCategory} onChange={(e) => setLicenseCategory(e.target.value)} placeholder="e.g. HMV, LMV" />
              </div>
              <div className="space-y-2">
                <Label>License Expiry Date</Label>
                <Input type="date" value={licenseExpiryDate} onChange={(e) => setLicenseExpiryDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contact Number</Label>
                <Input value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} placeholder="e.g. +91 9876543210" />
              </div>
              <Button 
                className="w-full bg-orange-600 hover:bg-orange-700 text-white" 
                onClick={handleAddDriver}
                disabled={isSubmitting || !fullName || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber}
              >
                {isSubmitting ? "Adding..." : "Add Driver"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <Input 
          placeholder="Search name or license..." 
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
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">DRIVER</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">LICENSE NO</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">CATEGORY</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">EXPIRY</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">CONTACT</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">TRIP COMPL.</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">SAFETY</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrivers.map((driver) => (
                <TableRow key={driver.id} className="hover:bg-neutral-50/50">
                  <TableCell className="px-4 py-3 font-medium">{driver.fullName}</TableCell>
                  <TableCell className="px-4 py-3">{driver.licenseNumber}</TableCell>
                  <TableCell className="px-4 py-3">{driver.licenseCategory}</TableCell>
                  <TableCell className="px-4 py-3">{driver.licenseExpiryDate ? new Date(driver.licenseExpiryDate).toLocaleDateString() : ''}</TableCell>
                  <TableCell className="px-4 py-3">{driver.contactNumber}</TableCell>
                  <TableCell className="px-4 py-3">{driver.tripCompletedCount || 0}</TableCell>
                  <TableCell className="px-4 py-3">
                    <span className={`font-semibold ${driver.rating >= 90 ? 'text-green-600' : driver.rating >= 75 ? 'text-amber-600' : 'text-red-600'}`}>
                      {driver.rating}%
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">{getStatusBadge(driver.status)}</TableCell>
                </TableRow>
              ))}
              {filteredDrivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-neutral-500">
                    No drivers found matching criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="mt-4">
        <h4 className="text-xs uppercase tracking-wider text-neutral-500 mb-2 font-semibold">Toggle Stats</h4>
        <div className="flex gap-2">
          {getStatusBadge('AVAILABLE')}
          {getStatusBadge('ON_TRIP')}
          {getStatusBadge('OFF_DUTY')}
          {getStatusBadge('SUSPENDED')}
        </div>
      </div>

      <p className="text-xs text-orange-600">Rule: Expired license or Suspended status &rarr; blocked from trip assignment</p>
    </div>
  );
}
