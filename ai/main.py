import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from dotenv import load_dotenv

# LangChain Imports
from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage

# Import tools and the executor
from tools import ALL_TOOLS
from mcp_server import execute_tool

# Load environment variables
load_dotenv()

# Configure OpenAI client via LangChain
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5-nano")

if OPENAI_API_KEY:
    # Initialize the LangChain ChatOpenAI LLM
    llm = ChatOpenAI(
        model=OPENAI_MODEL,
        openai_api_key=OPENAI_API_KEY,
        temperature=0.0
    )
    # Bind our 10 MCP tools to the LLM
    llm_with_tools = llm.bind_tools(ALL_TOOLS)
else:
    llm = None
    llm_with_tools = None

app = FastAPI(title="TransitOps AI Service (LangChain)", version="1.0.0")

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
        "status": "TransitOps AI Server is running (LangChain mode)", 
        "openai_enabled": llm is not None,
        "openai_model": OPENAI_MODEL,
        "tools_registered": [t.name for t in ALL_TOOLS]
    }

@app.post("/api/ai/chat")
async def chat(request: ChatRequest):
    if not llm_with_tools:
        return {
            "reply": "AI service is running in mock mode. Set OPENAI_API_KEY in 'ai/.env' to activate the live model.",
            "mock": True
        }
    
    try:
        # 1. Map history to LangChain messages list
        messages = []
        
        # Add system context instructions
        messages.append(
            HumanMessage(
                content=(
                    "System: You are an expert logistics assistant for TransitOps, a smart fleet management platform. "
                    "Help the user analyze route logs, check vehicle availability, and schedule drivers. "
                    "Use your tools to query the current state of the fleet whenever needed. "
                    "Answer questions factually using the tool responses."
                )
            )
        )
        
        for turn in request.history:
            role = turn.get("role", "user")
            content = turn.get("content", "")
            if role == "assistant":
                messages.append(AIMessage(content=content))
            else:
                messages.append(HumanMessage(content=content))
                
        # Add current user query
        messages.append(HumanMessage(content=request.message))
        
        # 2. Run the iterative tool execution loop (up to 10 steps)
        loop_count = 0
        while loop_count < 10:
            loop_count += 1
            
            # Invoke the LLM with current messages thread
            response = await llm_with_tools.ainvoke(messages)
            
            # If no tool calls are generated, we have our final answer
            if not response.tool_calls:
                return {
                    "reply": response.content,
                    "mock": False
                }
                
            # Append the assistant's tool-call response to messages thread
            messages.append(response)
            
            # Execute each requested tool call
            for tool_call in response.tool_calls:
                name = tool_call["name"]
                args = tool_call["args"]
                tool_call_id = tool_call["id"]
                
                print(f"[AI Agent] LangChain/OpenAI called tool: {name} with args: {args}")
                
                # Execute the tool via our MCP router
                result_json = await execute_tool(name, args)
                
                # Append ToolMessage response to continue the conversation
                messages.append(
                    ToolMessage(
                        content=result_json,
                        tool_call_id=tool_call_id,
                        name=name
                    )
                )
                
        raise HTTPException(status_code=500, detail="AI Agent exceeded tool calling limit without resolving a response.")
        
    except Exception as e:
        print(f"[AI Agent] Chat Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM Chat Error: {str(e)}")

@app.post("/api/ai/optimize-dispatch")
async def optimize_dispatch(request: OptimizationRequest):
    # Fallback to smart logic if no live LLM configured
    if not llm:
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
                "recommendationReason": "Round-robin matching (Mock Mode - set OPENAI_API_KEY for dynamic AI matching)."
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
        response = await llm.ainvoke(prompt)
        text = response.content.strip()
        
        if text.startswith("```json"):
            text = text[7:]
        if text.endswith("```"):
            text = text[:-3]
        text = text.strip()
        
        return json.loads(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM Dispatch Optimization Error: {str(e)}")
