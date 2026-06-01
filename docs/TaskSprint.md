# 10 — Jira-Format Sprint Breakdown
## Smart City Network Visualization Platform (SCNVP)
### Epic → Story → Task hierarchy | 2-week sprints | 2-member team

---

## Epic Structure

| Epic ID | Epic Name | Sprints |
|---------|-----------|---------|
| EP-01 | Authentication & User Management | Sprint 1 |
| EP-02 | Project Management | Sprint 1–2 |
| EP-03 | Network Canvas Builder | Sprint 1–2, 4 |
| EP-04 | Cost Engine | Sprint 3 |
| EP-05 | AI Assistant | Sprint 3–4 |
| EP-06 | Simulation Engine | Sprint 5 |
| EP-07 | 3D Visualization | Sprint 6 |
| EP-08 | Deployment Planning | Sprint 4 |
| EP-09 | Testing & Security | Sprint 7 |
| EP-10 | Production Deployment | Sprint 8 |

---

## SPRINT 1 — Foundation
**Duration:** Week 1–2  
**Goal:** Auth working, empty canvas renders, basic layout done  
**Capacity:** Dev A: 10 pts | Dev B: 10 pts

---

### EP-01: Authentication & User Management

#### [STORY] US-101: User Registration
> As a new user, I want to register with email and password so I can access the platform.

**Assignee:** Dev B  
**Story Points:** 3  
**Priority:** P0

Tasks:
- [ ] TASK-101a: Create User Prisma model + migration (0.5 pt)
- [ ] TASK-101b: `POST /api/v1/auth/register` endpoint with DTO validation (1 pt)
- [ ] TASK-101c: Bcrypt password hashing (0.5 pt)
- [ ] TASK-101d: JWT token generation + response (0.5 pt)
- [ ] TASK-101e: Unit test: AuthService.register (0.5 pt)

**Acceptance Criteria:**
- Duplicate email returns 409
- Password stored as hash (bcrypt, rounds=12)
- Response includes `token` and `refreshToken`
- Role defaults to provided value (validated against enum)

---

#### [STORY] US-102: User Login
> As a registered user, I want to log in so I can access my projects.

**Assignee:** Dev B  
**Story Points:** 2  
**Priority:** P0

Tasks:
- [ ] TASK-102a: `POST /api/v1/auth/login` endpoint (0.5 pt)
- [ ] TASK-102b: Passport Local strategy (0.5 pt)
- [ ] TASK-102c: JWT guard setup (0.5 pt)
- [ ] TASK-102d: Integration test: login flow (0.5 pt)

---

#### [STORY] US-103: Frontend Login & Register UI
> As a user, I want to see a polished auth screen to register and log in.

**Assignee:** Dev A  
**Story Points:** 3  
**Priority:** P0

Tasks:
- [x] TASK-103a: Login page with React Hook Form + validation (1 pt)
- [x] TASK-103b: Register page with role selector (1 pt)
- [x] TASK-103c: Zustand auth store: token storage, user state (0.5 pt)
- [x] TASK-103d: Auth API integration (useAuth hook) (0.5 pt)

---

### EP-02: Project Management (Sprint 1 part)

#### [STORY] US-104: Project Infrastructure Setup
> As a developer, I want the frontend scaffold and routing set up.

**Assignee:** Dev A  
**Story Points:** 2  
**Priority:** P0

Tasks:
- [x] TASK-104a: Vite + React + TS + Tailwind + shadcn setup (0.5 pt)
- [x] TASK-104b: React Router setup: /login, /dashboard, /project/:id/canvas (0.5 pt)
- [x] TASK-104c: Main layout: Sidebar + TopBar + Content (1 pt)

---

#### [STORY] US-105: Backend Infrastructure Setup
> As a developer, I want Docker Compose, NestJS, and Prisma configured.

**Assignee:** Dev B  
**Story Points:** 2  
**Priority:** P0

