import csv
import random
import os

random.seed(42)

INDUSTRIES = [
    'SaaS', 'Healthcare', 'FinTech', 'E-Commerce', 'Manufacturing',
    'Logistics', 'EdTech', 'CleanTech', 'InsurTech', 'Real Estate',
    'Cybersecurity', 'MarTech', 'Construction', 'Professional Services'
]

STATES = [
    'TX', 'CA', 'NY', 'FL', 'IL', 'WA', 'CO', 'GA', 'NC', 'VA',
    'MA', 'OH', 'PA', 'AZ', 'TN', 'OR', 'MN', 'MI', 'NJ', 'MD',
    'UT', 'IN', 'MO', 'WI', 'SC'
]

CITIES = {
    'TX': ['Austin', 'Dallas', 'Houston', 'San Antonio'],
    'CA': ['San Francisco', 'San Jose', 'San Diego', 'Los Angeles'],
    'NY': ['New York', 'Albany', 'Rochester', 'Buffalo'],
    'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
    'IL': ['Chicago', 'Naperville', 'Peoria', 'Springfield'],
    'WA': ['Seattle', 'Bellevue', 'Tacoma', 'Spokane'],
    'CO': ['Denver', 'Boulder', 'Colorado Springs'],
    'GA': ['Atlanta', 'Alpharetta', 'Savannah'],
    'NC': ['Raleigh', 'Charlotte', 'Durham'],
    'OH': ['Columbus', 'Cleveland', 'Cincinnati'],
    'PA': ['Philadelphia', 'Pittsburgh', 'Allentown'],
}

def get_city(state):
    return random.choice(CITIES.get(state, ['Springfield', 'Riverside', 'Georgetown', 'Franklin']))

PREFIXES = [
    'Apex', 'Vertex', 'Summit', 'Pioneer', 'Quantum', 'Nexus', 'Zenith', 'Vanguard', 'Alpha', 'Nova',
    'Atlas', 'Beacon', 'Catalyst', 'Crest', 'Echo', 'Horizon', 'Infinity', 'Matrix', 'Meridian', 'Optima',
    'Orion', 'Pulse', 'Radiant', 'Starlight', 'Sterling', 'Synergy', 'Titan', 'Trident', 'Valence', 'Vector'
]

SUFFIXES = [
    'Solutions', 'Analytics', 'Systems', 'Group', 'Cloud', 'Technologies', 'Innovations', 'Dynamics', 'Partners', 'Corp',
    'Enterprises', 'Ventures', 'Digital', 'Networks', 'Labs', 'Software', 'Services', 'Logistics', 'Capital', 'Industries'
]

