from app.services.normalization_service import *

def test_normalize_website_with_protocol():
    assert normalize_website("https://example.com") == "example.com"

def test_normalize_website_with_www():
    assert normalize_website("www.example.com") == "example.com"

def test_normalize_website_trailing_slash():
    assert normalize_website("example.com/") == "example.com"

def test_extract_domain():
    assert extract_domain("https://www.example.com/path") == "example.com"

def test_normalize_company_name():
    assert normalize_company_name("  Test   Company  ") == "Test Company"

def test_normalize_email():
    assert normalize_email(" TEST@Example.com ") == "test@example.com"

def test_normalize_linkedin():
    assert normalize_linkedin("https://www.linkedin.com/in/user") == "linkedin.com/in/user"
