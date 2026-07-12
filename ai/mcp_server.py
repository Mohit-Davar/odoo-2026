import inspect
import json
from tools import ALL_TOOLS

# Create a dictionary mapping function name strings to the actual callable Python objects
TOOL_MAP = {func.__name__: func for func in ALL_TOOLS}

async def execute_tool(name: str, arguments: dict) -> str:
    """
    Executes a registered tool function dynamically based on its string name.
    Passes arguments from Gemini as kwargs and handles coroutines correctly.
    """
    if name not in TOOL_MAP:
        return json.dumps({"error": f"Tool '{name}' is not registered."})
        
    func = TOOL_MAP[name]
    try:
        # Bind the arguments to the function signature to ensure parameters match
        sig = inspect.signature(func)
        
        # Clean arguments keys to match what Python expects (remove extra parameters)
        func_params = sig.parameters.keys()
        cleaned_args = {k: v for k, v in arguments.items() if k in func_params}
        
        bound = sig.bind(**cleaned_args)
        bound.apply_defaults()
        
        # Call the target tool
        if inspect.iscoroutinefunction(func):
            result = await func(*bound.args, **bound.kwargs)
        else:
            result = func(*bound.args, **bound.kwargs)
            
        # Return serialized JSON string
        return json.dumps(result, default=str)
        
    except Exception as e:
        print(f"[MCP Server] Error executing tool '{name}' with args {arguments}: {str(e)}")
        return json.dumps({"error": f"Failed to execute tool '{name}': {str(e)}"})
