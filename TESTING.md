# Testing

## Backend Tests
The backend test suite covers:
- Scoring calculation and boundary conditions
- Priority assignment
- Industry, geography, revenue, employee, and age matching logic
- Data quality evaluation
- Normalization and validation rules
- Deduplication logic
- CSV import processing
- API endpoints (pagination, filtering, sorting, export)

**To run the backend tests:**
```bash
cd backend
python -m pytest app/tests/ -v
```

## Frontend Build Verification
Verify the frontend builds successfully without TypeScript compilation errors.

**To run the frontend build check:**
```bash
cd frontend
npm run build
```

## Manual Test Checklist
- [ ] Start backend server and verify `/api/health` endpoint
- [ ] Start frontend development server and open in browser
- [ ] Click "Load Demo Data" and verify records populate
- [ ] Configure Ideal Company Profile and submit
- [ ] Click "Score Leads" and verify priorities update
- [ ] Filter by HIGH priority and sort by score
- [ ] Click a lead to view detailed score breakdown and signals
- [ ] Verify data completeness score and missing fields UI
- [ ] Import a custom CSV and review import summary (rows, valid, duplicates)
- [ ] Export filtered leads to CSV and verify contents

## Test Results
Run `python -m pytest app/tests/ -v` to see current results.
