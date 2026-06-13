# Integrated Agricultural Data System — Technical Documentation

> **Addis Ababa Science and Technology University**  
> Final Year Project — Computer Engineering Stream  
> Version 2.0.0

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Tech Stack](#2-tech-stack)
3. [Project Structure](#3-project-structure)
4. [Setup & Installation](#4-setup--installation)
5. [Configuration](#5-configuration)
6. [Database Schema](#6-database-schema)
7. [API Reference](#7-api-reference)
8. [Role-Based Access Control](#8-role-based-access-control)
9. [ML Microservice](#9-ml-microservice)
10. [Frontend Architecture](#10-frontend-architecture)
11. [Testing](#11-testing)
12. [Deployment](#12-deployment)

---

## 1. System Architecture

The system follows a **three-tier microservices architecture**:

```
┌──────────────────────────────────────────────────────────────────┐
│                        Client Tier                               │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │           Next.js Frontend (port 3000)                     │  │
│  │  React 19 · Tailwind CSS · shadcn/ui · Recharts · Leaflet │  │
│  └──────────────────────────┬─────────────────────────────────┘  │
│                             │ HTTP (JWT Bearer)                   │
├─────────────────────────────┼────────────────────────────────────┤
│                   API Tier  │                                    │
│  ┌──────────────────────────▼─────────────────────────────────┐  │
│  │              AdonisJS Backend (port 3333)                   │  │
│  │  Controllers → Services → Lucid ORM → PostgreSQL           │  │
│  │  Auth · CRUD · Import · Predict · RAG · Monetize          │  │
│  └────────────┬──────────────┬──────────────────────┬─────────┘  │
│               │              │                      │            │
│               ▼              ▼                      ▼            │
│  ┌──────────────┐  ┌────────────────┐  ┌────────────────────┐   │
│  │  PostgreSQL   │  │  ML Service    │  │  Anthropic/Cerebra│   │
│  │  (Neon/SQLite)│  │  (port 8000)   │  │  LLM API          │   │
│  └──────────────┘  └────────────────┘  └────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Frontend** communicates with the **AdonisJS backend** via REST API calls (`/api/v1/*`) using JWT bearer authentication.
2. **Backend** handles all business logic, data validation, RBAC enforcement, and database operations via Lucid ORM.
3. **ML Service** is an independent Python FastAPI microservice. The backend calls it internally for yield predictions.
4. **RAG System** uses Anthropic Claude API (or Cerebras as fallback) to answer natural-language questions about agricultural data.
5. **Chapa Payment Gateway** handles subscription/transaction processing for data monetization.

---

## 2. Tech Stack

### Backend (API)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20+ | Runtime |
| TypeScript | 6.0 | Language |
| AdonisJS | 7.3 | MVC framework |
| Lucid ORM | 22.4 | Database ORM |
| VineJS | 4.3 | Validation |
| PostgreSQL | 15+ | Primary database |
| SQLite | (better-sqlite3) | Local dev fallback |
| JWT | (AdonisJS Auth) | Authentication |
| csv-parse | 6.2 | CSV parsing |
| exceljs | 4.4 | Excel parsing |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16.2 | React framework |
| React | 19.2 | UI library |
| TypeScript | 5.7 | Language |
| Tailwind CSS | 4.2 | Styling |
| shadcn/ui | Radix-based | Component library |
| Recharts | 2.15 | Charts |
| Leaflet | 1.9 | Maps |
| React Hook Form | 7.54 | Forms |
| Zod | 3.24 | Validation |
| Lucide React | 0.564 | Icons |

### ML Service

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.10+ | Runtime |
| FastAPI | 0.111+ | API framework |
| scikit-learn | 1.4+ | ML (GradientBoostingRegressor) |
| pandas | 2.0+ | Data processing |
| numpy | 1.26+ | Numerical computing |
| Uvicorn | 0.29+ | ASGI server |

---

## 3. Project Structure

```
├── ace.js                          # AdonisJS CLI entry
├── adonisrc.ts                     # App config (providers, commands, tests)
├── package.json                    # Backend dependencies
├── tsconfig.json                   # TypeScript config
├── .env.example                    # Environment template
├── start-all.sh                    # Unified startup script
│
├── app/                            # Application code
│   ├── controllers/                # 20 HTTP controllers
│   ├── models/                     # 19 Lucid ORM models
│   ├── services/                   # Business logic services
│   ├── middleware/                  # Auth, role guard, silent auth
│   ├── validators/                 # VineJS schemas
│   ├── exceptions/                 # Error handlers
│   └── transformers/               # Response transformers
│
├── config/                         # App configuration (12 files)
├── database/
│   ├── migrations/                 # 24 migration files
│   ├── schema.ts                   # Central schema definition
│   └── schema_rules.ts             # Schema rules
├── start/
│   ├── routes.ts                   # All API routes
│   ├── kernel.ts                   # Middleware stack
│   └── env.ts                      # Env variable validation
│
├── frontend/                       # Next.js application
│   ├── app/                        # App Router pages
│   │   ├── login/
│   │   ├── signup/
│   │   ├── verify-email/
│   │   └── dashboard/              # 15+ route groups
│   ├── components/                 # Reusable components
│   │   └── ui/                     # shadcn/ui primitives
│   ├── lib/                        # Utilities, API client, types
│   ├── hooks/                      # Custom hooks
│   └── public/                     # Static assets
│
├── ml-service/                     # Python ML microservice
│   ├── app.py                      # FastAPI application
│   ├── model.py                    # Model definition & preprocessing
│   ├── train.py                    # Training script
│   ├── data/                       # Sample datasets
│   ├── models/                     # Trained model pickles
│   └── tests/                      # Python tests
│
├── docs/                           # Documentation
│   ├── openapi.yaml                # Full OpenAPI 3.0 spec
│   ├── technical-documentation.md  # This file
│   └── user-guide.md               # End-user guide
│
└── tests/                          # Backend tests
    ├── bootstrap.ts
    └── unit/                       # Unit test suites
```

---

## 4. Setup & Installation

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (or SQLite for local dev)
- Python 3.10+
- npm or yarn

### Quick Start

```bash
# 1. Clone and install backend dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL, APP_KEY, ANTHROPIC_API_KEY, etc.

# 3. Run database migrations
node ace migration:run

# 4. Install Python ML dependencies
pip install -r ml-service/requirements.txt

# 5. Install frontend dependencies
cd frontend && npm install && cd ..

# 6. Start all services
bash start-all.sh
```

The ML model is **pre-trained** and bundled in `ml-service/models/`. To retrain:

```bash
python -m ml_service.train
```

### Manual Service Startup

```bash
# Backend (port 3333)
node ace serve --hmr

# Frontend (port 3000)
cd frontend && npm run dev

# ML Service (port 8000)
uvicorn ml_service.app:app --port 8000
```

---

## 5. Configuration

### Environment Variables (.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3333 | Backend HTTP port |
| `HOST` | No | localhost | Backend host |
| `NODE_ENV` | No | development | Node environment |
| `APP_KEY` | **Yes** | — | AdonisJS app secret (generate via `node ace generate:key`) |
| `DATABASE_URL` | **Yes** | — | PostgreSQL connection string (e.g., `postgresql://user:pass@host/db`) |
| `FRONTEND_URL` | No | http://localhost:3000 | Frontend origin for CORS |
| `ANTHROPIC_API_KEY` | For RAG | — | Anthropic Claude API key |
| `CEREBRAS_API_KEY` | No | — | Cerebras API key (alternative RAG provider) |
| `CHAPA_SECRET_KEY` | For payments | — | Chapa payment gateway secret |
| `ML_SERVICE_URL` | No | http://localhost:8000 | ML microservice base URL |
| `SMTP_HOST` | For email | localhost | Mail server host |
| `SMTP_PORT` | For email | 1025 | Mail server port |
| `SESSION_DRIVER` | No | cookie | Session storage driver |
| `LIMITER_STORE` | No | database | Rate limiter backend |

### Key Configuration Files

| File | Purpose |
|------|---------|
| `config/database.ts` | Database connection (PostgreSQL primary, SQLite fallback) |
| `config/auth.ts` | JWT + session auth guards |
| `config/cors.ts` | CORS allowed origins |
| `config/limiter.ts` | Rate limiting rules |
| `config/mail.ts` | SMTP mail settings |
| `config/shield.ts` | CSRF & security headers |
| `config/session.ts` | Session configuration |
| `config/hash.ts` | Password hashing config |
| `config/app.ts` | HTTP server, app key, cookies |

---

## 6. Database Schema

The database consists of **24 migration files** creating the following core table groups:

### Core Tables

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `users` | System authentication users | id (PK), email, password, full_name |
| `access_tokens` | JWT token management | id, tokenable_id, type, token |
| `organizations` | Cooperatives, NGOs, government bodies | id, name, type, contact_email |
| `app_users` | Application users with roles | id (UUID), user_id, email, role, organization_id, is_active |
| `farmers` | Registered farmers | id (UUID), name, phone, region, zone, woreda, deleted_at |
| `plots` | Farm parcels/fields | id (UUID), farmer_id, area_hectares, geolocation (JSON), soil_type, irrigation_type, version (optimistic lock) |
| `crop_types` | Crop catalog | id, name, category, growing_season_days |
| `observations` | Field observation records | id (UUID), plot_id, crop_name, planting_date, growth_stage, health_status, expected_yield_kg, actual_yield_kg, version, deleted_at |
| `attachments` | Field photos | id, observation_id, file_path, file_type, file_size |
| `devices` | Mobile/field equipment | id, device_uuid (unique), name, device_type, last_sync_at |
| `sync_queue` | Offline sync queue | id, device_id, action (CREATE/UPDATE/DELETE), table_name, record_id, payload (JSON), status, retry_count |
| `audit_logs` | Compliance audit trail | id (UUID), user_id, action, table_name, record_id, old_values (JSONB), new_values (JSONB), ip_address, user_agent |

### Feature Tables

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `import_jobs` | CSV/Excel import jobs | id (UUID), file_name, file_type, file_size, status, imported_rows, error_rows |
| `imported_records` | Imported agricultural data | id, import_job_id, crop_name, year, season, area_hectares, rainfall_mm, temperature_celsius, fertilizer_amount_kg, actual_yield_kg |
| `predictions` | ML yield predictions | id, plot_id (nullable), crop_name, area_hectares, predicted_yield_kg, model_version |
| `products` | Monetization products | id, name, description, price, billing_interval |
| `subscriptions` | User subscriptions | id, user_id, product_id, status, current_period_start, current_period_end |
| `transactions` | Payment transactions | id, subscription_id, amount, currency, status, chapa_tx_id, receipt_url |
| `rate_limits` | Rate limiting store | id, key, hits, expires_at |

### Optimistic Locking

Plots and observations use a `version` column (integer) for optimistic concurrency control. Each update increments the version. If a conflict is detected (version mismatch), the request is rejected with a 409 Conflict.

---

## 7. API Reference

All routes are prefixed with `/api/v1`. Authentication is via `Authorization: Bearer <token>` header.

### Health & Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | Root health check |
| POST | `/api/v1/auth/signup` | No | Create account |
| POST | `/api/v1/auth/login` | No | Login |
| POST | `/api/v1/auth/logout` | Yes | Logout current session |
| POST | `/api/v1/auth/refresh` | Yes | Rotate access token |
| POST | `/api/v1/auth/password/forgot` | No | Request password reset |
| POST | `/api/v1/auth/password/reset` | No | Reset password with token |
| POST | `/api/v1/auth/email/verify` | Yes | Verify email address |

### Account

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/account/profile` | Get current user profile |
| PATCH | `/api/v1/account/profile` | Update profile |
| DELETE | `/api/v1/account/profile` | Delete account |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/dashboard` | Aggregated farm statistics |
| GET | `/api/v1/dashboard/farmer-counts` | Farmer counts by region |
| GET | `/api/v1/dashboard/yield-summary` | Yield summary by crop |
| GET | `/api/v1/dashboard/sync-status` | Offline sync status |
| GET | `/api/v1/dashboard/health` | System health status |

### CRUD Resources

All standard CRUD resources support: `GET /`, `POST /`, `GET /:id`, `PATCH /:id`, `DELETE /:id`.

| Resource | Prefix | Special Endpoints |
|----------|--------|-------------------|
| Organizations | `/api/v1/organizations` | `GET /:id/dashboard` |
| App Users | `/api/v1/app-users` | `PATCH /:id/activate`, `GET /:id/devices` |
| Devices | `/api/v1/devices` | `GET /by-uuid/:uuid`, `PATCH /:id/sync` |
| Crop Types | `/api/v1/crop-types` | `GET /categories` |
| Farmers | `/api/v1/farmers` | `GET /stats`, `POST /:id/restore`, `GET /:id/plots` |
| Plots | `/api/v1/plots` | `GET /nearby`, `POST /:id/restore` |
| Observations | `/api/v1/observations` | `GET /summary`, `POST /:id/restore`, `PATCH /:id/harvest`, `GET /:id/attachments` |
| Attachments | `/api/v1/attachments` | Standard CRUD |
| Sync Queue | `/api/v1/sync-queue` | `GET /stats`, `POST /batch`, `PATCH /:id/status`, `POST /:id/retry` |
| Audit Logs | `/api/v1/audit-logs` | `GET /stats`, `GET /record/:table/:id` (read-only) |

### Feature Endpoints (Role-Gated)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | `/api/v1/imports` | Admin, Supervisor, Field Agent | Upload CSV/Excel file |
| GET | `/api/v1/imports` | ^ | List import jobs |
| GET | `/api/v1/imports/:id/schema` | ^ | Get auto-detected schema |
| GET | `/api/v1/imports/:id/records` | ^ | View imported records |
| POST | `/api/v1/predictions` | Admin, Supervisor, Researcher, NGO | Predict yield for a record |
| GET | `/api/v1/predictions` | ^ | List predictions |
| GET | `/api/v1/predictions/ml-health` | ^ | ML service health |
| POST | `/api/v1/rag/query` | Admin, Supervisor, Gov, NGO, Researcher | Natural-language data query |
| GET | `/api/v1/rag/status` | ^ | RAG service status |

### Monetization

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/monetization/products` | All authenticated | List products |
| POST | `/api/v1/monetization/products` | Admin only | Create product |
| GET | `/api/v1/monetization/products/:id` | All authenticated | Get product |
| POST | `/api/v1/monetization/subscriptions` | All authenticated | Create subscription |
| GET | `/api/v1/monetization/subscriptions` | All authenticated | List subscriptions |
| GET | `/api/v1/monetization/transactions` | All authenticated | List transactions |
| POST | `/api/v1/monetization/chapa/webhook` | No auth (webhook) | Chapa payment callback |

### Analytics

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | `/api/v1/analytics/import-trends` | Admin, Supervisor, Gov, NGO, Trader, Researcher | Import volume over 30 days |
| GET | `/api/v1/analytics/yield-trends` | ^ | Yield averages by crop/season |

Full OpenAPI specification is available at `docs/openapi.yaml`.

---

## 8. Role-Based Access Control

### Roles

| Role | Code | Description |
|------|------|-------------|
| Admin | `admin` | Full system administration |
| Field Agent | `field_agent` | Data collection in the field |
| Supervisor | `supervisor` | Manages field agents |
| Government | `gov` | Public-sector stakeholder |
| NGO | `ngo` | Non-governmental organization |
| Trader | `trader` | Commodity trader/wholesaler |
| Researcher | `researcher` | Academic/research user |

### Permission Mapping

| Resource | Admin | Supervisor | Field Agent | Gov | NGO | Trader | Researcher |
|----------|-------|------------|-------------|-----|-----|--------|------------|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Farmer CRUD | ✓ | ✓ | ✓ | — | — | — | — |
| Plot CRUD | ✓ | ✓ | ✓ | — | — | — | — |
| Observation CRUD | ✓ | ✓ | ✓ | — | — | — | — |
| User Management | ✓ | — | — | — | — | — | — |
| Device Management | ✓ | ✓ | — | — | — | — | — |
| Organization CRUD | ✓ | ✓ | — | — | — | — | — |
| Data Import | ✓ | ✓ | ✓ | — | — | — | — |
| Yield Predictions | ✓ | ✓ | — | — | ✓ | — | ✓ |
| AI Query (RAG) | ✓ | ✓ | — | ✓ | ✓ | — | ✓ |
| Analytics | ✓ | ✓ | — | ✓ | ✓ | ✓ | ✓ |
| Monetization | ✓ | — | — | — | — | — | — |

### Middleware

The `role_guard` middleware enforces access at the route level. Privileged roles (`admin`, `supervisor`) can manage data on behalf of others. Roles are defined centrally in `app/services/role_constants.ts`.

---

## 9. ML Microservice

### Overview

The ML service (`ml-service/`) is a standalone Python FastAPI application providing crop yield prediction using a scikit-learn GradientBoostingRegressor.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Service health + model metadata |
| POST | `/predict/yield` | Predict yield for a single record |
| POST | `/predict/yield/batch` | Batch prediction |

### Input Features

- `crop_name` (string)
- `area_hectares` (float)
- `rainfall_mm` (float)
- `temperature_celsius` (float)
- `fertilizer_amount_kg` (float)
- `season` (string)
- `year` (integer)

### Model Details

- **Algorithm:** GradientBoostingRegressor (scikit-learn)
- **Metrics:** MAE ~2,424 kg, RMSE ~3,409 kg
- **Preprocessing:** Z-score normalization for numeric features, label encoding for categorical features
- **Versioning:** Models stored as pickle files in `ml-service/models/` with metadata JSON

### Training

```bash
# Train from database
python -m ml_service.train --source db

# Train from CSV
python -m ml_service.train --source csv --data-path data/sample.csv
```

---

## 10. Frontend Architecture

### Framework & Routing

The frontend uses **Next.js 16 App Router** with the following route groups:

```
/app
├── layout.tsx              # Root layout (fonts, metadata)
├── page.tsx                # Redirects to /login
├── login/page.tsx          # Login form
├── signup/page.tsx         # Registration form
├── verify-email/page.tsx   # Email verification
└── dashboard/
    ├── layout.tsx          # Authenticated layout + sidebar
    ├── page.tsx            # Overview with charts & stats
    ├── farmers/            # Farmer management
    ├── plots/              # Plot management with map
    ├── observations/       # Field observations
    ├── crop-types/         # Crop catalog
    ├── organizations/      # Organization management
    ├── users/              # User management
    ├── devices/            # Device management
    ├── imports/            # CSV/Excel import
    ├── predictions/        # AI yield predictions
    ├── ai-query/           # RAG intelligent query
    ├── sync-queue/         # Offline sync monitoring
    ├── audit-logs/         # Audit trail viewer
    └── settings/           # User profile settings
```

### Key Components

| Component | Location | Description |
|-----------|----------|-------------|
| `Sidebar` | `components/sidebar.tsx` | Navigation with role-aware grouping |
| `ProtectedRoute` | `components/protected-route.tsx` | Auth guard wrapper |
| `DataTable` | `components/data-table.tsx` | Reusable paginated table |
| `FormModal` | `components/form-modal.tsx` | CRUD form dialog |
| `PlotMap` | `components/plot-map.tsx` | Leaflet map for plots |
| `ThemeProvider` | `components/theme-provider.tsx` | Dark/light mode |

### Authentication Flow

1. User submits credentials via login form
2. Backend validates and returns JWT access token
3. Token stored in `localStorage`, attached as `Authorization: Bearer` header
4. `AuthContext` provides user state throughout the app
5. `ProtectedRoute` redirects unauthenticated users to `/login`
6. 401 responses trigger automatic logout and redirect

### API Client

The custom `ApiClient` class (`lib/api-client.ts`) wraps the native `fetch` API with:
- Automatic JWT token injection
- 401 response handling (auto-logout)
- JSON error parsing
- TypeScript generics for typed responses

---

## 11. Testing

### Backend Tests (Japa)

```bash
# Run all tests
node ace test

# Run specific suite
node ace test --suite=unit
```

Test files are in `tests/unit/`. The test runner uses:
- `@japa/runner` — Test framework
- `@japa/assert` — Assertions
- `@japa/api-client` — API testing
- `@japa/plugin-adonisjs` — AdonisJS integration

### ML Service Tests

```bash
cd ml-service && python -m pytest tests/
```

### Frontend Linting

```bash
cd frontend && npm run lint
```

---

## 12. Deployment

### Production Build

```bash
# Backend
node ace build

# Frontend
cd frontend && npm run build
```

### Environment Checklist

- [ ] Generate `APP_KEY`: `node ace generate:key`
- [ ] Set `NODE_ENV=production`
- [ ] Configure `DATABASE_URL` with production PostgreSQL
- [ ] Set `FRONTEND_URL` to production frontend domain
- [ ] Configure CORS in `config/cors.ts`
- [ ] Set `ANTHROPIC_API_KEY` for RAG
- [ ] Set `CHAPA_SECRET_KEY` for payments
- [ ] Run migrations: `node ace migration:run --force`

### Database Migrations

```bash
# Run pending migrations
node ace migration:run

# Rollback last batch
node ace migration:rollback

# Check migration status
node ace migration:status
```

### Seed Data

No seed scripts are bundled. Use the CSV/Excel import feature (`POST /api/v1/imports`) to populate data, or use the frontend CRUD interfaces.

### Monitoring

- **Backend health:** `GET /` returns `{ hello: "world", version: "1.0.0" }`
- **ML health:** `GET /health` on the ML service
- **Dashboard health:** `GET /api/v1/dashboard/health`
- **Audit logs:** All data mutations are logged in `audit_logs` table

---

*For detailed API schemas, refer to `docs/openapi.yaml`.*
*For quick-start instructions, refer to `docs/SETUP_AND_DEFENSE_GUIDE.md`.*
