import React from 'react';
import { Link2, ExternalLink, FileText, Paperclip } from 'lucide-react';
import { useLocalize } from '~/hooks';
import { cn } from '~/utils';

interface CustomLink {
  title: string;
  url: string;
  icon?: 'document' | 'link';
}

interface QuickLinksWidgetProps {
  customLinks: CustomLink[];
  className?: string;
}

const getLinkIcon = (iconType?: string) => {
  switch (iconType) {
    case 'document':
      return FileText;
    case 'link':
      return Link2;
    default:
      return Paperclip;
  }
};

export default function QuickLinksWidget({ customLinks, className = '' }: QuickLinksWidgetProps) {
  const localize = useLocalize();

  if (!customLinks || customLinks.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-text-primary">
        <Link2 className="h-5 w-5" />
        {localize('com_workspace_quick_links') || 'Quick Links'}
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {customLinks.map((link, index) => {
          const IconComponent = getLinkIcon(link.icon);
          return (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-lg border border-border-light bg-surface-secondary p-4 transition-colors hover:bg-surface-tertiary hover:border-border-medium"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate font-medium text-text-primary group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {link.title}
                  </h3>
                  <ExternalLink className="h-4 w-4 flex-shrink-0 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="truncate text-xs text-text-tertiary">{link.url}</p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
