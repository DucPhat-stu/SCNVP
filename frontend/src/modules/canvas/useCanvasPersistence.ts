import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '@lib/api';
import { API_ROUTES } from '@lib/api-contract';
import { useNetworkStore } from '@shared/store/networkStore';
import { useProjectStore } from '@shared/store/projectStore';
import type { Network, Project } from '@shared/types';
import { message } from 'antd';
import debounce from 'lodash/debounce';

/**
 * Hook to manage canvas state persistence with the backend.
 * Handles loading initial topology, manual saves, and auto-saves.
 * Bridging React Flow state and Backend Schema.
 */
export function useCanvasPersistence() {
  const { id: projectId } = useParams<{ id: string }>();
  const { setTopology, nodes: storeNodes, connections: storeConnections } = useNetworkStore();
  const { setCurrentProject } = useProjectStore();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isError, setIsError] = useState(false);
  
  // Ref to track if initial data is loaded to prevent saving default empty state
  const isInitialLoadComplete = useRef(false);

  /**
   * Fetch project and topology from API.
   */
  const loadData = useCallback(async () => {
    if (!projectId) return;
    
    setIsSyncing(true);
    setIsError(false);
    try {
      // Parallel fetch for project details and network topology
      const [project, network] = await Promise.all([
        api.get<Project>(API_ROUTES.PROJECTS.GET(projectId)),
        api.get<Network>(API_ROUTES.NETWORK.GET(projectId))
      ]);

      setCurrentProject(project as unknown as Project);
      
      const { nodes, connections, metadata } = network as unknown as Network;
      setTopology(nodes || [], connections || [], metadata);
      
      isInitialLoadComplete.current = true;
      setLastSaved(new Date());
    } catch (error: any) {
      console.error('Canvas load error:', error);
      setIsError(true);
      message.error(error?.message || 'Failed to initialize project canvas');
    } finally {
      setIsSyncing(false);
    }
  }, [projectId, setCurrentProject, setTopology]);

  /**
   * Send current state to API.
   */
  const saveData = useCallback(async (isAutoSave = false) => {
    if (!projectId || !isInitialLoadComplete.current) return;

    if (!isAutoSave) setIsSyncing(true);
    
    try {
      await api.put(API_ROUTES.NETWORK.SAVE(projectId), {
        nodes: storeNodes,
        connections: storeConnections,
      });
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        message.success('Project saved');
      }
    } catch (error: any) {
      console.error('Save error:', error);
      if (!isAutoSave) {
        message.error('Failed to save project changes');
      }
    } finally {
      if (!isAutoSave) setIsSyncing(false);
    }
  }, [projectId, storeNodes, storeConnections]);

  // Keyboard shortcut: Ctrl+S or Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveData();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveData]);

  // Debounced auto-save (30s)
  const autoSave = useRef(
    debounce(() => {
      saveData(true);
    }, 30000)
  ).current;

  // Trigger auto-save on state changes
  useEffect(() => {
    if (isInitialLoadComplete.current) {
      autoSave();
    }
  }, [storeNodes, storeConnections, autoSave]);

  // Initial load
  useEffect(() => {
    loadData();
    return () => {
      isInitialLoadComplete.current = false;
      autoSave.cancel();
    };
  }, [loadData, autoSave]);

  return {
    isSyncing,
    lastSaved,
    isError,
    saveData,
    reload: loadData,
  };
}
