# 02 — 4-Month Roadmap & Sprint Plan
## Smart City Network Visualization Platform (SCNVP)

> **Team**: Dev A (Frontend/AI) | Dev B (Backend/Infra)
> **Methodology**: Scrum, 2-week sprints, async-first

---

## Timeline Overview

```
Month 1 (Sprints 1–2): Foundation + MVP Shell
Month 2 (Sprints 3–4): Core Features + AI Integration
Month 3 (Sprints 5–6): Simulation + 3D Visualization  
Month 4 (Sprints 7–8): Polish + Testing + Deploy
```

---

## Month 1 — Foundation & MVP Shell

### Sprint 1 (Week 1–2): Project Setup + Auth + Canvas Skeleton

#### Dev A — Frontend Lead
- [ ] Init React + Vite + TypeScript + Tailwind + shadcn/ui
- [ ] Setup Zustand store architecture (auth, project, network)
- [ ] Build Auth pages (Login, Register, forgot password)
- [ ] Build main layout: Sidebar + TopBar + Content area
- [ ] Integrate React Flow for 2D canvas
- [ ] Build device palette (drag source) — static node types
- [ ] Build basic canvas: drop nodes, move nodes, delete nodes
- [ ] Basic node inspector panel (static, no API yet)

#### Dev B — Backend Lead
- [ ] Init NestJS + Prisma + PostgreSQL
- [ ] Docker Compose: postgres, redis, api
- [ ] Prisma schema: User, Project, Network, NetworkNode, Connection
- [ ] AuthModule: register, login, refresh token (JWT)
- [ ] JWT Guard + CurrentUser decorator
- [ ] Roles enum + RoleGuard setup
- [ ] Nginx reverse proxy config
- [ ] `.env` management + config service
- [ ] Health check endpoint

**Sprint 1 Goal**: Can register, log in, see empty canvas ✅

---

### Sprint 2 (Week 3–4): Project CRUD + Canvas Persistence

#### Dev A — Frontend Lead
- [ ] Project dashboard page (list projects, create, delete)
- [ ] Canvas: connect nodes with edges (React Flow custom edges)
- [ ] Save canvas state to Zustand + auto-save indicator
- [ ] API integration: auth endpoints
- [ ] API integration: project CRUD endpoints
- [ ] API integration: save/load network topology
- [ ] Node type icons + labels (ISP, Datacenter, Switch, Office, CCTV, IoT)
- [ ] Basic cost sidebar: show per-node cost estimate (static)

#### Dev B — Backend Lead
- [ ] ProjectModule: CRUD + ownership check
- [ ] NetworkModule: save/load topology (nodes + connections)
- [ ] NetworkNode: create, update position, delete
- [ ] Connection: create, update, delete
- [ ] Redis caching for project list
- [ ] Input validation (class-validator DTOs)
- [ ] GlobalExceptionFilter + logging interceptor
- [ ] Postman collection for all Sprint 1–2 endpoints

**Sprint 2 Goal**: Full project create → build topology → save → reload flow ✅

---

## Month 2 — Core Features + AI Integration

### Sprint 3 (Week 5–6): Cost Engine + AI Chat (Basic)

#### Dev A — Frontend Lead
- [ ] Cost breakdown panel: CAPEX/OPEX per node/link
- [ ] Cost summary card: total, by district, by type
- [ ] AI Panel component: chat UI (message bubbles, input, streaming)
- [ ] AI integration: connect to AI service chat endpoint
- [ ] Markdown rendering in AI responses
- [ ] AI suggestion cards: dismissible recommendations in sidebar
- [ ] Keyboard shortcuts for canvas (del, ctrl+z, ctrl+y)
- [ ] Canvas undo/redo via Zustand command pattern

#### Dev B — Backend Lead
- [ ] CostModule: strategy pattern (CAPEX per NodeType, link cost)
- [ ] Cost calculation API: POST /cost/estimate with topology
- [ ] FastAPI AI service skeleton + Docker container
- [ ] LangChain setup + Claude/OpenAI provider
- [ ] AI chat endpoint: streaming response (SSE)
- [ ] System prompts: network expert persona
- [ ] AI recommendation endpoint: analyze topology → suggestions
- [ ] Rate limiting on AI endpoints (per user/minute)

**Sprint 3 Goal**: Can get cost estimate + chat with AI assistant ✅

---

### Sprint 4 (Week 7–8): Advanced Node Types + Project Management Module

#### Dev A — Frontend Lead
- [ ] All node types rendered with distinct icons/colors
- [ ] Smart City nodes: CCTV, Traffic Light, IoT Hub, Public WiFi
- [ ] Logistics nodes: Warehouse, Drone Port, Smart Locker
- [ ] Node config form in inspector (bandwidth, VLAN, IP range)
- [ ] Zone/district grouping on canvas (selection + label)
- [ ] Deployment Timeline tab: Gantt chart (D3.js)
- [ ] Project settings: name, city, scale, budget
- [ ] Snapshot/version history UI

#### Dev B — Backend Lead
- [ ] NodeTypeRegistry: config schema per node type
- [ ] Zone/district entity (group of nodes)
- [ ] Snapshot service: save named versions
- [ ] Deployment phase calculation API
- [ ] Timeline estimation: nodes → phases → duration → staff
- [ ] AI auto-topology endpoint: text prompt → JSON topology
- [ ] Webhook/event system for simulation status updates
- [ ] API documentation: Swagger/OpenAPI setup

**Sprint 4 Goal**: Professional project management + auto-topology from AI ✅

---

