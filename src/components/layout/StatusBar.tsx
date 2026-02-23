import { forwardRef } from 'react';

interface StatusBarProps {
  statusText: string;
}

const StatusBar = forwardRef<HTMLElement, StatusBarProps>(({ statusText }, ref) => {
  return (
    <footer ref={ref} className="flex h-6 items-center justify-between border-t border-[#2a2a3a] bg-[#0a0a0f] px-3 text-[11px] text-[#555570]">
      <span className="truncate">{statusText}</span>
      <span className="hidden md:inline">Ctrl+S compiler · Ctrl+Z undo · Double-click fullscreen</span>
    </footer>
  );
});

StatusBar.displayName = 'StatusBar';

export default StatusBar;
