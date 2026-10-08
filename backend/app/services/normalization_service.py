import urllib.parse
import re

def normalize_website(url: str) -> str:
    if not url:
        return ""
    url = url.strip().lower()
    url = re.sub(r'^https?://', '', url)
    url = re.sub(r'^www\.', '', url)
    return url.rstrip('/')

def extract_domain(url: str) -> str:
    if not url:
        return ""
    normalized = normalize_website(url)
    return normalized.split('/')[0].split('?')[0]

def normalize_company_name(name: str) -> str:
    if not name:
        return ""
    return ' '.join(name.strip().title().split())

def normalize_industry(industry: str) -> str:
    if not industry:
        return ""
    return industry.strip().title()

def normalize_location(city: str, state: str, country: str) -> tuple:
    c = city.strip().title() if city else ""
    s = state.strip().upper() if state else ""
    co = country.strip().title() if country else ""
    return c, s, co

def normalize_email(email: str) -> str:
    if not email:
        return ""
    return email.strip().lower()

def normalize_phone(phone: str) -> str:
    if not phone:
        return ""
    return re.sub(r'[^0-9+() -]', '', phone).strip()

def normalize_linkedin(url: str) -> str:
    if not url:
        return ""
    url = url.strip().lower()
    url = re.sub(r'^https?://', '', url)
    url = re.sub(r'^www\.', '', url)
    return url.rstrip('/')

def normalize_lead(lead_dict: dict) -> dict:
    normalized = dict(lead_dict)
    
    if 'website' in normalized and normalized['website']:
        normalized['website'] = normalized['website'].strip()
        normalized['domain'] = extract_domain(normalized['website'])
    elif 'website' in normalized and not normalized['website']:
        normalized['website'] = None
        normalized['domain'] = None
        
    if 'company_name' in normalized:
        normalized['company_name'] = normalize_company_name(normalized.get('company_name', ''))
        
    if 'industry' in normalized:
        normalized['industry'] = normalize_industry(normalized.get('industry', '')) or None
        
    if 'owner_email' in normalized:
        normalized['owner_email'] = normalize_email(normalized.get('owner_email', '')) or None
        
    if 'phone' in normalized:
        normalized['phone'] = normalize_phone(normalized.get('phone', '')) or None
        
    if 'linkedin_url' in normalized:
        normalized['linkedin_url'] = normalize_linkedin(normalized.get('linkedin_url', '')) or None
        
    c, s, co = normalize_location(normalized.get('city', ''), normalized.get('state', ''), normalized.get('country', ''))
    normalized['city'] = c or None
    normalized['state'] = s or None
    normalized['country'] = co or None

    if 'owner_name' in normalized:
        normalized['owner_name'] = str(normalized['owner_name']).strip().title() if normalized.get('owner_name') else None
    if 'owner_title' in normalized:
        normalized['owner_title'] = str(normalized['owner_title']).strip() if normalized.get('owner_title') else None

    # Coerce numeric fields
    if 'employee_count' in normalized:
        val = normalized.get('employee_count')
        if val is None or str(val).strip() == '':
            normalized['employee_count'] = None
        else:
            try:
                normalized['employee_count'] = int(str(val).replace(',', '').strip())
            except Exception:
                pass

    if 'revenue' in normalized:
        val = normalized.get('revenue')
        if val is None or str(val).strip() == '':
            normalized['revenue'] = None
        else:
            try:
                normalized['revenue'] = float(str(val).replace('$', '').replace(',', '').strip())
            except Exception:
                pass

    if 'founded_year' in normalized:
        val = normalized.get('founded_year')
        if val is None or str(val).strip() == '':
            normalized['founded_year'] = None
        else:
            try:
                normalized['founded_year'] = int(str(val).strip())
            except Exception:
                pass

    return normalized
