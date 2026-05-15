import { create } from 'zustand';
import type { NetworkNode, Connection } from '@shared/types';

interface NetworkState {
  nodes: NetworkNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  metadata: Record<string, unknown>;

  // Actions
  setTopology: (nodes: NetworkNode[], connections: Connection[], metadata?: Record<string, unknown>) => void;
  addNode: (node: NetworkNode) => void;
  updateNode: (id: string, patch: Partial<NetworkNode>) => void;
  removeNode: (id: string) => void;
  addConnection: (conn: Connection) => void;
  removeConnection: (id: string) => void;
  selectNode: (id: string | null) => void;
  clearCanvas: () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  nodes: [],
  connections: [],
  selectedNodeId: null,
  metadata: {},

  setTopology: (nodes, connections, metadata = {}) =>
    set({ nodes, connections, metadata }),

  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),

  updateNode: (id, patch) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    })),

  removeNode: (id) =>
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== id),
      connections: state.connections.filter(
        (c) => c.sourceId !== id && c.targetId !== id,
      ),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),

  addConnection: (conn) =>
    set((state) => ({ connections: [...state.connections, conn] })),

  removeConnection: (id) =>
    set((state) => ({
      connections: state.connections.filter((c) => c.id !== id),
    })),

  selectNode: (id) => set({ selectedNodeId: id }),

  clearCanvas: () =>
    set({ nodes: [], connections: [], selectedNodeId: null, metadata: {} }),
}));
