import io
import pytest

SAMPLE_CSV = """company_name,website,industry,city,state,revenue,employee_count,founded_year,owner_name
Alpha SaaS,https://alpha-saas.test,SaaS,Austin,TX,5000000,50,2015,Jane Doe
Beta Health,https://beta-health.test,Healthcare,Dallas,TX,12000000,120,2010,John Smith
Gamma Logistics,https://gamma-log.test,Logistics,Miami,FL,30000000,300,1995,Robert Davis
"""

def seed_sample_leads(client):
    files = {"file": ("seed.csv", io.BytesIO(SAMPLE_CSV.encode("utf-8")), "text/csv")}
    res = client.post("/api/leads/import", files=files)
    assert res.status_code == 200

def test_health_endpoint(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_get_leads_empty(client):
    response = client.get("/api/leads")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)

def test_get_stats(client):
    seed_sample_leads(client)
    response = client.get("/api/stats")
    assert response.status_code == 200
    stats = response.json()
    assert "total_leads" in stats
    assert "high_priority" in stats
    assert "medium_priority" in stats
    assert "low_priority" in stats
    assert "avg_fit_score" in stats
    assert stats["total_leads"] >= 3

def test_import_csv(client):
    files = {"file": ("test_import.csv", io.BytesIO(SAMPLE_CSV.encode("utf-8")), "text/csv")}
    response = client.post("/api/leads/import", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["rows_received"] == 3
    assert data["rows_imported"] == 3
    assert data["valid_rows"] == 3
    assert data["invalid_rows"] == 0

def test_get_leads_after_import(client):
    seed_sample_leads(client)
    response = client.get("/api/leads")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 3
    assert any("Alpha" in lead["company_name"] for lead in data["items"])

def test_get_lead_by_id(client):
    seed_sample_leads(client)
    response = client.get("/api/leads")
    leads = response.json()["items"]
    assert len(leads) > 0
    lead_id = leads[0]["id"]
    
    detail_res = client.get(f"/api/leads/{lead_id}")
    assert detail_res.status_code == 200
    assert detail_res.json()["id"] == lead_id

def test_get_lead_not_found(client):
    response = client.get("/api/leads/999999")
    assert response.status_code == 404

def test_score_leads(client):
    seed_sample_leads(client)
    icp = {
        "target_industries": ["SaaS", "Healthcare"],
        "target_locations": ["TX"],
        "min_revenue": 1000000,
        "max_revenue": 20000000,
        "min_employees": 10,
        "max_employees": 200,
        "min_years": 5,
        "max_years": 25,
        "decision_maker_preferred": True,
        "website_preferred": True,
        "exclusion_keywords": []
    }
    response = client.post("/api/leads/score", json={"icp": icp})
    assert response.status_code == 200
    data = response.json()
    assert data["scored_count"] >= 3

    # Check updated scores
    leads_res = client.get("/api/leads")
    items = leads_res.json()["items"]
    assert any(lead["fit_score"] > 0 for lead in items)

def test_export_leads(client):
    seed_sample_leads(client)
    response = client.get("/api/leads/export")
    assert response.status_code == 200
    assert "text/csv" in response.headers.get("content-type", "")
    assert "Company,Industry,Location" in response.text
    assert "Alpha Saas" in response.text or "Alpha SaaS" in response.text

def test_search_leads(client):
    seed_sample_leads(client)
    response = client.get("/api/leads?search=Alpha")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("Alpha" in lead["company_name"] for lead in data["items"])

def test_filter_by_priority(client):
    seed_sample_leads(client)
    # Score first
    icp = {
        "target_industries": ["SaaS"],
        "target_locations": ["TX"],
        "min_revenue": 1000000,
        "max_revenue": 10000000,
        "min_employees": 10,
        "max_employees": 100,
        "min_years": 5,
        "max_years": 20,
        "decision_maker_preferred": True,
        "website_preferred": True,
        "exclusion_keywords": []
    }
    client.post("/api/leads/score", json={"icp": icp})
    
    response = client.get("/api/leads?priority=HIGH")
    assert response.status_code == 200
    data = response.json()
    assert all(lead["priority"] == "HIGH" for lead in data["items"])

def test_sort_by_score(client):
    seed_sample_leads(client)
    icp = {
        "target_industries": ["SaaS"],
        "target_locations": ["TX"],
        "min_revenue": 1000000,
        "max_revenue": 10000000,
        "min_employees": 10,
        "max_employees": 100,
        "min_years": 5,
        "max_years": 20,
        "decision_maker_preferred": True,
        "website_preferred": True,
        "exclusion_keywords": []
    }
    client.post("/api/leads/score", json={"icp": icp})

    response = client.get("/api/leads?sort_by=fit_score&sort_order=desc")
    assert response.status_code == 200
    items = response.json()["items"]
    if len(items) >= 2:
        assert (items[0]["fit_score"] or 0) >= (items[1]["fit_score"] or 0)

def test_pagination(client):
    seed_sample_leads(client)
    response = client.get("/api/leads?page=1&page_size=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) == 2
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["total"] >= 3

def test_invalid_csv(client):
    bad_csv = "revenue,employee_count\n5000000,20\n"
    files = {"file": ("bad.csv", io.BytesIO(bad_csv.encode("utf-8")), "text/csv")}
    response = client.post("/api/leads/import", files=files)
    assert response.status_code == 200
    data = response.json()
    assert data["invalid_rows"] == 1
    assert data["rows_imported"] == 0

def test_load_demo(client):
    response = client.post("/api/leads/load-demo")
    assert response.status_code == 200
    data = response.json()
    assert data["rows_received"] == 175
    assert data["duplicates_found"] == 15
    assert data["rows_imported"] == 160

def test_import_idempotency_multi_run(client):
    # 1. Load demo dataset first time
    res1 = client.post("/api/leads/load-demo").json()
    assert res1["records_inserted"] == 160
    assert res1["duplicate_rows"] == 15
    count1 = client.get("/api/stats").json()["total_leads"]
    assert count1 == 160

    # 2. Re-import demo dataset second time
    res2 = client.post("/api/leads/load-demo").json()
    assert res2["records_inserted"] == 0
    assert res2["existing_matches"] == 160
    assert res2["duplicate_rows"] == 15
    assert "No new companies imported" in res2["message"]
    count2 = client.get("/api/stats").json()["total_leads"]
    assert count2 == 160

    # 3. Re-import demo dataset third time
    res3 = client.post("/api/leads/load-demo").json()
    assert res3["records_inserted"] == 0
    assert res3["existing_matches"] == 160
    assert res3["duplicate_rows"] == 15
    count3 = client.get("/api/stats").json()["total_leads"]
    assert count3 == 160

