import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@librechat/client';

export interface EmptyStateProps {
  /**
   * Icon to display
   */
  icon?: LucideIcon;
  /**
   * Title of the empty state
   */
  title: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Call-to-action button text
   */
  actionText?: string;
  /**
   * Call-to-action button click handler
   */
  onAction?: () => void;
  /**
   * Custom className for container
   */
  className?: string;
}

/**
 * EmptyState component for displaying empty lists or missing content
 *
 * @example
 * <EmptyState
 *   icon={Users}
 *   title="No members yet"
 *   description="Add your first member to get started"
 *   actionText="Add Member"
 *   onAction={() => setShowAddDialog(true)}
 * />
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-border-light bg-surface-secondary p-8 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {Icon && (
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-tertiary">
          <Icon className="h-8 w-8 text-text-secondary" aria-hidden="true" />
        </div>
      )}

      <h3 className="mb-2 text-base font-semibold text-text-primary">{title}</h3>

      {description && (
        <p className="mb-4 max-w-sm text-sm text-text-secondary">{description}</p>
      )}

      {actionText && onAction && (
        <Button onClick={onAction} variant="default" size="sm">
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
