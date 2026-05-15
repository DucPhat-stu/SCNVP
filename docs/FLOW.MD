# 05 — User Flows by Role & Harness Design
## Smart City Network Visualization Platform (SCNVP)

> Defines exact user journeys per role, state transitions, and harness contracts
> to prevent scope drift during vibecoding sessions.

---

## 1. Student Flow

### Primary Journey: "Learn BGP with AI Tutor"

```
[Landing Page]
     │
     ▼
[Register → Role: Student]
     │
     ▼
[Dashboard]
  ├── Recommended Tutorials (auto-shown for students)
  └── "New Practice Project" button
     │
     ▼
[Select Tutorial: "BGP Basics Lab"]
     │
     ▼
[Guided Canvas Opens]
  ├── Pre-placed nodes: 2 routers, 1 ISP
  ├── Step-by-step overlay panel (left)
  │     Step 1: Connect Router A → ISP
  │     Step 2: Connect Router B → ISP
  │     Step 3: Ask AI: "What is eBGP?"
  └── AI Panel (right) — tutor mode
     │
     ▼
[Complete Lab → Achievement Badge]
     │
     ▼
[Save Practice Project]
     │
     ▼
[Dashboard: Progress tracker updated]
```

### State Machine: Student Session
```
IDLE ──register──▶ AUTHENTICATED
AUTHENTICATED ──select tutorial──▶ IN_TUTORIAL
IN_TUTORIAL ──complete step──▶ IN_TUTORIAL (next step)
IN_TUTORIAL ──complete all──▶ TUTORIAL_COMPLETE
IN_TUTORIAL ──ask AI──▶ AI_RESPONDING ──▶ IN_TUTORIAL
TUTORIAL_COMPLETE ──save──▶ IDLE
```

### Feature Flags for Student Role
```typescript
STUDENT_FEATURES = {
  canvasNodeLimit: 20,
  aiRequestsPerHour: 20,
  showTutorialOverlay: true,
  showCostEstimator: false,
  showDeploymentPlanning: false,
  showConfigExport: false,
  allowCustomSimulation: false,  // guided only
}
```

---

## 2. Engineer Flow

### Primary Journey: "Design Branch Office Network"

```
[Dashboard]
  ├── My Projects list
  └── "New Project" button
     │
     ▼
[New Project Modal]
  ├── Name: "HCM Branch Office"
  ├── Scale: Medium
  ├── Budget: $50,000
  └── [Create]
     │
     ▼
[Canvas: Empty]
  ├── Device Palette (left)
  │     Core Infrastructure
  │     Enterprise
  │     Smart City
  │     Logistics
  └── Toolbar: select, connect, pan, zoom, undo, redo
     │
     ▼
[Build Topology]
  ├── Drag: Edge Router × 1
  ├── Drag: Core Switch × 2
  ├── Drag: Office × 3, Branch Office × 1
  ├── Drag: Firewall × 1
  ├── Connect nodes with edges
  │     Set: bandwidth, link type (FIBER/COPPER)
  └── Right-click node → Configure (VLAN, IP range)
     │
     ▼
[Inspector Panel (right)]
  ├── Node Details: type, label, cost
  ├── Connection stats: bandwidth, latency
  └── "Run Quick Analysis" button
     │
     ▼
[AI Panel suggests]
  └── "Consider adding redundant uplink to avoid SPOF on Core Switch 1"
     │
     ▼ (accept suggestion)
[Add redundant link → Cost updates]
     │
     ▼
[Cost Panel]
  ├── CAPEX: $12,400
  ├── OPEX: $800/month
  └── Breakdown: by device, by zone
     │
     ▼
[Run Simulation]
  ├── Select: Traffic Load test
  ├── Run → WebSocket metrics stream
  ├── View: latency, throughput, packet loss chart
  └── SPOF detected: highlighted red on canvas
     │
     ▼
[Export]
  ├── Generate Cisco IOS configs
  ├── Export topology as PDF
  └── Share read-only link
```

### State Machine: Engineer Project Lifecycle
```
PROJECT_CREATED ──add nodes──▶ TOPOLOGY_DRAFT
TOPOLOGY_DRAFT ──auto-save──▶ TOPOLOGY_SAVED
TOPOLOGY_SAVED ──run sim──▶ SIMULATING
SIMULATING ──metrics stream──▶ SIMULATING
SIMULATING ──complete──▶ SIM_COMPLETE
SIM_COMPLETE ──export──▶ EXPORTED
TOPOLOGY_SAVED ──get AI review──▶ AI_REVIEWING
AI_REVIEWING ──suggestions ready──▶ TOPOLOGY_DRAFT (with suggestions)
```

---

## 3. Architect Flow

