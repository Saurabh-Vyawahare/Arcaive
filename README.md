<div align="center">

# 🏛️ Arcaive

### Reasoning-Based Document Intelligence Platform

**Vectorless RAG** · **No Chunking** · **No Embeddings** · **Human-Like Retrieval**

Built on [PageIndex](https://github.com/VectifyAI/PageIndex) — the framework that achieved **98.7% accuracy** on FinanceBench.

[Try Arcaive](#getting-started) · [Architecture](#architecture) · [API Docs](#api-endpoints) · [Contributing](#contributing)

</div>

---

## 🧠 What is Arcaive?

Arcaive is a **production-ready document intelligence platform** that uses reasoning-based retrieval instead of traditional vector search. Upload any PDF — financial reports, legal documents, compliance guides, research papers — and ask questions. Arcaive navigates the document like a human expert.

### How It Works

```
Traditional RAG:  PDF → Chunk → Embed → Vector DB → Cosine Similarity → LLM
Arcaive:          PDF → PageIndex Tree → LLM Reasons Through Tree → Answer + Trace
```

| Feature | Vector RAG | Arcaive |
|---------|-----------|---------|
| Storage | Vector database required | No vector DB |
| Processing | Fixed-size chunking | Natural document sections |
| Retrieval | Cosine similarity | LLM tree reasoning |
| Explainability | Opaque | Full reasoning path |
| Accuracy (FinanceBench) | ~70-85% | **98.7%** |

---

## 🏗️ Architecture

```
┌──────────────────────┐     ┌──────────────────────┐     ┌──────────────────────┐
│     React Frontend   │────▶│    FastAPI Backend    │────▶│   PageIndex API      │
│                      │     │                      │     │   (Tree + Chat)      │
│  • Landing Page      │     │  • JWT Auth           │     │                      │
│  • Auth (Login/      │     │  • Document Mgmt      │     │  • Tree Generation   │
│    Signup)           │     │  • Query Engine        │     │  • Reasoning Search  │
│  • Dashboard         │     │  • File Storage        │     │  • Chat Completions  │
│  • Document Tree     │     │                      │     │                      │
│  • Chat Interface    │     └──────────────────────┘     └──────────────────────┘
│  • Upload            │                │
└──────────────────────┘         ┌──────┴──────┐
                                 │   Storage    │
                                 │  (Local/S3)  │
                                 └─────────────┘
```

---

## 📁 Project Structure

```
Arcaive/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # Settings & environment config
│   ├── requirements.txt        # Python dependencies
│   ├── auth/
│   │   ├── router.py           # /auth/signup, /auth/login
│   │   ├── models.py           # User schemas
│   │   ├── utils.py            # JWT + password hashing
│   │   └── dependencies.py     # get_current_user dependency
│   ├── documents/
│   │   ├── router.py           # /documents/upload, /documents/list, /documents/tree
│   │   └── models.py           # Document schemas
│   ├── query/
│   │   ├── router.py           # /query/ask
│   │   └── models.py           # Query/response schemas
│   └── pageindex/
│       └── client.py           # PageIndex API wrapper
├── frontend/                   # React app (Vite + React)
│   └── ... (setup separately)
├── docs/
│   └── architecture.md         # Detailed architecture docs
├── .env.example                # Environment template
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ (for frontend)
- PageIndex API key ([get one free](https://docs.pageindex.ai))

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/Saurabh-Vyawahare/Arcaive.git
cd Arcaive

# Set up Python environment
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp ../.env.example ../.env
# Edit .env with your PageIndex API key

# Run the server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create new account |
| POST | `/auth/login` | Get JWT token |
| GET | `/auth/me` | Get current user |

### Documents
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/documents/upload` | Upload PDF → PageIndex |
| GET | `/documents/` | List user's documents |
| GET | `/documents/{doc_id}/tree` | Get document tree structure |
| GET | `/documents/{doc_id}/status` | Check processing status |

### Query
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/query/ask` | Ask question about document(s) |

---

## 🔧 Environment Variables

```env
# PageIndex
PAGEINDEX_API_KEY=your_key_here

# JWT
JWT_SECRET_KEY=your-secret-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=1440

# Storage (Phase 2)
# STORAGE_TYPE=local
# AWS_S3_BUCKET=arcaive-documents
```

---

## 📍 Roadmap

- [x] Project scaffolding & architecture
- [x] Frontend design (Landing, Auth, App)
- [ ] FastAPI backend with JWT auth
- [ ] PageIndex API integration
- [ ] Document upload & tree generation
- [ ] Query engine with reasoning paths
- [ ] Dashboard analytics
- [ ] File storage (local → S3)
- [ ] Deployment (Vercel + Railway/Render)

---

## 🛠️ Tech Stack

**Backend:** Python, FastAPI, JWT (python-jose), PageIndex SDK
**Frontend:** React, Vite, TypeScript (planned)
**Storage:** Local filesystem → AWS S3 (planned)
**AI:** PageIndex (reasoning-based RAG), OpenAI (via PageIndex)

---

## 👤 Author

**Saurabh Vyawahare**
- GitHub: [@Saurabh-Vyawahare](https://github.com/Saurabh-Vyawahare)
- LinkedIn: [Saurabh Vyawahare](https://linkedin.com/in/saurabh-vyawahare)

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
