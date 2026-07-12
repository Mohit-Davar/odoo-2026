import httpx
import os
from datetime import date

# The internal Node.js backend URL
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# We use a service-level token or bypass auth for internal calls.
# The Node.js server should expose an internal-only route OR we pass
# a trusted internal secret header. For now we use a shared secret.
INTERNAL_SECRET = os.getenv("INTERNAL_API_SECRET", "transitops-internal")

HEADERS = {"x-internal-secret": INTERNAL_SECRET}


async def fetch(client: httpx.AsyncClient, path: str) -> list | dict:
    """Fetch a route from the Node.js backend. Returns empty list on failure."""
    try:
        response = await client.get(f"{BACKEND_URL}{path}", headers=HEADERS, timeout=5.0)
        if response.status_code == 200:
            data = response.json()
            # Some routes return {"vehicles": [...]} others return [...]
            if isinstance(data, list):
                return data
            # Unwrap common wrapper keys
            for key in ("vehicles", "drivers", "trips", "fuelLogs", "expenses", "logs"):
                if key in data:
                    return data[key]
            return data
    except Exception:
        pass
    return []


async def build_fleet_context() -> str:
    """
    Fetches live data from the Node.js backend and returns a structured
    text summary that can be injected directly into a Gemini prompt.
    """
    async with httpx.AsyncClient() as client:
        vehicles  = await fetch(client, "/api/vehicles")
        drivers   = await fetch(client, "/api/drivers")
        trips     = await fetch(client, "/api/trips")
        fuel_logs = await fetch(client, "/api/fuel")
        expenses  = await fetch(client, "/api/expenses")

    today = date.today().isoformat()

    # ── Vehicles ─────────────────────────────────────────────────────────────
    vehicle_lines = []
    for v in vehicles:
        vehicle_lines.append(
            f"  - ID:{v.get('id')} | {v.get('vehicleName','?')} "
            f"({v.get('registrationNumber','?')}) | Type:{v.get('vehicleType','?')} "
            f"| Capacity:{v.get('maxLoadCapacityKg','?')}kg "
            f"| Odometer:{v.get('odometerKm','?')}km "
            f"| Status:{v.get('status','?')}"
        )
    vehicles_text = "\n".join(vehicle_lines) if vehicle_lines else "  No vehicles found."

    # ── Drivers ──────────────────────────────────────────────────────────────
    driver_lines = []
    for d in drivers:
        expiry = d.get("licenseExpiryDate", "?")
        driver_lines.append(
            f"  - ID:{d.get('id')} | {d.get('fullName','?')} "
            f"| License:{d.get('licenseNumber','?')} ({d.get('licenseCategory','?')}) "
            f"| Expiry:{expiry} "
            f"| Rating:{d.get('rating','?')} "
            f"| Status:{d.get('status','?')}"
        )
    drivers_text = "\n".join(driver_lines) if driver_lines else "  No drivers found."

    # ── Trips ────────────────────────────────────────────────────────────────
    trip_lines = []
    for t in trips:
        trip_lines.append(
            f"  - ID:{t.get('id')} | {t.get('tripCode','?')} "
            f"| {t.get('source','?')} → {t.get('destination','?')} "
            f"| Vehicle ID:{t.get('vehicleId','?')} | Driver ID:{t.get('driverId','?')} "
            f"| Cargo:{t.get('cargoWeightKg','?')}kg "
            f"| Status:{t.get('status','?')} "
            f"| Dispatched:{t.get('dispatchedAt','N/A')} "
            f"| Completed:{t.get('completedAt','N/A')}"
        )
    trips_text = "\n".join(trip_lines) if trip_lines else "  No trips found."

    # ── Fuel Logs ────────────────────────────────────────────────────────────
    fuel_lines = []
    total_fuel_cost = 0.0
    total_litres = 0.0
    for f in fuel_logs:
        cost = float(f.get("totalCost", 0) or 0)
        litres = float(f.get("litres", 0) or 0)
        total_fuel_cost += cost
        total_litres += litres
        fuel_lines.append(
            f"  - Vehicle ID:{f.get('vehicleId','?')} "
            f"| Date:{f.get('fuelDate','?')} "
            f"| Litres:{litres} | Cost:₹{cost}"
        )
    fuel_text = "\n".join(fuel_lines) if fuel_lines else "  No fuel logs found."

    # ── Expenses ─────────────────────────────────────────────────────────────
    expense_lines = []
    total_expenses = 0.0
    for e in expenses:
        amount = float(e.get("amount", 0) or 0)
        total_expenses += amount
        expense_lines.append(
            f"  - Trip ID:{e.get('tripId','?')} | Vehicle ID:{e.get('vehicleId','?')} "
            f"| Type:{e.get('expenseType','?')} | Amount:₹{amount} "
            f"| Date:{e.get('expenseDate','?')} | Notes:{e.get('notes','')}"
        )
    expenses_text = "\n".join(expense_lines) if expense_lines else "  No expense records found."

    # ── Quick Stats ──────────────────────────────────────────────────────────
    available_vehicles = [v for v in vehicles if v.get("status") == "AVAILABLE"]
    on_trip_vehicles   = [v for v in vehicles if v.get("status") == "ON_TRIP"]
    in_shop_vehicles   = [v for v in vehicles if v.get("status") == "IN_SHOP"]

    available_drivers  = [d for d in drivers if d.get("status") == "AVAILABLE"]
    on_trip_drivers    = [d for d in drivers if d.get("status") == "ON_TRIP"]
    suspended_drivers  = [d for d in drivers if d.get("status") == "SUSPENDED"]

    active_trips       = [t for t in trips if t.get("status") == "DISPATCHED"]
    completed_trips    = [t for t in trips if t.get("status") == "COMPLETED"]
    draft_trips        = [t for t in trips if t.get("status") == "DRAFT"]

    context = f"""
=== TRANSITOPS LIVE FLEET CONTEXT (as of {today}) ===

--- QUICK STATS ---
Total Vehicles : {len(vehicles)} | Available:{len(available_vehicles)} | On Trip:{len(on_trip_vehicles)} | In Shop:{len(in_shop_vehicles)}
Total Drivers  : {len(drivers)} | Available:{len(available_drivers)} | On Trip:{len(on_trip_drivers)} | Suspended:{len(suspended_drivers)}
Total Trips    : {len(trips)} | Active:{len(active_trips)} | Completed:{len(completed_trips)} | Draft:{len(draft_trips)}
Total Fuel Cost: ₹{total_fuel_cost:.2f} ({total_litres:.2f} litres across all logs)
Total Expenses : ₹{total_expenses:.2f} across all recorded expenses

--- VEHICLES ---
{vehicles_text}

--- DRIVERS ---
{drivers_text}

--- TRIPS ---
{trips_text}

--- FUEL LOGS ---
{fuel_text}

--- EXPENSES ---
{expenses_text}

=== END OF CONTEXT ===
""".strip()

    return context
