/**
 * API Route Contracts — frozen interface between frontend and backend.
 * Any change requires joint discussion between Dev A and Dev B.
 */
export const API_ROUTES = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    REGISTER: '/api/v1/auth/register',
    REFRESH: '/api/v1/auth/refresh',
    LOGOUT: '/api/v1/auth/logout',
  },
  PROJECTS: {
    LIST: '/api/v1/projects',
    CREATE: '/api/v1/projects',
    GET: (id: string) => `/api/v1/projects/${id}`,
    UPDATE: (id: string) => `/api/v1/projects/${id}`,
    DELETE: (id: string) => `/api/v1/projects/${id}`,
    SNAPSHOTS: {
      LIST: (id: string) => `/api/v1/projects/${id}/snapshots`,
      CREATE: (id: string) => `/api/v1/projects/${id}/snapshots`,
      RESTORE: (id: string, snapId: string) =>
        `/api/v1/projects/${id}/snapshots/${snapId}/restore`,
    },
  },
  NETWORK: {
    GET: (projectId: string) => `/api/v1/projects/${projectId}/network`,
    SAVE: (projectId: string) => `/api/v1/projects/${projectId}/network`,
    NODES: {
      CREATE: (projectId: string) =>
        `/api/v1/projects/${projectId}/network/nodes`,
      UPDATE: (projectId: string, nodeId: string) =>
        `/api/v1/projects/${projectId}/network/nodes/${nodeId}`,
      DELETE: (projectId: string, nodeId: string) =>
        `/api/v1/projects/${projectId}/network/nodes/${nodeId}`,
    },
    CONNECTIONS: {
      CREATE: (projectId: string) =>
        `/api/v1/projects/${projectId}/network/connections`,
      DELETE: (projectId: string, connId: string) =>
        `/api/v1/projects/${projectId}/network/connections/${connId}`,
    },
  },
  AI: {
    CHAT: '/api/v1/ai/chat',
    SUGGEST: '/api/v1/ai/suggest',
    GENERATE: '/api/v1/ai/generate',
    CODEGEN: '/api/v1/ai/codegen',
  },
  SIMULATION: {
    START: '/api/v1/simulation/start',
    STATUS: (id: string) => `/api/v1/simulation/${id}`,
    RESULTS: (id: string) => `/api/v1/simulation/${id}/results`,
  },
  COST: {
    ESTIMATE: '/api/v1/cost/estimate',
  },
} as const;

/**
 * WebSocket event contracts.
 */
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

  // Server → Client (project)
  PROJECT_SAVED: 'project:saved',
} as const;
