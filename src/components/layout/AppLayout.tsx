import { ReactNode } from 'react';
import AppHeader from './AppHeader';
import StatusBar from './StatusBar';

interface AppLayoutProps {
  shaderName: string;
  compileOk: boolean;
  statusText: string;
  onToggleMigration: () => void;
  leftPanel: ReactNode;
  canvas: ReactNode;
  rightPanel: ReactNode;
}

export default function AppLayout({ shaderName, compileOk, statusText, onToggleMigration, leftPanel, canvas, rightPanel }: AppLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#0a0a0f] text-[#e8e8f0]">
      <AppHeader shaderName={shaderName} compileOk={compileOk} onToggleMigration={onToggleMigration} />
      <main className="flex min-h-0 flex-1 overflow-hidden">
        <section className="w-[320px] shrink-0 overflow-hidden border-r border-[#2a2a3a] bg-[#111118]">{leftPanel}</section>
        <section className="relative min-w-0 flex-1 bg-black">{canvas}</section>
        {rightPanel}
      </main>
      <StatusBar statusText={statusText} />
    </div>
  );
}
