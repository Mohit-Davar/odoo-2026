# TransitOps – Smart Transport Operations Platform

TransitOps is a centralized, enterprise-grade Transport Operations Platform designed to digitize and streamline fleet management. The system replaces traditional spreadsheet-based workflows with a unified, real-time web application to manage vehicles, drivers, trips, maintenance, fuel consumption, operational expenses, and analytics.

---

## 🎯 Project Objectives & Target Users

The platform supports multiple organization roles through a robust Role-Based Access Control (RBAC) structure:

* **Fleet Manager**: Registers vehicles, updates vehicle details, manages maintenance intervals, and monitors fleet status.
* **Dispatcher**: Creates transport routes, plans cargo, pairs drivers and vehicles, and dispatches trips.
* **Safety Officer**: Monitors driver license validity, updates compliance details, and tracks driver safety ratings.
* **Financial Analyst**: Records fuel consumption logs, tracks operational expenses (tolls, maintenance, etc.), and reviews fleet ROI.

---

## ⚙️ Core Platform Modules

1. **Dashboard & KPIs**: Real-time view of active/available vehicles, vehicles in maintenance, active trips, pending trips, drivers on duty, and total fleet utilization metrics.
2. **Vehicle Registry**: Maintains detailed asset profiles including registration number, vehicle type, max load capacity, acquisition costs, and current status.
3. **Driver Management**: Tracks safety scores, license categories, and license validity to ensure compliance.
4. **Trip Management**: Handles the full trip lifecycle (`Draft` &rarr; `Dispatched` &rarr; `Completed` or `Cancelled`) and cascades status changes.
5. **Maintenance Logging**: Tracks cost, description, and completion dates for servicing logs, automatically taking vehicles in and out of active service.
6. **Fuel & Expense Tracking**: Logs fuel quantity and costs, toll charges, and maintenance fees, used directly to calculate vehicle ROI.
7. **Reports & Analytics**: Generates downloadable CSV exports for Fuel Efficiency, Fleet Utilization, Operational Costs, and individual Vehicle ROI.

---

## 🛡️ Mandatory Business Rules Enforced

The system strictly validates and enforces the following business logic at database and controller levels:
* **Retired/In-Shop Vehicles**: Blocked from being assigned to any new trip.
* **Non-Compliant Drivers**: Drivers with expired licenses or suspended status cannot be assigned.
* **Double Booking Prevention**: Active vehicles and drivers already on an active trip are blocked from multi-booking.
* **Cargo Load Validation**: Cargo weight must never exceed the maximum load capacity of the selected vehicle.
* **Automatic Status Cascade**:
  * Dispatching a trip automatically transitions both the vehicle and driver status to `ON_TRIP`.
  * Completing a trip restores both the vehicle and driver status to `AVAILABLE`.
  * Creating an active maintenance log changes the vehicle status to `IN_SHOP`; closing it restores it to `AVAILABLE`.

---

## 📊 Role Permission Matrix

| Module | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
| :--- | :---: | :---: | :---: | :---: |
| **Dashboard** | ✅ | ✅ | ✅ | ✅ |
| **Vehicles** | CRUD | View | View | View |
| **Drivers** | View | View | CRUD | View |
| **Trips** | View | CRUD | View | View |
| **Maintenance** | CRUD | View | View | View |
| **Fuel Logs** | View | View | View | CRUD |
| **Expenses** | View | View | View | CRUD |
| **Analytics** | ✅ | View | View | ✅ |

---

## 🏗️ Architecture Overview

The project is structured as a monorepo consisting of three main services:

```
odoo-2026/
├── backend/      # Express.js REST API (Node.js) + PostgreSQL & Redis
├── frontend/     # Next.js 16 (React 19) SPA + TailwindCSS & Zustand
└── ai/           # FastAPI (Python) + LangChain & OpenAI gpt-5-nano Agent
```

### 1. Backend (`/backend`)
* **Technology**: Node.js, Express.js (configured for Vercel Serverless compatibility)
* **Database**: PostgreSQL (hosted on Neon) for transactional data storage
* **Cache & OTP**: Redis (hosted on Upstash) for OTP management and temporary locks
* **Authentication**: JWT Access & Refresh token rotation with Role-Based Access Control (RBAC)
* **Background Tasks**: License expiry email reminders automated via cron

### 2. Frontend (`/frontend`)
* **Technology**: Next.js 16, React 19, Tailwind CSS, Framer Motion
* **State Management**: Zustand
* **API Client**: Axios with interceptors for automatic JWT attach/refresh

### 3. AI Service (`/ai`)
* **Technology**: FastAPI, Python 3, LangChain Core, `langchain-openai`
* **Agent System**: Custom Model Context Protocol (MCP) router binding 10 database-query tools to the LLM
* **Model**: `gpt-5-nano` (OpenAI compatible endpoint)

---

## ⚡ Smart Dispatch Optimizer & Fleet Assistant

TransitOps features an **AI-Powered Dispatch Optimizer** that matches pending trips with the absolute best available vehicle-driver pair.

### Match Optimization Criteria:
1. **Vehicle Load Capacity**: Ensures max load capacity $\ge$ cargo weight.
2. **License Matching**: Driver's license category must match the vehicle type (e.g. Heavy Truck requires a 'Heavy Transport' license).
3. **Driver Safety**: Prioritizes available drivers with the highest safety ratings.
4. **License Expiry**: Avoids assigning drivers whose licenses are expired or expiring within 30 days.
5. **Odometer Wear**: Selects lower-mileage vehicles for long-distance trips to minimize breakdown risk.

---

## 🚀 Local Development Setup

### Prerequisites
* **Node.js** (v18 or higher)
* **Python** (v3.10 or higher)

### 1. Express Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example` and fill in credentials:
   ```ini
   DATABASE_URL=postgresql://...
   REDIS_URL=rediss://...
   JWT_SECRET=your_jwt_secret
   REFRESH_TOKEN=your_refresh_secret
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_app_password
   AI_SERVICE_URL=http://localhost:8001
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 2. Next.js Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```ini
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   JWT_REFRESH_SECRET=your_refresh_secret
   ```
4. Start the frontend:
   ```bash
   npm run dev
   ```

### 3. FastAPI AI Setup
1. Navigate to the AI directory:
   ```bash
   cd ../ai
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file:
   ```ini
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-5-nano
   BACKEND_URL=http://localhost:8000
   INTERNAL_API_SECRET=transitops-internal
   ```
5. Start the server:
   ```bash
   uvicorn main:app --port 8001 --reload
   ```

---

## ☁️ Deployment Guide

### Backend (Vercel)
The backend is optimized for Vercel Serverless Functions using the root [`vercel.json`](./backend/vercel.json) rewrite rule:
1. Connect your repo to Vercel.
2. Set the root directory to `backend`.
3. Add all variables from `backend/.env` into Vercel settings.
4. Ensure `export default app;` remains at the bottom of `server.js`.

### AI Service (Render)
1. Create a new **Web Service** on Render.
2. Root directory: `ai`.
3. Build Command: `pip install -r requirements.txt`.
4. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. Add `OPENAI_API_KEY`, `OPENAI_MODEL`, `BACKEND_URL` and `INTERNAL_API_SECRET` to the environment settings.

### Frontend (Vercel / Render)
1. Deploy Next.js using default presets.
2. Root directory: `frontend`.
3. Set `NEXT_PUBLIC_API_URL` to your production backend URL (e.g. `https://your-backend.vercel.app/api`).
