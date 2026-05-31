CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'ENGINEER', 'ARCHITECT', 'COMPANY', 'ADMIN');
CREATE TYPE "ProjectScale" AS ENUM ('SMALL', 'MEDIUM', 'LARGE', 'CITY_SCALE');
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "NodeType" AS ENUM ('ISP_ROUTER', 'DATACENTER', 'BACKBONE_SWITCH', 'EDGE_ROUTER', 'OFFICE', 'CCTV', 'TRAFFIC_CONTROLLER', 'IOT_HUB', 'PUBLIC_WIFI', 'WAREHOUSE', 'DRONE_PORT');
CREATE TYPE "NodeStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'FAILED', 'WARNING');
CREATE TYPE "LinkType" AS ENUM ('FIBER', 'WIRELESS', 'COPPER', 'MPLS', 'VLAN');
CREATE TYPE "SimType" AS ENUM ('PACKET_ROUTING', 'CONGESTION', 'FAILURE', 'DDOS', 'TRAFFIC_LOAD');
CREATE TYPE "SimStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
  "experienceLevel" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "projects" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "cityName" TEXT,
  "scale" "ProjectScale" NOT NULL,
  "budget" DOUBLE PRECISION,
  "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
  "ownerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "networks" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "metadata" JSONB,
  CONSTRAINT "networks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "network_nodes" (
  "id" TEXT NOT NULL,
  "networkId" TEXT NOT NULL,
  "type" "NodeType" NOT NULL,
  "label" TEXT NOT NULL,
  "posX" DOUBLE PRECISION NOT NULL,
  "posY" DOUBLE PRECISION NOT NULL,
  "posZ" DOUBLE PRECISION,
  "config" JSONB,
  "status" "NodeStatus" NOT NULL DEFAULT 'ACTIVE',
  "cost" DOUBLE PRECISION,
  CONSTRAINT "network_nodes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "connections" (
  "id" TEXT NOT NULL,
  "networkId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "targetId" TEXT NOT NULL,
  "bandwidth" INTEGER,
  "latency" INTEGER,
  "linkType" "LinkType" NOT NULL,
  "cost" DOUBLE PRECISION,
  CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "snapshots" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "data" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "snapshots_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "simulations" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "type" "SimType" NOT NULL,
  "status" "SimStatus" NOT NULL DEFAULT 'PENDING',
  "config" JSONB,
  "results" JSONB,
  "metrics" JSONB,
  "duration" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ai_recommendations" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "recommendation" TEXT NOT NULL,
  "severity" "Severity" NOT NULL,
  "confidenceScore" DOUBLE PRECISION NOT NULL,
  "dismissed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_recommendations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "networks_projectId_key" ON "networks"("projectId");

ALTER TABLE "projects" ADD CONSTRAINT "projects_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "networks" ADD CONSTRAINT "networks_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "network_nodes" ADD CONSTRAINT "network_nodes_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "networks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "connections" ADD CONSTRAINT "connections_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "networks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "simulations" ADD CONSTRAINT "simulations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ai_recommendations" ADD CONSTRAINT "ai_recommendations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
