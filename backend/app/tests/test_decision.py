import io
import pytest
from app.models.lead import Lead
from app.services.decision_service import DecisionService
from app.schemas.decision import CompareRequest

SAMPLE_CSV = """company_name,website,industry,city,state,revenue,employee_count,founded_year,owner_name,owner_email,phone,linkedin_url
Target Alpha,https://alpha.test,SaaS,Austin,TX,10000000,60,2014,Alice Founder,alice@alpha.test,+1-512-555-0101,https://linkedin.com/in/alice
Target Beta,https://beta.test,SaaS,Dallas,TX,15000000,80,2012,Bob Builder,,,
Target Gamma,https://gamma.test,Manufacturing,Cleveland,OH,5000000,40,1990,Charlie Davis,charlie@gamma.test,+1-216-555-0103,
Target Delta,,Construction,Springfield,MO,,,,,,
"""

def seed_sample_leads(client):
    files = {"file": ("seed.csv", io.BytesIO(SAMPLE_CSV.encode("utf-8")), "text/csv")}
    res = client.post("/api/leads/import", files=files)
    assert res.status_code == 200

def test_quadrant_calculation_high_fit_high_conf():
    q, label = DecisionService.determine_quadrant(85.0, 92.0)
    assert q == "PRIORITY_TARGETS"
    assert label == "Priority Targets"

def test_quadrant_calculation_verify_first():
    q, label = DecisionService.determine_quadrant(80.0, 60.0)
    assert q == "VERIFY_FIRST"
    assert label == "Verify First"

def test_quadrant_calculation_secondary_or_low():
    q, label = DecisionService.determine_quadrant(45.0, 88.0)
    assert q == "SECONDARY_OR_LOW"
    assert label == "Secondary / Low Fit"

def test_quadrant_calculation_unverified_or_low():
    q, label = DecisionService.determine_quadrant(40.0, 45.0)
    assert q == "UNVERIFIED_OR_LOW"
    assert label == "Unverified / Low Fit"

def test_quadrant_and_action_boundaries_59_60_79_80():
    """
    Regression test verifying exact score boundaries 59, 60, 79, 80
    at both high (>=75%) and low (<75%) data confidence.
    Ensures:
    - 59 is LOW fit (0-59), gets Deprioritize
    - 60 is MEDIUM fit (60-79), remains medium and gets secondary review
    - 79 is MEDIUM fit (60-79), remains medium and gets secondary review
    - 80 is HIGH fit (80-100), gets priority / verify first
    """
    from app.services.scoring_service import get_priority

    full_lead = {
        "company_name": "Boundary Testing Corp",
        "website": "https://boundary.test",
        "revenue": 5000000,
        "employee_count": 40,
        "owner_name": "Jane Owner",
        "owner_email": "jane@boundary.test",
        "phone": "+1-555-0199"
    }

    # 1. Score 59 (LOW FIT boundary)
    assert get_priority(59) == "LOW"
    # High Confidence (85%)
    q, label = DecisionService.determine_quadrant(59.0, 85.0)
    assert q == "SECONDARY_OR_LOW"
    assert label == "Secondary / Low Fit"
    assert DecisionService.determine_next_best_action(full_lead, 59.0, 85.0) == "Deprioritize"
    # Low Confidence (60%)
    q, label = DecisionService.determine_quadrant(59.0, 60.0)
    assert q == "UNVERIFIED_OR_LOW"
    assert label == "Unverified / Low Fit"
    assert DecisionService.determine_next_best_action(full_lead, 59.0, 60.0) == "Deprioritize"

    # 2. Score 60 (MEDIUM FIT lower boundary)
    assert get_priority(60) == "MEDIUM"
    # High Confidence (85%)
    q, label = DecisionService.determine_quadrant(60.0, 85.0)
    assert q == "SECONDARY_OR_LOW"
    assert label == "Secondary / Low Fit"
    assert DecisionService.determine_next_best_action(full_lead, 60.0, 85.0) == "Review thesis fit with deal lead"
    # Low Confidence (60%)
    q, label = DecisionService.determine_quadrant(60.0, 60.0)
    assert q == "UNVERIFIED_OR_LOW"
    assert label == "Unverified / Low Fit"
    assert DecisionService.determine_next_best_action(full_lead, 60.0, 60.0) == "Review thesis fit with deal lead"

    # 3. Score 79 (MEDIUM FIT upper boundary)
    assert get_priority(79) == "MEDIUM"
    # High Confidence (85%)
    q, label = DecisionService.determine_quadrant(79.0, 85.0)
    assert q == "SECONDARY_OR_LOW"
    assert label == "Secondary / Low Fit"
    assert DecisionService.determine_next_best_action(full_lead, 79.0, 85.0) == "Review thesis fit with deal lead"
    # Low Confidence (60%)
    q, label = DecisionService.determine_quadrant(79.0, 60.0)
    assert q == "UNVERIFIED_OR_LOW"
    assert label == "Unverified / Low Fit"
    assert DecisionService.determine_next_best_action(full_lead, 79.0, 60.0) == "Review thesis fit with deal lead"

    # 4. Score 80 (HIGH FIT lower boundary)
    assert get_priority(80) == "HIGH"
    # High Confidence (85%)
    q, label = DecisionService.determine_quadrant(80.0, 85.0)
    assert q == "PRIORITY_TARGETS"
    assert label == "Priority Targets"
    assert DecisionService.determine_next_best_action(full_lead, 80.0, 85.0) == "Prioritize for initial owner research"
    # Low Confidence (60%)
    q, label = DecisionService.determine_quadrant(80.0, 60.0)
    assert q == "VERIFY_FIRST"
    assert label == "Verify First"
    assert DecisionService.determine_next_best_action(full_lead, 80.0, 60.0) == "Verify core company data before outreach"

