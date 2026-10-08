import pytest
from app.services.scoring_service import calculate_fit_score, calculate_data_quality, get_priority
from app.schemas.scoring import ICPConfig
from datetime import datetime

def make_sample_lead(**kwargs):
    current_year = datetime.now().year
    base = {
        'company_name': 'Acme Corp',
        'website': 'https://www.acme.test',
        'domain': 'acme.test',
        'industry': 'SaaS',
        'city': 'Austin',
        'state': 'TX',
        'country': 'USA',
        'employee_count': 50,
        'revenue': 5000000.0,
        'founded_year': current_year - 10,
        'owner_name': 'Jane Doe',
        'owner_title': 'Founder & CEO',
        'owner_email': 'jane@acme.test',
        'phone': '(555) 123-4567',
        'linkedin_url': 'linkedin.com/in/janedoe'
    }
    base.update(kwargs)
    return base

def make_default_icp(**kwargs):
    base = {
        'target_industries': ['SaaS', 'Healthcare'],
        'target_locations': ['TX', 'CA'],
        'min_employees': 10,
        'max_employees': 250,
        'min_revenue': 1000000.0,
        'max_revenue': 20000000.0,
        'min_years': 5,
        'max_years': 25,
        'decision_maker_preferred': True,
        'website_preferred': True,
        'exclusion_keywords': ['franchise', 'nonprofit']
    }
    base.update(kwargs)
    return ICPConfig(**base)

def test_perfect_score():
    lead = make_sample_lead()
    icp = make_default_icp()
    res = calculate_fit_score(lead, icp)
    assert res.score == 100
    assert res.priority == 'HIGH'
    assert res.breakdown.industry == 25.0
    assert res.breakdown.geography == 15.0
    assert res.breakdown.revenue == 15.0
    assert res.breakdown.employees == 10.0
    assert res.breakdown.business_age == 10.0
    assert res.breakdown.decision_maker == 10.0
    assert res.breakdown.website == 5.0

def test_zero_score():
    lead = {
        'company_name': '',
        'website': None,
        'industry': None,
        'state': None,
        'revenue': None,
        'employee_count': None,
        'founded_year': None,
        'owner_name': None
    }
    icp = make_default_icp()
    res = calculate_fit_score(lead, icp)
    assert res.score == 0
    assert res.priority == 'LOW'

def test_industry_match():
    lead = make_sample_lead(industry='SaaS')
    icp = make_default_icp(target_industries=['SaaS'])
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.industry == 25.0
    assert any("matches target" in s for s in res.positive_signals)

def test_industry_no_match():
    lead = make_sample_lead(industry='Construction')
    icp = make_default_icp(target_industries=['SaaS'])
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.industry == 0.0
    assert any("does not match target profile" in s for s in res.negative_signals)

def test_industry_missing():
    lead = make_sample_lead(industry=None)
    icp = make_default_icp()
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.industry == 0.0
    assert any("Industry information is missing" in s for s in res.negative_signals)

def test_geography_match():
    lead = make_sample_lead(state='TX')
    icp = make_default_icp(target_locations=['TX', 'CA'])
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.geography == 15.0
    assert any("Location matches target" in s for s in res.positive_signals)

def test_geography_partial():
    lead = make_sample_lead(state='NY', city='New York')
    icp = make_default_icp(target_locations=['TX', 'CA'])
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.geography == 0.0
    assert any("outside target geographies" in s for s in res.negative_signals)

def test_revenue_in_range():
    lead = make_sample_lead(revenue=5000000.0)
    icp = make_default_icp(min_revenue=1000000.0, max_revenue=10000000.0)
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.revenue == 15.0

def test_revenue_out_of_range():
    lead = make_sample_lead(revenue=100000.0)
    icp = make_default_icp(min_revenue=2000000.0, max_revenue=10000000.0)
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.revenue == 0.0

def test_revenue_partial():
    # 1.5M is within 70% of 2M min_revenue (1.4M to 2M)
    lead = make_sample_lead(revenue=1600000.0)
    icp = make_default_icp(min_revenue=2000000.0, max_revenue=10000000.0)
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.revenue == 7.5

def test_employees_in_range():
    lead = make_sample_lead(employee_count=75)
    icp = make_default_icp(min_employees=20, max_employees=100)
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.employees == 10.0

def test_employees_out_of_range():
    lead = make_sample_lead(employee_count=500)
    icp = make_default_icp(min_employees=20, max_employees=100)
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.employees == 0.0

def test_business_age_in_range():
    curr_yr = datetime.now().year
    lead = make_sample_lead(founded_year=curr_yr - 12)
    icp = make_default_icp(min_years=5, max_years=20)
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.business_age == 10.0

def test_business_age_out_of_range():
    curr_yr = datetime.now().year
    lead = make_sample_lead(founded_year=curr_yr - 50)
    icp = make_default_icp(min_years=5, max_years=15)
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.business_age == 0.0

def test_decision_maker_present():
    lead = make_sample_lead(owner_name='Alice Smith')
    icp = make_default_icp(decision_maker_preferred=True)
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.decision_maker == 10.0

def test_decision_maker_missing():
    lead = make_sample_lead(owner_name=None)
    icp = make_default_icp(decision_maker_preferred=True)
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.decision_maker == 0.0

def test_data_completeness_full():
    lead = make_sample_lead()
    dq = calculate_data_quality(lead)
    assert dq == 100.0

def test_data_completeness_partial():
    lead = {'company_name': 'Test Corp'}
    dq = calculate_data_quality(lead)
    assert 0.0 < dq < 50.0

def test_website_present():
    lead = make_sample_lead(website='https://test.com')
    icp = make_default_icp(website_preferred=True)
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.website == 5.0

def test_website_missing():
    lead = make_sample_lead(website=None)
    icp = make_default_icp(website_preferred=True)
    res = calculate_fit_score(lead, icp)
    assert res.breakdown.website == 0.0

def test_priority_high():
    assert get_priority(80) == 'HIGH'
    assert get_priority(95) == 'HIGH'
    assert get_priority(100) == 'HIGH'

def test_priority_medium():
    assert get_priority(60) == 'MEDIUM'
    assert get_priority(75) == 'MEDIUM'
    assert get_priority(79) == 'MEDIUM'

def test_priority_low():
    assert get_priority(0) == 'LOW'
    assert get_priority(45) == 'LOW'
    assert get_priority(59) == 'LOW'

def test_score_clamped():
    lead = make_sample_lead()
    icp = make_default_icp()
    res = calculate_fit_score(lead, icp)
    assert 0 <= res.score <= 100

def test_positive_signals_generated():
    lead = make_sample_lead()
    icp = make_default_icp()
    res = calculate_fit_score(lead, icp)
    assert len(res.positive_signals) > 0

def test_negative_signals_generated():
    lead = make_sample_lead(website=None, owner_email=None, linkedin_url=None)
    icp = make_default_icp()
    res = calculate_fit_score(lead, icp)
    assert len(res.negative_signals) > 0
