from app.services.validation_service import *

def test_valid_email():
    assert validate_email("test@example.com") == True

def test_invalid_email():
    assert validate_email("test@") == False

def test_valid_url():
    assert validate_url("https://example.com") == True

def test_invalid_url():
    assert validate_url("not a url") == False

def test_valid_lead():
    is_valid, errors = validate_lead({"company_name": "Test"})
    assert is_valid == True

def test_invalid_lead_no_name():
    is_valid, errors = validate_lead({})
    assert is_valid == False
    assert "company_name is required" in errors[0]

def test_invalid_lead_bad_email():
    is_valid, errors = validate_lead({"company_name": "Test", "owner_email": "bad"})
    assert is_valid == False

def test_negative_employees():
    is_valid, errors = validate_lead({"company_name": "Test", "employee_count": -1})
    assert is_valid == False

def test_negative_revenue():
    is_valid, errors = validate_lead({"company_name": "Test", "revenue": -1})
    assert is_valid == False
