from internal_client import fetch_api

async def get_all_vehicles() -> list:
    """
    Fetch all vehicles in the fleet with their status, capacity, odometer, and type.
    """
    return await fetch_api("/api/vehicles")

async def get_vehicles_by_status(status: str) -> list:
    """
    Fetch vehicles filtered by a specific status.
    
    Args:
        status: The vehicle status to filter by. Must be one of: AVAILABLE, ON_TRIP, IN_SHOP, RETIRED
    """
    vehicles = await fetch_api("/api/vehicles")
    status_upper = status.strip().upper()
    return [v for v in vehicles if v.get("status") == status_upper]
