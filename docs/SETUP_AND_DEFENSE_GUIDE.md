# Integrated Agricultural Data System — Setup & Defense Guide

> **Addis Ababa Science and Technology University**  
> Final Year Project — Computer Engineering Stream  
> Team: Dagmawi Shewaye · Kaleab Kebede · Kalkidan Yishak · Kidan Dibekulu  
> Advisor: Mr. Esubalew M.

---

## ⚡ Quick Start (5 minutes before defense)

```bash
# 1. Install Node dependencies
npm install

# 2. Copy and fill environment file
cp .env.example .env
# → Open .env and set: DATABASE_URL, ANTHROPIC_API_KEY (see Step 2 below)

# 3. Run database migrations
node ace migration:run

# 4. Install Python dependencies
pip install -r ml-service/requirements.txt

# 5. Start everything (opens AdonisJS + ML service)
bash start-all.sh
```

The ML model is **already trained and bundled** in `ml-service/models/`. No training step needed.

---

## What Was Built — All 6 Modifications Complete

| # | Feature | Status |
|---|---------|--------|
| 1 | Legacy CSV/XLSX Data Import | ✅ Complete |
| 2 | AI Analytics Engine (scikit-learn GradientBoosting) | ✅ Complete + **model pre-trained** |
| 3 | RAG Intelligent Query System (Claude AI) | ✅ Complete |
| 4 | Stakeholder-Specific Dashboards (7 roles) | ✅ Complete |
| 5 | Data Monetization + Chapa Payment Gateway | ✅ Complete |
| 6 | Data Governance + RBAC + Audit Logs | ✅ Complete |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     AdonisJS Backend                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ RAG          │  │ Predictions  │  │ Monetization     │  │
│  │ Controller   │  │ Controller   │  │ (Chapa Gateway)  │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────────────┘  │
│         │                 │                                  │
│  ┌──────▼───────┐  ┌──────▼───────┐                        │
│  │ RagService   │  │  MlService   │                        │
│  │ (SQL retriev)│  │  (HTTP call) │                        │
│  └──────┬───────┘  └──────┬───────┘                        │
│         │                 │                                  │
│  ┌──────▼───────┐  ┌──────▼───────────────────────────┐    │
│  │ PostgreSQL   │  │ Python FastAPI + sklearn          │    │
│  │ (7 tables)   │  │ GradientBoostingRegressor         │    │
│  └──────┬───────┘  │ MAE: 2,424 kg  RMSE: 3,409 kg   │    │
│         │          └──────────────────────────────────┘    │
│  ┌──────▼───────┐                                          │
│  │ Anthropic    │  claude-haiku-4-5-20251001               │
│  │ Claude API   │  (RAG answer generation)                 │
│  └──────────────┘                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Step 1 — Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Python 3.10+

---

## Step 2 — Environment Variables

```bash
cp .env.example .env
```

The only values you **must** set:

```env
# Required — your PostgreSQL connection
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/iads_db

# Required for RAG — get free key at https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-...

# Required for core app
APP_KEY=    ← run: node ace generate:key   and paste here
APP_URL=http://localhost:3333
FRONTEND_URL=http://localhost:5173

# Optional — only needed for live payments
CHAPA_SECRET_KEY=CHAPASK-...
```

Everything else in `.env.example` can stay as-is for development.

---

## Step 3 — Database

```bash
# Create database
createdb iads_db

# Run migrations (creates all 15 tables)
node ace migration:run
```

---

## Step 4 — Python ML Service

```bash
# Install dependencies (once)
pip install -r ml-service/requirements.txt

# The model is already trained! Verify it:
ls ml-service/models/
# You should see a folder like: 20260512_112525/
```

**The model does not need to be retrained.** It is bundled in the zip.  
If you ever want to retrain: `python -m ml_service.train --data ml-service/data/sample_yield.csv`

---

## Step 5 — Start Everything

```bash
# Option A: One command (recommended for defense)
bash start-all.sh

# Option B: Two separate terminals
# Terminal 1:
node ace serve --hmr

# Terminal 2:
cd ml-service && uvicorn ml_service.app:app --reload --port 8000
```

---

## Step 6 — Verify

```bash
# API health
curl http://localhost:3333/api/v1/dashboard/health

# ML service health (shows model version + accuracy)
curl http://localhost:8000/health

# RAG status (after login)
curl -H "Authorization: Bearer <token>" http://localhost:3333/api/v1/rag/status
```

---

## API Reference — AI Features

### 🤖 RAG Intelligent Query

**POST** `/api/v1/rag/query`  
Roles allowed: admin, supervisor, gov, ngo, researcher

```json
// Request
{
  "question": "Which regions have declining maize yield trends?",
  "dataset_type": "imported_records",
  "filters": { "crop_name": "maize" }
}

// Response
{
  "status": "success",
  "query_id": "uuid",
  "answer": "Based on the historical data retrieved from the database, Tigray shows...",
  "citations": [
    { "source": "imported_records", "description": "...", "row_count": 24 },
    { "source": "system_summary",   "description": "...", "row_count": 1  }
  ],
  "context_summary": "system_summary (1 rows), imported_records (24 rows)",
  "tokens_used": 847,
  "llm_model": "claude-haiku-4-5-20251001"
}
```

**GET** `/api/v1/rag/status`
```json
{ "rag_status": "ready", "api_key_configured": true, "db_accessible": true }
```

---

### 📊 Yield Prediction (ML)

**POST** `/api/v1/predictions`

