# TransitOps — Backend REST API

This is the central Express.js web server handling authentication, CRUD operations, business logic constraints, database storage, email communications, and caching for the TransitOps dashboard.

---

## 🗄️ Core Architecture

```
backend/
├── config/       # DB & Redis connection pools
├── controllers/  # Route handler controllers (req/res parsing)
├── middleware/   # JWT verification & RBAC role checks
├── models/       # SQL queries for database operations
├── routes/       # Endpoint definitions
├── schemas/      # Zod validation schemas
└── utils/        # Emailers and Cron reminder jobs
```

---

## 🌐 API Route Registry

All endpoints (except Authentication) require a valid **Bearer JWT Token** in the `Authorization` header.

### 1. Authentication (`/api/auth`)
* `POST /api/auth/register` — Register a new account (triggers OTP email).
* `POST /api/auth/verify-register` — Verify account activation with OTP.
* `POST /api/auth/login` — Log in and receive short-lived access token + long-lived secure HTTP-Only refresh cookie.
* `POST /api/auth/verify-login` — Multi-factor verification step with OTP.
* `GET /api/auth/refresh` — Rotate access token via refresh token.
* `POST /api/auth/logout` — Revoke and clear auth session cookie.
* `GET /api/auth/me` — Fetch currently authenticated user profile.

### 2. Fleet & Vehicles (`/api/vehicles`)
* `GET /api/vehicles` — List all vehicles.
* `GET /api/vehicles/:id` — Get detailed vehicle records (including odometer/maintenance).
* `POST /api/vehicles` — Register a new vehicle (*Fleet Manager only*).
* `PUT /api/vehicles/:id` — Update vehicle details (*Fleet Manager only*).
* `DELETE /api/vehicles/:id` — Retire/remove vehicle (*Fleet Manager only*).

### 3. Drivers (`/api/drivers`)
* `GET /api/drivers` — List all drivers.
* `GET /api/drivers/:id` — Fetch driver compliance/license profile.
* `POST /api/drivers` — Register a new driver (*Safety Officer only*).
* `PUT /api/drivers/:id` — Edit driver info (*Safety Officer only*).

### 4. Trips (`/api/trips`)
* `GET /api/trips` — List all trips.
* `GET /api/trips/:id` — Fetch trip detail.
* `POST /api/trips` — Create draft trip (*Dispatcher only*).
* `POST /api/trips/:id/dispatch` — Lock vehicle & driver, set status to `ON_TRIP` (*Dispatcher only*).
* `POST /api/trips/:id/complete` — Record ending odometer, total revenue, and restore availability (*Dispatcher only*).
* `POST /api/trips/:id/cancel` — Cancel active/draft trip and release assets.

### 5. Maintenance (`/api/maintenance`)
* `GET /api/maintenance` — View maintenance logs.
* `POST /api/maintenance` — Put vehicle in shop (sets status to `IN_SHOP`).
* `PUT /api/maintenance/:id` — Complete servicing (restores status to `AVAILABLE`).

### 6. Fuel & Expenses (`/api/fuel` & `/api/expenses`)
* `POST /api/fuel` — Log fuel fill-up (litres & cost) linked to vehicle & trip.
* `POST /api/expenses` — Log toll charges, maintenance costs, or miscellaneous expenses.

### 7. AI Proxy (`/api/ai`)
* `POST /api/ai/chat` — Authenticated chat proxy to FastAPI LangChain Agent.
* `POST /api/ai/optimize-dispatch` — Proxy to dispatch optimizer (*Dispatcher only*).

---

## 🔒 Role Permission Matrix (RBAC)

| Module | Fleet Manager | Dispatcher | Safety Officer | Financial Analyst |
|---|:---:|:---:|:---:|:---:|
| **Dashboard** | View | View | View | View |
| **Vehicles** | CRUD | View | View | View |
| **Drivers** | View | View | CRUD | View |
| **Trips** | View | CRUD | View | View |
| **Maintenance** | CRUD | View | View | View |
| **Fuel / Expenses** | View | View | View | CRUD |
| **AI Assistant** | Full Access | Full Access | Full Access | Full Access |
| **AI Optimizer** | Blocked | Full Access | Blocked | Blocked |
| **Settings / Roles** | CRUD | Blocked | Blocked | Blocked |

---

## ⚡ Serverless Deployment (Vercel)
This Express backend is fully serverless-compliant:
* Uses root [`vercel.json`](./vercel.json) to rewrite `/api/(.*)` routes to `server.js`.
* `server.js` exports the `app` handler via `export default app` to comply with `@vercel/node`.
* DB connection pool handles stateless connections gracefully.
