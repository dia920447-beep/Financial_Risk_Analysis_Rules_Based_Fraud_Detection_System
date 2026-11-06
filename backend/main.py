from __future__ import annotations

import random
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
app = FastAPI(title="Financial Risk Analysis Rules Based Fraud Detection API", version="1.0.0", description="Explainable rule-based transaction risk analytics.")

RULES = [
    {"id": "R-001", "name": "High-value transaction", "description": "Transaction amount exceeds $2,500", "weight": 30, "severity": "high", "enabled": True},
    {"id": "R-002", "name": "Rapid transaction velocity", "description": "4 or more transactions within 10 minutes", "weight": 25, "severity": "high", "enabled": True},
    {"id": "R-003", "name": "High-risk merchant category", "description": "Merchant belongs to a monitored category", "weight": 20, "severity": "medium", "enabled": True},
    {"id": "R-004", "name": "International transaction", "description": "Transaction originated outside the cardholder's home country", "weight": 15, "severity": "medium", "enabled": True},
    {"id": "R-005", "name": "Repeated declined attempts", "description": "3 or more recent authorization declines", "weight": 25, "severity": "high", "enabled": True},
    {"id": "R-006", "name": "Unusual transaction hour", "description": "Transaction occurred between 01:00 and 04:00", "weight": 10, "severity": "low", "enabled": True},
]
HIGH_RISK_CATEGORIES = {"Cryptocurrency", "Online Gaming", "Wire Transfer", "Luxury Goods"}
MERCHANTS = [
    ("Northstar Market", "Grocery"), ("Metro Transit", "Transport"), ("Nimbus Cloud", "Technology"),
    ("Apex Electronics", "Electronics"), ("Velvet Room", "Luxury Goods"), ("CoinHarbor", "Cryptocurrency"),
    ("PlayForge", "Online Gaming"), ("Harborline Hotel", "Travel"), ("Brightwell Health", "Healthcare"),
    ("SwiftSend", "Wire Transfer"), ("Field & Form", "Retail"), ("Pioneer Fuel", "Fuel"),
]
COUNTRIES = ["US", "US", "US", "US", "GB", "SG", "DE", "CA", "US", "US"]


class TransactionInput(BaseModel):
    amount: float = Field(gt=0, le=1_000_000)
    merchant: str = Field(min_length=1, max_length=120)
    category: str = Field(min_length=1, max_length=80)
    country: str = Field(default="US", min_length=2, max_length=3)
    hour: int = Field(default=12, ge=0, le=23)
    transactions_last_10m: int = Field(default=1, ge=1, le=100)
    recent_declines: int = Field(default=0, ge=0, le=100)


def classify(score: int) -> str:
    return "high" if score >= 70 else "medium" if score >= 40 else "low"


def evaluate(tx: dict[str, Any]) -> dict[str, Any]:
    hits: list[dict[str, Any]] = []
    checks = [
        (tx["amount"] > 2500, "R-001", f"Amount ${tx['amount']:,.2f} exceeds $2,500"),
        (tx.get("transactions_last_10m", 1) >= 4, "R-002", f"{tx.get('transactions_last_10m', 1)} transactions in the last 10 minutes"),
        (tx["category"] in HIGH_RISK_CATEGORIES, "R-003", f"{tx['category']} is a monitored merchant category"),
        (tx.get("country", "US") != "US", "R-004", f"Transaction originated in {tx.get('country', 'US')}"),
        (tx.get("recent_declines", 0) >= 3, "R-005", f"{tx.get('recent_declines', 0)} recent declined authorizations"),
        (1 <= tx.get("hour", 12) <= 4, "R-006", f"Transaction at {tx.get('hour', 12):02d}:00 falls in the overnight window"),
    ]
    weights = {rule["id"]: rule["weight"] for rule in RULES if rule["enabled"]}
    by_id = {rule["id"]: rule for rule in RULES}
    for hit, rule_id, explanation in checks:
        if hit and rule_id in weights:
            rule = by_id[rule_id]
            hits.append({"rule_id": rule_id, "rule_name": rule["name"], "weight": weights[rule_id], "severity": rule["severity"], "explanation": explanation})
    score = min(100, sum(item["weight"] for item in hits))
    decision = "block" if score >= 70 else "review" if score >= 40 else "approve"
    return {"risk_score": score, "risk_level": classify(score), "decision": decision, "triggered_rules": hits, "recommendation": "Escalate for analyst review" if score >= 70 else "Request additional verification" if score >= 40 else "Approve and continue monitoring"}


