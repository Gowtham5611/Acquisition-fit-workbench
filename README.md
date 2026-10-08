# Acquisition Fit Workbench

> Turn raw company leads into an actionable acquisition pipeline.

## Problem

Lead-generation platforms produce large volumes of company data. But for acquisition entrepreneurs and searchers, the critical question remains: **"Which companies should I investigate first as potential acquisition targets?"**

Raw lead lists lack prioritization context. Without a systematic way to evaluate companies against acquisition criteria, searchers waste time manually reviewing hundreds of companies — many of which are poor fits.

## Business Context

In the Entrepreneurship Through Acquisition (ETA) space, searchers need to:
1. Source large numbers of potential target companies
2. Filter and evaluate them against specific investment criteria
3. Prioritize outreach to the highest-potential targets
4. Document their research process

Existing tools like SaaSquatch Leads excel at **discovery and enrichment** — finding companies, gathering contact details, estimating revenue. But there's a gap between raw lead data and actionable acquisition intelligence.

The Acquisition Fit Workbench fills this gap.

## Product Decision

Rather than building another lead scraper or duplicating SaaSquatch's discovery capabilities, this project adds a **focused decision-support layer** with two primary features:

### Feature 1: Explainable Acquisition Fit Scoring
A deterministic, configurable scoring engine that evaluates every company against the user's Ideal Company Profile (ICP) and provides a transparent 0–100 fit score with human-readable explanations for every rating.

### Feature 2: Lead Quality + Prioritization Workflow  
A complete data pipeline (normalize → validate → deduplicate → score → prioritize) that transforms raw CSV imports into a clean, actionable priority queue.

## Why These Features

These two features create more value than collecting additional raw data fields because:

1. **Scoring answers "what to do next"** — Raw data tells you what a company is. Scoring tells you whether it's worth your time.
2. **Explainability builds trust** — A score without reasoning is useless. Showing exactly why a company scored high or low lets the searcher validate the logic and adjust their criteria.
3. **Data quality prevents wasted effort** — Incomplete records lead to bad outreach. Surfacing missing fields helps users focus enrichment effort where it matters.
4. **Deduplication saves time** — Real lead lists have duplicates. Automatically merging them prevents redundant work.
5. **Prioritization is the bottleneck** — Discovery is increasingly automated. The human bottleneck is deciding which leads to pursue. This tool directly addresses that bottleneck.

## User Workflow

```
Discover / Import Leads (CSV upload or demo dataset)
        ↓
Normalize Data (websites, domains, formatting)
        ↓
Validate Data (required fields, email/URL format)
        ↓
Deduplicate (domain-first, name+location fallback)
        ↓
Configure Ideal Company Profile
        ↓
Calculate Acquisition Fit Score (0–100)
        ↓
Explain Why (positive/negative signals)
        ↓
Prioritize (HIGH / MEDIUM / LOW)
        ↓
Filter / Review / Search
        ↓
Export Filtered Results
```

## Architecture

```
React (TypeScript + Vite + Tailwind CSS)
              ↓ REST API
FastAPI (Python + Pydantic)
              ↓
     Service Layer
  ┌─────────────────────────────────┐
  │ scoring_service.py              │
  │ normalization_service.py        │
  │ validation_service.py           │
  │ deduplication_service.py        │
  │ import_service.py               │
  │ export_service.py               │
  │ lead_service.py                 │
  └─────────────────────────────────┘
              ↓
     Repository Layer
              ↓
     SQLAlchemy + SQLite
```

## Technology Choices

| Technology | Why |
|---|---|
| **React + TypeScript** | Type safety, component architecture, industry standard for B2B SaaS |
| **Vite** | Fast development server, optimized builds, modern tooling |
| **Tailwind CSS** | Rapid UI development, consistent design system, no CSS complexity |
| **FastAPI** | Modern Python API framework, automatic validation, OpenAPI docs, async support |
| **Pydantic** | Data validation, serialization, schema enforcement at the API boundary |
| **SQLAlchemy** | Mature ORM, database-agnostic models, easy migration to PostgreSQL |
| **SQLite** | Zero-config database for prototyping, file-based, no server required |

## Database Strategy

**Prototype:** SQLite — zero configuration, single file, ideal for local development and interview evaluation.

**Production:** PostgreSQL — concurrent connections, ACID compliance, full-text search, JSON columns, proven at scale.

Migration path: Change `DATABASE_URL` in `.env`, add `psycopg2` dependency. SQLAlchemy models are database-agnostic.

## Caching Strategy

**Prototype:** Simple in-memory TTL cache for repeated stat/filter queries during a session.

**Production:** Redis or managed caching (ElastiCache, Memorystore) for shared cache across instances, session data, and rate limiting.

