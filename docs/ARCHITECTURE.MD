# 01 — Architecture Decision & Module Design
## Smart City Network Visualization Platform (SCNVP)

---

## 1. Architecture Decision

### ✅ Chosen: Modular Monolith → Selective Microservice Migration

**Why NOT pure Microservices from day 1:**
- 2-person team → overhead kills velocity
- Microservices require DevOps maturity (service mesh, distributed tracing, API gateway at day 0)
- Premature distribution = premature optimization for MVP scale
- Debugging across 10 services in month 1 is a trap

**Why NOT pure Monolith:**
- Simulation Engine (Python/NetworkX) is a different runtime → must be external
- AI Service (LangChain/Ollama) has different scaling needs
- Locks you into one tech stack forever

### Architecture: Modular Monolith Core + 2 External Services

```
┌──────────────────────────────────────────────────────┐
│                    FRONTEND (React/Vite)              │
│   Dashboard | Canvas | Inspector | AI Panel | Mgmt   │
└──────────────────┬───────────────────────────────────┘
                   │ HTTPS / WebSocket
┌──────────────────▼───────────────────────────────────┐
│              API GATEWAY (NestJS)                    │
│   Auth | Rate Limit | Request Routing | Logging      │
└───┬──────────┬──────────┬───────────┬────────────────┘
    │          │          │           │
┌───▼──┐  ┌───▼──┐  ┌────▼──┐  ┌────▼──────────────┐
│ Auth │  │Proj  │  │Network│  │  Cost / Analytics  │
│Module│  │Module│  │Module │  │  Module            │
└──────┘  └──────┘  └───────┘  └────────────────────┘
    │          │          │           │
┌───▼──────────▼──────────▼───────────▼──────────────┐
│              PostgreSQL + Redis Cache               │
└─────────────────────────────────────────────────────┘
         │                          │
┌────────▼──────────┐     ┌─────────▼──────────────┐
│  AI Service        │     │  Simulation Service     │
│  (FastAPI/Python)  │     │  (FastAPI/NetworkX)     │
│  LangChain/Claude  │     │  Scapy/SimPy            │
└───────────────────┘     └────────────────────────┘
```

---

## 2. SOLID Principles Applied

### Single Responsibility
Each NestJS module owns exactly one domain:
- `AuthModule` → JWT, sessions, OAuth
- `ProjectModule` → CRUD projects, versioning
- `NetworkModule` → topology, nodes, connections
- `CostModule` → budget estimation formulas
- `SimulationModule` → proxy to simulation service
- `AIModule` → proxy to AI service
- `NotificationModule` → WebSocket events, alerts

### Open/Closed
- Node types extensible via `NodeTypeRegistry` (no switch-case hell)
- Cost formulas pluggable via strategy pattern
- AI prompts versioned and injectable

### Liskov Substitution
- `BaseDevice` → `RouterDevice`, `SwitchDevice`, `IoTDevice`
- Simulation providers: `NetworkXProvider`, `MockProvider` (for testing)

### Interface Segregation
```typescript
interface IReadableProject { get(id: string): Project }
interface IWritableProject { create(dto): Project; update(id, dto): Project }
interface IProjectRepository extends IReadableProject, IWritableProject {}
```

### Dependency Inversion
- All services depend on interfaces, not concrete repos
- Repositories injected via NestJS DI container

---

## 3. Design Patterns

| Pattern | Where Used | Why |
|---------|-----------|-----|
| Repository Pattern | All DB access | Testability, swap DB |
| Strategy Pattern | Cost calculation, AI provider | Extensible formulas |
| Observer / Event Emitter | Simulation status, alerts | Decouple simulation from UI |
| Command Pattern | Network actions (undo/redo) | Canvas history |
| Factory Pattern | Node creation | Dynamic node type instantiation |
| Facade Pattern | AI Service client | Hide LangChain complexity |
| Circuit Breaker | AI/Sim external calls | Resilience |

---

## 4. Module Breakdown

### Frontend Modules (Dev A owns)

