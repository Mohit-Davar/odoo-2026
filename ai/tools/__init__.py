from langchain_core.tools import tool
from .vehicle_tools import get_all_vehicles, get_vehicles_by_status
from .driver_tools import get_all_drivers, get_drivers_by_status, get_driver_license_alerts
from .trip_tools import get_all_trips, get_trips_by_status
from .fuel_tools import get_fuel_summary
from .expense_tools import get_expense_summary
from .fleet_tools import get_fleet_summary

# Wrap the domain functions as LangChain tool objects
ALL_TOOLS = [
    tool(get_all_vehicles),
    tool(get_vehicles_by_status),
    tool(get_all_drivers),
    tool(get_drivers_by_status),
    tool(get_driver_license_alerts),
    tool(get_all_trips),
    tool(get_trips_by_status),
    tool(get_fuel_summary),
    tool(get_expense_summary),
    tool(get_fleet_summary)
]
