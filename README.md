# Acquisition Fit Workbench
### Deal Sourcing Command Center

> **"Find the targets worth investigating first — and know what to verify next."**  
> *Turn company data into an explainable acquisition research queue.*

---

## Executive Overview & Business Value

In the Entrepreneurship Through Acquisition (ETA), search fund, independent sponsor, and private equity sourcing ecosystems, teams do not suffer from a shortage of company names. Top-of-funnel platforms like **SaaSquatch Leads** provide robust company discovery, filtering, contact discovery, and enrichment.

The actual bottleneck begins **after** hundreds of companies are sourced:  
**"Which targets deserve the team's limited research and diligence time?"**

The **Acquisition Fit Workbench** acts as a dedicated decision-support command center that sits directly downstream of discovery. It evaluates targets along two independent dimensions:
1. **Acquisition Fit Score (0–100):** How closely does this company match the buyer's acquisition thesis?
2. **Data Confidence (0–100%):** How complete and validated is the underlying data supporting that rating?

This distinction creates a high-leverage research workflow where promising targets requiring verification are never conflated with verified priority opportunities.

---

## What Makes This Different?

| Conventional Lead Dashboard | Acquisition Fit Workbench (Command Center) |
| :--- | :--- |
| **"Here are 100 companies."** | **"Here are the targets that best fit your thesis, how confident the data is, and what to investigate next."** |
| Flat table sorted alphabetically or by date. | Dual-view terminal: **Executive View** for immediate decisions and **Research View** for deep analysis. |
| Opaque numbers or black-box predictions. | **Deterministic, 8-factor explainable scoring** with line-item positive and negative data signals. |
| Ignores missing data until outreach bounces. | **Opportunity Matrix (Fit × Confidence)** instantly distinguishes *Priority Targets* from *Verify First* candidates. |
| Static list viewing. | **Side-by-side target comparison** (up to 3 targets) with neutral, objective criteria evaluation. |
| Raw CSV data dumps. | **One-click Preliminary Acquisition Research Brief** formatted for pre-diligence review. |

---

## Core Product Capabilities

The application focuses strictly on two primary product features without unnecessary CRM or scraping bloat:

### Feature 1: Explainable Acquisition Fit Scoring
- **8-Factor Deterministic Engine:** Evaluates Industry Fit (25 pts), Geography Fit (15 pts), Revenue Scope (15 pts), Employee Scale (10 pts), Business Longevity (10 pts), Decision Maker Availability (10 pts), Data Completeness (10 pts), and Website Presence (5 pts).
- **Exclusion Filters:** Automatic disqualification overrides for user-specified negative keywords (e.g. `franchise`, `nonprofit`).
- **Priority Classification:** `HIGH` (80–100), `MEDIUM` (60–79), `LOW` (0–59), and `UNSCORED`.
- **Explainable Signals:** Line-item positive and negative signals derived purely from real company metrics. Zero fabricated explanations.

### Feature 2: Acquisition Decision Intelligence
- **Opportunity Matrix (Fit × Confidence):** Interactive quadrant scatter plot mapping strategic fit against information completeness.
- **Executive View vs. Research View Toggle:** Seamless switch between the high-level decision terminal and the detailed 11-column data grid.
- **Next Best Action Engine:** Deterministic guidance for every target based on missing attributes or criteria gaps (e.g. *"Verify revenue range"*, *"Identify decision maker"*, *"Prioritize for initial owner research"*).
- **Verification Gaps Checklist:** Prioritized inventory of missing fields (`HIGH`, `MEDIUM`, `LOW` data gaps).
- **Persistent Shortlist:** Bookmark and track high-conviction targets across sessions.
- **Side-by-Side Target Comparison:** Compare 2 or 3 shortlisted targets with objective criteria highlights.
- **Preliminary Acquisition Research Brief:** Structured one-page briefing document with instant print / PDF export.
- **Lead Quality & Deduplication Pipeline:** Real-time domain canonicalization, required field validation, and domain / name+state deduplication.

---

## Opportunity Matrix (Fit × Confidence)

```
        ACQUISITION FIT
              100 ▲
                  │  TOP-LEFT:                      TOP-RIGHT:
                  │  VERIFY FIRST                   PRIORITY TARGETS
                  │  (High Fit + Low Confidence)    (High Fit + High Confidence)
                  │  -------------------------------------------------------------
               70 ┼───────────────────────────────┬───────────────────────────────
                  │  BOTTOM-LEFT:                 │ BOTTOM-RIGHT:
                  │  DEPRIORITIZE                 │ KNOWN LOW FIT
                  │  (Low Fit + Low Confidence)   │ (Low Fit + High Confidence)
                  │                               │
                0 └───────────────────────────────┴───────────────────────────────►
                  0                              75                              100
                                       DATA CONFIDENCE (%)
```