```
src/
├── modules/
│   ├── auth/           # Login, register, session
│   ├── dashboard/      # Overview metrics, alerts
│   ├── canvas/         # Network topology builder (main)
│   │   ├── nodes/      # Node components by type
│   │   ├── edges/      # Connection renderers
│   │   ├── toolbar/    # Device palette, tools
│   │   ├── inspector/  # Right panel - node details
│   │   └── hooks/      # useCanvas, useHistory, useDrag
│   ├── visualization/  # 3D viewer (Month 3)
│   │   ├── scene/
│   │   ├── models/
│   │   └── animation/
│   ├── ai-panel/       # Chat + recommendations
│   ├── project/        # Save/load/share projects
│   ├── cost/           # Budget display, breakdown
│   └── simulation/     # Simulation control + metrics
├── shared/
│   ├── components/     # Button, Modal, Tooltip, etc.
│   ├── hooks/          # useWebSocket, useAuth, useApi
│   ├── store/          # Zustand stores
│   └── types/          # TypeScript interfaces
└── lib/
    ├── api.ts          # Axios client
    └── socket.ts       # Socket.IO client
```

### Backend Modules (Dev B owns)

```
src/
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/     # JWT, Local
│   │   └── guards/
│   ├── project/
│   │   ├── project.controller.ts
│   │   ├── project.service.ts
│   │   └── project.repository.ts
│   ├── network/
│   │   ├── network.controller.ts
│   │   ├── network.service.ts
│   │   ├── nodes/
│   │   │   ├── node.service.ts
│   │   │   └── node-type.registry.ts
│   │   └── connections/
│   ├── cost/
│   │   ├── cost.service.ts
│   │   └── strategies/     # capex.strategy.ts, opex.strategy.ts
│   ├── simulation/
│   │   ├── simulation.controller.ts
│   │   ├── simulation.service.ts
│   │   └── simulation.client.ts   # HTTP client to Python service
│   ├── ai/
│   │   ├── ai.controller.ts
│   │   ├── ai.service.ts
│   │   └── ai.client.ts           # HTTP client to AI service
│   └── notification/
│       ├── notification.gateway.ts  # WebSocket
│       └── notification.service.ts
├── shared/
│   ├── database/       # Prisma schema, migrations
│   ├── guards/         # RoleGuard, ThrottleGuard
│   ├── interceptors/   # LoggingInterceptor, TransformInterceptor
│   ├── filters/        # GlobalExceptionFilter
│   └── decorators/     # @CurrentUser, @Roles
└── config/
    ├── app.config.ts
    ├── db.config.ts
    └── jwt.config.ts
```

### Simulation Service (Python/FastAPI — Dev B owns)

```
simulation/
├── main.py
├── routers/
│   ├── topology.py     # Build graph from JSON
│   ├── simulate.py     # Run simulations
│   └── analyze.py      # Bottleneck, SPOF detection
├── engines/
│   ├── networkx_engine.py
│   ├── traffic_engine.py
│   └── failure_engine.py
└── models/
    ├── topology.py
    └── metrics.py
```

### AI Service (Python/FastAPI — Dev A owns for prompts, Dev B for infra)

```
ai-service/
├── main.py
├── routers/
│   ├── chat.py         # Conversational AI
│   ├── suggest.py      # Architecture suggestions
│   ├── generate.py     # Auto topology generation
│   └── codegen.py      # Config/code generation
├── chains/
│   ├── topology_chain.py
│   └── cost_chain.py
└── prompts/
    ├── suggest.md
    ├── generate.md
    └── codegen.md
```

---

## 5. Database Design

### PostgreSQL (via Prisma)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          UserRole  @default(STUDENT)
  experienceLevel String?
  projects      Project[]
  createdAt     DateTime  @default(now())
}

