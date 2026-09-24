"""
Phase 3: Machine Learning Pipeline (RFM + K-Means) — Arya Ribbon Company
Computes RFM matrix, applies K-Means clustering, exports segments to PostgreSQL,
and generates visualizations in report_assets/
"""

import pandas as pd
import numpy as np
from sqlalchemy import create_engine, text
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import os
import warnings
warnings.filterwarnings("ignore")

# ─── Config ───────────────────────────────────────────────────────────────────
DB_USER     = "postgres"
DB_PASSWORD = "root"
DB_HOST     = "localhost"
DB_PORT     = "5432"
DB_NAME     = "arya_ribbon"

REFERENCE_DATE = pd.Timestamp("2026-08-06")   # day after last invoice
os.makedirs("report_assets", exist_ok=True)

# ─── 1. Load from PostgreSQL ──────────────────────────────────────────────────
engine = create_engine(
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

df = pd.read_sql("SELECT * FROM invoice_ledger", engine)
print(f"Loaded {len(df)} rows from invoice_ledger")

df["date"] = pd.to_datetime(df["date"])

# ─── 2. RFM Calculation ───────────────────────────────────────────────────────
rfm = df.groupby("client").agg(
    Recency   = ("date", lambda x: (REFERENCE_DATE - x.max()).days),
    Frequency = ("invoice_id", "count"),
    Monetary  = ("total_amount_inr", "sum"),
).reset_index()

rfm["Monetary"] = rfm["Monetary"].round(2)
print(f"\nRFM Matrix shape: {rfm.shape}")
print(rfm.describe())

# ─── 3. Standardize & K-Means ────────────────────────────────────────────────
scaler = StandardScaler()
rfm_scaled = scaler.fit_transform(rfm[["Recency", "Frequency", "Monetary"]])

kmeans = KMeans(n_clusters=4, random_state=42, n_init=20, max_iter=500)
rfm["Cluster"] = kmeans.fit_predict(rfm_scaled)

# ─── 4. Assign Business-Friendly Labels ──────────────────────────────────────
# Inspect cluster centers to assign labels sensibly
centers = pd.DataFrame(
    scaler.inverse_transform(kmeans.cluster_centers_),
    columns=["Recency", "Frequency", "Monetary"]
)
centers["Cluster"] = range(4)

print("\nCluster Centers (unscaled):")
print(centers)

# Sort by Monetary descending to assign labels
centers_sorted = centers.sort_values("Monetary", ascending=False).reset_index(drop=True)
label_map_keys = centers_sorted["Cluster"].tolist()
labels = ["Wholesale VIPs", "Core Accounts", "Occasional Buyers", "At-Risk / Churned"]

# But also check recency: highest recency (oldest last contact) → At-Risk
# Refine: among low-monetary clusters, highest recency = At-Risk
low_monetary_clusters = centers_sorted.iloc[2:]["Cluster"].tolist()
recency_among_low = centers[centers["Cluster"].isin(low_monetary_clusters)].sort_values(
    "Recency", ascending=False
)
at_risk_cluster = recency_among_low.iloc[0]["Cluster"]

# Build final label map
label_map = {}
for i, clust_id in enumerate(label_map_keys):
    if i < 2:
        label_map[int(clust_id)] = labels[i]  # Top 2 by monetary
    else:
        if int(clust_id) == int(at_risk_cluster):
            label_map[int(clust_id)] = "At-Risk / Churned"
        else:
            label_map[int(clust_id)] = "Occasional Buyers"

rfm["Segment"] = rfm["Cluster"].map(label_map)
print("\nSegment distribution:")
print(rfm["Segment"].value_counts())

# ─── 5. Export to PostgreSQL ──────────────────────────────────────────────────
rfm_export = rfm.rename(columns={
    "client": "client",
    "Recency": "recency",
    "Frequency": "frequency",
    "Monetary": "monetary",
    "Cluster": "cluster",
    "Segment": "segment",
})
# Rename client col properly (it's already lowercase from SQL)
rfm_export.columns = [c.lower() for c in rfm_export.columns]

rfm_export.to_sql(
    "rfm_segments",
    engine,
    if_exists="replace",
    index=False,
    method="multi",
    chunksize=200
)
print(f"\n[OK] Pushed {len(rfm_export)} rows -> PostgreSQL table 'rfm_segments'")

with engine.connect() as conn:
    count = conn.execute(text("SELECT COUNT(*) FROM rfm_segments")).scalar()
    print(f"[OK] Verified: {count} rows in rfm_segments")

engine.dispose()

# ─── 6. Visualizations ───────────────────────────────────────────────────────
PALETTE = {
    "Wholesale VIPs":    "#6C63FF",
    "Core Accounts":     "#43BF8E",
    "Occasional Buyers": "#F5A623",
    "At-Risk / Churned": "#E84393",
}

# ── 6a. Scatter: Recency vs Monetary ─────────────────────────────────────────
fig, ax = plt.subplots(figsize=(10, 7))
fig.patch.set_facecolor("#0F1117")
ax.set_facecolor("#0F1117")

for seg, grp in rfm.groupby("Segment"):
    ax.scatter(
        grp["Recency"], grp["Monetary"],
        label=seg,
        color=PALETTE[seg],
        alpha=0.78,
        s=80,
        edgecolors="white",
        linewidths=0.4,
    )

ax.set_title("RFM Scatter — Recency vs Monetary Value", color="white", fontsize=14, pad=15)
ax.set_xlabel("Recency (days since last order)", color="#AAAAAA", fontsize=11)
ax.set_ylabel("Monetary Value (INR)", color="#AAAAAA", fontsize=11)
ax.tick_params(colors="#AAAAAA")
for spine in ax.spines.values():
    spine.set_edgecolor("#333333")
ax.grid(color="#222222", linestyle="--", alpha=0.5)
legend = ax.legend(facecolor="#1C1E27", edgecolor="#444444", labelcolor="white", fontsize=10)
plt.tight_layout()
plt.savefig("report_assets/rfm_scatter.png", dpi=150, bbox_inches="tight", facecolor="#0F1117")
plt.close()
print("[OK] Saved report_assets/rfm_scatter.png")

# ── 6b. Boxplot: Revenue by Segment ──────────────────────────────────────────
seg_order = ["Wholesale VIPs", "Core Accounts", "Occasional Buyers", "At-Risk / Churned"]

fig, ax = plt.subplots(figsize=(11, 6))
fig.patch.set_facecolor("#0F1117")
ax.set_facecolor("#0F1117")

sns.boxplot(
    data=rfm,
    x="Segment",
    y="Monetary",
    order=seg_order,
    palette=PALETTE,
    width=0.5,
    linewidth=1.2,
    flierprops=dict(marker="o", color="white", alpha=0.3, markersize=3),
    ax=ax,
)

ax.set_title("Revenue Distribution by Client Segment", color="white", fontsize=14, pad=15)
ax.set_xlabel("Segment", color="#AAAAAA", fontsize=11)
ax.set_ylabel("Total Revenue (INR)", color="#AAAAAA", fontsize=11)
ax.tick_params(colors="#AAAAAA", axis="both")
for spine in ax.spines.values():
    spine.set_edgecolor("#333333")
ax.grid(color="#222222", linestyle="--", alpha=0.5, axis="y")
ax.set_xticklabels(seg_order, rotation=15, ha="right", color="#CCCCCC")
plt.tight_layout()
plt.savefig("report_assets/rfm_boxplot.png", dpi=150, bbox_inches="tight", facecolor="#0F1117")
plt.close()
print("[OK] Saved report_assets/rfm_boxplot.png")

print("\n[DONE] Phase 3 complete.")