```json
// Request
{
  "crop_name": "teff",
  "area_hectares": 2.5,
  "rainfall_mm": 850,
  "temperature_celsius": 22,
  "fertilizer_amount_kg": 50,
  "season": "meher",
  "year": 2025
}

// Response
{ "predicted_yield_kg": 3089, "model_version": "20260512_112525", "status": "completed" }
```

---

### 📥 Data Import

**POST** `/api/v1/imports`  
`Content-Type: multipart/form-data`, field `file` (CSV or XLSX, max 50 MB)

---

### 💳 Monetization (Chapa)

**POST** `/api/v1/monetization/subscriptions`
```json
{ "product_id": "uuid", "return_url": "https://yourapp.com/dashboard" }
// Returns checkout_url → redirect user to complete payment
```

---

## Defense Demo Script

Run these in order during your presentation:

### Demo 1 — RAG Query (Most impressive — do this first)
```bash
curl -X POST http://localhost:3333/api/v1/rag/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Which kebeles have the lowest teff yields and what could be the reasons?",
    "dataset_type": "all"
  }'
```

### Demo 2 — Regional Comparison
```bash
curl -X POST http://localhost:3333/api/v1/rag/query \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Compare maize yields between Oromia and Amhara regions",
    "filters": { "crop_name": "maize" }
  }'
```

### Demo 3 — ML Prediction
```bash
curl -X POST http://localhost:3333/api/v1/predictions \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "crop_name": "teff",
    "area_hectares": 2.5,
    "rainfall_mm": 850,
    "temperature_celsius": 22,
    "fertilizer_amount_kg": 50,
    "season": "meher",
    "year": 2025
  }'
```

### Demo 4 — Import Historical Data
```bash
curl -X POST http://localhost:3333/api/v1/imports \
  -H "Authorization: Bearer <token>" \
  -F "file=@ml-service/data/sample_yield.csv"
```

---

## How to Explain RAG to the Panel

> *"When a user asks a question in plain English, our system does three things:*
> *First it **retrieves** relevant data from our PostgreSQL database using targeted SQL queries.*
> *Then it **augments** that data into a structured context — actual numbers from our database.*  
> *Finally it **generates** an answer using Claude AI, but Claude can only use the data we gave it — it cannot make up numbers. Every answer includes citations showing which database tables were used, making the system fully auditable.*
> *This is fundamentally different from a regular chatbot — our answers are grounded in live agricultural data."*

---

## How to Explain the ML Model

> *"We use a Gradient Boosting Regressor — an ensemble of decision trees — trained on 2,000 Ethiopian crop records.*
> *The model takes 7 inputs: crop type, area in hectares, rainfall, temperature, fertilizer amount, season, and year.*
> *It achieved a Mean Absolute Error of 2,424 kg on the test set.*
> *The model is served as a separate Python microservice (FastAPI) that our AdonisJS backend calls via HTTP — this is a microservice architecture, which makes it independently scalable and replaceable."*

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `ANTHROPIC_API_KEY not configured` | Add key to `.env` from console.anthropic.com |
| `ML service unreachable` | Run `uvicorn ml_service.app:app --port 8000` in `ml-service/` dir |
| `Migration failed` | Check `DATABASE_URL` in `.env` is correct |
| Chapa returns error | Set `CHAPA_SECRET_KEY` from dashboard.chapa.co (use test key) |
| `node ace generate:key` | Run this to generate `APP_KEY` value |

---

## New Files Added to Your Project

```
adonis-master/
├── app/
│   ├── controllers/
│   │   ├── rag_controller.ts           ← Full RAG implementation
│   │   └── monetization_controller.ts  ← Full Chapa payment integration
│   └── services/
│       └── rag_service.ts              ← SQL retrieval + Claude API
├── ml-service/
│   ├── model.py                        ← Rewritten for scikit-learn
│   ├── app.py                          ← Rewritten for scikit-learn
│   ├── train.py                        ← Rewritten for scikit-learn
│   ├── requirements.txt                ← Updated (no torch)
│   ├── models/
│   │   ├── latest.txt                  ← Points to trained model
│   │   └── 20260512_112525/
│   │       ├── model.pkl               ← Pre-trained model (ready to use)
│   │       └── metadata.json           ← Feature encoders + accuracy stats
│   └── data/
│       └── sample_yield.csv            ← 2,000 Ethiopian crop records
├── start-all.sh                        ← One command to start everything
├── start/
│   └── env.ts                          ← + ANTHROPIC_API_KEY, CHAPA_SECRET_KEY
├── .env.example                        ← + all new keys documented
└── docs/
    └── SETUP_AND_DEFENSE_GUIDE.md      ← This file
```

---

## Frontend Setup

The frontend is a **Next.js 16** app with Tailwind CSS, shadcn/ui, and Recharts.

### Install and run
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

Or use `bash start-all.sh` from the project root to start everything at once.

### New pages added

| Route | Feature |
|-------|---------|
| `/dashboard/ai-query` | **AI Query** — conversational RAG interface |
| `/dashboard/predictions` | **Yield Predictions** — ML prediction form + history |
| `/dashboard/imports` | **Data Imports** — CSV/XLSX upload + validation viewer |

### Sidebar structure

The sidebar now has four groups:
- **Overview** — Dashboard
- **Field Data** — Farmers, Plots, Observations, Crop Types
- **Intelligence** — AI Query ✨, Predictions, Data Imports *(highlighted with AI badge)*
- **Admin** — Organizations, Users, Devices, Sync Queue, Audit Logs, Settings
