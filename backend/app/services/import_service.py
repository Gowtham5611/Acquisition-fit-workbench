import csv
import io
from sqlalchemy.orm import Session
from app.schemas.import_export import ImportResult
from app.services.normalization_service import normalize_lead
from app.services.validation_service import validate_lead
from app.services.deduplication_service import find_duplicates
from app.services.scoring_service import calculate_data_quality
from app.repositories.lead_repository import LeadRepository

repo = LeadRepository()

ALIAS_MAP = {
    'company': 'company_name',
    'name': 'company_name',
    'business_name': 'company_name',
    'employees': 'employee_count',
    'num_employees': 'employee_count',
    'headcount': 'employee_count',
    'url': 'website',
    'site': 'website',
    'web': 'website',
    'sector': 'industry',
    'vertical': 'industry',
    'region': 'state',
    'province': 'state',
    'annual_revenue': 'revenue',
    'yearly_revenue': 'revenue',
    'founded': 'founded_year',
    'year_founded': 'founded_year',
    'established': 'founded_year',
    'owner': 'owner_name',
    'contact_name': 'owner_name',
    'contact': 'owner_name',
    'title': 'owner_title',
    'contact_title': 'owner_title',
    'email': 'owner_email',
    'contact_email': 'owner_email',
    'phone_number': 'phone',
    'telephone': 'phone',
    'linkedin': 'linkedin_url',
    'linkedin_profile': 'linkedin_url',
    'lead_source': 'source',
    'data_source': 'source',
    'source_link': 'source_url'
}

def map_headers(header: str) -> str:
    h = header.strip().lower()
    return ALIAS_MAP.get(h, h)

def import_csv(db: Session, file_content: str, filename: str) -> ImportResult:
    reader = csv.DictReader(io.StringIO(file_content))
    rows_received = 0
    valid_rows = 0
    invalid_rows = 0
    errors = []
    
    parsed_leads = []
    for i, row in enumerate(reader):
        rows_received += 1
        mapped_row = {map_headers(k): v.strip() if isinstance(v, str) else v for k, v in row.items() if k}
        
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

        if not mapped_row.get('source'):
            mapped_row['source'] = filename
        
        normalized = normalize_lead(mapped_row)
        is_valid, row_errors = validate_lead(normalized)
        
        if is_valid:
            valid_rows += 1
            normalized['data_quality_score'] = calculate_data_quality(normalized)
            parsed_leads.append(normalized)
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
    if audit['records_inserted'] > 0:
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
