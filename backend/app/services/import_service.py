import csv
import io
import re
from datetime import datetime
from sqlalchemy.orm import Session
from app.schemas.import_export import ImportResult
from app.models.lead import Lead
from app.services.normalization_service import normalize_lead
from app.services.validation_service import validate_lead
from app.services.deduplication_service import find_duplicates
from app.services.scoring_service import calculate_data_quality
from app.repositories.lead_repository import LeadRepository

repo = LeadRepository()

ALIAS_MAP = {
    'company': 'company_name',
    'company name': 'company_name',
    'company_name': 'company_name',
    'name': 'company_name',
    'business_name': 'company_name',
    'business name': 'company_name',
    'employees': 'employee_count',
    'employee count': 'employee_count',
    'employee_count': 'employee_count',
    'num_employees': 'employee_count',
    'headcount': 'employee_count',
    'url': 'website',
    'site': 'website',
    'web': 'website',
    'website': 'website',
    'sector': 'industry',
    'vertical': 'industry',
    'industry': 'industry',
    'region': 'state',
    'province': 'state',
    'state': 'state',
    'city': 'city',
    'country': 'country',
    'annual_revenue': 'revenue',
    'yearly_revenue': 'revenue',
    'revenue': 'revenue',
    'founded': 'founded_year',
    'year_founded': 'founded_year',
    'year founded': 'founded_year',
    'founded_year': 'founded_year',
    'founded year': 'founded_year',
    'established': 'founded_year',
    'owner': 'owner_name',
    'owner name': 'owner_name',
    'owner_name': 'owner_name',
    'contact_name': 'owner_name',
    'contact name': 'owner_name',
    'contact': 'owner_name',
    'decision maker': 'owner_name',
    'decision_maker': 'owner_name',
    'title': 'owner_title',
    'owner title': 'owner_title',
    'owner_title': 'owner_title',
    'contact_title': 'owner_title',
    'email': 'owner_email',
    'owner email': 'owner_email',
    'owner_email': 'owner_email',
    'contact_email': 'owner_email',
    'phone_number': 'phone',
    'phone': 'phone',
    'telephone': 'phone',
    'linkedin': 'linkedin_url',
    'linkedin url': 'linkedin_url',
    'linkedin_url': 'linkedin_url',
    'linkedin_profile': 'linkedin_url',
    'lead_source': 'source',
    'data_source': 'source',
    'source': 'source',
    'source_link': 'source_url',
    'source_url': 'source_url',
    'location': 'location',
    'business age': 'business_age',
    'business_age': 'business_age',
    'years in business': 'business_age',
    'fit score': 'fit_score',
    'fit_score': 'fit_score',
    'priority': 'priority',
    'data quality': 'data_quality_score',
    'data_quality': 'data_quality_score',
    'score reasons': 'score_reasons',
    'score_reasons': 'score_reasons'
}

def map_headers(header: str) -> str:
    h = header.strip().lstrip('\ufeff').lower()
    return ALIAS_MAP.get(h, h)

