import { useCallback, useEffect, useRef, useState } from 'react';
import { useNetworkStore } from '@shared/store/networkStore';
import type { NetworkNode, Connection } from '@shared/types';
import { message } from 'antd';

interface HistoryState {
  nodes: NetworkNode[];
  connections: Connection[];
}

/**
 * Hook to manage undo/redo history for the canvas.
 * Implements a command/snapshot pattern with state tracking.
 * Limits history to 50 actions as per FR-CANVAS-05.
 */
export function useCanvasHistory() {
  const { nodes, connections, setTopology } = useNetworkStore();
  
  const [past, setPast] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);
  
  // Ref to track if the change is coming from history navigation
  const isHistoryNavigating = useRef(false);
  
  // Keep track of the "last known" stable state
  const lastKnownState = useRef<HistoryState>({ nodes, connections });

  /**
   * Action to undo the last recorded change.
   */
  const undo = useCallback(() => {
    if (past.length === 0) return;

    const previous = past[past.length - 1];
    const newPast = past.slice(0, -1);

    isHistoryNavigating.current = true;
    
    setFuture(prev => [lastKnownState.current, ...prev]);
    setPast(newPast);
    lastKnownState.current = previous;
    
    setTopology(previous.nodes, previous.connections);
    message.info('Undo');
  }, [past, setTopology]);

  /**
   * Action to redo a previously undone change.
   */
  const redo = useCallback(() => {
    if (future.length === 0) return;

    const next = future[0];
    const newFuture = future.slice(1);

    isHistoryNavigating.current = true;
    
    setPast(prev => [...prev, lastKnownState.current]);
    setFuture(newFuture);
    lastKnownState.current = next;
    
    setTopology(next.nodes, next.connections);
    message.info('Redo');
  }, [future, setTopology]);

  /**
   * Record a snapshot of the current state.
   */
  const record = useCallback((nodes: NetworkNode[], connections: Connection[]) => {
    if (isHistoryNavigating.current) {
      isHistoryNavigating.current = false;
      return;
    }

    setPast(prev => [...prev.slice(-49), lastKnownState.current]);
    setFuture([]);
    lastKnownState.current = { nodes, connections };
  }, []);

  // Monitor store changes and record them if they differ from last known state
  useEffect(() => {
    const hasChanged = 
      nodes !== lastKnownState.current.nodes || 
      connections !== lastKnownState.current.connections;

    if (hasChanged) {
      record(nodes, connections);
    }
  }, [nodes, connections, record]);

  // Global keyboard shortcuts (Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.ctrlKey || e.metaKey;
      if (!isCmd) return;

      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    historyDepth: past.length
  };
}
