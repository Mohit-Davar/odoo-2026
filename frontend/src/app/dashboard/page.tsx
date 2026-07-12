"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const { dashboardStats } = useAppStore();

  const kpis = dashboardStats?.kpis || { vehicles: {}, drivers: {}, trips: {}, fleetUtilizationPercent: 0 };
  const recentTrips = dashboardStats?.recentTrips || [];

  const totalVehicles = kpis.vehicles.total || 0;
  const activeVehicles = kpis.vehicles.onTrip || 0;
  const availableVehicles = kpis.vehicles.available || 0;
  const vehiclesInMaintenance = kpis.vehicles.inMaintenance || 0;
  const utilization = kpis.fleetUtilizationPercent || 0;

  const activeTrips = kpis.trips.active || 0;
  const pendingTrips = kpis.trips.pending || 0;
  const driversOnDuty = kpis.drivers.onDuty || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ON_TRIP':
      case 'DISPATCHED':
        return <Badge className="bg-blue-500">{status}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-500">{status}</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-500">{status}</Badge>;
      case 'DRAFT':
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 geist-mono tracking-tighter">
          Dashboard
        </h1>
        <p className="text-neutral-600 geist-mono mt-2">
          Overview of fleet operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="animate-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeVehicles}</div>
          </CardContent>
        </Card>
        
        <Card className="animate-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Available Vehicles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{availableVehicles}</div>
          </CardContent>
        </Card>

        <Card className="animate-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">In Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{vehiclesInMaintenance}</div>
          </CardContent>
        </Card>

        <Card className="animate-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{utilization}%</div>
          </CardContent>
        </Card>

        <Card className="animate-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{activeTrips}</div>
          </CardContent>
        </Card>

        <Card className="animate-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending Trips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-neutral-500">{pendingTrips}</div>
          </CardContent>
        </Card>
        
        <Card className="animate-lift">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Drivers on Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{driversOnDuty}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="uppercase tracking-wider text-sm text-neutral-600">Recent Trips</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Trip</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTrips.map((trip: any) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium">{trip.tripCode}</TableCell>
                      <TableCell>{trip.vehicle?.vehicleName || '-'}</TableCell>
                      <TableCell>{trip.driver?.fullName || '-'}</TableCell>
                      <TableCell>{getStatusBadge(trip.status)}</TableCell>
                    </TableRow>
                  ))}
                  {recentTrips.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-neutral-500">
                        No recent trips found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
           <Card>
             <CardHeader>
               <CardTitle className="uppercase tracking-wider text-sm text-neutral-600">Vehicle Status</CardTitle>
             </CardHeader>
             <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Available</span>
                    <span className="font-medium">{availableVehicles}</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${totalVehicles ? (availableVehicles/totalVehicles)*100 : 0}%` }}></div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>On Trip</span>
                    <span className="font-medium">{activeVehicles}</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${totalVehicles ? (activeVehicles/totalVehicles)*100 : 0}%` }}></div>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>In Shop</span>
                    <span className="font-medium">{vehiclesInMaintenance}</span>
                  </div>
                  <div className="w-full bg-neutral-100 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${totalVehicles ? (vehiclesInMaintenance/totalVehicles)*100 : 0}%` }}></div>
                  </div>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
