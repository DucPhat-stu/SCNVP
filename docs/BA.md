# 03 — BA Analysis: User Roles, Use Cases & Diagrams
## Smart City Network Visualization Platform (SCNVP)

---

## 1. Stakeholder & User Role Matrix

| Role | Primary Goal | Key Actions | Pain Points Solved |
|------|-------------|-------------|-------------------|
| **Student** | Learn networking visually | Build labs, follow tutorials, ask AI tutor | Abstract concepts, no visual feedback |
| **Engineer** | Design real infrastructure | Build topology, run simulation, generate configs | No city-scale tools, slow planning |
| **Architect** | Plan large-scale city networks | Multi-zone planning, cost estimation, AI optimization | Cost + complexity estimation gap |
| **Company/Enterprise** | Simulate before deploying | Full simulation, ROI calc, team collaboration | Risk of bad deployment decisions |
| **Admin** | Manage platform | User management, analytics, content moderation | N/A (internal) |

---

## 2. Use Case Diagrams (Text/Mermaid Format)

### 2.1 System-Level Use Case

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCNVP System                                  │
│                                                                   │
│  ┌─────────────┐    ┌──────────────────────────────────────────┐ │
│  │  Student    │───▶│ UC-01: View Tutorial                     │ │
│  │             │───▶│ UC-02: Build Practice Network            │ │
│  │             │───▶│ UC-03: Ask AI Tutor                      │ │
│  └─────────────┘    │ UC-04: Run Guided Simulation             │ │
│                     └──────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────┐    ┌──────────────────────────────────────────┐ │
│  │  Engineer   │───▶│ UC-05: Create Network Project            │ │
│  │             │───▶│ UC-06: Design Topology (drag/drop)       │ │
│  │             │───▶│ UC-07: Run Simulation                    │ │
│  │             │───▶│ UC-08: Generate Device Configs           │ │
│  │             │───▶│ UC-09: Export Documentation              │ │
│  └─────────────┘    └──────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────┐    ┌──────────────────────────────────────────┐ │
│  │  Architect  │───▶│ UC-10: Plan City-Scale Network           │ │
│  │             │───▶│ UC-11: Estimate CAPEX/OPEX               │ │
│  │             │───▶│ UC-12: AI Optimization Request           │ │
│  │             │───▶│ UC-13: Multi-Zone Design                 │ │
│  └─────────────┘    │ UC-14: Deployment Phase Planning         │ │
│                     └──────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────┐    ┌──────────────────────────────────────────┐ │
│  │  Company    │───▶│ UC-15: Full Infrastructure Simulation     │ │
│  │             │───▶│ UC-16: Risk Analysis Report              │ │
│  │             │───▶│ UC-17: Snapshot & Version Control        │ │
│  │             │───▶│ UC-18: Share Project (read-only link)    │ │
│  └─────────────┘    └──────────────────────────────────────────┘ │
│                                                                   │
│  ┌─────────────┐    ┌──────────────────────────────────────────┐ │
│  │   Admin     │───▶│ UC-19: Manage Users                      │ │
│  │             │───▶│ UC-20: View Platform Analytics           │ │
│  │             │───▶│ UC-21: Manage Node Type Library          │ │
│  └─────────────┘    └──────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

### 2.2 Entity-Relationship Diagram (Conceptual)

```
USER ─────────── owns ──────────── PROJECT
  │                                    │
  │ has role                           │ contains
  ▼                                    ▼
USER_ROLE                           NETWORK
(Student/Engineer/                     │
 Architect/Company/                    ├── NETWORK_NODE (many)
 Admin)                                │        │
                                       │        ├── type (NodeType)
                                       │        ├── position (x,y,z)
                                       │        └── config (JSON)
                                       │
                                       └── CONNECTION (many)
                                                │
                                                ├── source → NODE
                                                ├── target → NODE
                                                └── linkType

PROJECT ─── has many ─── SIMULATION
              │               │
              │               └── METRICS (JSON)
              │
              ├── has many ─── AI_RECOMMENDATION
              │
              ├── has many ─── SNAPSHOT
              │
              └── has many ─── DEPLOYMENT_PHASE
```

---

### 2.3 Sequence Diagrams by Key Flow

#### Flow A: Engineer Builds and Simulates Topology

```
Engineer      Frontend       API Gateway    Network Svc   Sim Service
   │               │               │              │            │
   │──create proj──▶               │              │            │
   │               │──POST /proj───▶              │            │
   │               │◀──proj_id─────│              │            │
   │◀──project view─│               │              │            │
   │               │               │              │            │
   │──drag nodes───▶               │              │            │
   │──connect──────▶               │              │            │
   │──save canvas──▶               │              │            │
   │               │──PUT /network─▶──save nodes──▶            │
   │               │◀──saved───────│◀─────────────│            │
   │               │               │              │            │
   │──run sim──────▶               │              │            │
   │               │──POST /sim────▶──────────────────────────▶│
   │               │◀──sim_id──────│              │            │
   │               │    (WS event: sim.started)   │            │
   │               │◀───────────────────────────────────────── │
   │◀──metrics live─│              │              │   (WS events: metrics)
   │               │◀──────────────────────────────────────────│
   │◀──results──────│              │              │            │
```

