import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import type { TEndpointsConfig, TModelSpec } from 'librechat-data-provider';
import { currentWorkspaceAtom } from '~/store/workspaces';

/**
 * Hook to filter available models based on current workspace settings
 * Returns filtered modelSpecs and endpoints based on workspace.settings.availableModels
 *
 * @param modelSpecs - All available model specs
 * @param endpointsConfig - Endpoints configuration
 * @returns Filtered modelSpecs and available endpoints
 */
export function useWorkspaceModels(
  modelSpecs: TModelSpec[] | undefined,
  endpointsConfig: TEndpointsConfig | undefined,
) {
  const currentWorkspace = useAtomValue(currentWorkspaceAtom);
  const workspaceScopedSpecs = useMemo(() => {
    const specs = modelSpecs ?? [];
    const workspaceId = currentWorkspace?.workspaceId ?? null;

    if (!workspaceId) {
      return specs.filter((spec) => !spec.preset?.workspace);
    }

    return specs.filter((spec) => {
      const target = spec.preset?.workspace ?? null;
      return target === null || target === workspaceId;
    });
  }, [currentWorkspace?.workspaceId, modelSpecs]);

  const { filteredModelSpecs, filteredEndpoints } = useMemo(() => {
    if (!currentWorkspace) {
      return {
        filteredModelSpecs: workspaceScopedSpecs,
        filteredEndpoints: endpointsConfig,
      };
    }

    const { availableModels, availableEndpoints } = currentWorkspace.settings || {};

    // If no restrictions, return all models
    if (!availableModels && !availableEndpoints) {
      return {
        filteredModelSpecs: modelSpecs || [],
        filteredEndpoints: endpointsConfig,
      };
    }

    // Filter model specs
    let filteredSpecs = workspaceScopedSpecs;
    if (availableModels && availableModels.length > 0) {
      filteredSpecs = filteredSpecs.filter((spec) => {
        // Check if model name is in available models
        if (spec.name && availableModels.includes(spec.name)) {
          return true;
        }
        // Check if any preset model is in available models
        if (spec.preset?.model && availableModels.includes(spec.preset.model)) {
          return true;
        }
        return false;
      });
    }

    // Filter endpoints
    let filteredEps = endpointsConfig;
    if (availableEndpoints && availableEndpoints.length > 0 && endpointsConfig) {
      filteredEps = Object.keys(endpointsConfig).reduce((acc, key) => {
        if (availableEndpoints.includes(key)) {
          acc[key] = endpointsConfig[key];
        }
        return acc;
      }, {} as TEndpointsConfig);
    }

    return {
      filteredModelSpecs: filteredSpecs,
      filteredEndpoints: filteredEps,
    };
  }, [currentWorkspace, workspaceScopedSpecs, endpointsConfig]);

  return {
    modelSpecs: filteredModelSpecs,
    endpointsConfig: filteredEndpoints,
    isRestricted: !!(
      currentWorkspace?.settings?.availableModels || currentWorkspace?.settings?.availableEndpoints
    ),
  };
}
