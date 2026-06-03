import {
  useCallback,
  useMemo,
  useRef,
  type CSSProperties,
  type DragEvent,
} from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type Connection as FlowConnection,
  type NodeProps,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button, Tag, Badge, Tooltip, message, Flex, Typography, Card } from 'antd';
import { 
  CloudSyncOutlined, 
  HistoryOutlined, 
  SaveOutlined,
  UndoOutlined,
  RedoOutlined,
  ClearOutlined,
  QuestionCircleOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { NodeType, NodeStatus, LinkType } from '@shared/types';
import { cn } from '@lib/utils';
import { useNetworkStore } from '@shared/store/networkStore';
import { useCanvasPersistence } from './useCanvasPersistence';
import { useCanvasHistory } from './useCanvasHistory';
import { BackgroundVariant } from 'reactflow';

const { Title, Text } = Typography;

interface DeviceDefinition {
  type: NodeType;
  label: string;
  description: string;
  accent: string;
  icon: 'router' | 'switch' | 'camera' | 'wifi' | 'building' | 'iot' | 'datacenter';
}

type CanvasNodeData = {
  label: string;
  nodeType: NodeType;
  accent: string;
  icon: DeviceDefinition['icon'];
  status: NodeStatus;
};

const devicePalette: DeviceDefinition[] = [
  {
    type: NodeType.ISP_ROUTER,
    label: 'ISP Router',
    description: 'Upstream gateway',
    accent: '#38bdf8',
    icon: 'router',
  },
  {
    type: NodeType.DATACENTER,
    label: 'Data Center',
    description: 'Cloud resource',
    accent: '#8b5cf6',
    icon: 'datacenter',
  },
  {
    type: NodeType.BACKBONE_SWITCH,
    label: 'Backbone Switch',
    description: 'Core distribution',
    accent: '#22c55e',
    icon: 'switch',
  },
  {
    type: NodeType.EDGE_ROUTER,
    label: 'Edge Router',
    description: 'District routing',
    accent: '#f59e0b',
    icon: 'router',
  },
  {
    type: NodeType.CCTV,
    label: 'CCTV Camera',
    description: 'Video endpoint',
    accent: '#ef4444',
    icon: 'camera',
  },
  {
    type: NodeType.PUBLIC_WIFI,
    label: 'Public WiFi',
    description: 'Access zone',
    accent: '#a855f7',
    icon: 'wifi',
  },
  {
    type: NodeType.IOT_HUB,
    label: 'IoT Hub',
    description: 'Sensor aggregator',
    accent: '#14b8a6',
    icon: 'iot',
  },
];

const deviceByType = devicePalette.reduce<Record<NodeType, DeviceDefinition>>(
  (acc, device) => ({ ...acc, [device.type]: device }),
  {} as Record<NodeType, DeviceDefinition>,
);

function DeviceIcon({ icon }: { icon: DeviceDefinition['icon'] }) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    width: 22,
    height: 22,
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  if (icon === 'camera') {
    return (
      <svg {...common}>
        <path d="M4 8h11v8H4z" />
        <path d="m15 11 5-3v8l-5-3" />
      </svg>
    );
  }

  if (icon === 'wifi') {
    return (
      <svg {...common}>
        <path d="M5 10a10 10 0 0 1 14 0" />
        <path d="M8 13a6 6 0 0 1 8 0" />
        <path d="M11 16a2 2 0 0 1 2 0" />
        <path d="M12 19h.01" />
      </svg>
    );
  }

  if (icon === 'switch') {
    return (
      <svg {...common}>
        <path d="M4 7h16v10H4z" />
        <path d="M7 12h.01M11 12h.01M15 12h.01M18 12h.01" />
      </svg>
    );
  }

  if (icon === 'iot') {
    return (
      <svg {...common}>
        <path d="M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
      </svg>
    );
  }

  if (icon === 'datacenter') {
    return (
      <svg {...common}>
        <rect x="2" y="2" width="20" height="8" rx="2" />
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <path d="M6 6h.01M6 18h.01" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path d="M5 7h14v10H5z" />
      <path d="M8 17v3M16 17v3M9 11h6M12 7V4" />
      <path d="M7 20h10" />
    </svg>
  );
}

function DeviceNode({ data, selected }: NodeProps<CanvasNodeData>) {
  return (
    <div
      className={cn('canvas-node', selected && 'canvas-node--selected')}
      style={{ '--node-accent': data.accent } as CSSProperties}
    >
      <span className="canvas-node__icon">
        <DeviceIcon icon={data.icon} />
      </span>
      <Flex vertical>
        <Flex align="center" gap={6}>
          <strong>{data.label}</strong>
          <Badge status={data.status === NodeStatus.ACTIVE ? 'success' : 'default'} size="small" />
        </Flex>
        <small className="opacity-50 text-[10px] uppercase tracking-wide">
          {data.nodeType.split('_').join(' ')}
        </small>
      </Flex>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  device: DeviceNode,
};

function PaletteItem({ device }: { device: DeviceDefinition }) {
  const onDragStart = (event: DragEvent<HTMLButtonElement>) => {
    event.dataTransfer.setData('application/scnvp-node-type', device.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <button
      type="button"
      className="device-palette__item group"
      draggable
      onDragStart={onDragStart}
      title={`Drag ${device.label} to the canvas`}
    >
      <span
        className="device-palette__icon transition-colors duration-200"
        style={{ color: device.accent, borderColor: `${device.accent}44` }}
      >
        <DeviceIcon icon={device.icon} />
      </span>
      <Flex vertical>
        <strong className="group-hover:text-primary-400 transition-colors">{device.label}</strong>
        <small>{device.description}</small>
      </Flex>
    </button>
  );
}

function CanvasWorkspace() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const reactFlow = useReactFlow<CanvasNodeData>();
  
  // Store & Persistence Hooks
  const { 
    nodes: storeNodes, 
    connections: storeConnections,
    addNode, 
    updateNode, 
    removeNode,
    addConnection,
    removeConnection,
    selectedNodeId,
    selectNode,
    clearCanvas
  } = useNetworkStore();
  
  const { isSyncing, lastSaved, saveData } = useCanvasPersistence();
  const { undo, redo, canUndo, canRedo } = useCanvasHistory();

  // Mapping Store state to React Flow state
  const nodes = useMemo(() => 
    storeNodes.map(n => {
      const device = deviceByType[n.type];
      return {
        id: n.id,
        type: 'device',
        position: { x: n.posX, y: n.posY },
        data: {
          label: n.label,
          nodeType: n.type,
          accent: device?.accent || '#38bdf8',
          icon: device?.icon || 'router',
          status: n.status
        },
        selected: n.id === selectedNodeId
      };
    }), [storeNodes, selectedNodeId]
  );

  const edges = useMemo(() => 
    storeConnections.map(c => ({
      id: c.id,
      source: c.sourceId,
      target: c.targetId,
      animated: true,
      type: 'smoothstep',
      style: { stroke: '#38bdf8', strokeWidth: 2 },
      data: { linkType: c.linkType }
    })), [storeConnections]
  );

  const selectedNode = useMemo(
    () => storeNodes.find((node) => node.id === selectedNodeId) ?? null,
    [storeNodes, selectedNodeId],
  );

  /**
   * Handle changes from React Flow and sync with Zustand store
   */
  const onNodesChange = useCallback((changes: any[]) => {
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        updateNode(change.id, { posX: change.position.x, posY: change.position.y });
      } else if (change.type === 'select') {
        if (change.selected) selectNode(change.id);
        else if (selectedNodeId === change.id) selectNode(null);
      } else if (change.type === 'remove') {
        removeNode(change.id);
      }
    });
  }, [updateNode, selectNode, removeNode, selectedNodeId]);

  const onEdgesChange = useCallback((changes: any[]) => {
    changes.forEach(change => {
      if (change.type === 'remove') {
        removeConnection(change.id);
      }
    });
  }, [removeConnection]);

  const onConnect = useCallback(
    (connection: FlowConnection) => {
      if (!connection.source || !connection.target) return;
      
      const newConn = {
        id: `conn-${Date.now()}`,
        networkId: '', // Placeholder
        sourceId: connection.source,
        targetId: connection.target,
        linkType: LinkType.FIBER,
        bandwidth: 1000,
      };
      
      addConnection(newConn);
    },
    [addConnection],
  );

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const rawType = event.dataTransfer.getData(
        'application/scnvp-node-type',
      ) as NodeType;
      const device = deviceByType[rawType];
      if (!device) return;

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      const id = `${rawType.toLowerCase()}-${Date.now()}`;

      addNode({
        id,
        networkId: '', // Placeholder
        type: rawType,
        label: device.label,
        posX: position.x,
        posY: position.y,
        status: NodeStatus.ACTIVE,
        config: {},
      });
      
      selectNode(id);
    },
    [reactFlow, addNode, selectNode],
  );

  const handleClearCanvas = () => {
    clearCanvas();
    message.success('Canvas cleared');
  };

  return (
    <div className="canvas-layout">
      <aside className="canvas-panel canvas-panel--palette">
        <Flex vertical className="canvas-panel__header">
          <Flex align="center" justify="space-between">
            <Title level={4} className="!text-[0.95rem] !font-bold !m-0">Device Palette</Title>
            <Tooltip title="Drag devices to start building">
              <QuestionCircleOutlined className="opacity-30 hover:opacity-100 cursor-help" />
            </Tooltip>
          </Flex>
          <Text className="!text-white/50 !text-xs mt-1">City-scale networking components.</Text>
        </Flex>
        <div className="device-palette">
          {devicePalette.map((device) => (
            <PaletteItem key={device.type} device={device} />
          ))}
        </div>
      </aside>

      <section className="canvas-stage" ref={wrapperRef}>
        {/* Floating Toolbar */}
        <Flex gap={8} className="absolute top-4 left-4 z-10">
          <Card 
            className="!bg-black/60 backdrop-blur-xl border-white/10 shadow-2xl" 
            styles={{ body: { padding: 4, display: 'flex', alignItems: 'center' } }}
          >
            <Tooltip title={`Undo (${canUndo ? 'Ctrl+Z' : 'Empty'})`}>
              <Button 
                type="text" 
                icon={<UndoOutlined />} 
                disabled={!canUndo} 
                onClick={undo}
                className="text-white/60 hover:text-white"
              />
            </Tooltip>
            <Tooltip title={`Redo (${canRedo ? 'Ctrl+Y' : 'Empty'})`}>
              <Button 
                type="text" 
                icon={<RedoOutlined />} 
                disabled={!canRedo} 
                onClick={redo}
                className="text-white/60 hover:text-white"
              />
            </Tooltip>
            <div className="w-[1px] h-4 bg-white/10 mx-1" />
            <Tooltip title="Save project (Ctrl+S)">
              <Button 
                type="text" 
                icon={<SaveOutlined />} 
                onClick={() => saveData()}
                className="text-white/60 hover:text-white"
              />
            </Tooltip>
          </Card>
          
          <Flex align="center" gap={10} className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 text-xs font-medium text-white/70 shadow-2xl">
            {isSyncing ? (
              <>
                <CloudSyncOutlined spin className="text-primary-400" />
                <Text className="!text-inherit uppercase text-[10px] tracking-wide">Syncing...</Text>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                <Text className="!text-inherit uppercase text-[10px] tracking-wider opacity-60">
                  Live: {lastSaved ? lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                </Text>
              </>
            )}
          </Flex>
        </Flex>

        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onSelectionChange={({ nodes: selectedNodes }) => {
            selectNode(selectedNodes[0]?.id ?? null);
          }}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
          nodesDraggable
          nodesConnectable
          elementsSelectable
          snapToGrid
          snapGrid={[10, 10]}
        >
          <Background color="#38506b" gap={20} size={1} variant={BackgroundVariant.Dots} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => node.data?.accent ?? '#38bdf8'}
            maskColor="rgba(3, 7, 18, 0.82)"
            className="!bg-black/40 backdrop-blur-md rounded-lg border border-white/10"
          />
          <Controls showInteractive={false} className="!bg-black/40 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden" />
        </ReactFlow>

        {nodes.length === 0 && (
          <Flex vertical align="center" justify="center" className="canvas-empty">
            <div className="p-8 rounded-full bg-white/5 border border-white/5 mb-4">
              <PlusOutlined className="text-4xl opacity-20" />
            </div>
            <Title level={4} className="!text-white/80 !m-0">Ready to Design</Title>
            <Text className="!text-white/40 !text-sm mt-2">Drag network components from the palette to begin.</Text>
          </Flex>
        )}
      </section>

      <aside className="canvas-panel canvas-panel--inspector">
        <div className="canvas-panel__header">
          <Title level={4} className="!text-[0.95rem] !font-bold !m-0">Inspector</Title>
          <Text className="!text-white/50 !text-xs mt-1">Configuration and properties.</Text>
        </div>

        {selectedNode ? (
          <Card 
            className="inspector-card !border-primary-500/30 !bg-primary-500/5 shadow-xl"
            styles={{ body: { padding: 0 } }}
          >
            <Flex align="center" gap={16} className="p-5 border-b border-white/5">
              <div
                className="inspector-card__icon"
                style={{ color: deviceByType[selectedNode.type]?.accent }}
              >
                <DeviceIcon icon={deviceByType[selectedNode.type]?.icon || 'router'} />
              </div>
              <Flex vertical className="min-w-0">
                <Title level={5} className="!m-0 truncate !text-white tracking-tight">{selectedNode.label}</Title>
                <Tag 
                  color={selectedNode.status === NodeStatus.ACTIVE ? 'green' : 'default'}
                  className="m-0 border-none bg-opacity-20 text-[10px] uppercase font-bold mt-1"
                >
                  {selectedNode.status}
                </Tag>
              </Flex>
            </Flex>
            <div className="p-5">
              <dl className="inspector-list">
                <Flex vertical gap={4}>
                  <dt className="text-[10px] uppercase tracking-wider text-white/40">Node ID</dt>
                  <dd className="text-[10px] font-mono opacity-50 bg-white/5 p-1.5 rounded truncate">{selectedNode.id}</dd>
                </Flex>
                <Flex vertical gap={4} className="mt-4">
                  <dt className="text-[10px] uppercase tracking-wider text-white/40">Model</dt>
                  <dd className="text-white/90 text-sm">{selectedNode.type.split('_').join(' ')}</dd>
                </Flex>
                <Flex gap={24} className="mt-4">
                  <Flex vertical gap={4} className="flex-1">
                    <dt className="text-[10px] uppercase tracking-wider text-white/40">X Pos</dt>
                    <dd className="text-white/90 text-sm font-medium">{Math.round(selectedNode.posX)}px</dd>
                  </Flex>
                  <Flex vertical gap={4} className="flex-1">
                    <dt className="text-[10px] uppercase tracking-wider text-white/40">Y Pos</dt>
                    <dd className="text-white/90 text-sm font-medium">{Math.round(selectedNode.posY)}px</dd>
                  </Flex>
                </Flex>
              </dl>
              <div className="mt-8 pt-4 border-t border-white/5">
                <Text className="!text-[10px] !text-white/30 italic">
                  Advanced configuration available in Sprint 3.
                </Text>
              </div>
            </div>
          </Card>
        ) : (
          <Flex vertical align="center" className="mt-16 opacity-40">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <HistoryOutlined className="text-2xl" />
            </div>
            <Text className="!text-center !text-white !px-4 !leading-relaxed">
              Select a device to view its technical properties and manage network rules.
            </Text>
          </Flex>
        )}

        <div className="mt-auto pt-8">
          <Button
            type="default"
            className="w-full scnvp-button--outline border-red-500/20 text-red-400 hover:!bg-red-500/10 hover:!text-red-300"
            icon={<ClearOutlined />}
            onClick={handleClearCanvas}
            disabled={storeNodes.length === 0 && storeConnections.length === 0}
          >
            Clear Canvas
          </Button>
        </div>
      </aside>
    </div>
  );
}

/**
 * Main NetworkCanvas module.
 * Wraps the workspace with React Flow context.
 */
export function NetworkCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasWorkspace />
    </ReactFlowProvider>
  );
}
