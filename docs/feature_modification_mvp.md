# Feature Modification MVP – Developer Guide

This document covers the MVP implementation of the six feature areas described in the Feature Modification Document for the **Dagi2212/adonis** AdonisJS backend.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Data Governance & Access Control (RBAC)](#2-data-governance--access-control-rbac)
3. [Legacy Data Import (CSV / Excel)](#3-legacy-data-import-csv--excel)
4. [AI-Based Yield Prediction (PyTorch ML Service)](#4-ai-based-yield-prediction-pytorch-ml-service)
5. [RAG Intelligent Query System (Scaffold)](#5-rag-intelligent-query-system-scaffold)
6. [Stakeholder Dashboards](#6-stakeholder-dashboards)
7. [Data Monetisation (Scaffold)](#7-data-monetisation-scaffold)
8. [Running the Full Stack](#8-running-the-full-stack)
9. [Running Tests](#9-running-tests)
10. [Environment Variables](#10-environment-variables)
11. [Database Migrations](#11-database-migrations)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────┐
│              AdonisJS Backend               │
│  (Node.js / TypeScript – this repo)         │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ /imports │  │/predictns│  │  /rag    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  │
│       │              │              │        │
│       ▼              ▼              ▼        │
│  ┌──────────────────────────────────────┐   │
│  │           PostgreSQL DB              │   │
│  └──────────────────────────────────────┘   │
│                      │                       │
│            MlService (HTTP call)             │
└──────────────────────┼──────────────────────┘
                        │
          ┌─────────────▼──────────────┐
          │  ml-service/  (FastAPI)    │
          │  POST /predict/yield       │
          │  POST /predict/yield/batch │
          │  GET  /health              │
          └────────────────────────────┘
```

### New files added

| Area | Files |
|------|-------|
| Migrations | `database/migrations/178000000[1-7]_*.ts` |
| Models | `app/models/{import_job,imported_record,prediction,dataset_permission,product,subscription,transaction}.ts` |
| Services | `app/services/{import_service,ml_service,role_constants}.ts` |
| Controllers | `app/controllers/{imports,predictions,rag,monetization}_controller.ts` |
| Middleware | `app/middleware/role_guard_middleware.ts` |
| ML service | `ml-service/` (Python FastAPI + PyTorch) |
| Tests | `tests/unit/{import_service,role_constants}.spec.ts`, `ml-service/tests/` |

---

## 2. Data Governance & Access Control (RBAC)

### Roles

The system extends the original `admin | field_agent | supervisor` set with four new stakeholder roles:

| Role | Description |
|------|-------------|
| `admin` | Full system administration |
| `field_agent` | Field data-collection agent |
| `supervisor` | Supervisor over a group of field agents |
| `gov` | Government / public-sector stakeholder |
| `ngo` | Non-governmental organisation |
| `trader` | Commodity trader / wholesaler |
| `researcher` | Research / academic user |

Role constants are centralised in `app/services/role_constants.ts`.

### Role Guard Middleware

```typescript
// In routes.ts
router
  .group(() => { /* … */ })
  .use(middleware.auth())
  .use(middleware.roleGuard({ roles: IMPORT_ROLES }))
```

### Dataset-level Permissions

The `dataset_permissions` table allows fine-grained, per-user, per-dataset-type permissions beyond the broad role check:

```sql
SELECT * FROM dataset_permissions
WHERE user_id = '<uuid>'
  AND dataset_type = 'imported_records'
  AND (expires_at IS NULL OR expires_at > NOW());
```

### Audit Logging

Every import, prediction, RAG query, and payment event writes a row to `audit_logs` with:
- `action` in `{INSERT, UPDATE, DELETE, SYNC, IMPORT, PREDICT, QUERY, EXPORT, PAYMENT}`
- `user_id`, `ip_address`, `user_agent`, `new_values`

---

## 3. Legacy Data Import (CSV / Excel)

### Upload endpoint

```
POST /api/v1/imports
Content-Type: multipart/form-data
Authorization: Bearer <token>

file=<csv_or_xlsx>
dry_run=true   # optional: validate without persisting
```

### Typical frontend flow

```
1. POST /api/v1/imports?dry_run=true  →  review schema + validation report
2. POST /api/v1/imports               →  confirm and persist
3. GET  /api/v1/imports/:id/schema    →  fetch schema mapping & row counts
4. GET  /api/v1/imports/:id/records   →  paginate through imported records
```

### Supported file types

| Format | Parser |
|--------|--------|
| `.csv` | `csv-parse` |
| `.xlsx` / `.xls` | `ExcelJS` |

### Schema auto-detection

`ImportService.detectSchema(headers)` maps CSV column names to canonical field names using a comprehensive alias table. Recognised columns include:

`Crop / crop_name`, `Crop_Year / year`, `Season / season`, `Area / area_hectares`, `Production / Yield / actual_yield_kg`, `Annual_Rainfall / rainfall_mm`, `Fertilizer / fertilizer_amount_kg`, `State / region`, `Pesticide`, `Temperature / temperature_celsius`, and many more.

### Normalization pipeline

1. **Trim** – whitespace stripped from all string values
2. **Type coercion** – numeric strings parsed to `float` / `int`
3. **Missing values** – missing numerics left `null`; downstream ML service imputes with training-set mean
4. **Outlier checks** – plausible-range validation (area, yield, rainfall, temperature)
5. **Date normalisation** – accepts `YYYY-MM-DD`, `DD/MM/YYYY`, `YYYY/MM/DD`
6. **Season normalisation** – lower-cased

### Time-series support

Records include `year` and `season` columns. The `imported_records` table has a composite index on `(crop_name, year, season)` to support efficient time-series queries.

### Import job status flow

```
pending → processing → completed
                     → failed
```

Query status at `GET /api/v1/imports/:id`.

---

## 4. AI-Based Yield Prediction (PyTorch ML Service)

### Architecture

A standalone Python FastAPI microservice in `ml-service/`. The AdonisJS backend calls it over HTTP via `MlService` in `app/services/ml_service.ts`.

### Training

#### 1. Download the public dataset (optional)

```bash
cd ml-service
python -m ml_service.train --download
# Downloads Crop_yield.csv from https://github.com/Explore-AI/Public-Data
# Set CROP_YIELD_DATASET_URL env var to override the default download URL.
```

Or supply your own CSV:

```bash
python -m ml_service.train --data path/to/your.csv
```

#### 2. Train with the bundled sample

```bash
python -m ml_service.train --data data/sample_yield.csv --epochs 50
```

The script:
1. Loads and normalises the CSV (handles Explore-AI column names automatically)
2. Builds numeric (z-scored) + one-hot categorical features
3. Trains a 3-layer MLP (128→64→1) with BatchNorm + Dropout
4. Evaluates on 15% held-out test split, logs RMSE & MAE
5. Saves model + metadata to `models/<timestamp>/`

#### 3. Training options

```
--data PATH      CSV path (default: data/Crop_yield.csv)
--download       Download Explore-AI dataset before training
--epochs N       Training epochs (default: 50)
--batch-size N   Batch size (default: 256)
--lr FLOAT       Learning rate (default: 0.001)
```

### Running the ML service

```bash
cd ml-service
pip install -r requirements.txt
uvicorn ml_service.app:app --reload --port 8000
```

Or using the package entrypoint:

```bash
python -m ml_service
```

### Inference from AdonisJS

The Node backend calls the ML service automatically when `POST /api/v1/predictions` is called. The `ML_SERVICE_URL` environment variable controls the base URL (default: `http://localhost:8000`).

### Model versioning

Each training run creates `models/<YYYYMMDD_HHMMSS>/model.pt` and `metadata.json`. The `models/latest.txt` file points to the most recent version.

---

## 5. RAG Intelligent Query System (Scaffold)

### Endpoints

```
GET  /api/v1/rag/status        – subsystem readiness
POST /api/v1/rag/query         – submit a natural-language question
```

Access restricted to: `admin`, `supervisor`, `gov`, `ngo`, `researcher`.

Every query is written to `audit_logs` (action: `QUERY`) for governance compliance.

### Current state

Returns `status: not_implemented` with a clear message. The scaffold is in place to wire in:
1. SQL retrieval of relevant aggregates
2. Vector store retrieval (pgvector or external)
3. LLM generation (OpenAI / local model)

---

## 6. Stakeholder Dashboards

`GET /api/v1/dashboard` now returns role-filtered content:

| Role | Gets |
|------|------|
| `admin`, `supervisor` | All data + audit logs + import/prediction stats |
| `gov`, `ngo`, `researcher` | Yield summary + farmer counts + import/prediction stats |
| `trader` | Yield summary only |
| `field_agent` | Yield summary + farmer counts + sync status |

Role-specific aggregate endpoints:

```
GET /api/v1/analytics/import-trends   # last 30 days import jobs
GET /api/v1/analytics/yield-trends    # yield by crop/year/season
```

---

## 7. Data Monetisation (Scaffold)

### Tables

- `products` – data products (export, report, subscription, pay-per-query)
- `subscriptions` – user-product subscriptions
- `transactions` – payment records with full audit trail

### Endpoints

```
GET    /api/v1/monetization/products
POST   /api/v1/monetization/products          [admin only]
GET    /api/v1/monetization/products/:id
PATCH  /api/v1/monetization/products/:id      [admin only]
GET    /api/v1/monetization/subscriptions
POST   /api/v1/monetization/subscriptions
GET    /api/v1/monetization/transactions
```

Subscription creation currently creates a `pending` transaction. Payment gateway integration (Stripe / Paystack) is the next step.

Every transaction creates an `PAYMENT` audit log entry.

---

## 8. Running the Full Stack

### AdonisJS backend

```bash
# Copy env
cp .env.example .env
# Fill APP_KEY and DATABASE_URL

# Run migrations
node ace migration:run

# Start dev server
node ace serve --hmr
```

### ML service

```bash
cd ml-service
pip install -r requirements.txt

# Train (first time)
python -m ml_service.train --data data/sample_yield.csv

# Start
uvicorn ml_service.app:app --port 8000
```

### Environment variable for ML service

Add to `.env`:

```
ML_SERVICE_URL=http://localhost:8000
```

---

## 9. Running Tests

### Node.js (AdonisJS / Japa)

```bash
node ace test unit
```

### Python (ML service)

```bash
cd ml-service
pip install -r requirements.txt
pytest tests/ -v
```

---

## 10. Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ | – | PostgreSQL connection string |
| `APP_KEY` | ✅ | – | AdonisJS encryption key |
| `FRONTEND_URL` | ✅ | `http://localhost:5173` | Frontend origin (used in production CORS allowlist) |
| `ML_SERVICE_URL` | ⬜ | `http://localhost:8000` | Python ML microservice base URL |

---

## 11. Database Migrations

New migrations added (in order):

| File | Creates |
|------|---------|
| `1780000001000_create_import_jobs_table.ts` | `import_jobs` |
| `1780000002000_create_imported_records_table.ts` | `imported_records` |
| `1780000003000_create_dataset_permissions_table.ts` | `dataset_permissions` |
| `1780000004000_create_predictions_table.ts` | `predictions` |
| `1780000005000_create_monetization_tables.ts` | `products`, `subscriptions`, `transactions` |
| `1780000006000_extend_app_user_roles.ts` | Extends `app_user_role_enum` with new roles |
| `1780000007000_extend_audit_log_actions.ts` | Extends `audit_logs` action constraint |
