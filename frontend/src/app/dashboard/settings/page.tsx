"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthStore } from "../../../../store/authstore";
import { useAppStore } from "@/store/useAppStore";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { users, roles, fetchUsers, fetchRoles, addPerson, assignRole } = useAppStore();
  
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserData, setNewUserData] = useState({ name: "", email: "", password: "", roleId: "3" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = user?.roleId === 1 || user?.role_id === 1 || user?.role_name === "ADMIN";

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchRoles();
    }
  }, [isAdmin, fetchUsers, fetchRoles]);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await addPerson({
      name: newUserData.name,
      email: newUserData.email,
      password: newUserData.password,
      roleId: parseInt(newUserData.roleId)
    });
    
    if (res.ok) {
      toast.success(res.message);
      setIsAddUserOpen(false);
      setNewUserData({ name: "", email: "", password: "", roleId: "3" });
    } else {
      toast.error(res.message || "Failed to add user");
    }
    setIsSubmitting(false);
  };

  const handleRoleChange = async (userId: number, newRoleId: string) => {
    const res = await assignRole(userId, parseInt(newRoleId));
    if (res.ok) {
      toast.success(res.message);
    } else {
      toast.error(res.message || "Failed to update role");
    }
  };

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

        {/* Role-Based Access Control Info */}
        <div>
          <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-6">Role-Based Access Matrix</h4>
          
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

      {/* Admin User Management */}
      {isAdmin && (
        <div className="pt-8 border-t border-neutral-200 mt-8">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">User Management</h4>
            <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
              <DialogTrigger asChild>
                <Button className="bg-neutral-900 text-white hover:bg-neutral-800">
                  + Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New User</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddUser} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      value={newUserData.name} 
                      onChange={(e) => setNewUserData({...newUserData, name: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={newUserData.email} 
                      onChange={(e) => setNewUserData({...newUserData, email: e.target.value})} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={newUserData.password} 
                      onChange={(e) => setNewUserData({...newUserData, password: e.target.value})} 
                      required 
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roleId">Assign Role</Label>
                    <Select 
                      value={newUserData.roleId} 
                      onValueChange={(val) => setNewUserData({...newUserData, roleId: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role: any) => (
                          <SelectItem key={role.id} value={role.id.toString()}>
                            {role.name.replace(/_/g, ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting ? "Creating..." : "Create User"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50/50">
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name}</TableCell>
                    <TableCell className="text-neutral-500">{u.email}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {u.verified ? 'Verified' : 'Pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={u.role_id?.toString()} 
                        onValueChange={(val) => handleRoleChange(u.id, val)}
                        disabled={u.role_name === 'ADMIN' && u.id === user?.id} // Prevent admin from changing their own role easily
                      >
                        <SelectTrigger className="w-[180px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role: any) => (
                            <SelectItem key={role.id} value={role.id.toString()} className="text-xs">
                              {role.name.replace(/_/g, ' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
                {users.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-neutral-500">
                      Loading users...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