### Primary Journey: "Design District-Level Smart City Network"

```
[Dashboard]
  └── "New City Project" (Architect UI shows extra options)
     │
     ▼
[New Project: City Scale]
  ├── City: Ho Chi Minh City
  ├── Focus: District 1
  ├── Budget: $2,000,000
  └── Scale: City Scale
     │
     ▼
[AI Auto-Generate]
  ├── Prompt: "Design network for district with
  │            20 schools, 5 hospitals, 2 ISP uplinks"
  └── [Generate] → AI creates topology JSON → renders on canvas
     │
     ▼
[Multi-Zone Canvas]
  ├── Zone: Education (20 school nodes)
  ├── Zone: Healthcare (5 hospital nodes)
  ├── Zone: Core Infrastructure
  └── Zone: IoT/CCTV overlay layer
     │
     ▼
[Layer Toggle]
  ├── Toggle: Fiber Underground layer
  ├── Toggle: Wireless coverage layer
  ├── Toggle: IoT sensor layer
  └── Toggle: CCTV layer
     │
     ▼
[Deployment Planning Tab]
  ├── Phase 1: Core backbone (Month 1–2)
  ├── Phase 2: Education zone (Month 3–4)
  ├── Phase 3: Healthcare zone (Month 5–6)
  └── Gantt chart + resource estimate
     │
     ▼
[Cost Analysis]
  ├── Total CAPEX: $1.8M
  ├── OPEX: $45,000/month
  ├── Fiber: 21km estimated
  └── Engineers needed: 12
     │
     ▼
[AI Optimization]
  └── "Ring topology in Zone A saves $120K vs current star topology"
     │
     ▼
[3D View Toggle]
  └── Fly through city model with traffic animation
     │
     ▼
[Export Full Report]
  ├── PDF with topology + cost + phases
  └── JSON for handoff to engineering team
```

### State Machine: Architect Project
```
CREATED ──AI generate OR manual build──▶ DRAFT
DRAFT ──zone assignment──▶ ZONED
ZONED ──cost analysis──▶ COSTED
COSTED ──AI optimization──▶ OPTIMIZED
OPTIMIZED ──deployment plan──▶ PLANNED
PLANNED ──export──▶ DELIVERED
(Any state) ──edit canvas──▶ DRAFT (reset cost/plan)
```

---

## 4. Company/Enterprise Flow

### Primary Journey: "Simulate ISP Backbone Deployment"

```
[Dashboard: Enterprise View]
  ├── Projects (team visible)
  └── Simulation Queue (shared)
     │
     ▼
[Import Existing Topology]
  └── Upload JSON / rebuild from template
     │
     ▼
[Full Simulation Suite]
  ├── Traffic Load: simulate 100,000 users
  ├── DDoS Attack: test mitigation
  ├── Fiber Cut: test redundancy
  └── Device Failure Cascade: worst case
     │
     ▼
[Risk Analysis Dashboard]
  ├── Risk Score: 7.2/10 (High)
  ├── SPOF count: 3
  ├── Estimated downtime: 4h/year
  └── SLA projection: 99.95%
     │
     ▼
[Snapshot History]
  ├── v1.0 — Initial design
  ├── v1.1 — Added redundancy
  └── v2.0 — Post-optimization
     │
     ▼
[Share Project]
  └── Share link (read-only) → stakeholders
     │
     ▼
[Generate Executive Report]
  ├── Risk summary
  ├── Cost projection (3-year TCO)
  └── Deployment recommendation
```

---

## 5. Harness Design — Preventing Scope Bugs

### What is the Harness?

The "harness" is a set of **fixed interface points** that both developers reference to build independently without breaking each other. Think of it as the scaffolding that keeps vibecoding contained.

### Harness Level 1: HTTP Contract

All API endpoints are defined BEFORE implementation starts:

