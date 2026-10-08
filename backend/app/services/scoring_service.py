from datetime import datetime
import json
from typing import List, Dict, Any
from app.schemas.scoring import ICPConfig, ScoreResult, ScoreBreakdown
from app.models.lead import Lead

def get_priority(score: int) -> str:
    if score >= 80:
        return 'HIGH'
    if score >= 60:
        return 'MEDIUM'
    return 'LOW'

def calculate_data_quality(lead: Dict[str, Any]) -> float:
    # 11 key fields according to specification
    has_location = bool(lead.get('city') and lead.get('state'))
    single_fields = [
        'company_name', 'website', 'industry', 'employee_count',
        'revenue', 'founded_year', 'owner_name', 'owner_email',
        'phone', 'linkedin_url'
    ]
    present_count = sum(1 for f in single_fields if lead.get(f) is not None and str(lead.get(f)).strip() != '')
    if has_location:
        present_count += 1
    return round((present_count / 11.0) * 100.0, 1)

def calculate_fit_score(lead_data: Dict[str, Any], icp: ICPConfig) -> ScoreResult:
    breakdown = ScoreBreakdown()
    pos_signals: List[str] = []
    neg_signals: List[str] = []

    # 1. Exclusion Keywords check
    is_excluded = False
    if icp.exclusion_keywords:
        c_name = str(lead_data.get('company_name') or '').lower()
        c_ind = str(lead_data.get('industry') or '').lower()
        for kw in icp.exclusion_keywords:
            kw_clean = kw.strip().lower()
            if kw_clean and (kw_clean in c_name or kw_clean in c_ind):
                neg_signals.append(f"Exclusion keyword '{kw.strip()}' matched company or industry.")
                is_excluded = True

    # 2. Industry Fit (25 pts)
    ind = lead_data.get('industry')
    if not ind or str(ind).strip() == '':
        breakdown.industry = 0.0
        neg_signals.append("Industry information is missing.")
    elif not icp.target_industries or len([ti for ti in icp.target_industries if ti.strip()]) == 0:
        breakdown.industry = 25.0
        pos_signals.append(f"Industry: {ind} (all industries eligible).")
    else:
        matched = False
        ind_clean = str(ind).strip().lower()
        for ti in icp.target_industries:
            ti_clean = ti.strip().lower()
            if ti_clean and (ti_clean in ind_clean or ind_clean in ti_clean):
                breakdown.industry = 25.0
                pos_signals.append(f"Industry matches target: {ind}.")
                matched = True
                break
        if not matched:
            breakdown.industry = 0.0
            neg_signals.append(f"Industry ({ind}) does not match target profile.")

    # 3. Geography Fit (15 pts)
    state = str(lead_data.get('state') or '').strip()
    city = str(lead_data.get('city') or '').strip()
    if not state and not city:
        breakdown.geography = 0.0
        neg_signals.append("Geographic location data is missing.")
    elif not icp.target_locations or len([loc for loc in icp.target_locations if loc.strip()]) == 0:
        breakdown.geography = 15.0
        pos_signals.append(f"Location: {city}, {state} (all regions eligible).")
    else:
        matched_geo = False
        location_str = f"{city} {state}".lower()
        for loc in icp.target_locations:
            loc_clean = loc.strip().lower()
            if not loc_clean:
                continue
            if (state and loc_clean == state.lower()) or (loc_clean in location_str):
                breakdown.geography = 15.0
                pos_signals.append(f"Location matches target: {city + ', ' if city else ''}{state}.")
                matched_geo = True
                break
        if not matched_geo:
            breakdown.geography = 0.0
            neg_signals.append(f"Location ({city + ', ' if city else ''}{state}) outside target geographies.")

    # 4. Revenue Fit (15 pts)
    rev = lead_data.get('revenue')
    if rev is None or rev == '':
        breakdown.revenue = 0.0
        neg_signals.append("Revenue data is missing.")
    else:
        try:
            rev_val = float(rev)
            min_r = icp.min_revenue if icp.min_revenue is not None else 0.0
            max_r = icp.max_revenue if icp.max_revenue is not None else float('inf')
            if min_r <= rev_val <= max_r:
                breakdown.revenue = 15.0
                pos_signals.append(f"Revenue (${rev_val:,.0f}) falls within target range.")
            elif (min_r * 0.7) <= rev_val <= (max_r * 1.3):
                breakdown.revenue = 7.5
                pos_signals.append(f"Revenue (${rev_val:,.0f}) is near target range.")
            else:
                breakdown.revenue = 0.0
                neg_signals.append(f"Revenue (${rev_val:,.0f}) outside target range.")
        except (ValueError, TypeError):
            breakdown.revenue = 0.0
            neg_signals.append("Invalid revenue format.")

    # 5. Employee Count Fit (10 pts)
    emp = lead_data.get('employee_count')
    if emp is None or emp == '':
        breakdown.employees = 0.0
        neg_signals.append("Employee count is missing.")
    else:
        try:
            emp_val = int(emp)
            min_e = icp.min_employees if icp.min_employees is not None else 0
            max_e = icp.max_employees if icp.max_employees is not None else 1000000
            if min_e <= emp_val <= max_e:
                breakdown.employees = 10.0
                pos_signals.append(f"Headcount ({emp_val} employees) matches target range.")
            elif (min_e * 0.7) <= emp_val <= (max_e * 1.3):
                breakdown.employees = 5.0
                pos_signals.append(f"Headcount ({emp_val} employees) is near target range.")
            else:
                breakdown.employees = 0.0
                neg_signals.append(f"Headcount ({emp_val} employees) outside target range.")
        except (ValueError, TypeError):
            breakdown.employees = 0.0
            neg_signals.append("Invalid employee count format.")

    # 6. Business Age Fit (10 pts)
    yr = lead_data.get('founded_year')
    if yr is None or yr == '':
        breakdown.business_age = 0.0
        neg_signals.append("Founding year is missing.")
    else:
        try:
            yr_val = int(yr)
            age = datetime.now().year - yr_val
            min_y = icp.min_years if icp.min_years is not None else 0
            max_y = icp.max_years if icp.max_years is not None else 1000
            if min_y <= age <= max_y:
                breakdown.business_age = 10.0
                pos_signals.append(f"Business has operated for {age} years (target: {min_y}–{max_y} yrs).")
            elif (min_y * 0.7) <= age <= (max_y * 1.3):
                breakdown.business_age = 5.0
                pos_signals.append(f"Business age ({age} years) is near target range.")
            else:
                breakdown.business_age = 0.0
                neg_signals.append(f"Business age ({age} years) outside target range.")
        except (ValueError, TypeError):
            breakdown.business_age = 0.0
            neg_signals.append("Invalid founding year format.")

    # 7. Decision Maker (10 pts)
    owner = lead_data.get('owner_name')
    title = lead_data.get('owner_title')
    has_owner = bool(owner and str(owner).strip())
    if icp.decision_maker_preferred:
        if has_owner:
            breakdown.decision_maker = 10.0
            title_str = f" ({title})" if title else ""
            pos_signals.append(f"Decision maker identified: {owner}{title_str}.")
        else:
            breakdown.decision_maker = 0.0
            neg_signals.append("Decision maker contact information missing.")
    else:
        if has_owner:
            breakdown.decision_maker = 10.0
            pos_signals.append(f"Decision maker identified: {owner}.")
        else:
            breakdown.decision_maker = 5.0

    # 8. Data Completeness (10 pts)
    dq = calculate_data_quality(lead_data)
    breakdown.data_completeness = round((dq / 100.0) * 10.0, 1)
    if dq >= 80.0:
        pos_signals.append(f"High data completeness ({dq:.0f}%).")
    elif dq < 50.0:
        neg_signals.append(f"Low data completeness ({dq:.0f}%).")

    # Additional negative signals for missing contact details
    if not lead_data.get('owner_email'):
        neg_signals.append("Direct email missing.")
    if not lead_data.get('linkedin_url'):
        neg_signals.append("LinkedIn profile missing.")
    if not lead_data.get('phone'):
        neg_signals.append("Phone number missing.")

    # 9. Website Presence (5 pts)
    web = lead_data.get('website')
    has_web = bool(web and str(web).strip())
    if icp.website_preferred:
        if has_web:
            breakdown.website = 5.0
            pos_signals.append("Website presence verified.")
        else:
            breakdown.website = 0.0
            neg_signals.append("Company website missing.")
    else:
        if has_web:
            breakdown.website = 5.0
            pos_signals.append("Website presence verified.")
        else:
            breakdown.website = 2.5

    # Compute Total & apply exclusion penalty if present
    total = sum([
        breakdown.industry,
        breakdown.geography,
        breakdown.revenue,
        breakdown.employees,
        breakdown.business_age,
        breakdown.decision_maker,
        breakdown.data_completeness,
        breakdown.website
    ])

    if is_excluded:
        total = max(0.0, total - 40.0)

    final_score = int(max(0.0, min(100.0, round(total))))

    return ScoreResult(
        score=final_score,
        priority=get_priority(final_score),
        breakdown=breakdown,
        positive_signals=pos_signals,
        negative_signals=neg_signals
    )

def score_all_leads(leads: List[Lead], icp: ICPConfig) -> List[Dict[str, Any]]:
    results = []
    for lead in leads:
        lead_dict = {c.name: getattr(lead, c.name) for c in lead.__table__.columns}
        res = calculate_fit_score(lead_dict, icp)
        dq = calculate_data_quality(lead_dict)
        results.append({
            'lead': lead,
            'score_result': res,
            'data_quality': dq
        })
    return results