def import_csv(db: Session, file_content: str, filename: str) -> ImportResult:
    if not file_content or not file_content.strip():
        return ImportResult(
            rows_received=0,
            valid_rows=0,
            invalid_rows=0,
            new_records=0,
            existing_matches=0,
            duplicate_rows=0,
            records_inserted=0,
            records_updated=0,
            records_unchanged=0,
            duplicates_found=0,
            rows_imported=0,
            message="Uploaded CSV file contained no records.",
            errors=["File contains no data rows"]
        )

    reader = csv.DictReader(io.StringIO(file_content))
    if not reader.fieldnames or not any(str(f).strip() for f in reader.fieldnames if f):
        return ImportResult(
            rows_received=0,
            valid_rows=0,
            invalid_rows=0,
            new_records=0,
            existing_matches=0,
            duplicate_rows=0,
            records_inserted=0,
            records_updated=0,
            records_unchanged=0,
            duplicates_found=0,
            rows_imported=0,
            message="Uploaded CSV file has no headers.",
            errors=["Missing CSV column headers"]
        )

    rows_received = 0
    valid_rows = 0
    invalid_rows = 0
    errors = []
    
    parsed_leads = []
    for i, row in enumerate(reader):
        rows_received += 1
        mapped_row = {map_headers(k): v.strip() if isinstance(v, str) else v for k, v in row.items() if k}
        
        # Parse combined Location if available (e.g. "Albany, NY")
        if mapped_row.get('location') and not (mapped_row.get('city') and mapped_row.get('state')):
            loc = str(mapped_row['location']).strip()
            if ',' in loc:
                parts = [p.strip() for p in loc.split(',', 1)]
                if not mapped_row.get('city') and parts[0]:
                    mapped_row['city'] = parts[0]
                if not mapped_row.get('state') and parts[1]:
                    mapped_row['state'] = parts[1]
            elif not mapped_row.get('state') and len(loc) == 2:
                mapped_row['state'] = loc.upper()
            elif not mapped_row.get('city'):
                mapped_row['city'] = loc

        # Parse business age if available (e.g. "12 yrs")
        if mapped_row.get('business_age') and not mapped_row.get('founded_year'):
            m = re.search(r'\d+', str(mapped_row['business_age']))
            if m:
                mapped_row['founded_year'] = datetime.now().year - int(m.group(0))

        # Type conversions
        if mapped_row.get('employee_count'):
            try:
                mapped_row['employee_count'] = int(str(mapped_row['employee_count']).replace(',', ''))
            except Exception:
                mapped_row['employee_count'] = None
            
        if mapped_row.get('revenue'):
            try:
                mapped_row['revenue'] = float(str(mapped_row['revenue']).replace('$', '').replace(',', ''))
            except Exception:
                mapped_row['revenue'] = None
            
        if mapped_row.get('founded_year'):
            try:
                mapped_row['founded_year'] = int(str(mapped_row['founded_year']).strip())
            except Exception:
                mapped_row['founded_year'] = None

        if mapped_row.get('data_quality_score'):
            try:
                dq_str = str(mapped_row['data_quality_score']).replace('%', '').strip()
                mapped_row['data_quality_score'] = float(dq_str)
            except Exception:
                mapped_row['data_quality_score'] = None

        if mapped_row.get('fit_score'):
            try:
                mapped_row['fit_score'] = float(str(mapped_row['fit_score']).strip())
            except Exception:
                mapped_row['fit_score'] = None

        if not mapped_row.get('source'):
            mapped_row['source'] = filename
        
        # Remove intermediate parsing-only fields
        mapped_row.pop('location', None)
        mapped_row.pop('business_age', None)

        normalized = normalize_lead(mapped_row)
        is_valid, row_errors = validate_lead(normalized)
        
        if is_valid:
            valid_rows += 1
            if normalized.get('data_quality_score') is None:
                normalized['data_quality_score'] = calculate_data_quality(normalized)
            
            # Ensure only valid Lead model columns are preserved
            writable_cols = {c.name for c in Lead.__table__.columns} - {'id', 'created_at', 'updated_at'}
            clean_lead = {k: v for k, v in normalized.items() if k in writable_cols}
            parsed_leads.append(clean_lead)
        else:
            invalid_rows += 1
            errors.append(f"Row {i+2}: {', '.join(row_errors)}")

    existing_leads = [
        {c.name: getattr(l, c.name) for c in l.__table__.columns}
        for l in repo.get_all(db, 0, 1000000)[0]
    ]
    
    unique_leads, merged_leads, duplicate_count, audit = find_duplicates(parsed_leads, existing_leads)
    
    # Import unique leads
    if unique_leads:
        repo.bulk_create(db, unique_leads)
        
    # Update merged existing leads
    for m in merged_leads:
        if m.get('id'):
            # recalculate quality score for merged record
            m['data_quality_score'] = calculate_data_quality(m)
            repo.update(db, m['id'], m)

    # Formulate truthful audit message based on actual database operations
    if rows_received == 0:
        msg = "Uploaded CSV file contained no records."
    elif valid_rows == 0:
        msg = f"No valid company records found in {rows_received} rows. Please ensure the CSV contains a valid company name column."
    elif audit['records_inserted'] > 0:
        if audit['duplicate_rows'] > 0:
            msg = f"{audit['records_inserted']} new companies successfully imported ({audit['duplicate_rows']} duplicate rows consolidated)."
        else:
            msg = f"{audit['records_inserted']} new companies successfully imported."
    elif audit['records_updated'] > 0:
        msg = f"No new companies imported. {audit['records_updated']} existing database records were enriched with new data."
    else:
        msg = "No new companies imported. Uploaded records matched existing database records."

    return ImportResult(
        rows_received=rows_received,
        valid_rows=valid_rows,
        invalid_rows=invalid_rows,
        new_records=audit['records_inserted'],
        existing_matches=audit['existing_matches'],
        duplicate_rows=audit['duplicate_rows'],
        records_inserted=audit['records_inserted'],
        records_updated=audit['records_updated'],
        records_unchanged=audit['records_unchanged'],
        duplicates_found=duplicate_count,
        rows_imported=audit['records_inserted'],
        message=msg,
        errors=errors[:10]
    )

def load_demo_data(db: Session, csv_path: str) -> ImportResult:
    with open(csv_path, 'r', encoding='utf-8') as f:
        return import_csv(db, f.read(), 'Demo Dataset')
