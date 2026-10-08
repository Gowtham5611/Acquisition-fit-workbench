import re
from typing import Tuple, List

def validate_email(email: str) -> bool:
    if not email or str(email).strip() == '':
        return True
    return bool(re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', str(email).strip()))

def validate_url(url: str) -> bool:
    if not url or str(url).strip() == '':
        return True
    return bool(re.match(r'^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/.*)?$', str(url).strip()))

def validate_phone(phone: str) -> bool:
    if not phone or str(phone).strip() == '':
        return True
    digits = re.sub(r'\D', '', str(phone))
    return len(digits) >= 7

def validate_lead(lead_dict: dict) -> Tuple[bool, List[str]]:
    errors = []
    
    company_name = lead_dict.get('company_name')
    if not company_name or str(company_name).strip() == '':
        errors.append("company_name is required")
        
    email = lead_dict.get('owner_email')
    if email and str(email).strip() != '' and not validate_email(email):
        errors.append("invalid owner_email format")
        
    website = lead_dict.get('website')
    if website and str(website).strip() != '' and not validate_url(website):
        errors.append("invalid website format")
        
    emp = lead_dict.get('employee_count')
    if emp is not None and str(emp).strip() != '':
        try:
            val = int(str(emp).replace(',', ''))
            if val < 0:
                errors.append("employee_count must be >= 0")
        except (ValueError, TypeError):
            errors.append("employee_count must be a valid integer >= 0")
        
    rev = lead_dict.get('revenue')
    if rev is not None and str(rev).strip() != '':
        try:
            val = float(str(rev).replace('$', '').replace(',', ''))
            if val < 0:
                errors.append("revenue must be >= 0")
        except (ValueError, TypeError):
            errors.append("revenue must be a valid number >= 0")
        
    yr = lead_dict.get('founded_year')
    if yr is not None and str(yr).strip() != '':
        try:
            val = int(str(yr).strip())
            if val < 1800 or val > 2100:
                errors.append("founded_year must be reasonable")
        except (ValueError, TypeError):
            errors.append("founded_year must be a valid year")
        
    return len(errors) == 0, errors
