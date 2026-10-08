# Project Rationale

## Problem Identified
Lead generation tools produce volume. Acquisition searchers need signal. The gap between "here are 500 companies" and "here are 15 companies worth calling" is where value is created.

## Why Prioritization Matters
A searcher evaluating 50 companies per day can review ~1,000/month. If a pipeline has 10,000 leads, manual review takes 10 months. Scoring and prioritization reduce this to reviewing the top 200 first — a 50x improvement in time-to-first-meeting.

## Why Acquisition Fit Is Useful
Not all companies are acquisition targets. A SaaS company with $3M revenue, 20 employees, and 8 years of history is a very different target than a 2-year-old startup with no revenue. Scoring quantifies this difference.

## Why Deterministic Scoring
- Reproducible: same inputs always produce same outputs
- Testable: unit tests can verify exact score calculations
- Explainable: every point can be traced to a specific criterion
- Debuggable: if a score seems wrong, you can identify exactly which criterion is off
- No API costs: no external AI calls needed
- Fast: millisecond computation

AI/ML scoring was considered but rejected for this prototype because: (a) no training data exists, (b) black-box scores undermine trust, (c) deterministic scoring is appropriate for structured data with known criteria.

## Why Score Explanations Matter
A score of 91 is meaningless without context. "Industry matches, revenue is in range, decision maker available, but LinkedIn profile missing" tells the user exactly what they're getting and what's incomplete.

## Why Data Quality Matters
If a company is scored HIGH but has no email, no phone, and no decision maker name — the user can't actually act on it. Data quality scoring surfaces these gaps before the user wastes time.

## Why Deduplication Matters
Real lead lists from multiple sources inevitably contain duplicates. Importing 500 leads that include 50 duplicates means 10% wasted review time. Automatic deduplication with intelligent merging preserves the best data from each source.

## Why These Two Features Fit the Assignment
Caprae asks for 1-2 impactful improvements to their lead-generation workflow. These features:
1. Add intelligence that raw lead data lacks (scoring)
2. Add a quality layer that prevents wasted effort (data pipeline)
3. Are complementary — scoring depends on clean, validated data
4. Can be demonstrated end-to-end in a working prototype
5. Show both product thinking and engineering execution

## Tradeoffs Made
- SQLite over PostgreSQL: simpler setup, portable, sufficient for demo scale
- Deterministic scoring over ML: explainable, testable, no training data needed
- CSV import over live scraping: no external API dependencies, works offline
- Single-page app over SSR: simpler deployment, sufficient for an internal tool
- No authentication: unnecessary complexity for a prototype
- Synthetic data over real data: ethical, legal, clearly labeled

## What Was Intentionally Excluded
- Authentication/authorization
- Payment processing
- Email automation
- CRM integration
- AI chatbots or agents
- Kubernetes/microservices
- GraphQL
- Cloud infrastructure
- Live scraping
- Real company data

## How It Could Scale
- SQLite → PostgreSQL for concurrent access
- Add Redis for caching
- Add background job queue (Celery/RQ) for scoring large datasets
- Add enrichment API adapters
- Add user authentication and multi-tenant support
- Deploy frontend to CDN, backend to container service
- Add monitoring and alerting

## INTERVIEW DEFENSE

**Why did you build this?**
The assignment asks for improvements to a lead-generation workflow. Rather than building another scraper, I identified the gap between raw leads and actionable intelligence. Acquisition fit scoring turns data into decisions.

**Why these two features?**
Scoring answers "which companies are worth investigating." Data quality answers "can I actually reach them." Together, they convert raw leads into an actionable priority queue.

**Why not build a scraper?**
SaaSquatch already handles discovery and enrichment. Building another scraper duplicates existing capability. Scoring and prioritization add new value to the pipeline.

**Why acquisition fit?**
Caprae operates in the ETA space. Their users are searching for companies to acquire. Generic lead scoring (for sales) evaluates purchase likelihood. Acquisition fit scoring evaluates investment suitability — a fundamentally different question.

**Why deterministic scoring instead of AI?**
Three reasons: (1) No training data exists for acquisition outcomes. (2) Users need to trust and understand why a company scored high. (3) Deterministic scoring is testable — I can write 25+ unit tests proving the math is correct.

**Why FastAPI?**
Modern Python framework with automatic request validation (Pydantic), OpenAPI documentation, async support, and excellent developer experience. The right tool for a data-processing API.

**Why React?**
Industry standard for interactive B2B dashboards. TypeScript adds type safety that matches the backend's Pydantic validation. Component architecture maps cleanly to the UI's modular design.

**Why SQLite?**
Zero-config, file-based, perfect for interview evaluation. The reviewer can clone and run without installing PostgreSQL. SQLAlchemy makes migration to PostgreSQL a one-line config change.

**How does deduplication work?**
Primary: normalize the website URL → extract domain → match against existing domains. Fallback: normalize company name + state for companies without websites. When duplicates are found, fields are merged preferring the more complete value.

**How would you scale from 10,000 to 10 million leads?**
PostgreSQL for concurrent access, Redis for caching, background job queue for async scoring, database partitioning by created_at, read replicas for query load, CDN for frontend.

**How would you make scoring learn from outcomes?**
Track which scored leads converted to actual acquisitions. Use logistic regression or gradient boosting on the feature set to learn which criteria actually predict successful acquisitions. Gradually shift from rule-based to learned weights.

**How would you add real data providers?**
Create an adapter interface (enrich(company_name, domain) -> EnrichmentResult). Implement adapters for Apollo, ZoomInfo, Clearbit. Queue enrichment requests, cache results, handle rate limits.

**How would you secure production deployment?**
JWT authentication, RBAC, HTTPS everywhere, input sanitization (already in place via Pydantic), rate limiting, CORS restrictions, SQL injection prevention (via SQLAlchemy ORM), audit logging, secrets management.

**What would you build next?**
Enrichment API integration to fill data quality gaps, then a learning-to-rank model once acquisition outcome data exists.

**What are the current limitations?**
Synthetic data only, no live enrichment, SQLite scale ceiling, no authentication, single-user prototype.