#### Flow B: Student AI Tutor Interaction

```
Student      AI Panel     API /ai/chat   AI Service   LLM (Claude)
   │             │              │              │            │
   │──type msg───▶              │              │            │
   │             │──POST stream─▶──────────────▶            │
   │             │              │              │──prompt────▶
   │             │              │              │◀──tokens───│
   │             │◀─────────────────── SSE stream ──────────│
   │◀──stream text│              │              │            │
   │   chunks     │              │              │            │
   │             │◀──[done]─────│◀─────────────│            │
   │◀──full resp──│              │              │            │
```

#### Flow C: Architect AI Auto-Topology Generation

```
Architect    Frontend    AI Service    Network Svc    Canvas
   │             │            │              │           │
   │──text prompt▶            │              │           │
   │             │──POST /ai/generate        │           │
   │             │────────────▶              │           │
   │             │            │──LLM call──▶ │           │
   │             │            │◀──JSON topo──│           │
   │             │◀──topology JSON           │           │
   │             │──POST /network/import     │           │
   │             │──────────────────────────▶           │
   │             │◀──saved────│◀─────────────│           │
   │             │──render────────────────────────────── ▶
   │◀──see topo──│            │              │           │
```

---

## 3. Data Flow Diagram (Level 0 — Context Diagram)

```
                    ┌─────────────────────────────┐
                    │                             │
   Users ──────────▶│     SCNVP Platform          │──────────▶ Configs
  (5 roles)         │                             │            (Cisco/MK)
                    │  - Network Design           │
   LLM API ◀────────│  - AI Assistance            │──────────▶ Reports
  (Claude/Ollama)   │  - Simulation               │            (PDF/JSON)
                    │  - Cost Estimation          │
   External DB ◀────│  - Project Management       │──────────▶ Alerts
  (backup/export)   │                             │            (email/WS)
                    └─────────────────────────────┘
```

---

## 4. Business Rules

### BR-01: Project Ownership
- Users can only access their own projects (unless shared)
- Admin can access any project

### BR-02: Role-Based Feature Access

| Feature | Student | Engineer | Architect | Company | Admin |
|---------|---------|----------|-----------|---------|-------|
| Basic canvas | ✅ | ✅ | ✅ | ✅ | ✅ |
| AI chat | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cost estimation | ❌ | ✅ | ✅ | ✅ | ✅ |
| Simulation | ❌ (guided only) | ✅ | ✅ | ✅ | ✅ |
| 3D visualization | ✅ | ✅ | ✅ | ✅ | ✅ |
| Config export | ❌ | ✅ | ✅ | ✅ | ✅ |
| Auto-topology AI | ❌ | ✅ | ✅ | ✅ | ✅ |
| Deployment planning | ❌ | ❌ | ✅ | ✅ | ✅ |
| Project sharing | ❌ | ✅ | ✅ | ✅ | ✅ |
| User management | ❌ | ❌ | ❌ | ❌ | ✅ |

### BR-03: AI Rate Limits
- Student: 20 AI requests/hour
- Engineer: 100 AI requests/hour
- Architect: 200 AI requests/hour
- Company: 500 AI requests/hour

### BR-04: Project Scale Limits
- Student: Max 20 nodes per project
- Engineer: Max 200 nodes per project
- Architect/Company: Unlimited

### BR-05: Simulation Constraints
- Max concurrent simulations per user: 2
- Simulation timeout: 300 seconds
- Results stored for 30 days

---

## 5. Acceptance Criteria Summary (per Epic)

### Epic 1: Authentication
- AC: User can register with email + password
- AC: User receives JWT on login, expires in 15min
- AC: Refresh token rotates on every use
- AC: Role is assigned on registration

### Epic 2: Network Builder
- AC: User can drag nodes from palette to canvas
- AC: User can connect two nodes with an edge
- AC: Connections have configurable bandwidth and link type
- AC: Canvas state auto-saves every 30 seconds
- AC: User can undo/redo up to 50 actions

### Epic 3: AI Assistant
- AC: AI responds in < 3s for simple queries
- AC: AI suggests architecture improvements based on current topology
- AC: AI can generate a topology from natural language in < 10s
- AC: AI explains networking concepts when asked (student tutor mode)

### Epic 4: Simulation
- AC: Simulation starts in < 2s
- AC: Metrics update via WebSocket in < 500ms intervals
- AC: SPOF detection highlights affected nodes in red
- AC: Simulation results exportable as JSON

### Epic 5: Cost Engine
- AC: Cost recalculates when nodes/connections are added/removed
- AC: CAPEX and OPEX broken down by category
- AC: Total cost displayed in dashboard in real-time