- **Top-Right (Priority Targets):** Targets that match the acquisition criteria with verified contact and operational data. Ready for initial owner outreach.
- **Top-Left (Verify First):** Targets that match the acquisition thesis but have data gaps (e.g. missing direct email or unconfirmed revenue). Verification is needed before outreach.
- **Bottom-Right (Known Low Fit):** Complete records that definitively fall outside the target industry, geography, or size criteria.
- **Bottom-Left (Deprioritize):** Low fit combined with incomplete information; de-prioritized for sourcing time.

---

## Executive View vs. Research View

- **Executive View (Default):**
  - **Executive Insight Strip:** Counts for *Priority Targets*, *Verify First*, *Average Fit*, *Average Confidence*, and *Shortlisted Targets*.
  - **Visual Core:** Interactive Opportunity Matrix on the left paired with **Today's Research Queue** (Top 5 ranked opportunities with *Why It Matters* and *Next Action*).
  - **Deterministic Pipeline Insights:** Concrete, data-grounded observations calculated from current dataset metrics (e.g. revenue coverage %, qualifying candidate %).
- **Research View:**
  - Full-featured data grid with search, multi-parameter filters (score range, revenue, headcount, state, requirements), server-side sorting, pagination, and shortlisted checkboxes.
  - Quick action buttons to launch the Target Drawer, toggle Shortlists, or trigger filtered CSV exports.

---

## Next Best Action Engine

Rather than utilizing an ungrounded LLM, the workbench employs a deterministic decision service (`backend/app/services/decision_service.py`) that audits available fields and criteria alignment:

- Exclusion matched $\to$ `"Exclude from acquisition pipeline"`
- Fit score $< 50$ $\to$ `"Deprioritize"`
- Missing revenue $\to$ `"Verify revenue range"`
- Missing headcount $\to$ `"Verify employee count"`
- Decision maker unrecorded $\to$ `"Identify decision maker"`
- High Fit ($\ge 70$) + Low Confidence ($< 75\%$) $\to$ `"Verify core company data before outreach"`
- High Fit ($\ge 70$) + High Confidence ($\ge 75\%$) $\to$ `"Prioritize for initial owner research"`

---

## Target Comparison Matrix

Select 2 or 3 targets using the checkboxes in the Research View or Shortlist and click **Compare (N/3)** to open the comparison modal:
- Side-by-side attributes: Fit Score, Data Confidence, Priority, Quadrant, Industry, Location, Revenue, Headcount, Operating Longevity, Decision Maker, Next Action.
- Objective evaluation summaries:
  - *"Strongest fit against current criteria: <Company>"*
  - *"Best data confidence: <Company>"*
  - *"Needs most verification before diligence: <Company>"*

---

## Preliminary Acquisition Research Brief

Accessible directly from the Lead Detail Drawer via **Generate Acquisition Brief**:
- **Target Snapshot:** Standardized overview of firmographics, longevity, and leadership.
- **Acquisition Fit Rating:** Fit Score, Data Confidence, Priority, and Opportunity Quadrant.
- **Why It Ranks:** Specific thesis alignment factors.
- **Verify Before Proceeding:** Prioritized verification checklist of missing data.
- **Next Best Action:** Concrete pre-diligence operational step.
- **Source Attribution:** Clear provenance metadata.
- **Print / PDF Export:** Clean CSS print styles for instant PDF saving or physical printing.

---

## System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                           │
│        React 19 • TypeScript • Tailwind CSS • Vite            │
│                                                               │
│   Executive View       Research View       Opportunity Matrix │
│   Research Queue       Compare Modal       Acquisition Brief  │
│   LeadDetailDrawer     FilterBar           ICP Configuration  │
└───────────────────────────────┬───────────────────────────────┘
                                │ HTTP / REST (JSON)
┌───────────────────────────────▼───────────────────────────────┐
│                       BACKEND API                             │
│                  FastAPI • Python 3.13                        │
│                                                               │
│   /api/insights               /api/leads                      │
│   /api/leads/{id}/decision-summary   /api/leads/score         │
│   /api/leads/compare          /api/leads/export               │
│   /api/shortlist              /api/leads/import               │
│   /api/brief/{id}             /api/health                     │
└───────────────────────────────┬───────────────────────────────┘
                                │ Service Invocation
