from app.services.deduplication_service import find_duplicates, merge_leads

def test_no_duplicates():
    unique, merged, count = find_duplicates([{'company_name': 'A'}], [])
    assert count == 0
    assert len(unique) == 1

def test_domain_duplicate():
    unique, merged, count = find_duplicates([{'domain': 'test.com', 'company_name': 'New'}], [{'domain': 'test.com', 'company_name': 'Old'}])
    assert count == 1
    assert len(unique) == 0

def test_name_state_duplicate():
    unique, merged, count = find_duplicates([{'company_name': 'A', 'state': 'CA'}], [{'company_name': 'A', 'state': 'CA'}])
    assert count == 1

def test_merge_prefers_complete():
    merged = merge_leads({'company_name': 'A', 'website': ''}, {'company_name': 'A', 'website': 'test.com'})
    assert merged['website'] == 'test.com'

def test_duplicate_count():
    unique, merged, count = find_duplicates([{'company_name': 'A', 'state': 'CA'}], [{'company_name': 'A', 'state': 'CA'}])
    assert count == 1