## Performance

- **Database indexes** on frequently queried columns (company_name, domain, industry, state, fit_score, priority, revenue, employee_count)
- **Backend pagination** — default 20 rows, configurable up to 100
- **Backend filtering/sorting** — all queries execute in the database, not in the browser
- **Efficient scoring** — batch score calculation, results stored in database
- **No N+1 queries** — single queries with joins where needed
- Designed for **100–10,000 records** in prototype, scalable to 100K+ with PostgreSQL

## Data Quality

- **Normalization**: Website URLs, domains, company names, emails, phone numbers, LinkedIn URLs
- **Validation**: Required fields (company_name), email format, URL format, numeric ranges
- **Deduplication**: Primary key = normalized domain; fallback = normalized company name + state
- **Completeness scoring**: 11 important fields checked, percentage score calculated

## Scoring Formula

| Criterion | Max Points | Logic |
|---|---|---|
| Industry Fit | 25 | Full match to target industries |
| Geography Fit | 15 | State/city match to target locations |
| Revenue Fit | 15 | Within configured range (partial for near-range) |
| Employee Count Fit | 10 | Within configured range |
| Business Age Fit | 10 | Within configured years range |
| Decision Maker | 10 | Owner/contact information available |
| Data Completeness | 10 | Proportion of important fields present |
| Website Presence | 5 | Website URL available |
| **Total** | **100** | |

Priority assignment:
- **HIGH**: 80–100
- **MEDIUM**: 60–79
- **LOW**: 0–59

## CSV Import

Supported columns (with common aliases):

| Field | Aliases |
|---|---|
| company_name | company, name, business_name |
| website | url, site, web |
| industry | sector, vertical |
| city | — |
| state | region, province |
| country | — |
| employee_count | employees, num_employees, headcount |
| revenue | annual_revenue, yearly_revenue |
| founded_year | founded, year_founded, established |
| owner_name | owner, contact_name, contact |
| owner_title | title, contact_title |
| owner_email | email, contact_email |
| phone | telephone, phone_number |
| linkedin_url | linkedin, linkedin_profile |
| source | lead_source, data_source |
| source_url | source_link |

Import shows: rows received, valid, invalid, duplicates found, rows imported.

## API Documentation

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/leads` | List leads (paginated, filtered, sorted) |
| POST | `/api/leads/search` | Search leads |
| GET | `/api/leads/{id}` | Get lead details |
| POST | `/api/leads/import` | Import CSV file |
| POST | `/api/leads/load-demo` | Load demo dataset |
| POST | `/api/leads/score` | Score all leads with ICP |
| POST | `/api/score/preview` | Preview score for single lead |
| GET | `/api/leads/export` | Export filtered leads as CSV |
| GET | `/api/stats` | Dashboard statistics |

## Testing

```bash
# Backend tests
cd backend
python -m pytest app/tests/ -v

# Frontend build check
cd frontend
npm run build
```

Backend tests cover: scoring calculation, boundary conditions, priority assignment, industry/geography/revenue/employee/age matching, data quality, normalization, validation, deduplication, CSV import, API endpoints, pagination, filtering, sorting, export.

## Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate      # macOS/Linux
pip install -r requirements.txt

# Generate demo data (if not already present)
python generate_demo_data.py

# Start server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

### Quick Start
1. Start backend (port 8000)
2. Start frontend (port 5173)
3. Click "Load Demo Data" on the Import page or dashboard
4. Configure your Ideal Company Profile
5. Click "Score Leads"
6. Review HIGH priority targets
7. Export filtered results

## Deployment

Deployment-ready configuration and instructions are included. No live deployment is claimed unless verified.

**Possible production deployment:**
- Frontend: Vercel / Netlify / static hosting
- Backend: Render / Railway / AWS ECS
- Database: PostgreSQL (Render, RDS, Cloud SQL)

## Limitations

- **Synthetic demo dataset** — not real company data
- **No paid enrichment provider** — no live data augmentation
- **No live scraping** — data comes from CSV import only
- **SQLite prototype scale** — suitable for thousands, not millions of records
- **No production authentication** — no user accounts or access control
- **No real-time updates** — manual refresh after scoring

## Future Improvements

- Real data-provider adapters (Apollo, ZoomInfo, Clearbit)
- PostgreSQL for production scale
- Redis for shared caching
- Enrichment API integration
- CRM integration (HubSpot, Salesforce)
- Additional acquisition signals (customer concentration, recurring revenue %, churn)
- Learning-to-rank from historical acquisition outcomes
- AI-powered extraction of unstructured company information
- Webhook notifications for score changes
- Team collaboration features
