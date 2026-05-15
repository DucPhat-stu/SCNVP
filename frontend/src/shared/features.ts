import { UserRole } from '@shared/types';

/**
 * Feature flags per role — prevents role-based bugs during development.
 * Defined in FLOW.MD Harness Level 4.
 */
export interface FeatureFlags {
  canvasNodeLimit: number;
  aiEnabled: boolean;
  aiRequestsPerHour: number;
  costEnabled: boolean;
  simulationEnabled: boolean;
  deploymentPlanEnabled: boolean;
  configExportEnabled: boolean;
  tutorialModeEnabled: boolean;
  projectSharingEnabled: boolean;
  userManagementEnabled: boolean;
}

const BASE_FLAGS: FeatureFlags = {
  canvasNodeLimit: Infinity,
  aiEnabled: true,
  aiRequestsPerHour: 100,
  costEnabled: true,
  simulationEnabled: true,
  deploymentPlanEnabled: true,
  configExportEnabled: true,
  tutorialModeEnabled: false,
  projectSharingEnabled: true,
  userManagementEnabled: false,
};

const ROLE_OVERRIDES: Record<UserRole, Partial<FeatureFlags>> = {
  [UserRole.STUDENT]: {
    canvasNodeLimit: 20,
    aiRequestsPerHour: 20,
    costEnabled: false,
    simulationEnabled: false, // guided only
    configExportEnabled: false,
    tutorialModeEnabled: true,
    deploymentPlanEnabled: false,
    projectSharingEnabled: false,
  },
  [UserRole.ENGINEER]: {
    aiRequestsPerHour: 100,
    deploymentPlanEnabled: false,
    canvasNodeLimit: 200,
  },
  [UserRole.ARCHITECT]: {
    aiRequestsPerHour: 200,
  },
  [UserRole.COMPANY]: {
    aiRequestsPerHour: 500,
  },
  [UserRole.ADMIN]: {
    userManagementEnabled: true,
  },
};

export function getFeatureFlags(role: UserRole): FeatureFlags {
  return { ...BASE_FLAGS, ...ROLE_OVERRIDES[role] };
}
