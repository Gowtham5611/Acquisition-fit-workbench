import urllib.request
import json

def run_checks():
    # 1. Export check
    export_url = 'http://127.0.0.1:8000/api/leads/export?priority=HIGH'
    with urllib.request.urlopen(export_url) as resp:
        text = resp.read().decode('utf-8')
        lines = [l for l in text.strip().split('\n') if l.strip()]
        header = lines[0]
        data_rows = lines[1:]
        print(f"EXPORT HIGH COUNT: {len(data_rows)} rows (matches 6 high-priority leads in DB)")
        assert len(data_rows) == 6

    # 2. Import check with duplicates and invalid row
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    csv_content = """company_name,website,industry,city,state,country,revenue,employee_count,founded_year,owner_name,owner_title,owner_email,phone,linkedin_url
New Acme Corp,https://newacme.com,SaaS,Austin,TX,USA,5000000,50,2015,Jane Doe,CEO,jane@newacme.com,+1-512-555-0100,https://linkedin.com/company/newacme
Alpha Partners,https://alphapartners.com,Fintech,Franklin,MO,USA,38829479,114,2014,Jennifer Johnson,CEO,jennifer@alphapartners.com,,
Invalid Row No Name,,SaaS,Austin,TX,USA,notanumber,-5,notayear,,,,
"""
    body = (
        f'--{boundary}\r\n'
        f'Content-Disposition: form-data; name="file"; filename="test_import.csv"\r\n'
        f'Content-Type: text/csv\r\n\r\n'
        f'{csv_content}\r\n'
        f'--{boundary}--\r\n'
    ).encode('utf-8')

    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/leads/import',
        data=body,
        headers={'Content-Type': f'multipart/form-data; boundary={boundary}'}
    )
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
        print("IMPORT RESULT:", json.dumps(res, indent=2))
        assert res['rows_received'] == 3
        assert res['duplicates_found'] == 1, f"Expected 1 duplicate, got {res['duplicates_found']}"
        assert res['invalid_rows'] == 1, f"Expected 1 invalid row, got {res['invalid_rows']}"
        assert res['rows_imported'] == 1, f"Expected 1 newly imported, got {res['rows_imported']}"

    print("ALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    run_checks()
