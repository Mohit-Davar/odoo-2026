from internal_client import fetch_api
from datetime import datetime, date

async def get_all_drivers() -> list:
    """
    Fetch all drivers with their license details, safety score rating, and current status.
    """
    return await fetch_api("/api/drivers")

async def get_drivers_by_status(status: str) -> list:
    """
    Fetch drivers filtered by their current status.
    
    Args:
        status: The driver status to filter by. Must be one of: AVAILABLE, ON_TRIP, OFF_DUTY, SUSPENDED
    """
    drivers = await fetch_api("/api/drivers")
    status_upper = status.strip().upper()
    return [d for d in drivers if d.get("status") == status_upper]

async def get_driver_license_alerts(days_threshold: int = 30) -> list:
    """
    Find all drivers whose license expires within a given number of days.
    
    Args:
        days_threshold: The number of days warning threshold (default is 30 days).
    """
    drivers = await fetch_api("/api/drivers")
    alerts = []
    today = date.today()
    
    for d in drivers:
        expiry_str = d.get("licenseExpiryDate")
        if not expiry_str:
            continue
            
        try:
            # Parse ISO date (e.g., '2030-05-15T00:00:00.000Z' or '2030-05-15')
            clean_date = expiry_str.split("T")[0]
            expiry_date = datetime.strptime(clean_date, "%Y-%m-%d").date()
            days_remaining = (expiry_date - today).days
            
            if days_remaining <= days_threshold:
                alerts.append({
                    "id": d.get("id"),
                    "fullName": d.get("fullName"),
                    "licenseNumber": d.get("licenseNumber"),
                    "licenseExpiryDate": expiry_str,
                    "daysRemaining": days_remaining,
                    "status": "EXPIRED" if days_remaining < 0 else "WARNING"
                })
        except Exception:
            pass
            
    return alerts