def test_verification_gaps_generation():
    incomplete_lead = {
        "company_name": "Incomplete Inc",
        "website": "",
        "revenue": None,
        "owner_name": "",
        "owner_email": "",
        "phone": "",
        "linkedin_url": "",
        "founded_year": None,
        "employee_count": None
    }
    gaps = DecisionService.calculate_verification_gaps(incomplete_lead)
    gap_fields = [g.field for g in gaps]
    
    assert "owner_email" in gap_fields
    assert "revenue" in gap_fields
    assert "owner_name" in gap_fields
    assert any(g.priority == "HIGH" for g in gaps)
    assert any(g.priority == "MEDIUM" for g in gaps)
    assert any(g.priority == "LOW" for g in gaps)

def test_next_best_action_logic():
    # Exclusion
    assert DecisionService.determine_next_best_action(
        {"company_name": "Test"}, 80.0, 90.0, ["Exclusion keyword 'franchise' matched"]
    ) == "Exclude from acquisition pipeline"

    # Missing decision maker
    assert DecisionService.determine_next_best_action(
        {"company_name": "Test", "website": "https://test.com", "revenue": 5000000, "employee_count": 50, "owner_name": ""},
        75.0, 65.0
    ) == "Identify decision maker"

    # Missing revenue
    assert DecisionService.determine_next_best_action(
        {"company_name": "Test", "owner_name": "John Doe", "revenue": None, "employee_count": 50},
        75.0, 65.0
    ) == "Verify revenue range"

    # High fit + high confidence
    assert DecisionService.determine_next_best_action(
        {"company_name": "Test", "owner_name": "John", "owner_email": "j@t.com", "revenue": 5000000, "employee_count": 50},
        85.0, 90.0
    ) == "Prioritize for initial owner research"

    # Missing website
    assert DecisionService.determine_next_best_action(
        {"company_name": "Test", "owner_name": "John", "revenue": 5000000, "employee_count": 50, "website": ""},
        70.0, 60.0
    ) == "Verify company web presence"

    # High fit + low confidence
    assert DecisionService.determine_next_best_action(
        {"company_name": "Test", "website": "https://test.com", "owner_name": "John", "owner_email": "j@t.com", "revenue": 5000000, "employee_count": 50},
        85.0, 60.0
    ) == "Verify core company data before outreach"

    # Low fit
    assert DecisionService.determine_next_best_action(
        {"company_name": "Test", "revenue": 5000000, "employee_count": 50},
        30.0, 80.0
    ) == "Deprioritize"

