<div align="center">

# 🏛️ Arcaive

### Reasoning-Based Document Intelligence Platform

**Vectorless RAG** · **No Chunking** · **No Embeddings** · **Human-Like Retrieval**

Built on [PageIndex](https://github.com/VectifyAI/PageIndex) — **98.7% accuracy** on FinanceBench.

</div>

---

## 🧠 What is Arcaive?

Arcaive is a production-ready document intelligence platform that uses **reasoning-based retrieval** instead of traditional vector search. Upload any PDF and ask questions — Arcaive navigates the document like a human expert.

```
Traditional RAG:  PDF → Chunk → Embed → Vector DB → Cosine Similarity → LLM
Arcaive:          PDF → PageIndex Tree → LLM Reasons Through Tree → Answer + Trace
```

## 🏗️ Project Structure

```
Arcaive/
├── FastAPI/                    # Backend API
│   ├── main.py                 # FastAPI entry point
│   ├── config.py               # Settings & environment
│   ├── auth.py                 # JWT auth (signup/login/me)
│   ├── models.py               # All Pydantic schemas
│   ├── documents.py            # Document upload & tree endpoints
│   ├── query.py                # Query/chat endpoints
│   └── pageindex_client.py     # PageIndex SDK wrapper
├── frontend/                   # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/              # Landing, Auth, Dashboard, Documents, Query, Upload
│   │   ├── components/ui/      # Reusable UI components
│   │   ├── App.jsx             # Router setup
│   │   ├── Layout.jsx          # Sidebar + main layout
│   │   └── index.css           # Tailwind + custom styles
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── docs/                       # Architecture documentation
├── sample_data/                # Sample PDFs for testing
├── requirements.txt            # Python dependencies
├── .env.example                # Environment template
├── .gitignore
├── LICENSE
└── README.md
```

## 🚀 Getting Started

### Backend

```bash
git clone https://github.com/Saurabh-Vyawahare/Arcaive.git
cd Arcaive

# Python environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure
cp .env.example .env
# Edit .env with your PageIndex API key

# Run
cd FastAPI
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:3000
```

## 🔑 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Get JWT token |
| GET | `/auth/me` | Current user |
| POST | `/documents/upload` | Upload PDF |
| GET | `/documents/` | List documents |
| GET | `/documents/{id}/tree` | Get tree structure |
| POST | `/query/ask` | Ask a question |

## 🛠️ Tech Stack

**Backend:** Python, FastAPI, JWT, PageIndex SDK
**Frontend:** React, Vite, Tailwind CSS, React Router
**Auth:** JWT (python-jose) + bcrypt
**AI:** PageIndex (reasoning-based RAG)

## 👤 Author

**Saurabh Vyawahare** — [@Saurabh-Vyawahare](https://github.com/Saurabh-Vyawahare)
