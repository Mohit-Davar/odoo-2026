from internal_client import fetch_api

async def get_all_trips() -> list:
    """
    Fetch all trips with their source, destination, cargo weight, planned distance, status, and assigned vehicle/driver.
    """
    return await fetch_api("/api/trips")

async def get_trips_by_status(status: str) -> list:
    """
    Fetch trips filtered by their current status.
    
    Args:
        status: The trip status to filter by. Must be one of: DRAFT, DISPATCHED, COMPLETED, CANCELLED
    """
    trips = await fetch_api("/api/trips")
    status_upper = status.strip().upper()
    return [t for t in trips if t.get("status") == status_upper]
