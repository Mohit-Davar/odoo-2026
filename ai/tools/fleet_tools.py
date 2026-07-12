from internal_client import fetch_api

async def get_fleet_summary() -> dict:
    """
    Get a high-level fleet operational dashboard summary (available rates, total costs, active count).
    """
    vehicles = await fetch_api("/api/vehicles")
    drivers = await fetch_api("/api/drivers")
    trips = await fetch_api("/api/trips")
    fuel_logs = await fetch_api("/api/fuel")
    expenses = await fetch_api("/api/expenses")
    
    # Calculate vehicle stats
    total_vehicles = len(vehicles)
    available_vehicles = len([v for v in vehicles if v.get("status") == "AVAILABLE"])
    on_trip_vehicles = len([v for v in vehicles if v.get("status") == "ON_TRIP"])
    in_shop_vehicles = len([v for v in vehicles if v.get("status") == "IN_SHOP"])
    
    # Calculate driver stats
    total_drivers = len(drivers)
    available_drivers = len([d for d in drivers if d.get("status") == "AVAILABLE"])
    on_trip_drivers = len([d for d in drivers if d.get("status") == "ON_TRIP"])
    
    # Calculate trip stats
    total_trips = len(trips)
    active_trips = len([t for t in trips if t.get("status") == "DISPATCHED"])
    completed_trips = len([t for t in trips if t.get("status") == "COMPLETED"])
    
    # Calculate financials
    total_fuel_cost = sum(float(l.get("totalCost") or 0) for l in fuel_logs)
    total_expense_cost = sum(float(e.get("amount") or 0) for e in expenses)
    
    return {
        "vehicleMetrics": {
            "totalCount": total_vehicles,
            "availableCount": available_vehicles,
            "onTripCount": on_trip_vehicles,
            "inShopCount": in_shop_vehicles,
            "availabilityRate": (available_vehicles / total_vehicles * 100) if total_vehicles > 0 else 0
        },
        "driverMetrics": {
            "totalCount": total_drivers,
            "availableCount": available_drivers,
            "onTripCount": on_trip_drivers,
            "availabilityRate": (available_drivers / total_drivers * 100) if total_drivers > 0 else 0
        },
        "tripMetrics": {
            "totalCount": total_trips,
            "activeCount": active_trips,
            "completedCount": completed_trips
        },
        "financials": {
            "totalFuelCost": total_fuel_cost,
            "totalExpenses": total_expense_cost,
            "totalOperationalCost": total_fuel_cost + total_expense_cost
        }
    }