Tasks:
- [ ] TASK-105a: Docker Compose: postgres, redis, api services (0.5 pt)
- [ ] TASK-105b: NestJS init + ConfigService + env validation (0.5 pt)
- [ ] TASK-105c: Prisma setup + first migration (0.5 pt)
- [ ] TASK-105d: Health check endpoint + Nginx config (0.5 pt)

---

### EP-03: Network Canvas Builder (Sprint 1 part)

#### [STORY] US-106: Empty Canvas with Device Palette
> As an engineer, I want to see the canvas and device palette so I can start building.

**Assignee:** Dev A  
**Story Points:** 3  
**Priority:** P0

Tasks:
- [x] TASK-106a: Install + configure React Flow (0.5 pt)
- [x] TASK-106b: Device palette sidebar with node type icons (1 pt)
- [x] TASK-106c: Drag from palette → drop on canvas (1 pt)
- [x] TASK-106d: Node move, select, delete keyboard shortcut (0.5 pt)

---

## SPRINT 2 — Project CRUD & Topology Persistence
**Duration:** Week 3–4  
**Goal:** Save/load full topology, projects dashboard working  
**Capacity:** Dev A: 10 pts | Dev B: 10 pts

---

#### [STORY] US-201: Project CRUD API
> As an engineer, I want to create, list, update, and delete projects.

**Assignee:** Dev B  
**Story Points:** 3  
**Priority:** P0

Tasks:
- [ ] TASK-201a: Project Prisma model + migration (0.5 pt)
- [ ] TASK-201b: ProjectService: create, findAll, findOne, update, delete (1 pt)
- [ ] TASK-201c: ProjectController with ownership validation (1 pt)
- [ ] TASK-201d: Integration tests: all CRUD endpoints (0.5 pt)

---

#### [STORY] US-202: Network Topology Save/Load API
> As an engineer, I want my topology to be saved and restored exactly.

**Assignee:** Dev B  
**Story Points:** 4  
**Priority:** P0

Tasks:
- [ ] TASK-202a: NetworkNode + Connection Prisma models (0.5 pt)
- [ ] TASK-202b: NetworkService: bulk upsert nodes + connections (1.5 pt)
- [ ] TASK-202c: GET /network endpoint (0.5 pt)
- [ ] TASK-202d: PUT /network endpoint (bulk save) (1 pt)
- [ ] TASK-202e: Node CRUD endpoints (create, update, delete) (0.5 pt)

---

#### [STORY] US-203: Dashboard & Project List UI
> As a user, I want to see all my projects and create new ones from the dashboard.

**Assignee:** Dev A  
**Story Points:** 3  
**Priority:** P0

Tasks:
- [ ] TASK-203a: Dashboard page: project cards list (1 pt)
- [ ] TASK-203b: Create project modal (1 pt)
- [ ] TASK-203c: API integration: project list + create + delete (1 pt)

---

#### [STORY] US-204: Canvas Persistence & Auto-Save
> As a user, I want my canvas saved automatically so I don't lose work.

**Assignee:** Dev A  
**Story Points:** 4  
**Priority:** P0

Tasks:
- [ ] TASK-204a: API integration: load topology on canvas open (1 pt)
- [ ] TASK-204b: Canvas state → API save on Ctrl+S (0.5 pt)
- [ ] TASK-204c: Auto-save debounce (30s) with status indicator (1 pt)
- [ ] TASK-204d: Undo/redo with Zustand command pattern (1.5 pt)

---

## SPRINT 3 — Cost Engine + AI Chat
**Duration:** Week 5–6  
**Goal:** Cost estimate shown, AI chat streaming works  

---

#### [STORY] US-301: Cost Calculation API
**Assignee:** Dev B | Points: 4 | Priority: P1

Tasks:
- [ ] TASK-301a: Cost table constants (CAPEX per node type) (0.5 pt)
- [ ] TASK-301b: CostService with strategy pattern (1.5 pt)
- [ ] TASK-301c: POST /cost/estimate endpoint (0.5 pt)
- [ ] TASK-301d: Cost updates on network save (hook in NetworkService) (1 pt)
- [ ] TASK-301e: Unit tests: all cost strategies (0.5 pt)

