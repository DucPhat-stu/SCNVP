import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
} from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection as FlowConnection,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { NodeType } from '@shared/types';
import { cn } from '@lib/utils';

interface DeviceDefinition {
  type: NodeType;
  label: string;
  description: string;
  accent: string;
  icon: 'router' | 'switch' | 'camera' | 'wifi' | 'building' | 'iot';
}

interface CanvasNodeData {
  label: string;
  nodeType: NodeType;
  accent: string;
  icon: DeviceDefinition['icon'];
}

type CanvasNode = Node<CanvasNodeData>;
type CanvasEdge = Edge;

const devicePalette: DeviceDefinition[] = [
  {
    type: NodeType.ISP_ROUTER,
    label: 'ISP Router',
    description: 'Upstream gateway',
    accent: '#38bdf8',
    icon: 'router',
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

const initialNodes: CanvasNode[] = [];
const initialEdges: CanvasEdge[] = [];

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

  if (icon === 'building') {
    return (
      <svg {...common}>
        <path d="M5 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" />
        <path d="M9 7h4M9 11h4M9 15h4M3 21h18" />
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
      <span>
        <strong>{data.label}</strong>
        <small>{data.nodeType.replaceAll('_', ' ')}</small>
      </span>
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
      className="device-palette__item"
      draggable
      onDragStart={onDragStart}
      title={`Drag ${device.label} to the canvas`}
    >
      <span
        className="device-palette__icon"
        style={{ color: device.accent, borderColor: `${device.accent}55` }}
      >
        <DeviceIcon icon={device.icon} />
      </span>
      <span>
        <strong>{device.label}</strong>
        <small>{device.description}</small>
      </span>
    </button>
  );
}

function CanvasWorkspace() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const nextId = useRef(1);
  const reactFlow = useReactFlow<CanvasNodeData>();
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNodeData>(
    initialNodes,
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const onConnect = useCallback(
    (connection: FlowConnection) => {
      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            animated: true,
            type: 'smoothstep',
            style: { stroke: '#38bdf8', strokeWidth: 2 },
          },
          currentEdges,
        ),
      );
    },
    [setEdges],
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
      const id = `${rawType.toLowerCase()}-${nextId.current}`;
      nextId.current += 1;

      const newNode: CanvasNode = {
        id,
        type: 'device',
        position,
        selected: true,
        data: {
          label: device.label,
          nodeType: device.type,
          accent: device.accent,
          icon: device.icon,
        },
      };

      setNodes((currentNodes) => [
        ...currentNodes.map((node) => ({ ...node, selected: false })),
        newNode,
      ]);
      setSelectedNodeId(id);
    },
    [reactFlow, setNodes],
  );

  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
  };

  return (
    <div className="canvas-layout">
      <aside className="canvas-panel canvas-panel--palette">
        <div className="canvas-panel__header">
          <h2>Device Palette</h2>
          <p>Drag a device onto the canvas.</p>
        </div>
        <div className="device-palette">
          {devicePalette.map((device) => (
            <PaletteItem key={device.type} device={device} />
          ))}
        </div>
      </aside>

      <section className="canvas-stage" ref={wrapperRef}>
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
            setSelectedNodeId(selectedNodes[0]?.id ?? null);
          }}
          onNodesDelete={(deletedNodes) => {
            if (deletedNodes.some((node) => node.id === selectedNodeId)) {
              setSelectedNodeId(null);
            }
          }}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
          nodesDraggable
          nodesConnectable
          elementsSelectable
        >
          <Background color="#38506b" gap={22} size={1} />
          <MiniMap
            pannable
            zoomable
            nodeColor={(node) => node.data?.accent ?? '#38bdf8'}
            maskColor="rgba(3, 7, 18, 0.72)"
          />
          <Controls showInteractive={false} />
        </ReactFlow>

        {nodes.length === 0 && (
          <div className="canvas-empty">
            <strong>Drop devices here</strong>
            <span>Build a first network draft by dragging from the palette.</span>
          </div>
        )}
      </section>

      <aside className="canvas-panel canvas-panel--inspector">
        <div className="canvas-panel__header">
          <h2>Inspector</h2>
          <p>Selected node details and quick actions.</p>
        </div>

        {selectedNode ? (
          <Card className="inspector-card">
            <CardHeader>
              <span
                className="inspector-card__icon"
                style={{ color: selectedNode.data.accent }}
              >
                <DeviceIcon icon={selectedNode.data.icon} />
              </span>
              <div>
                <h3>{selectedNode.data.label}</h3>
                <p>{selectedNode.data.nodeType.replaceAll('_', ' ')}</p>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="inspector-list">
                <div>
                  <dt>Node ID</dt>
                  <dd>{selectedNode.id}</dd>
                </div>
                <div>
                  <dt>Position</dt>
                  <dd>
                    {Math.round(selectedNode.position.x)}, {' '}
                    {Math.round(selectedNode.position.y)}
                  </dd>
                </div>
              </dl>
              <p className="canvas-shortcut">Use Delete or Backspace to remove selected nodes.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="canvas-panel__empty">
            <span>Select a node to inspect it.</span>
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          onClick={clearCanvas}
          disabled={nodes.length === 0 && edges.length === 0}
        >
          Clear canvas
        </Button>
      </aside>
    </div>
  );
}

export function NetworkCanvas() {
  return (
    <ReactFlowProvider>
      <CanvasWorkspace />
    </ReactFlowProvider>
  );
}