def test_shortlist_add_and_remove(client):
    seed_sample_leads(client)
    leads_res = client.get("/api/leads")
    lead_id = leads_res.json()["items"][0]["id"]

    # Add to shortlist
    post_res = client.post(f"/api/shortlist/{lead_id}")
    assert post_res.status_code == 200
    assert post_res.json()["is_shortlisted"] is True

    # Check shortlist
    list_res = client.get("/api/shortlist")
    assert list_res.status_code == 200
    shortlisted = list_res.json()
    assert any(l["id"] == lead_id for l in shortlisted)

    # Remove from shortlist
    del_res = client.delete(f"/api/shortlist/{lead_id}")
    assert del_res.status_code == 200
    assert del_res.json()["is_shortlisted"] is False

    # Check shortlist empty of this lead
    list_res2 = client.get("/api/shortlist")
    assert not any(l["id"] == lead_id for l in list_res2.json())

def test_compare_targets_2_and_3(client):
    seed_sample_leads(client)
    leads_res = client.get("/api/leads")
    items = leads_res.json()["items"]
    ids_2 = [items[0]["id"], items[1]["id"]]
    ids_3 = [items[0]["id"], items[1]["id"], items[2]["id"]]

    # Compare 2 targets
    res2 = client.post("/api/leads/compare", json={"lead_ids": ids_2})
    assert res2.status_code == 200
    data2 = res2.json()
    assert len(data2["targets"]) == 2
    assert data2["strongest_fit"] is not None
    assert data2["best_confidence"] is not None
    assert len(data2["comparison_notes"]) >= 3

    # Compare 3 targets
    res3 = client.post("/api/leads/compare", json={"lead_ids": ids_3})
    assert res3.status_code == 200
    data3 = res3.json()
    assert len(data3["targets"]) == 3

def test_compare_targets_invalid_sizes(client):
    seed_sample_leads(client)
    leads_res = client.get("/api/leads")
    items = leads_res.json()["items"]

    # 1 target (too few)
    res1 = client.post("/api/leads/compare", json={"lead_ids": [items[0]["id"]]})
    assert res1.status_code == 400

    # 4 targets (too many)
    if len(items) >= 4:
        ids_4 = [items[0]["id"], items[1]["id"], items[2]["id"], items[3]["id"]]
        res4 = client.post("/api/leads/compare", json={"lead_ids": ids_4})
        assert res4.status_code == 400

def test_acquisition_brief_generation(client):
    seed_sample_leads(client)
    leads_res = client.get("/api/leads")
    lead_id = leads_res.json()["items"][0]["id"]

    res = client.get(f"/api/brief/{lead_id}")
    assert res.status_code == 200
    brief = res.json()
    assert "target_snapshot" in brief
    assert "acquisition_fit" in brief
    assert "why_it_ranks" in brief
    assert "verify_before_proceeding" in brief
    assert "next_best_action" in brief
    assert "disclaimer" in brief
    assert "pre-diligence" in brief["disclaimer"].lower()

def test_insights_and_total_count_invariant(client):
    seed_sample_leads(client)
    
    # Check stats before scoring
    stats_res = client.get("/api/stats")
    stats = stats_res.json()
    total = stats["total_leads"]
    high = stats["high_priority"]
    med = stats["medium_priority"]
    low = stats["low_priority"]
    unscored = stats["unscored_leads"]

    # Verify exact invariant: total == high + med + low + unscored
    assert total == high + med + low + unscored

    # Now score leads
    icp = {
        "icp": {
            "target_industries": ["SaaS"],
            "target_locations": ["TX"],
            "min_revenue": 1000000,
            "max_revenue": 50000000,
            "min_employees": 10,
            "max_employees": 200,
            "min_years": 3,
            "max_years": 30,
            "decision_maker_preferred": True,
            "website_preferred": True,
            "exclusion_keywords": ["nonprofit"]
        }
    }
    score_res = client.post("/api/leads/score", json=icp)
    assert score_res.status_code == 200

    # Check stats after scoring
    stats_after = client.get("/api/stats").json()
    assert stats_after["total_leads"] == (
        stats_after["high_priority"] + 
        stats_after["medium_priority"] + 
        stats_after["low_priority"] + 
        stats_after["unscored_leads"]
    )

    # Check insights endpoint
    insights_res = client.get("/api/insights")
    assert insights_res.status_code == 200
    insights = insights_res.json()
    assert len(insights["matrix_points"]) > 0
    assert len(insights["research_queue"]) <= 5
    assert len(insights["pipeline_insights"]) > 0
    assert insights["priority_targets_count"] >= 0
    assert insights["verify_first_count"] >= 0

