"""
Phase 2: Data Cleaning & Database Initialization — Arya Ribbon Company
Cleans raw_arya_ledger.csv, applies Winsorization, then pushes to PostgreSQL.
Output: clean_arya_ledger.csv + PostgreSQL table 'invoice_ledger'
"""

import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
import warnings
warnings.filterwarnings("ignore")

# ─── 1. Load Raw Data ─────────────────────────────────────────────────────────
df = pd.read_csv("raw_arya_ledger.csv")
print(f"Raw rows loaded   : {len(df)}")
print(f"Null Clients      : {df['Client'].isna().sum()}")
print(f"Negative Quantities: {(df['Quantity'] < 0).sum()}")

# ─── 2. Clean ─────────────────────────────────────────────────────────────────
# Drop rows with missing Client or Product
df = df.dropna(subset=["Client", "Product"])
print(f"\nAfter dropping nulls : {len(df)} rows")

# Parse Date
df["Date"] = pd.to_datetime(df["Date"], format="%Y-%m-%d", errors="coerce")
df = df.dropna(subset=["Date"])

# Filter out negative quantities
df = df[df["Quantity"] > 0].copy()
print(f"After filtering negatives: {len(df)} rows")

# Calculate Total Amount
df["Total_Amount_INR"] = (df["Quantity"] * df["Unit_Price_INR"]).round(2)

# Fill null values in Payment_Method with 'Not Applicable'
if "Payment_Method" in df.columns:
    df["Payment_Method"] = df["Payment_Method"].fillna("Not Applicable")

# ─── 3. Winsorize top 1% of Total_Amount_INR ─────────────────────────────────
cap_val = df["Total_Amount_INR"].quantile(0.99)
df["Total_Amount_INR"] = df["Total_Amount_INR"].clip(upper=cap_val)
print(f"Winsorization cap (99th pct): Rs {cap_val:,.2f}")

# Reset index
df = df.reset_index(drop=True)
df.index = df.index + 1  # 1-based
df.index.name = "Row_ID"

# ─── 4. Save Clean CSV ────────────────────────────────────────────────────────
df.to_csv("clean_arya_ledger.csv")
print(f"\nSaved clean_arya_ledger.csv with {len(df)} rows.")
print(df.dtypes)
print(df.head(3))

# ─── 5. PostgreSQL — Create DB and Table ──────────────────────────────────────
# Connect to default 'postgres' DB first to create arya_ribbon
DB_USER     = "postgres"
DB_PASSWORD = "root"          # <-- Change if needed
DB_HOST     = "localhost"
DB_PORT     = "5432"
DB_NAME     = "arya_ribbon"

# Connect to default postgres db to create the target db
default_engine = create_engine(
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/postgres",
    isolation_level="AUTOCOMMIT"
)

with default_engine.connect() as conn:
    exists = conn.execute(
        text("SELECT 1 FROM pg_database WHERE datname = :dbname"),
        {"dbname": DB_NAME}
    ).fetchone()
    if not exists:
        conn.execute(text(f'CREATE DATABASE "{DB_NAME}"'))
        print(f"\nDatabase '{DB_NAME}' created.")
    else:
        print(f"\nDatabase '{DB_NAME}' already exists.")

default_engine.dispose()

# Connect to arya_ribbon db
engine = create_engine(
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

# Push dataframe to invoice_ledger table
df_to_insert = df.reset_index().rename(columns={"Row_ID": "row_id"})
df_to_insert.columns = [c.lower().replace(" ", "_") for c in df_to_insert.columns]

df_to_insert.to_sql(
    "invoice_ledger",
    engine,
    if_exists="replace",
    index=False,
    method="multi",
    chunksize=500
)
print(f"\n[OK] Pushed {len(df_to_insert)} rows -> PostgreSQL table 'invoice_ledger'")

# Verify
with engine.connect() as conn:
    count = conn.execute(text("SELECT COUNT(*) FROM invoice_ledger")).scalar()
    print(f"[OK] Verified: {count} rows in invoice_ledger")

engine.dispose()
