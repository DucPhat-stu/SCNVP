# 07 — API Endpoint Reference
## Smart City Network Visualization Platform (SCNVP)
### Base URL: `https://api.scnvp.io/api/v1`

---

## Global Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": { "page": 1, "pageSize": 20, "total": 100 },
  "error": null
}

// Error
{
  "success": false,
  "data": null,
  "error": { "code": "NOT_FOUND", "message": "Project not found", "details": null }
}
```

### Error Codes
| Code | HTTP Status | Meaning |
|------|------------|---------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Insufficient role |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | DTO validation failed |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_UNAVAILABLE` | 503 | AI service down |
| `SIM_UNAVAILABLE` | 503 | Simulation service down |
| `INTERNAL_ERROR` | 500 | Unhandled exception |

---

## Authentication Endpoints

### POST /auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "role": "ENGINEER",
  "experienceLevel": "intermediate"
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "cuid123", "email": "user@example.com", "role": "ENGINEER" },
    "token": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

---

### POST /auth/login
Login with credentials.

**Request:**
```json
{ "email": "user@example.com", "password": "SecurePass123!" }
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "user": { "id": "cuid123", "email": "user@example.com", "role": "ENGINEER" }
  }
}
```

---

### POST /auth/refresh
Refresh access token.

**Headers:** `Authorization: Bearer <refreshToken>`

**Response 200:** New token pair (same as login response)

---

### POST /auth/logout
Invalidate refresh token.

**Headers:** `Authorization: Bearer <token>`

**Response 200:** `{ "success": true, "data": null }`

---

## Project Endpoints

### GET /projects
List user's projects.

**Headers:** `Authorization: Bearer <token>`

**Query params:** `page=1&pageSize=20&status=ACTIVE`

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_123",
      "name": "HCM District 1 Network",
      "cityName": "Ho Chi Minh City",
      "scale": "CITY_SCALE",
      "budget": 2000000,
      "status": "ACTIVE",
      "nodeCount": 47,
      "totalCost": 1800000,
      "updatedAt": "2024-10-15T10:30:00Z"
    }
  ],
  "meta": { "page": 1, "pageSize": 20, "total": 3 }
}
```

---

### POST /projects
Create a new project.

**Request:**
```json
{
  "name": "District 1 Smart Network",
  "description": "Complete network for D1 HCMC",
  "cityName": "Ho Chi Minh City",
  "scale": "CITY_SCALE",
  "budget": 2000000
}
```

**Response 201:** Full project object

---

### GET /projects/:id
Get project details.

**Response 200:** Project with nested network summary

---

### PUT /projects/:id
Update project metadata.

**Request:** Partial project fields (name, description, budget, status)

**Response 200:** Updated project

---

### DELETE /projects/:id
Delete project (cascade deletes network).

**Response 200:** `{ "success": true, "data": null }`

---

### POST /projects/:id/snapshots
Save a named snapshot.

**Request:** `{ "name": "v1.2 — Added redundancy" }`

**Response 201:** Snapshot object

---

### GET /projects/:id/snapshots
List snapshots.

**Response 200:** Array of snapshot objects

---

### POST /projects/:id/snapshots/:snapshotId/restore
Restore project from snapshot.

**Response 200:** Restored project

---

## Network Endpoints

### GET /projects/:id/network
Get full network topology.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "nodes": [
      {
        "id": "node_abc",
        "type": "EDGE_ROUTER",
        "label": "Edge Router A",
        "posX": 120.5,
        "posY": 340.2,
        "posZ": null,
        "config": { "vlan": 100, "ipRange": "10.0.0.0/24" },
        "status": "ACTIVE",
        "cost": 5000
      }
    ],
    "connections": [
      {
        "id": "conn_xyz",
        "sourceId": "node_abc",
        "targetId": "node_def",
        "bandwidth": 1000,
        "latency": 2,
        "linkType": "FIBER",
        "cost": 15000
      }
    ],
    "metadata": { "zoom": 1.2, "panX": 0, "panY": 0 }
  }
}
```

---

### PUT /projects/:id/network
Save full network state (bulk upsert).

**Request:** Same structure as GET response `data`

**Response 200:** Saved network

---

### POST /projects/:id/network/nodes
Add a single node.

**Request:**
```json
{
  "type": "EDGE_ROUTER",
  "label": "Edge Router A",
  "posX": 120.5,
  "posY": 340.2,
  "config": { "vlan": 100 }
}
```

**Response 201:** Created node

---

### PUT /projects/:id/network/nodes/:nodeId
Update node (position, config, label, status).

**Response 200:** Updated node

---

### DELETE /projects/:id/network/nodes/:nodeId
Delete node (also deletes its connections).

**Response 200:** `{ "success": true, "data": null }`

---

### POST /projects/:id/network/connections
Add a connection.

