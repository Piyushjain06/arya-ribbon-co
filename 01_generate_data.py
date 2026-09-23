"""
Phase 1: Synthetic Data Generation — Arya Ribbon Company
Generates 4,000 realistic B2B invoices in Indian context.
Output: raw_arya_ledger.csv
"""

import pandas as pd
import numpy as np
import random
from datetime import datetime, timedelta

random.seed(42)
np.random.seed(42)

# ─── 150 Indian Business Client Names ────────────────────────────────────────
PREFIXES = ["M/s", "M/s", "M/s", "Shri", "Smt.", "M/s"]
BUSINESS_TYPES = [
    "Textiles", "Garments", "Fabrics", "Traders", "Enterprises",
    "Industries", "Exports", "Fashion House", "Boutique", "Emporium",
    "Event Planners", "Decorators", "Silk House", "Weavers", "Embroidery Works",
    "Handloom", "Saree Centre", "Creations", "Designs", "Collections",
]
NAMES = [
    "Balaji", "Kavya", "Sharma", "Rajesh", "Sunita", "Mohan", "Priya",
    "Venkatesh", "Lakshmi", "Ramesh", "Anjali", "Suresh", "Pooja", "Mahesh",
    "Deepika", "Arun", "Meena", "Vijay", "Rekha", "Ganesh", "Sita", "Ravi",
    "Kamala", "Naresh", "Savita", "Dinesh", "Usha", "Prakash", "Geeta",
    "Harish", "Nirmala", "Santosh", "Poonam", "Ashok", "Radha", "Vinod",
    "Saroj", "Rakesh", "Shanta", "Gopal", "Manju", "Subhash", "Pushpa",
    "Rajendra", "Lata", "Brijesh", "Sudha", "Hemant", "Kiran", "Jagdish",
    "Malti", "Arvind", "Shyam", "Kusum", "Bharat", "Saraswati", "Sanjay",
    "Madhuri", "Yash", "Champa", "Nilesh", "Shobha", "Tarun", "Vandana",
    "Mukesh", "Asha", "Girish", "Padma", "Vivek", "Sundar", "Chandrika",
    "Navin", "Alka", "Dilip", "Bharati", "Sunil", "Anita", "Hemendra",
    "Jaya", "Ramakant", "Sushila", "Kalpesh", "Komal", "Paresh", "Nandini",
    "Jayesh", "Smita", "Bhavesh", "Hema", "Alpesh", "Ruchita", "Hardik",
    "Drashti", "Chirag", "Manisha", "Krunal", "Foram", "Hitesh", "Zalak",
    "Niraj", "Sneha", "Jigar", "Riddhi", "Dhaval", "Prital", "Vishal",
    "Swati", "Kamlesh", "Nayna", "Jignesh", "Bindiya", "Ketan", "Mital",
    "Mayur", "Pallavi", "Bhavik", "Chhaya", "Rahul", "Neha", "Akash",
    "Pooja", "Deepak", "Kavita", "Rohit", "Seema", "Shyamlal", "Vimla",
    "Chandrakant", "Suman", "Hasmukh", "Varsha", "Amrut", "Dipti",
    "Ramniklal", "Jasumati", "Pravin", "Rupal", "Kantilal", "Bhavna",
    "Narottam", "Mrudula", "Bhikhabhai", "Shardaben", "Natubhai", "Indira",
    "Mansukhbhai", "Taraben",
]

clients = []
used_names = set()
for i in range(1, 151):
    while True:
        name = random.choice(NAMES)
        biz = random.choice(BUSINESS_TYPES)
        full = f"{random.choice(PREFIXES)} {name} {biz}"
        if full not in used_names:
            used_names.add(full)
            clients.append(f"Client-{i:03d}: {full}")
            break

