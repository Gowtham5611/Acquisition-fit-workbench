from typing import List, Tuple, Dict, Any

def find_duplicates(leads: List[dict], existing_leads: List[dict]) -> Tuple[List[dict], List[dict], int, Dict[str, int]]:
    """
    Categorizes incoming leads into:
    - unique_leads: completely new companies to be inserted into database
    - merged_existing_leads: database records enriched with new fields from this upload
    - duplicate_count: total consolidated rows (duplicate_rows + existing_matches)
    - audit_stats: granular counts distinguishing internal duplicate rows from existing DB matches
    """
    unique_leads: List[dict] = []
    merged_existing_leads: List[dict] = []
    
    domain_map: Dict[str, dict] = {}
    name_state_map: Dict[str, dict] = {}
    
    # 1. Index existing leads from database
    for e in existing_leads:
        lead_dict = dict(e)
        dom = str(lead_dict.get('domain') or '').strip().lower()
        if dom:
            domain_map[dom] = lead_dict
            
        cname = str(lead_dict.get('company_name') or '').strip().lower()
        cstate = str(lead_dict.get('state') or '').strip().lower()
        if cname:
            name_state_map[f"{cname}_{cstate}"] = lead_dict

    seen_in_batch: Dict[str, dict] = {}
    existing_matches = 0
    duplicate_rows = 0
    records_updated = 0

    # 2. Process incoming leads
    for new_lead in leads:
        lead_copy = dict(new_lead)
        dom = str(lead_copy.get('domain') or '').strip().lower()
        cname = str(lead_copy.get('company_name') or '').strip().lower()
        cstate = str(lead_copy.get('state') or '').strip().lower()
        ns = f"{cname}_{cstate}" if cname else ""
        
        # Primary identity key
        batch_key = dom if dom else ns

        if batch_key and batch_key in seen_in_batch:
            # Internal duplicate row within the uploaded batch itself
            duplicate_rows += 1
            target = seen_in_batch[batch_key]
            merged = merge_leads(target, lead_copy)
            target.clear()
            target.update(merged)
        else:
            # Check for existing match in database
            match_db = None
            if dom and dom in domain_map:
                match_db = domain_map[dom]
            elif ns and ns in name_state_map:
                match_db = name_state_map[ns]

            if match_db is not None:
                existing_matches += 1
                seen_in_batch[batch_key] = match_db
                before = dict(match_db)
                merged = merge_leads(match_db, lead_copy)
                match_db.clear()
                match_db.update(merged)
                was_enriched = any(
                    (before.get(k) is None or str(before.get(k)).strip() == '') and
                    (merged.get(k) is not None and str(merged.get(k)).strip() != '')
                    for k in merged
                )
                if was_enriched and match_db not in merged_existing_leads:
                    merged_existing_leads.append(match_db)
                    records_updated += 1
            else:
                # Genuinely new unique company
                seen_in_batch[batch_key] = lead_copy
                unique_leads.append(lead_copy)

    total_duplicates = duplicate_rows + existing_matches
    audit_stats = {
        'records_inserted': len(unique_leads),
        'existing_matches': existing_matches,
        'duplicate_rows': duplicate_rows,
        'records_updated': records_updated,
        'records_unchanged': existing_matches - records_updated
    }
    
    return unique_leads, merged_existing_leads, total_duplicates, audit_stats

def merge_leads(existing: dict, new: dict) -> dict:
    merged = dict(existing)
    for k, v in new.items():
        if v is not None and str(v).strip() != "":
            if merged.get(k) is None or str(merged.get(k)).strip() == "":
                merged[k] = v
                
    # Preserve source information where applicable
    if new.get('source') and merged.get('source') and new['source'] not in merged['source']:
        merged['source'] = f"{merged['source']}, {new['source']}"
    elif new.get('source') and not merged.get('source'):
        merged['source'] = new['source']

    return merged
