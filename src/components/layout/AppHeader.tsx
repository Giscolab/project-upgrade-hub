import { AlertTriangle, CheckCircle2, Maximize2, Settings2 } from 'lucide-react';

interface AppHeaderProps {
  shaderName: string;
  compileOk: boolean;
  onToggleMigration: () => void;
}

export default function AppHeader({ shaderName, compileOk, onToggleMigration }: AppHeaderProps) {
  return (
    <header className="flex h-10 items-center justify-between border-b border-[#2a2a3a] bg-[#0a0a0f] px-3">
      <div className="flex items-center gap-2">
        <div className="rounded border border-[#2a2a3a] bg-[#16161f] px-1.5 py-0.5 font-mono text-xs text-[#a78bfa]">{'{}'}</div>
        <p className="text-[13px] font-medium text-[#e8e8f0]">GLSL &amp; Shadertoy Studio</p>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-[#b8b8d6]">
        <span>Shader: {shaderName}</span>
        <span className="text-[#555570]">|</span>
        <span className={`inline-flex items-center gap-1 ${compileOk ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
          {compileOk ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
          {compileOk ? 'Compile OK' : 'Compile ERR'}
        </span>
      </div>

      <div className="flex items-center gap-1">
        

        
        <button aria-label="Réglages" className="h-7 w-7 rounded border border-transparent text-[#b8b8d6] transition hover:border-[#2a2a3a] hover:bg-[#1a1a26]" title="Réglages">
          <Settings2 className="mx-auto h-3.5 w-3.5" />
        </button>
        <button
          aria-label="Checklist migration"
          className="h-7 w-7 rounded border border-transparent text-[#b8b8d6] transition hover:border-[#2a2a3a] hover:bg-[#1a1a26]"
          title="Checklist migration"
          onClick={onToggleMigration}>
          
          
        </button>
      </div>
    </header>);

}