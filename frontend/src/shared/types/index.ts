/**
 * Shared TypeScript interfaces — mirroring Prisma schema from ARCHITECTURE.MD
 */

// ── Enums ────────────────────────────────────────
export enum UserRole {
  STUDENT = 'STUDENT',
  ENGINEER = 'ENGINEER',
  ARCHITECT = 'ARCHITECT',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN',
}

export enum ProjectScale {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  CITY_SCALE = 'CITY_SCALE',
}

export enum ProjectStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}

export enum NodeType {
  ISP_ROUTER = 'ISP_ROUTER',
  DATACENTER = 'DATACENTER',
  BACKBONE_SWITCH = 'BACKBONE_SWITCH',
  EDGE_ROUTER = 'EDGE_ROUTER',
  OFFICE = 'OFFICE',
  CCTV = 'CCTV',
  TRAFFIC_CONTROLLER = 'TRAFFIC_CONTROLLER',
  IOT_HUB = 'IOT_HUB',
  PUBLIC_WIFI = 'PUBLIC_WIFI',
  WAREHOUSE = 'WAREHOUSE',
  DRONE_PORT = 'DRONE_PORT',
}

export enum NodeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FAILED = 'FAILED',
  WARNING = 'WARNING',
}

export enum LinkType {
  FIBER = 'FIBER',
  WIRELESS = 'WIRELESS',
  COPPER = 'COPPER',
  MPLS = 'MPLS',
  VLAN = 'VLAN',
}

export enum SimType {
  PACKET_ROUTING = 'PACKET_ROUTING',
  CONGESTION = 'CONGESTION',
  FAILURE = 'FAILURE',
  DDOS = 'DDOS',
  TRAFFIC_LOAD = 'TRAFFIC_LOAD',
}

export enum SimStatus {
  PENDING = 'PENDING',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

// ── Entity Interfaces ────────────────────────────
export interface User {
  id: string;
  email: string;
  role: UserRole;
  experienceLevel?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  cityName?: string;
  scale: ProjectScale;
  budget?: number;
  status: ProjectStatus;
  ownerId: string;
  nodeCount?: number;
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkNode {
  id: string;
  networkId: string;
  type: NodeType;
  label: string;
  posX: number;
  posY: number;
  posZ?: number;
  config?: Record<string, unknown>;
  status: NodeStatus;
  cost?: number;
}

export interface Connection {
  id: string;
  networkId: string;
  sourceId: string;
  targetId: string;
  bandwidth?: number;
  latency?: number;
  linkType: LinkType;
  cost?: number;
}

export interface Network {
  id: string;
  projectId: string;
  nodes: NetworkNode[];
  connections: Connection[];
  metadata?: Record<string, unknown>;
}

export interface Simulation {
  id: string;
  projectId: string;
  type: SimType;
  status: SimStatus;
  results?: Record<string, unknown>;
  metrics?: SimMetrics;
  duration?: number;
  createdAt: string;
}

export interface SimMetrics {
  avgLatency: number;
  maxLatency: number;
  avgThroughput: number;
  packetLoss: number;
  availability: number;
}

export interface AIRecommendation {
  id: string;
  projectId: string;
  type: string;
  title?: string;
  recommendation: string;
  severity: Severity;
  confidenceScore: number;
  dismissed: boolean;
  estimatedCostImpact?: number;
  createdAt: string;
}

export interface CostEstimate {
  capex: {
    total: number;
    byType: Record<string, number>;
    fiber?: number;
    wireless?: number;
  };
  opex: {
    monthly: number;
    annually: number;
  };
  tco3Year: number;
  fiberLengthKm?: number;
  engineersNeeded?: number;
}

// ── API Response Envelope ────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: { page: number; pageSize: number; total: number };
  error: { code: string; message: string; details?: unknown } | null;
}

// ── Auth ─────────────────────────────────────────
export interface AuthTokens {
  token: string;
  refreshToken: string;
  user: User;
}

// ── WebSocket Payloads ───────────────────────────
export interface SimMetricsPayload {
  simulationId: string;
  timestamp: number;
  nodeId?: string;
  metrics: {
    latency: number;
    throughput: number;
    packetLoss: number;
    jitter?: number;
  };
}