model Project {
  id          String    @id @default(cuid())
  name        String
  description String?
  cityName    String?
  scale       ProjectScale
  budget      Float?
  status      ProjectStatus @default(DRAFT)
  ownerId     String
  owner       User      @relation(fields: [ownerId], references: [id])
  network     Network?
  snapshots   Snapshot[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Network {
  id          String    @id @default(cuid())
  projectId   String    @unique
  project     Project   @relation(fields: [projectId], references: [id])
  nodes       NetworkNode[]
  connections Connection[]
  metadata    Json?     # canvas viewport, zoom, etc.
}

model NetworkNode {
  id          String    @id @default(cuid())
  networkId   String
  network     Network   @relation(fields: [networkId], references: [id])
  type        NodeType
  label       String
  posX        Float
  posY        Float
  posZ        Float?    # for 3D
  config      Json?     # device-specific config
  status      NodeStatus @default(ACTIVE)
  cost        Float?
}

model Connection {
  id          String    @id @default(cuid())
  networkId   String
  network     Network   @relation(fields: [networkId], references: [id])
  sourceId    String
  targetId    String
  bandwidth   Int?      # Mbps
  latency     Int?      # ms
  linkType    LinkType  # FIBER, WIRELESS, COPPER, MPLS
  cost        Float?
}

model Simulation {
  id          String    @id @default(cuid())
  projectId   String
  type        SimType
  status      SimStatus
  results     Json?
  metrics     Json?
  duration    Int?      # seconds
  createdAt   DateTime  @default(now())
}

model AIRecommendation {
  id              String    @id @default(cuid())
  projectId       String
  type            RecommendationType
  recommendation  String
  severity        Severity
  confidenceScore Float
  dismissed       Boolean   @default(false)
  createdAt       DateTime  @default(now())
}

enum UserRole { STUDENT ENGINEER ARCHITECT COMPANY ADMIN }
enum ProjectScale { SMALL MEDIUM LARGE CITY_SCALE }
enum ProjectStatus { DRAFT ACTIVE ARCHIVED }
enum NodeType { ISP_ROUTER DATACENTER BACKBONE_SWITCH EDGE_ROUTER OFFICE CCTV TRAFFIC_CONTROLLER IOT_HUB PUBLIC_WIFI WAREHOUSE DRONE_PORT }
enum NodeStatus { ACTIVE INACTIVE FAILED WARNING }
enum LinkType { FIBER WIRELESS COPPER MPLS VLAN }
enum SimType { PACKET_ROUTING CONGESTION FAILURE DDOS TRAFFIC_LOAD }
enum SimStatus { PENDING RUNNING COMPLETED FAILED }
enum Severity { LOW MEDIUM HIGH CRITICAL }
```

---

## 6. Tech Stack Finalized

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| TailwindCSS | 3.x | Styling |
| shadcn/ui | latest | Component library |
| Zustand | 4.x | State management |
| React Flow | 11.x | 2D topology canvas |
| Three.js + R3F | latest | 3D visualization (Month 3) |
| D3.js | 7.x | Charts, heatmaps |
| Socket.IO client | 4.x | Realtime |
| Framer Motion | 11.x | Animations |
| Axios | 1.x | HTTP client |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| NestJS | 10.x | API framework |
| TypeScript | 5.x | Type safety |
| Prisma | 5.x | ORM |
| PostgreSQL | 16.x | Primary DB |
| Redis | 7.x | Cache, sessions |
| Socket.IO | 4.x | WebSocket server |
| JWT | — | Auth tokens |
| Passport.js | — | Auth strategies |

### External Services
| Technology | Purpose |
|-----------|---------|
| FastAPI (Python) | Simulation + AI service |
| NetworkX | Graph algorithms, simulation |
| LangChain | AI orchestration |
| Claude API / Ollama | LLM backend |
| Docker Compose | Local development |
| Nginx | Reverse proxy |

---

## 7. API Design Principles

- RESTful for CRUD operations
- WebSocket (Socket.IO) for realtime events
- JWT Bearer token authentication
- Versioned endpoints: `/api/v1/...`
- Consistent response envelope:

```json
{
  "success": true,
  "data": {},
  "meta": { "page": 1, "total": 100 },
  "error": null
}
```

- Global error filter returns:
```json
{
  "success": false,
  "data": null,
  "error": { "code": "NOT_FOUND", "message": "Project not found" }
}
```