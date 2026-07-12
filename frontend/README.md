# TransitOps — Frontend Client

This is the Next.js React client application. It provides a responsive web interface for managing fleet operations, showing real-time dashboard KPIs, and scheduling dispatches.

---

## 📂 Project Structure

```
frontend/
├── src/
│   ├── app/             # Next.js Pages (trips, fleet, analytics, settings)
│   ├── components/      # UI components (cards, tables, badges, loaders)
│   ├── store/           # Zustand stores (state management)
│   └── types/           # TypeScript interface definitions
├── store/               # Auth persist state store
└── lib/                 # Axios configuration
```

---

## 🔄 State Management (Zustand Stores)

### 1. `useAuthStore` (`/store/authstore.js`)
Handles authentication lifecycle, OTP states, login, registration, and session restoration:
```js
const { user, loading, login, register, logout, restoreSession } = useAuthStore();
```

### 2. `useAppStore` (`/src/store/useAppStore.ts`)
Manages fleet dashboard data, available vehicles, active drivers, current dispatches, and analytic reports:
```ts
const { vehicles, drivers, trips, fetchAllData, addTrip, dispatchTrip, completeTrip } = useAppStore();
```

---

## ⚡ API Client (`lib/axiosInstance.js`)

Axios is preconfigured to handle token rotation seamlessly:
* **Automatic Token Injection**: Automatically attaches the Bearer JWT access token to all outgoing API headers.
* **Token Rotation Interceptor**: If an API request returns `401 Unauthorized` or `403 Forbidden` due to access token expiry, the interceptor automatically queues the request, makes a refresh request to `/api/auth/refresh`, updates the token, and retries the queued requests without interrupting the user.

---

## 🚀 AI Feature Integration Templates

To add the AI chat assistant or suggestion tool to any page, use the following React hook patterns:

### 1. Consult AI Dispatcher (Form integration)
When creating a trip, call the optimizer endpoint directly to prefill the vehicle and driver selections:

```tsx
import axiosInstance from "@/lib/axiosInstance";

const handleSuggestPairing = async () => {
  try {
    const res = await axiosInstance.post("/ai/optimize-dispatch", {
      trips: [{ source, destination, cargoWeightKg, plannedDistanceKm }]
    });
    
    if (res.data.assignments?.length > 0) {
      const match = res.data.assignments[0];
      setVehicleId(match.assignedVehicleId.toString());
      setDriverId(match.assignedDriverId.toString());
      setReason(match.recommendationReason);
    }
  } catch (err) {
    console.error("AI matching failed:", err);
  }
};
```

### 2. Floating AI Assistant Chatbox
Add a side panel to layout to query system statistics:

```tsx
const handleSendChat = async (message: string, history: Array<{role: string, content: string}>) => {
  const res = await axiosInstance.post("/ai/chat", { message, history });
  return res.data.reply; // Returns chatbot response
};
```