def build_demo_data() -> list[dict[str, Any]]:
    rng = random.Random(20261023)
    now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    records = []
    for i in range(240):
        age_minutes = rng.randrange(0, 60 * 24 * 30)
        ts = now - timedelta(minutes=age_minutes)
        merchant, category = rng.choice(MERCHANTS)
        amount = round(min(rng.lognormvariate(3.8, 1.05), 8200), 2)
        country = rng.choice(COUNTRIES)
        hour = ts.hour
        velocity = rng.choices([1, 2, 3, 4, 5], [75, 12, 6, 5, 2])[0]
        declines = rng.choices([0, 1, 2, 3, 4], [82, 9, 4, 4, 1])[0]
        tx = {"amount": amount, "merchant": merchant, "category": category, "country": country, "hour": hour,
              "transactions_last_10m": velocity, "recent_declines": declines}
        outcome = evaluate(tx)
        # A small, clearly synthetic fraud label is added for dashboard demonstrations.
        fraud = outcome["risk_score"] >= 70 and rng.random() < 0.62 or outcome["risk_score"] >= 40 and rng.random() < 0.18
        status = "blocked" if fraud and outcome["risk_score"] >= 70 else "review" if outcome["risk_score"] >= 40 else "approved"
        records.append({"id": f"TXN-{ts.strftime('%y%m%d')}-{i + 1:04d}", "customer_id": f"CUS-{rng.randrange(1000, 9999)}",
                        "amount": amount, "merchant": merchant, "category": category, "country": country,
                        "timestamp": ts.isoformat(), "risk_score": outcome["risk_score"], "risk_level": outcome["risk_level"],
                        "status": status, "fraud": bool(fraud), "transactions_last_10m": velocity, "recent_declines": declines,
                        "hour": hour, "triggered_rules": outcome["triggered_rules"]})
    return sorted(records, key=lambda item: item["timestamp"], reverse=True)


TRANSACTIONS = build_demo_data()


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "financial-risk-analysis-fraud-detection"}


@app.get("/api/dashboard")
def dashboard() -> dict[str, Any]:
    total = len(TRANSACTIONS)
    flagged = [tx for tx in TRANSACTIONS if tx["risk_level"] != "low"]
    fraud_count = sum(tx["fraud"] for tx in TRANSACTIONS)
    fraud_amount = sum(tx["amount"] for tx in TRANSACTIONS if tx["fraud"])
    day_bins: dict[str, dict[str, Any]] = defaultdict(lambda: {"volume": 0, "flagged": 0, "label": ""})
    for tx in TRANSACTIONS:
        dt = datetime.fromisoformat(tx["timestamp"])
        key = dt.strftime("%Y-%m-%d")
        bucket = day_bins[key]
        bucket["label"] = dt.strftime("%d %b")
        bucket["volume"] += tx["amount"]
        bucket["flagged"] += 1 if tx["risk_level"] != "low" else 0
    trend = [value for _, value in sorted(day_bins.items())][-14:]
    risk_counts = Counter(tx["risk_level"] for tx in TRANSACTIONS)
    cat_counter = Counter()
    cat_amount = Counter()
    for tx in flagged:
        cat_counter[tx["category"]] += 1
        cat_amount[tx["category"]] += tx["amount"]
    categories = [{"name": name, "count": count, "amount": round(cat_amount[name], 2)} for name, count in cat_counter.most_common(6)]
    return {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "kpis": {"total_transactions": total, "total_volume": round(sum(tx["amount"] for tx in TRANSACTIONS), 2),
                 "flagged_transactions": len(flagged), "fraud_prevented": round(fraud_amount, 2),
                 "fraud_rate": round(fraud_count / total * 100, 2) if total else 0,
                 "review_queue": sum(tx["status"] == "review" for tx in TRANSACTIONS)},
        "risk_distribution": [{"level": level, "count": risk_counts[level]} for level in ["low", "medium", "high"]],
        "trend": trend,
        "categories": categories,
        "recent_alerts": [tx for tx in TRANSACTIONS if tx["risk_level"] == "high"][:6],
    }


@app.get("/api/transactions")
def transactions(q: str = "", status: str = "all", risk: str = "all", limit: int = Query(default=100, ge=1, le=500), offset: int = Query(default=0, ge=0)) -> dict[str, Any]:
    rows = TRANSACTIONS
    if q:
        needle = q.casefold()
        rows = [tx for tx in rows if needle in tx["id"].casefold() or needle in tx["merchant"].casefold() or needle in tx["customer_id"].casefold() or needle in tx["category"].casefold()]
    if status != "all":
        rows = [tx for tx in rows if tx["status"] == status]
    if risk != "all":
        rows = [tx for tx in rows if tx["risk_level"] == risk]
    return {"total": len(rows), "items": rows[offset:offset + limit]}


@app.get("/api/transactions/{transaction_id}")
def transaction_detail(transaction_id: str) -> dict[str, Any]:
    tx = next((row for row in TRANSACTIONS if row["id"] == transaction_id), None)
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx


@app.post("/api/analyze")
def analyze_transaction(payload: TransactionInput) -> dict[str, Any]:
    tx = payload.model_dump()
    return {"transaction": tx, **evaluate(tx)}


@app.get("/api/rules")
def rules() -> dict[str, Any]:
    return {"rules": RULES, "thresholds": {"low": "0–39", "medium": "40–69", "high": "70–100"}}


@app.post("/api/rules/{rule_id}/toggle")
def toggle_rule(rule_id: str) -> dict[str, Any]:
    rule = next((item for item in RULES if item["id"] == rule_id), None)
    if rule is None:
        raise HTTPException(status_code=404, detail="Rule not found")
    rule["enabled"] = not rule["enabled"]
    return rule


FRONTEND = ROOT / "frontend"
app.mount("/assets", StaticFiles(directory=FRONTEND), name="assets")


@app.get("/")
def index() -> FileResponse:
    return FileResponse(FRONTEND / "index.html")