**Request:**
```json
{
  "sourceId": "node_abc",
  "targetId": "node_def",
  "bandwidth": 1000,
  "latency": 2,
  "linkType": "FIBER"
}
```

**Response 201:** Created connection

---

### DELETE /projects/:id/network/connections/:connId
Delete a connection.

**Response 200:** `{ "success": true, "data": null }`

---

## Cost Endpoints

### POST /cost/estimate
Calculate cost for a topology.

**Request:**
```json
{
  "projectId": "proj_123",
  "nodes": [ ... ],
  "connections": [ ... ]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "capex": {
      "total": 1800000,
      "byType": {
        "ISP_ROUTER": 120000,
        "DATACENTER": 800000,
        "EDGE_ROUTER": 250000
      },
      "fiber": 280000,
      "wireless": 150000
    },
    "opex": {
      "monthly": 45000,
      "annually": 540000
    },
    "tco3Year": 3420000,
    "fiberLengthKm": 21.4,
    "engineersNeeded": 12
  }
}
```

---

## AI Endpoints

### POST /ai/chat
Chat with AI assistant (SSE streaming).

**Headers:** `Accept: text/event-stream`

**Request:**
```json
{
  "message": "What is BGP and why should I use it here?",
  "projectId": "proj_123",
  "conversationHistory": [
    { "role": "user", "content": "previous message" },
    { "role": "assistant", "content": "previous response" }
  ]
}
```

**Response:** SSE stream
```
data: {"delta": "BGP", "done": false}
data: {"delta": " (Border Gateway Protocol)", "done": false}
data: {"delta": " is...", "done": false}
data: {"done": true, "fullText": "BGP (Border Gateway Protocol) is..."}
```

---

### POST /ai/suggest
Get architecture suggestions for current topology.

**Request:** `{ "projectId": "proj_123" }` (system fetches topology internally)

**Response 200:**
```json
{
  "success": true,
  "data": {
    "suggestions": [
      {
        "id": "sug_001",
        "type": "REDUNDANCY",
        "severity": "HIGH",
        "title": "Add redundant uplink",
        "description": "Core Switch 1 is a SPOF. Add second fiber uplink to ISP Router B.",
        "estimatedCostImpact": 15000,
        "confidenceScore": 0.92
      }
    ]
  }
}
```

---

### POST /ai/generate
Auto-generate topology from natural language.

**Request:**
```json
{
  "prompt": "Design a network for a district with 20 schools, 5 hospitals, 2 ISP uplinks, budget $2M",
  "projectId": "proj_123"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "nodes": [ ... ],
    "connections": [ ... ],
    "explanation": "Generated a hierarchical topology with ring backbone...",
    "estimatedCost": 1750000
  }
}
```

---

### POST /ai/codegen
Generate device configuration code.

**Request:**
```json
{
  "projectId": "proj_123",
  "targetDevice": "CISCO_IOS",
  "nodeIds": ["node_abc", "node_def"]
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "configs": [
      {
        "nodeId": "node_abc",
        "nodeLabel": "Edge Router A",
        "deviceType": "CISCO_IOS",
        "config": "! Edge Router A\nhostname EdgeRouterA\n..."
      }
    ]
  }
}
```

---

## Simulation Endpoints

### POST /simulation/start
Start a simulation.

**Request:**
```json
{
  "projectId": "proj_123",
  "type": "TRAFFIC_LOAD",
  "config": {
    "concurrentUsers": 10000,
    "durationSeconds": 60
  }
}
```

**Response 202:**
```json
{
  "success": true,
  "data": { "simulationId": "sim_abc", "status": "PENDING" }
}
```

WebSocket events follow (see WS section).

---

### GET /simulation/:id
Get simulation status and results.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "sim_abc",
    "type": "TRAFFIC_LOAD",
    "status": "COMPLETED",
    "metrics": {
      "avgLatency": 12.4,
      "maxLatency": 89.2,
      "avgThroughput": 840,
      "packetLoss": 0.02,
      "availability": 99.97
    },
    "spofNodes": ["node_def"],
    "bottleneckConnections": ["conn_xyz"],
    "duration": 60
  }
}
```

---

## WebSocket Events (Socket.IO)

**Connection:** `wss://api.scnvp.io?token=<jwt>`

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `project:join` | `{ projectId }` | Subscribe to project events |
| `project:leave` | `{ projectId }` | Unsubscribe |

### Server → Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `simulation:started` | `{ simulationId, projectId }` | Sim began |
| `simulation:metrics` | `SimMetricsPayload` | Live metrics update |
| `simulation:complete` | `{ simulationId, summary }` | Sim finished |
| `simulation:error` | `{ simulationId, error }` | Sim failed |
| `ai:suggestion` | `{ projectId, suggestion }` | New AI rec available |
| `node:status` | `{ nodeId, status, projectId }` | Node status changed |
| `project:saved` | `{ projectId, savedAt }` | Auto-save completed |