# ─── Indian Ribbon Products ───────────────────────────────────────────────────
products = [
    "Gota Patti (Label-204)",
    "Banarasi Zari Border (Label-302)",
    "Satin 1-Inch (Label-101)",
    "Velvet Roll (Label-405)",
    "Organza Sheer (Label-210)",
    "Jacquard Brocade (Label-315)",
    "Silk Printed (Label-112)",
    "Nylon Woven (Label-501)",
    "Cotton Herringbone (Label-203)",
    "Polyester Grosgrain (Label-408)",
    "Metallic Zari (Label-306)",
    "Lace Trim Border (Label-217)",
    "Chiffon Pleated (Label-119)",
    "Embroidered Mirror Work (Label-422)",
    "Multicolor Taffeta (Label-308)",
    "Satin 2-Inch (Label-102)",
    "Gold Zardozi (Label-501)",
    "Silver Tissue (Label-312)",
    "Kutch Embroidery Border (Label-407)",
    "Raw Silk Ribbon (Label-115)",
    "Chanderi Block Print (Label-221)",
    "Patola Woven Border (Label-330)",
]

# ─── Unit Prices per Product (INR/metre) ─────────────────────────────────────
price_map = {
    "Gota Patti (Label-204)": 85,
    "Banarasi Zari Border (Label-302)": 145,
    "Satin 1-Inch (Label-101)": 35,
    "Velvet Roll (Label-405)": 120,
    "Organza Sheer (Label-210)": 55,
    "Jacquard Brocade (Label-315)": 175,
    "Silk Printed (Label-112)": 95,
    "Nylon Woven (Label-501)": 28,
    "Cotton Herringbone (Label-203)": 42,
    "Polyester Grosgrain (Label-408)": 32,
    "Metallic Zari (Label-306)": 160,
    "Lace Trim Border (Label-217)": 65,
    "Chiffon Pleated (Label-119)": 75,
    "Embroidered Mirror Work (Label-422)": 210,
    "Multicolor Taffeta (Label-308)": 88,
    "Satin 2-Inch (Label-102)": 50,
    "Gold Zardozi (Label-501)": 280,
    "Silver Tissue (Label-312)": 195,
    "Kutch Embroidery Border (Label-407)": 230,
    "Raw Silk Ribbon (Label-115)": 110,
    "Chanderi Block Print (Label-221)": 135,
    "Patola Woven Border (Label-330)": 250,
}

# ─── Generate 4,000 Invoices ─────────────────────────────────────────────────
START_DATE = datetime(2023, 1, 1)
END_DATE   = datetime(2026, 8, 5)
date_range = (END_DATE - START_DATE).days

records = []
for i in range(1, 4001):
    # Random date
    rand_days = random.randint(0, date_range)
    date = START_DATE + timedelta(days=rand_days)

    # Client — introduce ~3% missing
    client = random.choice(clients) if random.random() > 0.03 else None

    # Product
    product = random.choice(products)
    unit_price = price_map[product]

    # Add small price noise (±10%)
    unit_price = round(unit_price * random.uniform(0.90, 1.10), 2)

    # Quantity — introduce ~2% negative (noise)
    if random.random() < 0.02:
        qty = random.randint(-50, -1)
    else:
        # B2B quantities: skewed — some large wholesale orders
        qty = int(np.random.lognormal(mean=4.5, sigma=1.2))
        qty = max(1, min(qty, 5000))  # cap sanity

    records.append({
        "Invoice_ID":    f"INV-{i:04d}",
        "Date":          date.strftime("%Y-%m-%d"),
        "Client":        client,
        "Product":       product,
        "Quantity":      qty,
        "Unit_Price_INR": unit_price,
    })

df = pd.DataFrame(records)

# Shuffle rows so dates are not ordered
df = df.sample(frac=1, random_state=42).reset_index(drop=True)

# Save raw CSV
df.to_csv("raw_arya_ledger.csv", index=False)

print(f"[OK] Generated {len(df)} invoices -> raw_arya_ledger.csv")
print(f"   Null clients  : {df['Client'].isna().sum()}")
print(f"   Neg quantities: {(df['Quantity'] < 0).sum()}")
print(df.head(5))