---

#### [STORY] US-302: AI Service & Chat Endpoint
**Assignee:** Dev B | Points: 4 | Priority: P1

Tasks:
- [ ] TASK-302a: FastAPI AI service setup + Docker (1 pt)
- [ ] TASK-302b: LangChain + Claude API integration (1 pt)
- [ ] TASK-302c: POST /ai/chat with SSE streaming (1 pt)
- [ ] TASK-302d: Rate limiting per user (Redis counter) (1 pt)

---

#### [STORY] US-303: AI Chat UI + Cost Panel
**Assignee:** Dev A | Points: 6 | Priority: P1

Tasks:
- [ ] TASK-303a: AI panel component: chat bubbles, input, send (1.5 pt)
- [ ] TASK-303b: SSE streaming integration (EventSource) (1.5 pt)
- [ ] TASK-303c: Markdown rendering in AI responses (0.5 pt)
- [ ] TASK-303d: Cost panel: CAPEX/OPEX breakdown (1.5 pt)
- [ ] TASK-303e: Real-time cost update on canvas change (1 pt)

---

## SPRINT 4 — Advanced Nodes + Deployment Planning
**Duration:** Week 7–8  
**Goal:** All node types, AI auto-generate, Gantt chart  

---

#### [STORY] US-401: AI Suggest & Auto-Generate
**Assignee:** Dev B | Points: 5 | Priority: P1

Tasks:
- [ ] TASK-401a: POST /ai/suggest — topology analysis prompt (1.5 pt)
- [ ] TASK-401b: POST /ai/generate — natural language → topology JSON (2 pt)
- [ ] TASK-401c: POST /ai/codegen — Cisco/MikroTik config generation (1.5 pt)

---

#### [STORY] US-402: All Node Types + Zone Grouping
**Assignee:** Dev A | Points: 4 | Priority: P1

Tasks:
- [ ] TASK-402a: All 15 node types with icons + color coding (1.5 pt)
- [ ] TASK-402b: Node config form per type (VLAN, IP, bandwidth) (1.5 pt)
- [ ] TASK-402c: Zone grouping: lasso select + group label (1 pt)

---

#### [STORY] US-403: Deployment Planning Module
**Assignee:** Dev A (UI) + Dev B (API) | Points: 4 | Priority: P2

Tasks:
- [ ] TASK-403a: Deployment phase calculation API (Dev B, 1.5 pt)
- [ ] TASK-403b: Gantt chart component (D3.js) (Dev A, 1.5 pt)
- [ ] TASK-403c: Timeline integration with project (1 pt)

---

## SPRINT 5 — Simulation Engine
**Duration:** Week 9–10  
**Goal:** Run simulation, see live metrics, SPOF detection  

---

#### [STORY] US-501: FastAPI Simulation Service
**Assignee:** Dev B | Points: 6 | Priority: P0

Tasks:
- [ ] TASK-501a: NetworkX graph builder from topology JSON (1 pt)
- [ ] TASK-501b: Shortest path + routing simulation (1 pt)
- [ ] TASK-501c: SPOF detection algorithm (1 pt)
- [ ] TASK-501d: Traffic load simulation (1 pt)
- [ ] TASK-501e: Device failure cascade (1 pt)
- [ ] TASK-501f: pytest: all simulation algorithms (1 pt)

---

#### [STORY] US-502: Simulation WebSocket Integration
**Assignee:** Dev B | Points: 4 | Priority: P0

Tasks:
- [ ] TASK-502a: SimulationModule in NestJS + job queue (BullMQ) (1.5 pt)
- [ ] TASK-502b: WebSocket gateway: broadcast simulation events (1.5 pt)
- [ ] TASK-502c: POST /simulation/start, GET /simulation/:id (1 pt)

---

#### [STORY] US-503: Simulation UI
**Assignee:** Dev A | Points: 6 | Priority: P0

