# 🚚 Lorry Fleet Management ERP System

A modern, enterprise-grade Fleet & Logistics ERP monorepo built with **NestJS**, **React + TypeScript**, **TypeORM (PostgreSQL)**, **Socket.IO**, and **Flutter**.

---

## 🌟 Features

### 🚛 1. Fleet & Vehicle Management
- Vehicle registration tracking (Make, Model, Year, Capacity, Fuel Type, Odometer).
- Real-time vehicle status indicators (`active`, `in_trip`, `maintenance`, `inactive`).
- Vehicle document manager (Insurance, Permit, Fitness certificates) with automatic expiration alerts.

### 🛣️ 2. Trip Lifecycle & Tracking
- Complete trip state machine (`draft` → `assigned` → `in_progress` → `delivered` → `completed` / `cancelled`).
- Direct vehicle & driver assignment during trip creation or dispatch.
- Proof of Delivery (POD) receipt uploads via MinIO storage.
- Real-time WebSocket notifications (`/notifications` Socket.IO namespace) for trip updates.

### 👤 3. Driver Operations
- Driver profiles with license categories (HMV, HTV, LMV), phone, status, and assigned vehicle.
- Driver trip history and availability tracking.

### ⛽ 4. Fuel & Efficiency Analytics
- Fuel log entries (Quantity, Price per Liter, Total Cost, Odometer reading, Fuel station/location).
- Automatic KM/L mileage calculation per fill and vehicle efficiency tracking.

### 💵 5. Expense Tracking
- Category-wise expense recording (Tolls, Driver Allowance, Repairs, Tyre Replacements, RTO Fines, Weighbridge, Accommodations).
- Link expenses directly to specific vehicles, drivers, or trips.

### 🔧 6. Vehicle Maintenance
- Scheduled & breakdown maintenance logging (Vendor name, invoice number, costs, service date).
- Automatic status update when vehicles undergo maintenance.

### 🏢 7. Customers & Billing / Invoicing
- Customer directory with GST numbers, contact persons, credit limits, and balances.
- Dynamic invoice builder with auto-calculated GST (0%, 5%, 12%, 18%, 28%), subtotal, grand total, line items, and payment terms.
- Invoice status tracking (`draft`, `issued`, `partially_paid`, `paid`, `overdue`).

### 📊 8. Reports & Analytics
- Executive KPI Summary Cards (Total Revenue, Fuel Expenses, Operating Costs, Net Operating Profit, Margin %).
- Fleet Profitability Breakdown table with per-vehicle revenue, fuel/maint costs, net margin %, and KM/L efficiency.
- Expense Category distribution & percentage share analytics.
- One-click CSV Export for reports.

---

## 🏗️ Architecture & Tech Stack

```
Logistics_App/
├── apps/
│   ├── api/             # NestJS REST API & WebSockets (TypeORM, PostgreSQL)
│   ├── web/             # React + Vite + TypeScript (React Query, Custom UI)
│   └── mobile/          # Flutter Mobile Application
├── package.json         # Workspace root package configuration
└── pnpm-workspace.yaml  # Monorepo configuration
```

| Layer | Technology |
|---|---|
| **Backend API** | NestJS, TypeScript, TypeORM, Swagger OpenAPI |
| **Database** | PostgreSQL (Neon DB Cloud or Local Postgres) |
| **Real-time** | Socket.IO (WebSockets) |
| **Object Storage** | MinIO / S3 compatible storage |
| **Web Client** | React 18, Vite, TypeScript, React Query (`@tanstack/react-query`), Lucide Icons |
| **Mobile App** | Flutter / Dart |
| **Package Manager** | `pnpm` Workspaces |

---

## 🚀 Quick Start & Setup

### Prerequisites
- **Node.js**: `v18.x` or higher
- **pnpm**: `v8.x` or higher (`npm install -g pnpm`)
- **PostgreSQL**: Local database or Neon PostgreSQL connection string

---

### 1. Installation

Clone the repository and install dependencies:

```bash
cd Logistics_App
pnpm install
```

---

### 2. Environment Configuration

Configure the backend environment variables in `apps/api/.env.development`:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# PostgreSQL Database
DATABASE_URL=postgresql://user:password@localhost:5432/lorry_erp
DATABASE_SYNC=true
DATABASE_LOGGING=false

# JWT Secret
JWT_SECRET=dev-jwt-secret-change-in-prod
JWT_REFRESH_SECRET=dev-jwt-refresh-secret-change-in-prod

# MinIO Storage (Optional)
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin123
```

---

### 3. Database Seeding (Optional)

Populate initial admin account, demo vehicles, drivers, and customers:

```bash
pnpm --filter api run db:seed
```

**Default Admin Credentials:**
- **Email:** `admin@lorryerp.com`
- **Password:** `Admin@123456`

---

### 4. Running Locally

Start both NestJS API server and React Web Application concurrently:

```bash
pnpm dev
```

- **Web Client:** `http://localhost:5173`
- **API Server:** `http://localhost:3000/api/v1`
- **Swagger Docs:** `http://localhost:3000/api/docs`

---

## 🛠️ Monorepo Commands Summary

```bash
# Start all applications in development mode
pnpm dev

# Build NestJS API
pnpm build:api

# Type-check Web Frontend
pnpm --filter lorry-erp-web run type-check

# Run Web Client build
pnpm --filter lorry-erp-web run build
```

---

## 📄 License

MIT License. Designed & Developed for Fleet & Logistics Operations.
