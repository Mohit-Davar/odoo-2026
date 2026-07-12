import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
from dotenv import load_dotenv

# Import tools and the executor
from tools import ALL_TOOLS
from mcp_server import execute_tool

# Load environment variables
load_dotenv()

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    # Register our MCP tools directly with the model
    model = genai.GenerativeModel('gemini-1.5-flash', tools=ALL_TOOLS)
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
        "gemini_enabled": model is not None,
        "tools_registered": [t.__name__ for t in ALL_TOOLS]
    }

@app.post("/api/ai/chat")
async def chat(request: ChatRequest):
    if not model:
        return {
            "reply": "AI service is running in mock mode. Set GEMINI_API_KEY in 'ai/.env' to activate the live model.",
            "mock": True
        }
    
    try:
        # Map conversation history to Gemini structure
        history = []
        for turn in request.history:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            gemini_role = "model" if role == "assistant" else "user"
            history.append({"role": gemini_role, "parts": [content]})
            
        # Start the chat session
        chat_session = model.start_chat(history=history)
        
        # Send user query
        response = chat_session.send_message(request.message)
        
        # Handle iterative tool calling loops
        loop_count = 0
        while response.function_calls and loop_count < 10:
            loop_count += 1
            for call in response.function_calls:
                tool_name = call.name
                tool_args = dict(call.args)
                
                print(f"[AI Agent] Gemini called tool: {tool_name} with args: {tool_args}")
                
                # Execute the matched tool
                result_json = await execute_tool(tool_name, tool_args)
                
                # Send tool output back to the model context
                response = chat_session.send_message(
                    genai.protos.Part(
                        function_response=genai.protos.FunctionResponse(
                            name=tool_name,
                            response={'result': result_json}
                        )
                    )
                )
                
        return {
            "reply": response.text,
            "mock": False
        }
        
    except Exception as e:
        print(f"[AI Agent] Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM Chat Error: {str(e)}")

@app.post("/api/ai/optimize-dispatch")
async def optimize_dispatch(request: OptimizationRequest):
    # Keep optimization endpoint separate for custom batch calls
    if not model:
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
        
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Dispatch Optimization Error: {str(e)}")
