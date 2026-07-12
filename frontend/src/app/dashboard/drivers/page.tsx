"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useMemo } from "react";
import { DriverStatus } from "@/types";
import { toast } from "sonner";
import { Pencil, Trash2, UserPlus } from "lucide-react";

// Helper: format ISO date → YYYY-MM-DD for <input type="date">
function toDateInputValue(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().split("T")[0];
}

export default function DriversPage() {
  const { drivers, addDriver, updateDriver, deleteDriver } = useAppStore();

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<DriverStatus | "ALL">("ALL");

  // ── Add Driver ───────────────────────────────────────────────────────────────
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    fullName: "", licenseNumber: "", licenseCategory: "",
    licenseExpiryDate: "", contactNumber: "",
  });
  const [isAdding, setIsAdding] = useState(false);

  // ── Edit Driver ──────────────────────────────────────────────────────────────
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    fullName: "", licenseNumber: "", licenseCategory: "",
    licenseExpiryDate: "", contactNumber: "", status: "" as DriverStatus | "",
  });
  const [isEditing, setIsEditing] = useState(false);

  // ── Delete Driver ────────────────────────────────────────────────────────────
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Derived list ─────────────────────────────────────────────────────────────
  const filteredDrivers = useMemo(() => {
    return drivers.filter((d: any) => {
      const matchSearch =
        !searchTerm ||
        d.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [drivers, searchTerm, statusFilter]);

  // ── Status badge ─────────────────────────────────────────────────────────────
  const getStatusBadge = (status: DriverStatus) => {
    switch (status) {
      case "AVAILABLE":   return <Badge className="bg-green-500 text-white">Available</Badge>;
      case "ON_TRIP":     return <Badge className="bg-blue-500 text-white">On Trip</Badge>;
      case "SUSPENDED":   return <Badge className="bg-orange-500 text-white">Suspended</Badge>;
      case "OFF_DUTY":    return <Badge className="bg-neutral-500 text-white">Off Duty</Badge>;
      default:            return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // ── Rating color ─────────────────────────────────────────────────────────────
  const ratingClass = (r: number) =>
    r >= 90 ? "text-green-600" : r >= 75 ? "text-amber-600" : "text-red-600";

  // ── Validate & submit: Add ───────────────────────────────────────────────────
  const handleAdd = async () => {
    const { fullName, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber } = addForm;
    if (!fullName || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber) {
      toast.error("All fields are required"); return;
    }
    if (licenseNumber.length < 5) { toast.error("License number must be ≥ 5 characters"); return; }
    const digits = contactNumber.replace(/\D/g, "");
    if (digits.length < 10) { toast.error("Contact number must have at least 10 digits"); return; }
    if (contactNumber.trim().startsWith("0")) { toast.error("Contact number shouldn't start with 0"); return; }
    if (new Date(licenseExpiryDate) < new Date()) { toast.error("License expiry cannot be in the past"); return; }

    setIsAdding(true);
    const res = await addDriver({
      fullName,
      licenseNumber,
      licenseCategory,
      licenseExpiryDate: new Date(licenseExpiryDate).toISOString(),
      contactNumber,
      rating: 100,
      status: "AVAILABLE",
    });
    setIsAdding(false);
    if (res.ok) {
      toast.success("Driver added successfully");
      setIsAddOpen(false);
      setAddForm({ fullName: "", licenseNumber: "", licenseCategory: "", licenseExpiryDate: "", contactNumber: "" });
    } else {
      toast.error(res.message);
    }
  };

  // ── Open edit dialog ─────────────────────────────────────────────────────────
  const openEdit = (driver: any) => {
    setEditTargetId(driver.id);
    setEditForm({
      fullName: driver.fullName ?? "",
      licenseNumber: driver.licenseNumber ?? "",
      licenseCategory: driver.licenseCategory ?? "",
      licenseExpiryDate: toDateInputValue(driver.licenseExpiryDate),
      contactNumber: driver.contactNumber ?? "",
      status: driver.status ?? "AVAILABLE",
    });
    setIsEditOpen(true);
  };

  // ── Submit edit ──────────────────────────────────────────────────────────────
  const handleEdit = async () => {
    if (!editTargetId) return;
    const { fullName, licenseNumber, licenseCategory, licenseExpiryDate, contactNumber, status } = editForm;
    if (!fullName || !licenseNumber || !licenseCategory || !licenseExpiryDate || !contactNumber || !status) {
      toast.error("All fields are required"); return;
    }
    if (licenseNumber.length < 5) { toast.error("License number must be ≥ 5 characters"); return; }

    setIsEditing(true);
    const res = await updateDriver(editTargetId, {
      fullName, licenseNumber, licenseCategory,
      licenseExpiryDate: new Date(licenseExpiryDate).toISOString(),
      contactNumber, status,
    });
    setIsEditing(false);
    if (res.ok) {
      toast.success("Driver updated successfully");
      setIsEditOpen(false);
    } else {
      toast.error(res.message);
    }
  };

  // ── Confirm delete ────────────────────────────────────────────────────────────
  const openDelete = (driver: any) => {
    setDeleteTarget({ id: driver.id, name: driver.fullName ?? "this driver" });
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteDriver(deleteTarget.id);
    setIsDeleting(false);
    if (res.ok) {
      toast.success("Driver deleted");
      setIsDeleteOpen(false);
      setDeleteTarget(null);
    } else {
      toast.error(res.message);
    }
  };

  // ── Status filter tabs ────────────────────────────────────────────────────────
  const STATUS_TABS: Array<DriverStatus | "ALL"> = ["ALL", "AVAILABLE", "ON_TRIP", "OFF_DUTY", "SUSPENDED"];
  const tabLabel = (s: DriverStatus | "ALL") => {
    if (s === "ALL") return `All (${drivers.length})`;
    const count = (drivers as any[]).filter((d: any) => d.status === s).length;
    return `${s === "ON_TRIP" ? "On Trip" : s === "OFF_DUTY" ? "Off Duty" : s[0] + s.slice(1).toLowerCase()} (${count})`;
  };

  // ── Reusable field setter ─────────────────────────────────────────────────────
  const setAdd = (field: string, val: string) => setAddForm(p => ({ ...p, [field]: val }));
  const setEdit = (field: string, val: string) => setEditForm(p => ({ ...p, [field]: val }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 geist-mono tracking-tighter">
            Drivers &amp; Safety Profiles
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {drivers.length} driver{drivers.length !== 1 ? "s" : ""} registered
          </p>
        </div>

        {/* Add Driver Dialog */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 gap-2">
              <UserPlus className="w-4 h-4" /> Add Driver
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New Driver</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <FieldRow label="Full Name">
                <Input value={addForm.fullName} onChange={e => setAdd("fullName", e.target.value)} placeholder="e.g. John Doe" />
              </FieldRow>
              <FieldRow label="License Number">
                <Input value={addForm.licenseNumber} onChange={e => setAdd("licenseNumber", e.target.value)} placeholder="e.g. DL-12345678" />
              </FieldRow>
              <FieldRow label="License Category">
                <Input value={addForm.licenseCategory} onChange={e => setAdd("licenseCategory", e.target.value)} placeholder="e.g. Heavy Transport" />
              </FieldRow>
              <FieldRow label="License Expiry Date">
                <Input type="date" value={addForm.licenseExpiryDate} onChange={e => setAdd("licenseExpiryDate", e.target.value)} />
              </FieldRow>
              <FieldRow label="Contact Number">
                <Input value={addForm.contactNumber} onChange={e => setAdd("contactNumber", e.target.value)} placeholder="e.g. +91 9876543210" />
              </FieldRow>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleAdd}
                disabled={isAdding || !addForm.fullName || !addForm.licenseNumber || !addForm.licenseCategory || !addForm.licenseExpiryDate || !addForm.contactNumber}
              >
                {isAdding ? "Adding..." : "Add Driver"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + Status Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          placeholder="Search name or license number..."
          className="max-w-xs"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                statusFilter === s
                  ? "bg-orange-600 text-white border-orange-600"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-orange-400"
              }`}
            >
              {tabLabel(s)}
            </button>
          ))}
        </div>
      </div>

      {/* Drivers Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Driver</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">License No</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Category</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Expiry</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Contact</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Trip Compl.</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Safety</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3">Status</TableHead>
                <TableHead className="uppercase text-xs tracking-wider font-semibold px-4 py-3 text-right">Actions</TableHead>
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
                  <TableCell className="px-4 py-3 text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(driver)}>
                      <Pencil className="w-4 h-4 text-neutral-500" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openDelete(driver)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDrivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-neutral-400">
                    No drivers found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Driver Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Driver</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <FieldRow label="Full Name">
              <Input value={editForm.fullName} onChange={e => setEdit("fullName", e.target.value)} />
            </FieldRow>
            <FieldRow label="License Number">
              <Input value={editForm.licenseNumber} onChange={e => setEdit("licenseNumber", e.target.value)} />
            </FieldRow>
            <FieldRow label="License Category">
              <Input value={editForm.licenseCategory} onChange={e => setEdit("licenseCategory", e.target.value)} />
            </FieldRow>
            <FieldRow label="License Expiry Date">
              <Input type="date" value={editForm.licenseExpiryDate} onChange={e => setEdit("licenseExpiryDate", e.target.value)} />
            </FieldRow>
            <FieldRow label="Contact Number">
              <Input value={editForm.contactNumber} onChange={e => setEdit("contactNumber", e.target.value)} />
            </FieldRow>
            <FieldRow label="Status">
              <Select value={editForm.status} onValueChange={val => setEdit("status", val)}>
                <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="ON_TRIP">On Trip</SelectItem>
                  <SelectItem value="OFF_DUTY">Off Duty</SelectItem>
                  <SelectItem value="SUSPENDED">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </FieldRow>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={handleEdit}
                disabled={isEditing}
              >
                {isEditing ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Delete Driver</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-neutral-600 text-sm">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-neutral-900">{deleteTarget?.name}</span>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer note */}
      <p className="text-xs text-orange-600">
        Rule: Expired license or Suspended status &rarr; blocked from trip assignment
      </p>
    </div>
  );
}

// Small helper component to keep form rows tidy
function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}
