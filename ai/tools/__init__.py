from .vehicle_tools import get_all_vehicles, get_vehicles_by_status
from .driver_tools import get_all_drivers, get_drivers_by_status, get_driver_license_alerts
from .trip_tools import get_all_trips, get_trips_by_status
from .fuel_tools import get_fuel_summary
from .expense_tools import get_expense_summary
from .fleet_tools import get_fleet_summary

# Gather all tools into a single list for Gemini registration
ALL_TOOLS = [
    get_all_vehicles,
    get_vehicles_by_status,
    get_all_drivers,
    get_drivers_by_status,
    get_driver_license_alerts,
    get_all_trips,
    get_trips_by_status,
    get_fuel_summary,
    get_expense_summary,
    get_fleet_summary
]
