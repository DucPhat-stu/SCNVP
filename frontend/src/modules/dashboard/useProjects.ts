import { useCallback, useState } from 'react';
import api from '@lib/api';
import { API_ROUTES } from '@lib/api-contract';
import { useProjectStore } from '@shared/store/projectStore';
import type { Project, ProjectScale } from '@shared/types';
import { message } from 'antd';

/**
 * Hook for managing project CRUD operations.
 * Synchronizes local projectStore with backend API.
 */
export function useProjects() {
  const {
    projects,
    setProjects,
    addProject,
    removeProject: storeRemoveProject,
    setLoading,
    isLoading,
  } = useProjectStore();
  
  const [isCreating, setIsCreating] = useState(false);

  /**
   * Fetch all projects owned by the current user.
   */
  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      // API response is already unwrapped by the interceptor in lib/api.ts
      const data = await api.get<Project[]>(API_ROUTES.PROJECTS.LIST);
      setProjects(data as unknown as Project[]);
    } catch (error: any) {
      console.error('Failed to fetch projects:', error);
      message.error(error?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setProjects]);

  /**
   * Create a new network project.
   */
  const createProject = async (values: {
    name: string;
    cityName?: string;
    scale: ProjectScale;
    budget?: number;
  }) => {
    setIsCreating(true);
    try {
      const data = await api.post<Project>(API_ROUTES.PROJECTS.CREATE, values);
      const newProject = data as unknown as Project;
      addProject(newProject);
      message.success('Project created successfully');
      return newProject;
    } catch (error: any) {
      console.error('Failed to create project:', error);
      message.error(error?.message || 'Failed to create project');
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  /**
   * Delete a project by ID.
   */
  const deleteProject = async (id: string) => {
    try {
      await api.delete(API_ROUTES.PROJECTS.DELETE(id));
      storeRemoveProject(id);
      message.success('Project deleted');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      message.error(error?.message || 'Failed to delete project');
    }
  };

  return {
    projects,
    isLoading,
    isCreating,
    fetchProjects,
    createProject,
    deleteProject,
  };
}
