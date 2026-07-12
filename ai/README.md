# TransitOps — AI LangChain Service

This is the FastAPI server running the LangChain AI agent. It utilizes a custom Model Context Protocol (MCP) framework to bind 10 specialized local tools directly to the `gpt-5-nano` LLM, allowing it to query live database records and make optimized pairings.

---

## 🤖 System Architecture

```
ai/
├── tools/                # 10 DB query tools (vehicles, drivers, trips, fuel)
├── main.py               # FastAPI entry point, chat, and optimizer routes
├── mcp_server.py         # Asynchronous LangChain tool invocation router
└── internal_client.py    # HTTP client query utility with token validation bypass
```

---

## 🛠️ The 10 AI Tools (Model Context Protocol)

The AI agent interacts with the PostgreSQL database through the following tools registered in [`tools/`](./tools/):

1. `get_all_vehicles` — Retrieve list of all registered vehicles.
2. `get_vehicles_by_status` — Query available, on-trip, or maintenance-status vehicles.
3. `get_all_drivers` — Fetch all driver profiles.
4. `get_drivers_by_status` — Query available, suspended, or off-duty drivers.
5. `get_driver_license_alerts` — Identify drivers whose licenses are expiring within $N$ days.
6. `get_all_trips` — Fetch all trips.
7. `get_trips_by_status` — Fetch draft, dispatched, or completed trips.
8. `get_recent_maintenance_logs` — List active maintenance status logs.
9. `get_fuel_efficiency_report` — Query fuel efficiency analytics for vehicles.
10. `get_operational_expenses_summary` — Summarize toll, maintenance, and miscellaneous costs.

---

## 🔌 API Endpoints

### 1. Chat with Fleet Assistant
* **URL**: `/api/ai/chat`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "message": "Which heavy trucks are currently available?",
    "history": [
      { "role": "user", "content": "Hi" },
      { "role": "assistant", "content": "Hello! How can I help you today?" }
    ]
  }
  ```
* **Response**:
  ```json
  {
    "reply": "Based on the fleet registry, the Mahindra Blazo X 35 (heavy truck) is currently available.",
    "mock": false
  }
  ```

### 2. Smart Dispatch Optimizer
* **URL**: `/api/ai/optimize-dispatch`
* **Method**: `POST`
* **Request Body**:
  ```json
  {
    "trips": [
      {
        "id": 10,
        "tripCode": "TRP-101",
        "origin": "Mumbai Depot",
        "destination": "Delhi Depot",
        "cargoWeightKg": 12000,
        "plannedDistanceKm": 1400
      }
    ]
  }
  ```
* **Response**:
  ```json
  {
    "assignments": [
      {
        "tripId": 10,
        "assignedVehicleId": "2",
        "assignedVehicleName": "Mahindra Blazo X 35",
        "assignedDriverId": "1",
        "assignedDriverName": "Rajesh Sharma",
        "recommendationReason": "Vehicle capacity (25000 kg) meets cargoWeightKg (12000 kg). Driver holds Heavy Transport license, safety rating 98.5, and odometer (8400.2 km) is low, minimizing risk on the 1400 km run."
      }
    ]
  }
  ```

---

## 🔒 Security Configuration
The AI service authenticates all backend requests via an internal secret bypass header:
`x-internal-secret: transitops-internal` (configurable via `INTERNAL_API_SECRET` in `.env`). This allows the AI agent to fetch context from database tables without exposing public endpoints.
