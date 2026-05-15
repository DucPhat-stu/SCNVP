# 🏙️ Smart City Network Visualization Platform (SCNVP)

> **2-Member Team • 4-Month Roadmap • Web-First Architecture**

A web-based platform for designing, simulating, and managing city-scale network infrastructure with AI assistance.

---

## 🏗️ Architecture

**Modular Monolith** (NestJS) + 2 External Python Services

| Component       | Tech Stack                        | Port  |
|-----------------|-----------------------------------|-------|
| **Frontend**    | React 18 + Vite + TypeScript + TailwindCSS | 3000  |
| **Backend**     | NestJS 10 + Prisma + PostgreSQL   | 4000  |
| **AI Service**  | FastAPI + LangChain + Claude      | 8001  |
| **Simulation**  | FastAPI + NetworkX + SimPy        | 8002  |
| **Database**    | PostgreSQL 16                     | 5432  |
| **Cache**       | Redis 7                           | 6379  |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 16 (or use Docker)

### Option A: Docker (recommended)

```bash
# Clone & start everything
cp .env.example .env
docker compose up --build
```

| Service    | URL                        |
|------------|----------------------------|
| Frontend   | http://localhost:3000       |
| Backend    | http://localhost:4000       |
| API Health | http://localhost:4000/api/v1/health |

### Option B: Local Development

```bash
# Install all dependencies
npm install

# Start frontend (terminal 1)
cd frontend && npm run dev

# Start backend (terminal 2)
cd backend && npm run start:dev

# Start simulation service (terminal 3)
cd simulation && pip install -r requirements.txt && uvicorn main:app --port 8002

# Start AI service (terminal 4)
cd ai-service && pip install -r requirements.txt && uvicorn main:app --port 8001
```

---

## 📁 Project Structure

```
SCNVP/
├── frontend/           # React + Vite + TypeScript
│   ├── src/
│   │   ├── modules/    # Feature modules (auth, canvas, dashboard, ai-panel…)
│   │   ├── shared/     # Components, hooks, stores, types
│   │   └── lib/        # API client, Socket.IO, contracts
│   └── Dockerfile
├── backend/            # NestJS + Prisma
│   ├── src/
│   │   ├── modules/    # Auth, Project, Network, Cost, Simulation, AI, Notification
│   │   ├── shared/     # Guards, filters, interceptors, decorators
│   │   └── config/     # App, DB, JWT config
│   ├── prisma/         # Schema & migrations
│   └── Dockerfile
├── simulation/         # FastAPI + NetworkX
├── ai-service/         # FastAPI + LangChain
├── nginx/              # Reverse proxy config
├── docs/               # Architecture, API, BA, SRS, Roadmap…
├── docker-compose.yml
└── .env.example
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.MD) | Module design, SOLID, patterns |
| [Roadmap](docs/ROADMAP.MD) | 4-month sprint plan |
| [BA Analysis](docs/BA.md) | User roles, use cases, ER diagram |
| [API Endpoints](docs/API%20ENDPOINT.MD) | Full REST + WebSocket reference |
| [SRS](docs/SRS) | Functional & non-functional requirements |
| [User Flows](docs/FLOW.MD) | Per-role journeys & state machines |
| [Sprint Tasks](docs/TaskSprint.md) | Jira-format task breakdown |

---

## 👥 Team

| Member   | Role                  | Scope                                      |
|----------|-----------------------|--------------------------------------------|
| **Dev A** | Frontend / AI Integration | React Canvas, 3D Viz, AI Chat, UI/UX      |
| **Dev B** | Backend / Infrastructure  | APIs, DB, Auth, Simulation, DevOps         |

---

## 📜 License

MIT
