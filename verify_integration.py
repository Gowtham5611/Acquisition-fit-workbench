import urllib.request
import json

def run_checks():
    # 1. Health check
    with urllib.request.urlopen('http://127.0.0.1:8000/api/health') as resp:
        health = json.loads(resp.read().decode())
        print(f"1. Health Check: {health['status']}")
        assert health['status'] == 'healthy'

    # 2. Insights endpoint & matrix quadrants
    with urllib.request.urlopen('http://127.0.0.1:8000/api/insights') as resp:
        insights = json.loads(resp.read().decode())
        print(f"2. Insights Check:")
        print(f"   - Total Leads: {insights['total_leads']}")
        print(f"   - Priority Targets (High Fit + High Conf): {insights['priority_targets_count']}")
        print(f"   - Verify First (High Fit + Low Conf): {insights['verify_first_count']}")
        print(f"   - Known Low Fit: {insights['known_low_fit_count']}")
        print(f"   - Deprioritize: {insights['deprioritize_count']}")
        print(f"   - Research Queue: {len(insights['research_queue'])} items")
        print(f"   - Pipeline Insights: {len(insights['pipeline_insights'])} bullets")
        assert insights['total_leads'] >= 160
        assert insights['priority_targets_count'] > 0
        assert insights['verify_first_count'] > 0
        assert len(insights['research_queue']) <= 5
        print(f"   - Strict Reconciliation Check: Priority Targets ({insights['priority_targets_count']}) + Verify First ({insights['verify_first_count']}) == High Fit ({insights['priority_targets_count'] + insights['verify_first_count']})")

    # 3. Stats endpoint & count invariant
    with urllib.request.urlopen('http://127.0.0.1:8000/api/stats') as resp:
        stats = json.loads(resp.read().decode())
        total = stats['total_leads']
        high = stats['high_priority']
        med = stats['medium_priority']
        low = stats['low_priority']
        unscored = stats['unscored_leads']
        print(f"3. Stats Check:")
        print(f"   - Total: {total}, High: {high}, Med: {med}, Low: {low}, Unscored: {unscored}")
        assert total == high + med + low + unscored, f"Invariant violated: {total} != {high + med + low + unscored}"
        print(f"   - Count invariant STRICTLY VERIFIED: total == high + med + low + unscored")
        assert insights['priority_targets_count'] + insights['verify_first_count'] == high, f"Reconciliation violated: {insights['priority_targets_count']} + {insights['verify_first_count']} != {high}"
        print(f"   - High Fit Reconciliation STRICTLY VERIFIED: priority_targets ({insights['priority_targets_count']}) + verify_first ({insights['verify_first_count']}) == high_fit ({high})")

    # 4. Shortlist endpoints
    with urllib.request.urlopen('http://127.0.0.1:8000/api/shortlist') as resp:
        shortlist = json.loads(resp.read().decode())
        print(f"4. Shortlist Check: Currently {len(shortlist)} shortlisted leads")
        assert len(shortlist) >= 1

    # 5. Compare targets (2 targets)
    lead_ids = [shortlist[0]['id']]
    # fetch another lead for comparison
    with urllib.request.urlopen('http://127.0.0.1:8000/api/leads?limit=2') as resp:
        leads = json.loads(resp.read().decode())['items']
        for l in leads:
            if l['id'] not in lead_ids:
                lead_ids.append(l['id'])
            if len(lead_ids) == 2:
                break
    
    comp_req = urllib.request.Request(
        'http://127.0.0.1:8000/api/leads/compare',
        data=json.dumps({'lead_ids': lead_ids}).encode(),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(comp_req) as resp:
        comp_res = json.loads(resp.read().decode())
        print(f"5. Target Comparison Check:")
        print(f"   - Comparing: {[t['company_name'] for t in comp_res['targets']]}")
        print(f"   - Strongest Fit: {comp_res['strongest_fit']}")
        print(f"   - Best Confidence: {comp_res['best_confidence']}")
        print(f"   - Notes: {comp_res['comparison_notes']}")
        assert len(comp_res['targets']) == 2
        assert comp_res['strongest_fit'] is not None

    # 6. Acquisition Brief
    target_id = lead_ids[0]
    with urllib.request.urlopen(f'http://127.0.0.1:8000/api/brief/{target_id}') as resp:
        brief = json.loads(resp.read().decode())
        print(f"6. Acquisition Brief Check:")
        print(f"   - Target: {brief['company_name']}")
        print(f"   - Next Action: {brief['next_best_action']}")
        print(f"   - Disclaimer: {brief['disclaimer']}")
        assert 'pre-diligence' in brief['disclaimer'].lower()
        assert 'target_snapshot' in brief

    # 7. Decision Summary
    with urllib.request.urlopen(f'http://127.0.0.1:8000/api/leads/{target_id}/decision-summary') as resp:
        summary = json.loads(resp.read().decode())
        print(f"7. Decision Summary Check:")
        print(f"   - Why This Target: {summary['why_this_target']}")
        print(f"   - Next Action: {summary['next_best_action']}")
        print(f"   - Verification Gaps: {len(summary['verification_gaps'])} gaps")
        assert len(summary['why_this_target']) > 10

    # 8. Export filtered leads
    with urllib.request.urlopen('http://127.0.0.1:8000/api/leads/export?priority=HIGH') as resp:
        csv_data = resp.read().decode('utf-8')
        lines = [l for l in csv_data.strip().split('\n') if l.strip()]
        header = lines[0]
        rows = lines[1:]
        print(f"8. Filtered CSV Export Check: {len(rows)} HIGH priority rows exported (header cols: {len(header.split(','))})")
        assert len(rows) == high

    # 9. Frontend Dev Server Check
    with urllib.request.urlopen('http://127.0.0.1:5173') as resp:
        html = resp.read().decode()
        print(f"9. Frontend Server Check: HTTP 200 OK, index.html loaded ({len(html)} bytes)")
        assert 'Acquisition Fit Workbench' in html

    print("\n=======================================================")
    print("ALL 9 LIVE SYSTEM INTEGRATION CHECKS PASSED PERFECTLY!")
    print("=======================================================")

if __name__ == '__main__':
    run_checks()