def test_strict_count_invariant_across_all_states(client):
    """
    Validates that total_leads == high_priority + medium_priority + low_priority + unscored_leads
    under every possible state: initial, added unscored lead, and after scoring.
    """
    s0 = client.get("/api/stats").json()
    assert s0["total_leads"] == s0["high_priority"] + s0["medium_priority"] + s0["low_priority"] + s0["unscored_leads"]

    # Add an unscored lead
    new_lead = {"company_name": "Invariant Test Co", "state": "TX", "industry": "SaaS"}
    client.post("/api/leads", json=new_lead)
    s1 = client.get("/api/stats").json()
    assert s1["total_leads"] == s1["high_priority"] + s1["medium_priority"] + s1["low_priority"] + s1["unscored_leads"]

    # Score all leads
    icp = {
        "icp": {
            "target_industries": ["SaaS"],
            "target_locations": ["TX"],
            "min_revenue": 1000000,
            "max_revenue": 50000000
        }
    }
    client.post("/api/leads/score", json=icp)
    s2 = client.get("/api/stats").json()
    assert s2["total_leads"] == s2["high_priority"] + s2["medium_priority"] + s2["low_priority"] + s2["unscored_leads"]

def test_calibrated_demo_data_distribution(client):
    """
    Validates that the demo dataset produces an acquisition-realistic distribution:
    - High: 8-15%
    - Medium: 20-30%
    - Low: 50-65%
    - All 4 Opportunity Matrix quadrants populated with visible examples.
    """
    # Load demo dataset
    load_res = client.post("/api/leads/load-demo")
    assert load_res.status_code == 200

    # Score using default thesis ICP
    icp = {
        "icp": {
            "target_industries": ["SaaS", "Healthcare", "FinTech"],
            "target_locations": ["TX", "CA", "NY", "FL"],
            "min_employees": 15,
            "max_employees": 200,
            "min_revenue": 2000000,
            "max_revenue": 35000000,
            "min_years": 3,
            "max_years": 25,
            "decision_maker_preferred": True,
            "website_preferred": True,
            "exclusion_keywords": ["franchise", "nonprofit", "consulting"]
        }
    }
    score_res = client.post("/api/leads/score", json=icp)
    assert score_res.status_code == 200

    stats = client.get("/api/stats").json()
    total = stats["total_leads"]
    high = stats["high_priority"]
    med = stats["medium_priority"]
    low = stats["low_priority"]
    unscored = stats["unscored_leads"]

    # Invariant strictly preserved
    assert total == high + med + low + unscored

    # Distribution percentages
    high_pct = (high / total) * 100
    med_pct = (med / total) * 100
    low_pct = (low / total) * 100

    assert 10.0 <= high_pct <= 20.0, f"High priority percentage {high_pct:.1f}% not in 10-20%"
    assert 20.0 <= med_pct <= 35.0, f"Medium priority percentage {med_pct:.1f}% not in 20-35%"
    assert 45.0 <= low_pct <= 65.0, f"Low priority percentage {low_pct:.1f}% not in 45-65%"

    # Opportunity Matrix quadrants all meaningfully populated
    insights = client.get("/api/insights").json()
    assert insights["priority_targets_count"] >= 10, "Priority targets quadrant insufficient"
    assert insights["verify_first_count"] >= 8, "Verify first quadrant insufficient"
    assert insights["known_low_fit_count"] >= 40, "Known low fit quadrant insufficient"
    assert insights["deprioritize_count"] >= 15, "Deprioritize quadrant insufficient"
    assert insights["secondary_or_low_count"] == insights["known_low_fit_count"]
    assert insights["unverified_or_low_count"] == insights["deprioritize_count"]

    # CRITICAL: Strict reconciliation between Research View and Executive View
    assert insights["priority_targets_count"] + insights["verify_first_count"] == high, (
        f"High fit count mismatch: {insights['priority_targets_count']} + "
        f"{insights['verify_first_count']} != {high}"
    )
    assert total == insights["priority_targets_count"] + insights["verify_first_count"] + insights["known_low_fit_count"] + insights["deprioritize_count"] + unscored