FIRST_NAMES = ['David', 'Sarah', 'Michael', 'Jennifer', 'Robert', 'Lisa', 'James', 'Emily', 'William', 'Jessica', 'Alex', 'Rachel', 'Brian', 'Amanda', 'Kevin']
LAST_NAMES = ['Miller', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Taylor', 'Anderson', 'Thomas']

SOURCES = ['Demo Dataset', 'Industry Directory', 'Trade Association', 'Conference Directory']

def generate_base_records(count=160):
    used_names = set()
    records = []
    
    for i in range(count):
        pref = PREFIXES[i % len(PREFIXES)]
        suf = SUFFIXES[(i // len(PREFIXES)) % len(SUFFIXES)]
        company = f"{pref} {suf}"
        if company in used_names:
            company = f"{pref} {suf} {i+1}"
        used_names.add(company)
        
        domain = company.lower().replace(' ', '-').replace('--', '-') + '.test'
        fname = random.choice(FIRST_NAMES)
        lname = random.choice(LAST_NAMES)
        
        record = {
            'company_name': company,
            'website': f"https://www.{domain}",
            'industry': 'SaaS',
            'city': 'Austin',
            'state': 'TX',
            'country': 'USA',
            'employee_count': 50,
            'revenue': 10000000,
            'founded_year': 2015,
            'owner_name': f"{fname} {lname}",
            'owner_title': random.choice(['CEO', 'Founder & CEO', 'President', 'Managing Director', 'Owner']),
            'owner_email': f"{fname.lower()}.{lname.lower()}@{domain}",
            'phone': f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
            'linkedin_url': f"linkedin.com/in/{fname.lower()}-{lname.lower()}-{random.randint(10, 99)}",
            'source': random.choice(SOURCES),
            'source_url': f"https://directory.test/{domain}"
        }
        records.append(record)
    return records

records = generate_base_records(160)

# ==============================================================================
# COHORT 1: HIGH FIT (Score >= 80) -> Target: ~18 records (~11% of unique)
# ==============================================================================
# 1A. High Fit + High Confidence (Quadrant: Priority Targets): 11 records
for i in range(11):
    records[i]['industry'] = random.choice(['SaaS', 'Healthcare', 'FinTech'])
    records[i]['state'] = random.choice(['TX', 'CA', 'NY', 'FL'])
    records[i]['city'] = get_city(records[i]['state'])
    records[i]['revenue'] = random.randint(3500000, 28000000)
    records[i]['employee_count'] = random.randint(25, 150)
    records[i]['founded_year'] = random.randint(2008, 2018)

# 1B. High Fit + Low Confidence (Quadrant: Verify First): 7 records
# High fit attributes match, but key contact and profile fields are missing
for i in range(11, 18):
    records[i]['industry'] = random.choice(['SaaS', 'Healthcare', 'FinTech'])
    records[i]['state'] = random.choice(['TX', 'CA', 'NY', 'FL'])
    records[i]['city'] = get_city(records[i]['state'])
    records[i]['revenue'] = random.randint(3500000, 28000000)
    records[i]['employee_count'] = random.randint(25, 150)
    records[i]['founded_year'] = random.randint(2008, 2018)
    records[i]['owner_email'] = ''
    records[i]['phone'] = ''
    records[i]['linkedin_url'] = ''

# ==============================================================================
# COHORT 2: MEDIUM FIT (60 <= Score < 80) -> Target: ~40 records (~25% of unique)
# ==============================================================================
# 2A. Upper Medium, High Confidence (Fit 70-79, Conf >= 75% -> Priority Targets): 14 records
# Strong industry & financials, but outside primary geographic target and older founding date
for i in range(18, 32):
    records[i]['industry'] = random.choice(['SaaS', 'Healthcare', 'FinTech'])
    records[i]['state'] = random.choice(['OH', 'PA', 'CO', 'GA', 'NC', 'VA', 'AZ', 'WA'])
    records[i]['city'] = get_city(records[i]['state'])
    records[i]['revenue'] = random.randint(3500000, 28000000)
    records[i]['employee_count'] = random.randint(25, 150)
    records[i]['founded_year'] = random.randint(1982, 1996)  # Outside target age

# 2B. Upper Medium, Low Confidence (Fit 70-79, Conf < 75% -> Verify First): 8 records
# Core criteria match, but revenue and executive identity are unconfirmed
for i in range(32, 40):
    records[i]['industry'] = random.choice(['SaaS', 'Healthcare', 'FinTech'])
    records[i]['state'] = random.choice(['TX', 'CA', 'NY', 'FL'])
    records[i]['city'] = get_city(records[i]['state'])
    records[i]['revenue'] = ''
    records[i]['employee_count'] = random.randint(25, 150)
    records[i]['founded_year'] = random.randint(2008, 2018)
    records[i]['owner_name'] = ''
    records[i]['owner_title'] = ''
    records[i]['owner_email'] = ''
    records[i]['phone'] = ''
    records[i]['linkedin_url'] = ''

# 2C. Lower Medium, High Confidence (Fit 60-69, Conf >= 75% -> Known Low Fit): 18 records
# Adjacent sectors (EdTech, MarTech, InsurTech) with near-boundary revenue in target states
for i in range(40, 58):
    records[i]['industry'] = random.choice(['Manufacturing', 'EdTech', 'CleanTech', 'InsurTech', 'MarTech'])
    records[i]['state'] = random.choice(['TX', 'CA', 'NY', 'FL'])
    records[i]['city'] = get_city(records[i]['state'])
    records[i]['revenue'] = random.choice([1600000, 1800000, 38000000, 42000000])  # Near-revenue (7.5 pts)
    records[i]['employee_count'] = random.randint(25, 150)
    records[i]['founded_year'] = random.randint(2008, 2018)

# ==============================================================================
# COHORT 3: LOW FIT (Score < 60) -> Target: ~102 records (~64% of unique)
# ==============================================================================
# 3A. Low Fit, High Confidence (Fit < 60, Conf >= 75% -> Known Low Fit): 67 records
# Non-target industries and outside geography, large scale, but fully documented
for i in range(58, 125):
    records[i]['industry'] = random.choice(['Construction', 'Real Estate', 'Logistics', 'Retail', 'Hospitality', 'Professional Services'])
    records[i]['state'] = random.choice(['OH', 'PA', 'AZ', 'TN', 'OR', 'MN', 'MI', 'NJ', 'MD', 'UT', 'IN', 'MO', 'WI', 'SC'])
    records[i]['city'] = get_city(records[i]['state'])
    records[i]['revenue'] = random.randint(65000000, 120000000)
    records[i]['employee_count'] = random.randint(400, 950)
    records[i]['founded_year'] = random.randint(1970, 1995)

# 3B. Low Fit, Low Confidence (Fit < 60, Conf < 75% -> Deprioritize): 35 records
# Non-target industries, sparse incomplete profiles
for i in range(125, 160):
    records[i]['industry'] = random.choice(['Construction', 'Real Estate', 'Logistics'])
    records[i]['state'] = random.choice(['OH', 'PA', 'AZ', 'TN', 'OR', 'MN', 'MI', 'NJ', 'MD', 'UT', 'IN', 'MO', 'WI', 'SC'])
    records[i]['city'] = get_city(records[i]['state'])
    records[i]['revenue'] = ''
    records[i]['employee_count'] = ''
    records[i]['founded_year'] = ''
    records[i]['owner_name'] = ''
    records[i]['owner_title'] = ''
    records[i]['owner_email'] = ''
    records[i]['phone'] = ''
    records[i]['website'] = ''
    records[i]['linkedin_url'] = ''

# ==============================================================================
# DELIBERATE DUPLICATES: 15 records across cohorts
# ==============================================================================
duplicates = []
# 2 from High Fit, 4 from Medium Fit, 9 from Low Fit
for idx in [0, 1, 18, 19, 32, 40, 58, 59, 60, 61, 62, 125, 126, 127, 128]:
    dup = dict(records[idx])
    dup['source'] = 'Secondary Directory'
    dup['source_url'] = f"https://secondary.test/{dup['company_name'].lower().replace(' ', '-')}"
    duplicates.append(dup)

all_records = records + duplicates
random.shuffle(all_records)

# Write to target path
possible_dirs = ['data/demo', '../data/demo']
target_dir = 'data/demo'
for pd in possible_dirs:
    if os.path.exists(pd) or os.path.exists(os.path.dirname(pd)):
        target_dir = pd
        break

os.makedirs(target_dir, exist_ok=True)
csv_path = os.path.join(target_dir, 'demo_leads.csv')

with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=list(all_records[0].keys()))
    writer.writeheader()
    writer.writerows(all_records)

print(f"Generated {len(all_records)} records ({len(records)} unique + {len(duplicates)} deliberate duplicates) in {csv_path}")
