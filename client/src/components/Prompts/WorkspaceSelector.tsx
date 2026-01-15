import React from 'react';
import { Building2, Home } from 'lucide-react';
import { Label } from '@librechat/client';
import { useLocalize } from '~/hooks';
import { useGetWorkspacesQuery } from '~/data-provider';
import { cn } from '~/utils';

interface WorkspaceSelectorProps {
  value?: string | null;
  onChange: (workspaceId: string | null) => void;
  className?: string;
  disabled?: boolean;
}

const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  value,
  onChange,
  className = '',
  disabled = false,
}) => {
  const localize = useLocalize();
  const { data: workspacesData, isLoading } = useGetWorkspacesQuery();

  const workspaces = Array.isArray(workspacesData) ? workspacesData : [];

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label className="text-sm font-medium text-text-primary">
        {localize('com_workspace_selector_label') || 'Workspace'}
      </Label>
      <div className="relative">
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled || isLoading}
          className={cn(
            'w-full appearance-none rounded-lg border border-border-medium bg-surface-primary px-4 py-2.5 pr-10 text-sm text-text-primary transition-colors',
            'hover:border-border-heavy focus:border-border-heavy focus:outline-none focus:ring-2 focus:ring-border-heavy/20',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          {/* Personal/No workspace option */}
          <option value="">
            {localize('com_workspace_personal') || 'Personal (No workspace)'}
          </option>

          {/* Available workspaces */}
          {workspaces.map((workspace) => (
            <option key={workspace.workspaceId} value={workspace.workspaceId}>
              {workspace.name}
            </option>
          ))}

          {/* Loading state */}
          {isLoading && <option disabled>{localize('com_ui_loading') || 'Loading...'}</option>}

          {/* Empty state */}
          {!isLoading && workspaces.length === 0 && (
            <option value="" disabled>
              {localize('com_workspace_no_workspaces') || 'No workspaces available'}
            </option>
          )}
        </select>

        {/* Icon indicator */}
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {value ? (
            <Building2 className="h-4 w-4 text-text-secondary" />
          ) : (
            <Home className="h-4 w-4 text-text-secondary" />
          )}
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-text-secondary">
        {value
          ? localize('com_workspace_prompt_workspace_desc') ||
            'This prompt will be associated with the selected workspace'
          : localize('com_workspace_prompt_personal_desc') ||
            'This prompt will be personal and not associated with any workspace'}
      </p>
    </div>
  );
};

export default WorkspaceSelector;
