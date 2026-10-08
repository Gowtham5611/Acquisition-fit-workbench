from typing import List, Tuple, Dict, Any

def find_duplicates(leads: List[dict], existing_leads: List[dict]) -> Tuple[List[dict], List[dict], int]:
    unique_leads = []
    merged_existing_leads = []
    duplicate_count = 0
    
    domain_map: Dict[str, Tuple[str, dict]] = {}
    name_state_map: Dict[str, Tuple[str, dict]] = {}
    
    # 1. Index existing leads from database
    for e in existing_leads:
        lead_dict = dict(e)
        dom = str(lead_dict.get('domain') or '').strip().lower()
        if dom:
            domain_map[dom] = ('existing', lead_dict)
            
        cname = str(lead_dict.get('company_name') or '').strip().lower()
        cstate = str(lead_dict.get('state') or '').strip().lower()
        if cname:
            ns = f"{cname}_{cstate}"
            name_state_map[ns] = ('existing', lead_dict)

    # 2. Process incoming leads
    for new_lead in leads:
        lead_copy = dict(new_lead)
        dom = str(lead_copy.get('domain') or '').strip().lower()
        cname = str(lead_copy.get('company_name') or '').strip().lower()
        cstate = str(lead_copy.get('state') or '').strip().lower()
        ns = f"{cname}_{cstate}" if cname else ""
        
        match_info = None
        if dom and dom in domain_map:
            match_info = domain_map[dom]
        elif ns and ns in name_state_map:
            match_info = name_state_map[ns]
            
        if match_info is not None:
            duplicate_count += 1
            source_type, target_record = match_info
            merged = merge_leads(target_record, lead_copy)
            target_record.clear()
            target_record.update(merged)
            
            if source_type == 'existing' and target_record not in merged_existing_leads:
                merged_existing_leads.append(target_record)
        else:
            unique_leads.append(lead_copy)
            if dom:
                domain_map[dom] = ('batch', lead_copy)
            if ns:
                name_state_map[ns] = ('batch', lead_copy)
                
    return unique_leads, merged_existing_leads, duplicate_count

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