```typescript
// api-contract.ts — agreed in Week 1, frozen until Sprint review
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',           // POST
    REGISTER: '/api/v1/auth/register',     // POST
    REFRESH: '/api/v1/auth/refresh',       // POST
    LOGOUT: '/api/v1/auth/logout',         // POST
  },
  PROJECTS: {
    LIST: '/api/v1/projects',              // GET
    CREATE: '/api/v1/projects',            // POST
    GET: (id: string) => `/api/v1/projects/${id}`,    // GET
    UPDATE: (id: string) => `/api/v1/projects/${id}`, // PUT
    DELETE: (id: string) => `/api/v1/projects/${id}`, // DELETE
  },
  NETWORK: {
    GET: (projectId: string) => `/api/v1/projects/${projectId}/network`,  // GET
    SAVE: (projectId: string) => `/api/v1/projects/${projectId}/network`, // PUT
    NODES: {
      CREATE: (projectId: string) => `/api/v1/projects/${projectId}/network/nodes`, // POST
      UPDATE: (projectId: string, nodeId: string) =>
        `/api/v1/projects/${projectId}/network/nodes/${nodeId}`,  // PUT
      DELETE: (projectId: string, nodeId: string) =>
        `/api/v1/projects/${projectId}/network/nodes/${nodeId}`,  // DELETE
    },
  },
  AI: {
    CHAT: '/api/v1/ai/chat',              // POST (SSE stream)
    SUGGEST: '/api/v1/ai/suggest',        // POST
    GENERATE: '/api/v1/ai/generate',      // POST
    CODEGEN: '/api/v1/ai/codegen',        // POST
  },
  SIMULATION: {
    START: '/api/v1/simulation/start',    // POST
    STATUS: (id: string) => `/api/v1/simulation/${id}`, // GET
    RESULTS: (id: string) => `/api/v1/simulation/${id}/results`, // GET
  },
  COST: {
    ESTIMATE: '/api/v1/cost/estimate',    // POST
  },
} as const;
```

### Harness Level 2: WebSocket Events Contract

```typescript
// Agreed event names — any change requires both devs to update
export const WS_EVENTS = {
  // Client → Server
  JOIN_PROJECT: 'project:join',
  LEAVE_PROJECT: 'project:leave',

  // Server → Client (simulation)
  SIM_STARTED: 'simulation:started',
  SIM_METRICS: 'simulation:metrics',
  SIM_COMPLETE: 'simulation:complete',
  SIM_ERROR: 'simulation:error',

  // Server → Client (AI)
  AI_SUGGESTION: 'ai:suggestion',

  // Server → Client (node)
  NODE_STATUS: 'node:status',
} as const;

// Payload types (FROZEN — change requires joint discussion)
export interface SimMetricsPayload {
  simulationId: string;
  timestamp: number;
  nodeId?: string;
  metrics: {
    latency: number;     // ms
    throughput: number;  // Mbps
    packetLoss: number;  // percentage 0-100
    jitter?: number;     // ms
  };
}
```

### Harness Level 3: Mock Backend for Dev A

Dev B delivers mock server on Day 1 of each sprint:

```typescript
// msw handlers for Dev A to develop against
// packages/mock-server/handlers.ts
export const handlers = [
  http.post('/api/v1/auth/login', () => {
    return HttpResponse.json({
      success: true,
      data: { token: 'mock-jwt', refreshToken: 'mock-refresh', user: mockUser },
      error: null,
    });
  }),
  http.get('/api/v1/projects', () => {
    return HttpResponse.json({
      success: true,
      data: mockProjects,
      meta: { page: 1, total: 3 },
      error: null,
    });
  }),
  // etc.
];
```

### Harness Level 4: Feature Flag System

Prevents role-based bugs during development:

```typescript
// src/shared/features.ts
export function getFeatureFlags(role: UserRole): FeatureFlags {
  const base: FeatureFlags = {
    canvasNodeLimit: Infinity,
    aiEnabled: true,
    costEnabled: true,
    simulationEnabled: true,
    deploymentPlanEnabled: true,
    configExportEnabled: true,
    tutorialModeEnabled: false,
  };

  const overrides: Record<UserRole, Partial<FeatureFlags>> = {
    STUDENT: {
      canvasNodeLimit: 20,
      costEnabled: false,
      simulationEnabled: false,
      configExportEnabled: false,
      tutorialModeEnabled: true,
      deploymentPlanEnabled: false,
    },
    ENGINEER: { deploymentPlanEnabled: false },
    ARCHITECT: {},
    COMPANY: {},
    ADMIN: {},
  };

  return { ...base, ...overrides[role] };
}
```

---

## 6. Debug Scope Map

When a bug appears, use this map to assign it:

| Symptom | Likely Owner | Check First |
|---------|-------------|-------------|
| Canvas not rendering | Dev A | `canvasStore`, React Flow version |
| Nodes not saving to DB | Dev B | `network.repository.ts`, Prisma query |
| API call failing (4xx) | Dev B | Controller DTO validation, guard |
| API call failing (network) | Dev A | `src/lib/api.ts` baseURL, CORS |
| WebSocket not connecting | Both | Dev B: gateway config; Dev A: socket.ts |
| WebSocket events not received | Both | Check `WS_EVENTS` constants match |
| AI response not streaming | Both | Dev B: SSE headers; Dev A: EventSource setup |
| Cost showing wrong value | Dev B | `cost.service.ts` strategy |
| 3D scene not loading | Dev A | R3F scene, canvas ref |
| Simulation never completes | Dev B | Python service timeout, NetworkX |