Tasks:
- [ ] TASK-503a: Simulation control panel (start/stop) (1 pt)
- [ ] TASK-503b: WebSocket client: receive metrics events (1 pt)
- [ ] TASK-503c: Live metrics charts (latency, throughput, packet loss) (1.5 pt)
- [ ] TASK-503d: SPOF highlighting on canvas (node color = red) (1 pt)
- [ ] TASK-503e: Traffic heatmap overlay (D3.js) (1.5 pt)

---

## SPRINT 6 — 3D Visualization
**Duration:** Week 11–12  
**Goal:** 3D city view with traffic animation, 2D↔3D toggle  

---

#### [STORY] US-601: Three.js 3D Scene
**Assignee:** Dev A | Points: 8 | Priority: P1

Tasks:
- [ ] TASK-601a: React Three Fiber scene setup + camera controls (1.5 pt)
- [ ] TASK-601b: 3D node models per type (box + material) (2 pt)
- [ ] TASK-601c: 3D connections as tube geometries (1 pt)
- [ ] TASK-601d: Traffic particle animation along connections (2 pt)
- [ ] TASK-601e: 2D↔3D toggle (same Zustand store) (1 pt)
- [ ] TASK-601f: Day/night mode (lighting change) (0.5 pt)

---

#### [STORY] US-602: 3D Layout + Export
**Assignee:** Dev B | Points: 4 | Priority: P2

Tasks:
- [ ] TASK-602a: 2D → 3D position auto-layout algorithm (1.5 pt)
- [ ] TASK-602b: JSON topology export endpoint (0.5 pt)
- [ ] TASK-602c: AI codegen: full config for all nodes in project (1 pt)
- [ ] TASK-602d: Performance: Redis cache for large topology queries (1 pt)

---

## SPRINT 7 — Testing & Security
**Duration:** Week 13–14  

---

#### [STORY] US-701: Backend Testing
**Assignee:** Dev B | Points: 6

- Unit tests all services (2 pt)
- Integration tests all endpoints (2 pt)
- Security hardening (Helmet, CORS, rate limits) (1 pt)
- OWASP checklist (1 pt)

---

#### [STORY] US-702: Frontend Testing
**Assignee:** Dev A | Points: 6

- Component tests: Canvas, AI Panel, Cost Panel (2 pt)
- Hook tests: useCanvas, useAuth, useSimulation (1.5 pt)
- E2E: 3 critical flows (Playwright) (2 pt)
- Error boundaries + loading states audit (0.5 pt)

---

## SPRINT 8 — Production Deploy
**Duration:** Week 15–16  

---

#### [STORY] US-801: CI/CD + Infra
**Assignee:** Dev B | Points: 6

- GitHub Actions: test → build → deploy pipeline (2 pt)
- Docker production multi-stage builds (1 pt)
- Kubernetes/Docker Swarm manifests (1.5 pt)
- Monitoring: Prometheus + Grafana + Sentry (1.5 pt)

---

#### [STORY] US-802: Frontend Production + UX Polish
**Assignee:** Dev A | Points: 6

- Production build optimization + code splitting (1 pt)
- Onboarding flow for new users (1.5 pt)
- Demo project: pre-built city topology (1 pt)
- Final UI polish: animations, spacing, responsiveness (1.5 pt)
- User help documentation (1 pt)

---

## Definition of Done (DoD)

All stories must meet:
- [ ] Code reviewed (1 reviewer minimum)
- [ ] Unit/integration test added
- [ ] Swagger updated (backend) or Storybook entry (frontend)
- [ ] No TypeScript `any` or `@ts-ignore`
- [ ] Deployed to staging environment
- [ ] Acceptance criteria verified against staging

---

## Sprint Ceremonies

| Ceremony | Frequency | Duration | Who |
|----------|-----------|----------|-----|
| Sprint Planning | Start of each sprint | 1h | Both |
| Daily Standup | Daily (async) | 15min (text) | Both |
| Sprint Review | End of each sprint | 30min | Both |
| Sprint Retro | End of each sprint | 30min | Both |
| Architecture Sync | Weekly | 30min | Both |