┌───────────────────────────────▼───────────────────────────────┐
│                     BUSINESS SERVICES                         │
│                                                               │
│   ScoringService           DecisionService (Gaps & Actions)   │
│   NormalizationService     DeduplicationService               │
│   ValidationService        ImportService / ExportService      │
└───────────────────────────────┬───────────────────────────────┘
                                │ SQLAlchemy 2.0 ORM
┌───────────────────────────────▼───────────────────────────────┐
│                      STORAGE ENGINE                           │
│            SQLite (Indexed) / PostgreSQL-Ready                │
└───────────────────────────────────────────────────────────────┘
```

---

## Verification & Automated Test Suite

The project includes **76 comprehensive automated backend tests** covering all business logic, boundary conditions, and API contracts.

```bash
$ env:PYTHONPATH="backend"; py -3.13 -m pytest backend/app/tests -v
======================== 76 passed, 1 warning in 0.76s ========================
```

### Verified Test Modules
1. `test_decision.py` (11 tests): Quadrant calculation (all 4 quadrants), next-best-action rules, verification gaps checklist, shortlist add/remove, comparison matrix (2 and 3 targets, invalid size rejection), acquisition brief generation, executive statistics, and count partition invariant.
2. `test_scoring.py` (26 tests): All 8 scoring criteria dimensions, score clamping, boundary thresholds (59/60, 79/80), exclusion keyword penalties, and signal generation.
3. `test_api.py` (15 tests): REST API endpoints for leads, search, filters, pagination, import, export, and health.
4. `test_validation.py` (9 tests): Strict type checks, email formatting, domain protocols, negative revenues, and future founding years.
5. `test_normalization.py` (7 tests): URL normalization, domain extraction, company suffix stripping, phone cleaning.
6. `test_deduplication.py` (5 tests): Domain deduplication, name + state fallback, batch deduplication, field merging.
7. `test_data_quality.py` (3 tests): Data completeness scoring across complete, partial, and empty leads.

### Live System Integration Verification
Run the live integration verification suite:
```bash
$ py -3.13 verify_integration.py
1. Health Check: healthy
2. Insights Check: Total=160, PriorityTargets=20, VerifyFirst=13, KnownLowFit=112, Deprioritize=15
3. Stats Check: Invariant STRICTLY VERIFIED (total == high + med + low + unscored)
4. Shortlist Check: Active shortlist endpoints verified
5. Target Comparison Check: 2-target side-by-side comparison verified
6. Acquisition Brief Check: Preliminary brief verified
7. Decision Summary Check: Executive explanation and gaps verified
8. Filtered CSV Export Check: Exactly filtered records exported
9. Frontend Server Check: HTTP 200 OK
=======================================================
ALL 9 LIVE SYSTEM INTEGRATION CHECKS PASSED PERFECTLY!
=======================================================
```

---

## Local Execution Instructions

### Prerequisites
- Python 3.11+ (verified with Python 3.13)
- Node.js 18+ & npm (verified with Node.js v20+)

### 1. Backend Server Setup
```bash
cd backend
py -3.13 -m pip install -r requirements.txt
$env:PYTHONPATH="backend"
py -3.13 -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API available at `http://127.0.0.1:8000` (Interactive Swagger docs at `http://127.0.0.1:8000/docs`).*

### 2. Frontend Application Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend available at `http://127.0.0.1:5173`.*

### 3. Production Build Verification
```bash
cd frontend
npm run build
```
*Builds production assets into `dist/` in under 5 seconds with zero TypeScript warnings.*

---

## Data Honesty & Scope Disclosures

In accordance with Caprae's standards of engineering integrity:
1. **Synthetic Prototype Data:** The dataset (`data/demo/demo_leads.csv`) contains 175 realistic records (160 unique companies across 14 industries and 25 states + 15 deliberate duplicates) constructed specifically to test deduplication, missing fields, and all 4 matrix quadrants.
2. **Pre-Diligence Tooling:** This tool is designed for **sourcing and qualification**, not full financial due diligence.
3. **No Web Scraping:** This tool does not execute unauthorized background web scraping.
4. **Deterministic Reasoning:** Scores, recommendations, and insights are calculated deterministically from available structured data. No third-party LLM API keys are required or invoked.
