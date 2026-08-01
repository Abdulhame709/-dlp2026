import { useEffect } from 'react';

export function useKeyboardShortcuts(shortcuts: { [key: string]: () => void }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is writing in an input, textarea, or select
      const activeEl = document.activeElement;
      const isInput = activeEl instanceof HTMLInputElement || 
                      activeEl instanceof HTMLTextAreaElement || 
                      activeEl?.getAttribute('contenteditable') === 'true';

      if (isInput && e.key !== 'Enter') return;

      const key = e.key.toLowerCase();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Handle Ctrl/Cmd + Key combos
      if (isCtrlOrCmd && key === 'k' && shortcuts['ctrl+k']) {
        e.preventDefault();
        shortcuts['ctrl+k']();
        return;
      }

      if (isCtrlOrCmd && e.key === 'Enter' && shortcuts['ctrl+enter']) {
        e.preventDefault();
        shortcuts['ctrl+enter']();
        return;
      }

      // Handle single key hotkeys (disabled when typing inside inputs)
      if (!isInput) {
        if (e.key === 'n' && shortcuts['n']) {
          e.preventDefault();
          shortcuts['n']();
        } else if (e.key === 'e' && shortcuts['e']) {
          e.preventDefault();
          shortcuts['e']();
        } else if (e.key === 'Delete' && shortcuts['delete']) {
          e.preventDefault();
          shortcuts['delete']();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}
