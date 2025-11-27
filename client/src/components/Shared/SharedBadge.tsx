import React from 'react';
import { Users, Building2, Lock, Globe } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

export type VisibilityType = 'private' | 'workspace' | 'shared_with' | 'global';

interface SharedBadgeProps {
  visibility: VisibilityType;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const VISIBILITY_CONFIG = {
  private: {
    icon: Lock,
    label: 'com_nav_share_private',
    colorClass: 'text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400',
  },
  workspace: {
    icon: Building2,
    label: 'com_nav_share_workspace',
    colorClass: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400',
  },
  shared_with: {
    icon: Users,
    label: 'com_nav_share_specific',
    colorClass: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
  },
  global: {
    icon: Globe,
    label: 'com_nav_share_global',
    colorClass: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
  },
};

const SIZE_CONFIG = {
  sm: {
    iconSize: 'h-3 w-3',
    textSize: 'text-xs',
    padding: 'px-1.5 py-0.5',
    gap: 'gap-1',
  },
  md: {
    iconSize: 'h-3.5 w-3.5',
    textSize: 'text-sm',
    padding: 'px-2 py-1',
    gap: 'gap-1.5',
  },
  lg: {
    iconSize: 'h-4 w-4',
    textSize: 'text-sm',
    padding: 'px-2.5 py-1.5',
    gap: 'gap-2',
  },
};

export default function SharedBadge({
  visibility,
  className = '',
  showLabel = true,
  size = 'sm',
}: SharedBadgeProps) {
  const localize = useLocalize();
  const config = VISIBILITY_CONFIG[visibility];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  // Don't show badge for private resources
  if (visibility === 'private') {
    return null;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        config.colorClass,
        sizeConfig.padding,
        sizeConfig.gap,
        className,
      )}
      title={localize(config.label)}
    >
      <Icon className={sizeConfig.iconSize} />
      {showLabel && (
        <span className={sizeConfig.textSize}>{localize(config.label)}</span>
      )}
    </div>
  );
}
