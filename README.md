# RecoLab – Intelligent Product Recommendation Strategy & Algorithm Benchmarking

RecoLab is a full-stack, enterprise-grade machine learning platform in the Data Science & Commerce domain. It delivers real-time personalized product recommendations, offline algorithm benchmarking, explainable AI justifications, and executive business analytics.

---

## Key Highlights

- **Multi-Algorithm Recommender Suite:**
  - **Content-Based Filtering:** TF-IDF n-gram vectorization with Cosine Similarity and semantic attribute weighting.
  - **Item-Item Collaborative Filtering:** SciPy sparse customer-item interaction matrices with configurable event weights (views, clicks, cart adds, purchases, wishlists, ratings).
  - **Hybrid Strategy:** Normalized composite fusion combining semantic content affinity and behavioral co-purchase patterns.
- **Offline Algorithm Benchmarking Studio:**
  - Avoids data leakage via per-user holdout and temporal train/test splitting.
  - Computes Precision@K, Recall@K, F1@K, MAP@K, NDCG@K, Catalog Coverage, User Coverage, Diversity, and Novelty.
- **Full-Spectrum Business Analytics:**
  - Product Behaviour & Conversion Funnel diagnostics.
  - Price Sensitivity & Tier Distribution analysis.
  - Demand Cadence & Velocity monitoring.
  - Prescriptive Merchandising Insights & Bundling hypotheses.
- **Publication-Ready Exporting:**
  - PDF Executive Briefs with tables and charts.
  - Multi-sheet Excel workbooks (.xlsx) using OpenPyXL.
  - Raw CSV data dumps.
- **Data Validation & Cleaning Engine:**
  - Detects duplicate keys, orphan references, missing descriptions, and malformed datatypes.
  - Generates Data Quality Scores (0–100%) and rejected records archives.

---

## Architecture & Technology Stack

```
                  ┌──────────────────────────────────────────────┐
                  │             React 18 + TypeScript            │
                  │  Vite • Tailwind CSS • Lucide • Recharts     │
                  └──────────────────────┬───────────────────────┘
                                         │  REST / JWT
                                         ▼
                  ┌──────────────────────────────────────────────┐
                  │              Python FastAPI Backend          │
                  │  Pydantic v2 • Motor • PyMongo • Joblib      │
                  └──────────────┬───────────────────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────────────┐   ┌──────────────────────────────────┐
│   MongoDB Atlas Cloud Database  │   │     Machine Learning Engines     │
│   Users, Products, Interactions,│   │  Scikit-Learn TF-IDF, SciPy CSR  │
│   Runs, Experiments, Reports    │   │  Cosine Similarity, Benchmarking │
└─────────────────────────────────┘   └──────────────────────────────────┘
```

---

## Directory Structure

```
RecoLab/
├── backend/
│   ├── app/
│   │   ├── main.py                     # FastAPI entry point & lifespan
│   │   ├── core/                       # Settings, JWT security & RBAC
│   │   ├── database/                   # Motor MongoDB & indexing
│   │   ├── schemas/                    # Pydantic v2 request/response models
│   │   ├── services/                   # Auth, dataset, product, reports, benchmark
│   │   ├── api/v1/                     # Modular versioned REST endpoints
│   │   └── ml/
│   │       ├── preprocessing/          # Text cleaner & feature enrichment
│   │       ├── content_based/          # TF-IDF & Cosine Similarity engine
│   │       ├── item_item/              # Collaborative sparse matrix engine
│   │       ├── hybrid/                 # Normalized weighted fusion engine
│   │       └── evaluation/             # Evaluator (NDCG, Precision, Coverage)
│   ├── data/                           # Sample product catalogue & interactions
│   ├── tests/                          # Pytest ML & API verification suite
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── app/                        # Router & global providers
│   │   ├── components/layout/          # Sidebar, Navbar, DashboardLayout
│   │   ├── context/                    # AuthContext & active dataset selector
│   │   ├── services/                   # Axios API client
│   │   ├── types/                      # TypeScript domain definitions
│   │   └── modules/                    # Dashboard, Datasets, Products,
│   │                                   # Recommenders, Benchmarking, Reports
│   ├── package.json
│   ├── Dockerfile
│   └── .env
├── docker-compose.yml
└── README.md
```

---

## Quickstart & Local Execution

### 1. Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 2. Backend Startup
```bash
cd backend
python -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
API Documentation will be accessible at: `http://localhost:8000/docs`

### 3. Frontend Startup
```bash
cd frontend
npm install
npm run dev
```
Web Application will run at: `http://localhost:5173`

---

## Preloaded Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Data Analyst** | `analyst@recolab.io` | `Analyst@123456` |
| **Super Admin** | `admin@recolab.io` | `Admin@123456` |

---

## Executing Machine Learning Unit Tests

Run test suite verifying recommender fidelity, text normalization, and offline ranking metrics:
```bash
cd backend
python -m pytest tests/test_ml_and_api.py -v
```

---

## Docker Deployment

To launch both frontend and backend in isolated production containers:
```bash
docker-compose up --build
```
- Frontend UI: `http://localhost:80`
- Backend API: `http://localhost:8000`
