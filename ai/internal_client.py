import httpx
import os
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")
INTERNAL_SECRET = os.getenv("INTERNAL_API_SECRET", "transitops-internal")

HEADERS = {
    "x-internal-secret": INTERNAL_SECRET,
    "Content-Type": "application/json"
}

async def fetch_api(path: str) -> list | dict:
    """
    Asynchronously calls the Express backend API path and extracts the payload.
    """
    async with httpx.AsyncClient() as client:
        try:
            url = f"{BACKEND_URL}{path}"
            response = await client.get(url, headers=HEADERS, timeout=5.0)
            if response.status_code == 200:
                data = response.json()
                
                # If the response is a direct array, return it
                if isinstance(data, list):
                    return data
                
                # Unwrap common response envelopes
                for key in ("vehicles", "drivers", "trips", "fuelLogs", "expenses"):
                    if key in data:
                        return data[key]
                        
                return data
            else:
                print(f"[Internal Client] API call to {path} returned status {response.status_code}")
        except Exception as e:
            print(f"[Internal Client] Exception while calling {path}: {str(e)}")
            
    # Default fallback to empty list
    return []
