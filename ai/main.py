import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Using the recommended fast model
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    model = None

app = FastAPI(title="TransitOps AI Service", version="1.0.0")

# Enable CORS for frontend connectivity
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[dict]] = []

class OptimizationRequest(BaseModel):
    trips: List[dict]
    vehicles: List[dict]
    drivers: List[dict]

@app.get("/")
def read_root():
    return {
        "status": "TransitOps AI Server is running", 
        "gemini_enabled": model is not None
    }

@app.post("/api/ai/chat")
async def chat(request: ChatRequest):
    if not model:
        return {
            "reply": "AI service is running in mock mode. Set GEMINI_API_KEY in 'ai/.env' to activate the live model.",
            "mock": True
        }
    
    try:
        # Build prompt context
        prompt = (
            "System: You are an expert logistics assistant for TransitOps, a smart fleet management platform. "
            "Help the user analyze route logs, check vehicle availability, and schedule drivers intelligently.\n\n"
        )
        
        # Merge chat history
        for turn in request.history:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            prompt += f"{role.capitalize()}: {content}\n"
            
        prompt += f"User: {request.message}\nAssistant:"
        
        response = model.generate_content(prompt)
        return {"reply": response.text, "mock": False}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Chat Error: {str(e)}")

@app.post("/api/ai/optimize-dispatch")
async def optimize_dispatch(request: OptimizationRequest):
    if not model:
        # Smart round-robin mock optimization fallback
        assignments = []
        for i, trip in enumerate(request.trips):
            vehicle = request.vehicles[i % len(request.vehicles)] if request.vehicles else {"id": "None", "registrationNumber": "N/A"}
            driver = request.drivers[i % len(request.drivers)] if request.drivers else {"id": "None", "fullName": "N/A"}
            assignments.append({
                "tripId": trip.get("id"),
                "origin": trip.get("origin"),
                "destination": trip.get("destination"),
                "assignedVehicleId": vehicle.get("id"),
                "assignedVehicleName": vehicle.get("vehicleName", "N/A"),
                "assignedDriverId": driver.get("id"),
                "assignedDriverName": driver.get("fullName", "N/A"),
                "recommendationReason": "Round-robin matching (Mock Mode - set GEMINI_API_KEY for dynamic AI matching)."
            })
        return {"assignments": assignments, "mock": True}
        
    try:
        prompt = f"""
        You are a logistics dispatch optimization model.
        Analyze the following inputs and recommend the best pairing of a vehicle and a driver for each trip.
        Consider safety scores of drivers and load capacity constraints of vehicles.
        
        Trips to schedule:
        {json.dumps(request.trips, indent=2)}
        
        Available Vehicles:
        {json.dumps(request.vehicles, indent=2)}
        
        Available Drivers:
        {json.dumps(request.drivers, indent=2)}
        
        Return the response strictly as a JSON object of assignments with this format:
        {{
            "assignments": [
                {{
                    "tripId": "trip_id_here",
                    "assignedVehicleId": "vehicle_id_here",
                    "assignedVehicleName": "vehicle_name_here",
                    "assignedDriverId": "driver_id_here",
                    "assignedDriverName": "driver_name_here",
                    "recommendationReason": "detailed explanation of why this vehicle and driver were matched"
                }}
            ]
        }}
        """
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Strip markdown syntax formatting if present
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Dispatch Optimization Error: {str(e)}")
