# Financial Risk Analysis | Rules Based Fraud Detection

A full-stack, rule-based financial risk analysis and fraud detection dashboard. The project uses a Python FastAPI backend and a responsive HTML/CSS/JavaScript frontend, so no frontend build step is needed.

## Features

- Executive dashboard with transaction volume, fraud exposure, risk distribution, trend charts, and live alert feed.
- Transaction explorer with search, status filters, sortable results, and transaction detail view.
- Rule engine with explainable decisions: each flagged transaction includes the rules that fired and its risk score.
- Transaction screening endpoint for evaluating new transactions.
- Synthetic, deterministic demo data; no real financial or personal data is used.
- Health and API documentation endpoints.

## Run locally

Python 3.10 or newer is recommended.

```powershell
cd "C:\Users\kdivy\OneDrive\Desktop\VS CODES 🔥\financial_analysis _fraud_detection 2.O"
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn backend.main:app --reload
```

Open **http://127.0.0.1:8000**. Interactive API documentation is at **http://127.0.0.1:8000/docs**.

If PowerShell blocks activation, run `py -m pip install -r requirements.txt` and then `py -m uvicorn backend.main:app --reload` without activating the environment.

## API overview

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Service status |
| GET | `/api/dashboard` | KPI, chart, and alert data |
| GET | `/api/transactions` | Searchable and filterable transaction list |
| GET | `/api/transactions/{transaction_id}` | Transaction detail and triggered rules |
| POST | `/api/analyze` | Score a transaction against the rule set |
| GET | `/api/rules` | Rule definitions and thresholds |

## Rule model

The score is an explainable weighted sum, capped at 100. Rules look for unusually large amounts, rapid transaction velocity, high-risk merchant categories, international activity, repeated declines, and unusual transaction hours. A score of 70 or more is **high risk**; 40–69 is **medium risk**. Demo decisions are illustrative and are not a substitute for a production fraud strategy, model validation, or compliance review.

## Project layout

```text
backend/
  main.py                 FastAPI routes, demo data, and risk rules
frontend/
  index.html              App shell
  styles.css              Responsive dashboard styling
  app.js                  API integration and interactive views
requirements.txt
```

