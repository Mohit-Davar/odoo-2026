import json
from tools import ALL_TOOLS

# Create a dictionary mapping tool name strings to the LangChain StructuredTool objects
TOOL_MAP = {func.name: func for func in ALL_TOOLS}

async def execute_tool(name: str, arguments: dict) -> str:
    """
    Executes a registered LangChain tool function dynamically using its ainvoke method.
    """
    if name not in TOOL_MAP:
        return json.dumps({"error": f"Tool '{name}' is not registered."})
        
    tool_obj = TOOL_MAP[name]
    try:
        # LangChain tools support async execution via ainvoke, handling signatures automatically
        result = await tool_obj.ainvoke(arguments)
        
        # Return serialized JSON string
        return json.dumps(result, default=str)
        
    except Exception as e:
        print(f"[MCP Server] Error executing tool '{name}' with args {arguments}: {str(e)}")
        return json.dumps({"error": f"Failed to execute tool '{name}': {str(e)}"})
