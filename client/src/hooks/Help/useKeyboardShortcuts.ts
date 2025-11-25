import { useEffect } from 'react';

interface KeyboardShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
  description?: string;
}

/**
 * Hook to register keyboard shortcuts
 * @param shortcuts - Array of keyboard shortcut configurations
 * @param enabled - Whether shortcuts are enabled (default: true)
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcutConfig[],
  enabled: boolean = true
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: allow Ctrl+K/Cmd+K for search even in inputs
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          // Let it through
        } else {
          return;
        }
      }

      for (const shortcut of shortcuts) {
        const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;
        const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

        // For Ctrl/Cmd shortcuts, accept either
        const modifierMatches =
          (shortcut.ctrlKey || shortcut.metaKey) ? (event.ctrlKey || event.metaKey) : true;

        if (
          keyMatches &&
          modifierMatches &&
          shiftMatches &&
          altMatches &&
          (!shortcut.ctrlKey || ctrlMatches || metaMatches) &&
          (!shortcut.metaKey || metaMatches || ctrlMatches)
        ) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts, enabled]);
}

/**
 * Hook for help page specific keyboard shortcuts
 */
export function useHelpKeyboardShortcuts({
  onNextSection,
  onPreviousSection,
  onGoHome,
  onToggleSidebar,
}: {
  onNextSection?: () => void;
  onPreviousSection?: () => void;
  onGoHome?: () => void;
  onToggleSidebar?: () => void;
}) {
  const shortcuts: KeyboardShortcutConfig[] = [
    {
      key: 'ArrowRight',
      callback: () => onNextSection?.(),
      description: 'Go to next section',
    },
    {
      key: 'ArrowLeft',
      callback: () => onPreviousSection?.(),
      description: 'Go to previous section',
    },
    {
      key: 'h',
      callback: () => onGoHome?.(),
      description: 'Go to home page',
    },
    {
      key: 'Escape',
      callback: () => onToggleSidebar?.(),
      description: 'Toggle sidebar',
    },
  ];

  useKeyboardShortcuts(shortcuts.filter((s) => s.callback !== undefined));
}