## Month 3 — Simulation + 3D Visualization

### Sprint 5 (Week 9–10): Simulation Engine + Metrics

#### Dev A — Frontend Lead
- [ ] Simulation control panel: start, stop, pause
- [ ] Real-time metrics display: latency, throughput, packet loss
- [ ] Node status animation on canvas (color = status)
- [ ] Failure simulation: click node → mark as failed → visual feedback
- [ ] Traffic heatmap overlay on 2D canvas (D3.js)
- [ ] Simulation history list + results comparison
- [ ] Alert notification system (toast + sidebar alerts)
- [ ] WebSocket integration for live simulation events

#### Dev B — Backend Lead
- [ ] FastAPI Simulation service: NetworkX graph builder
- [ ] Simulation endpoints: start, status, results
- [ ] Packet routing simulation: shortest path, load
- [ ] Bottleneck detection: identify overloaded links
- [ ] SPOF (Single Point of Failure) analysis
- [ ] Device failure cascade simulation
- [ ] WebSocket gateway: broadcast simulation events
- [ ] SimulationModule in NestJS: proxy + status tracking

**Sprint 5 Goal**: Run simulation, see live metrics, identify bottlenecks ✅

---

### Sprint 6 (Week 11–12): 3D Visualization Engine

#### Dev A — Frontend Lead
- [ ] Three.js / React Three Fiber scene setup
- [ ] City ground plane + grid
- [ ] 3D node models: box geometries with textures per type
- [ ] 3D connections: tube geometries + colors by link type
- [ ] Camera controls: orbit, zoom, pan
- [ ] 2D ↔ 3D toggle (same data, different view)
- [ ] Traffic flow animation: particles along connections
- [ ] Node click in 3D → opens inspector
- [ ] Day/night mode for 3D scene

#### Dev B — Backend Lead
- [ ] 3D position storage in NetworkNode (posZ field)
- [ ] Auto-layout algorithm: 2D coords → 3D city layout
- [ ] Network export: JSON, PNG (canvas screenshot API)
- [ ] AI code generation endpoint: topology → Cisco/MikroTik config
- [ ] Config template engine (Jinja2 in Python)
- [ ] Learning platform: tutorial CRUD API
- [ ] Performance optimization: Redis caching for heavy topology queries

**Sprint 6 Goal**: Full 3D city visualization with traffic animation ✅

---

## Month 4 — Polish, Testing & Deploy

### Sprint 7 (Week 13–14): Testing + Security Hardening

#### Dev A — Frontend Lead
- [ ] Unit tests: custom hooks (useCanvas, useWebSocket)
- [ ] Component tests: Canvas, Inspector, AI Panel (Vitest + Testing Library)
- [ ] E2E tests: full user flows (Playwright)
  - Login → create project → build topology → save → reload
  - AI chat → get suggestion → apply to canvas
  - Run simulation → view results
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance: lazy loading, React.memo, canvas virtualization
- [ ] Error boundaries for all major modules
- [ ] Loading skeletons for all async operations

#### Dev B — Backend Lead
- [ ] Unit tests: all services (Jest + mock repos)
- [ ] Integration tests: all API endpoints
- [ ] E2E API tests: Supertest
- [ ] Security: input sanitization, SQL injection prevention (Prisma)
- [ ] Security: XSS headers, CORS config, Helmet.js
- [ ] Security: JWT rotation, refresh token blacklist
- [ ] Rate limiting: per-user, per-IP
- [ ] OWASP Top 10 checklist review
- [ ] Database backups + migration scripts

**Sprint 7 Goal**: > 80% test coverage, security hardened ✅

---

### Sprint 8 (Week 15–16): Production Deploy + Documentation

#### Dev A — Frontend Lead
- [ ] Production build optimization (code splitting, tree shaking)
- [ ] Environment config: staging vs production
- [ ] Deploy frontend: Vercel / Netlify / S3+CloudFront
- [ ] User onboarding flow: tutorial overlay for new users
- [ ] Demo project: pre-built city topology for showcase
- [ ] Analytics integration: error tracking (Sentry)
- [ ] Final UI polish pass: spacing, animations, responsiveness
- [ ] User documentation / help center pages

#### Dev B — Backend Lead
- [ ] Docker production images: multi-stage builds
- [ ] Kubernetes deployment manifests (or Docker Swarm)
- [ ] CI/CD pipeline: GitHub Actions (test → build → deploy)
- [ ] Production PostgreSQL: managed (RDS or Supabase)
- [ ] Redis cluster config
- [ ] Monitoring: Prometheus + Grafana dashboards
- [ ] Log aggregation: structured logging → CloudWatch/Loki
- [ ] SSL certificates, domain config
- [ ] API rate limit production tuning
- [ ] Runbook documentation

**Sprint 8 Goal**: Live on production URL, monitored, documented ✅

---

## Delivery Milestones

| Milestone | Date | Success Criteria |
|-----------|------|-----------------|
| M1: Auth + Canvas | End Week 2 | Login works, can drop nodes on canvas |
| M2: Save/Load | End Week 4 | Full topology persistence |
| M3: AI + Cost | End Week 6 | AI chat + cost estimate working |
| M4: Full Feature | End Week 8 | Auto-topology, project mgmt, gantt |
| M5: Simulation | End Week 10 | Run sim, see metrics, identify SPOF |
| M6: 3D Viz | End Week 12 | 3D city view with animation |
| M7: Tested | End Week 14 | >80% coverage, security review done |
| M8: Production | End Week 16 | Live URL, monitoring active |