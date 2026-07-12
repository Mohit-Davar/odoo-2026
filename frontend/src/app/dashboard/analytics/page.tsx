"use client";

import { useAppStore } from "@/store/useAppStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AnalyticsPage() {
  const { analyticsStats, trips } = useAppStore();

  const fuelEfficiencyList = analyticsStats?.fuelEfficiency || [];
  const validEfficiencies = fuelEfficiencyList.filter((v: any) => v.efficiencyKmPerLitre > 0);
  const avgEfficiency = validEfficiencies.length > 0 
    ? (validEfficiencies.reduce((acc: number, v: any) => acc + v.efficiencyKmPerLitre, 0) / validEfficiencies.length).toFixed(1)
    : "0.0";

  const utilization = analyticsStats?.fleetUtilization?.utilizationPercent || 0;
  const operationalCost = analyticsStats?.operationalCost?.grandTotal || 0;

  const vehicleROIList = analyticsStats?.vehicleROI || [];
  const avgRoi = vehicleROIList.length > 0 
    ? (vehicleROIList.reduce((acc: number, v: any) => acc + (v.roi || 0), 0) / vehicleROIList.length).toFixed(1)
    : "0.0";

  const topCostliest = [...vehicleROIList]
    .sort((a: any, b: any) => b.totalCost - a.totalCost)
    .slice(0, 3);

  // Fallbacks for chart visualization scale
  const maxCost = topCostliest.length > 0 ? topCostliest[0].totalCost : 1;

  // Calculate monthly revenue for the last 7 months
  const monthlyRevenue = Array(7).fill(0);
  const now = new Date();
  
  trips.forEach(trip => {
    if (trip.status === 'COMPLETED' && trip.completed_at && trip.revenue) {
      const tripDate = new Date(trip.completed_at);
      const monthDiff = (now.getFullYear() - tripDate.getFullYear()) * 12 + now.getMonth() - tripDate.getMonth();
      if (monthDiff >= 0 && monthDiff < 7) {
        monthlyRevenue[6 - monthDiff] += trip.revenue;
      }
    }
  });
  const maxMonthRev = Math.max(...monthlyRevenue, 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 geist-mono tracking-tighter">
            Reports & Analytics
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-neutral-500 uppercase tracking-wider">Avg Fuel Efficiency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgEfficiency} km/l</div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-neutral-500 uppercase tracking-wider">Fleet Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{utilization}%</div>
          </CardContent>
        </Card>
        
        <Card className="border-t-4 border-t-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-neutral-500 uppercase tracking-wider">Operational Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">₹{operationalCost.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-600">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-neutral-500 uppercase tracking-wider">Vehicle ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgRoi}%</div>
          </CardContent>
        </Card>
      </div>
      
      <p className="text-xs text-neutral-500 italic mt-2">
        ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div>
          <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-4">Monthly Revenue</h4>
          <div className="h-48 flex items-end gap-2 border-b border-l border-neutral-300 p-4">
            {monthlyRevenue.map((rev, idx) => {
              const heightPct = (rev / maxMonthRev) * 100;
              return (
                <div 
                  key={idx} 
                  title={`₹${rev.toLocaleString()}`}
                  className="bg-blue-400 w-full rounded-t-sm hover:bg-blue-500 transition-colors cursor-pointer relative group flex justify-center" 
                  style={{ height: `${Math.max(heightPct, 2)}%` }}
                >
                  <span className="absolute -top-6 text-[10px] text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white px-1 rounded shadow-sm">
                    {rev > 0 ? `₹${rev > 1000 ? (rev/1000).toFixed(1)+'k' : rev}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold mb-4">Top Costliest Vehicles (Maintenance + Fuel)</h4>
          <div className="space-y-4 pt-4">
            {topCostliest.map((vehicle: any, index: number) => {
              const widthPct = maxCost > 0 ? (vehicle.totalCost / maxCost) * 100 : 0;
              const colorClass = index === 0 ? "bg-red-400" : index === 1 ? "bg-amber-600" : "bg-blue-400";
              return (
                <div key={vehicle.vehicleId} className="flex items-center gap-4">
                  <span className="w-20 text-xs font-semibold uppercase">{vehicle.vehicleName}</span>
                  <div className="flex-1 bg-neutral-100 h-4 rounded-full overflow-hidden flex items-center">
                    <div className={`${colorClass} h-full`} style={{ width: `${Math.max(widthPct, 2)}%` }}></div>
                  </div>
                  <span className="text-xs text-neutral-500 w-16 text-right">₹{vehicle.totalCost.toLocaleString()}</span>
                </div>
              );
            })}
            {topCostliest.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-4">No cost data available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
