from app.services.scoring_service import calculate_data_quality

def test_full_quality():
    lead = {
        'company_name': 'A', 'website': 'B', 'industry': 'C', 'city': 'D', 'state': 'E',
        'employee_count': 1, 'revenue': 1, 'founded_year': 1, 'owner_name': 'F',
        'owner_email': 'G', 'phone': 'H', 'linkedin_url': 'I'
    }
    assert calculate_data_quality(lead) == 100.0

def test_empty_quality():
    assert calculate_data_quality({}) == 0.0

def test_partial_quality():
    assert calculate_data_quality({'company_name': 'A'}) > 0.0
