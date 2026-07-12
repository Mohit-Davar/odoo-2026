from internal_client import fetch_api

async def get_fuel_summary(vehicle_id: int = None) -> dict:
    """
    Fetch fuel logs and return a summary: total litres, total cost, and logs.
    
    Args:
        vehicle_id: Optional vehicle ID to filter fuel logs for a specific vehicle.
    """
    logs = await fetch_api("/api/fuel")
    
    # Filter logs if vehicle_id is provided
    if vehicle_id is not None:
        try:
            v_id = int(vehicle_id)
            logs = [l for l in logs if int(l.get("vehicleId")) == v_id]
        except Exception:
            pass
            
    total_litres = sum(float(l.get("litres") or 0) for l in logs)
    total_cost = sum(float(l.get("totalCost") or 0) for l in logs)
    
    return {
        "totalLitres": total_litres,
        "totalCost": total_cost,
        "recordCount": len(logs),
        "fuelLogs": logs
    }
