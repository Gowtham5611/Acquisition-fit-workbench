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
    'TX': ['Houston', 'Austin', 'Dallas', 'San Antonio'],
    'CA': ['Los Angeles', 'San Francisco', 'San Diego', 'San Jose'],
    'NY': ['New York', 'Buffalo', 'Albany', 'Rochester'],
    'FL': ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
    'IL': ['Chicago', 'Naperville', 'Peoria', 'Springfield'],
    'WA': ['Seattle', 'Bellevue', 'Tacoma', 'Spokane'],
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

def generate_unique_companies(count=160):
    used_names = set()
    records = []
    
    idx = 0
    while len(records) < count:
        pref = random.choice(PREFIXES)
        suf = random.choice(SUFFIXES)
        company = f"{pref} {suf}"
        if company in used_names:
            # Append modifier if collision
            company = f"{pref} {suf} {len(records)+1}"
        used_names.add(company)
        
        domain = company.lower().replace(' ', '-').replace('--', '-') + '.test'
        state = random.choice(STATES)
        city = get_city(state)
        
        emp = random.randint(5, 500)
        rev = random.randint(500000, 75000000)
        yr = random.randint(1985, 2022)
        
        fname = random.choice(FIRST_NAMES)
        lname = random.choice(LAST_NAMES)
        owner = f"{fname} {lname}"
        
        record = {
            'company_name': company,
            'website': f"https://www.{domain}",
            'industry': random.choice(INDUSTRIES),
            'city': city,
            'state': state,
            'country': 'USA',
            'employee_count': emp,
            'revenue': rev,
            'founded_year': yr,
            'owner_name': owner,
            'owner_title': random.choice(['CEO', 'Founder & CEO', 'President', 'Managing Director', 'Owner']),
            'owner_email': f"{fname.lower()}.{lname.lower()}@{domain}",
            'phone': f"(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}",
            'linkedin_url': f"linkedin.com/in/{fname.lower()}-{lname.lower()}-{random.randint(10, 99)}",
            'source': random.choice(SOURCES),
            'source_url': f"https://directory.test/{domain}"
        }
        records.append(record)
        idx += 1
        
    return records

records = generate_unique_companies(160)

# Create 15 deliberate duplicates
duplicates = []
for i in range(15):
    dup = dict(records[i])
    # Slight variation in duplicate source or case
    dup['source'] = 'Secondary Directory'
    dup['source_url'] = f"https://secondary.test/{dup['company_name'].lower().replace(' ', '-')}"
    duplicates.append(dup)

# Intentionally introduce realistic missing data in the base records
# Some missing websites
for i in range(15, 30):
    records[i]['website'] = ""
# Some missing owner emails
for i in range(30, 45):
    records[i]['owner_email'] = ""
# Some missing phone numbers
for i in range(45, 60):
    records[i]['phone'] = ""
# Some missing LinkedIn
for i in range(60, 75):
    records[i]['linkedin_url'] = ""
# Some missing revenue
for i in range(75, 85):
    records[i]['revenue'] = ""
# Some missing employees
for i in range(85, 95):
    records[i]['employee_count'] = ""
# Some missing founded year
for i in range(95, 105):
    records[i]['founded_year'] = ""
# Some missing owner name (no decision maker)
for i in range(105, 120):
    records[i]['owner_name'] = ""
    records[i]['owner_title'] = ""

all_records = records + duplicates
random.shuffle(all_records)

# Determine output paths
possible_dirs = ['data/demo', '../data/demo']
target_dir = 'data/demo'
for pd in possible_dirs:
    if os.path.exists(os.path.dirname(pd)) or os.path.exists(pd):
        target_dir = pd
        break

os.makedirs(target_dir, exist_ok=True)
csv_path = os.path.join(target_dir, 'demo_leads.csv')

with open(csv_path, 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=list(all_records[0].keys()))
    writer.writeheader()
    writer.writerows(all_records)

print(f"Generated {len(all_records)} records (160 unique + 15 deliberate duplicates) in {csv_path}")
