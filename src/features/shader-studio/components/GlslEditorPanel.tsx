import { useCallback, useEffect, useMemo, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { EditorView, keymap } from '@codemirror/view';
import { Code, Play, Save, Trash2, Upload } from 'lucide-react';

interface GlslEditorPanelProps {
  vertexShader: string;
  fragmentShader: string;
  onVertexChange: (code: string) => void;
  onFragmentChange: (code: string) => void;
  onCompile: () => void;
  onExportCode: () => void;
}

type EditorTab = 'vertex' | 'fragment';

const editorTheme = EditorView.theme({
  '&': { fontSize: '12px', backgroundColor: '#0a0a0f' },
  '.cm-content': { fontFamily: "'JetBrains Mono', 'Fira Code', monospace", caretColor: '#a78bfa' },
  '.cm-cursor': { borderLeftColor: '#a78bfa' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'rgba(108, 99, 255, 0.25) !important' },
  '.cm-gutters': { backgroundColor: '#111118', borderRight: '1px solid #2a2a3a', color: '#555570' },
  '.cm-activeLine': { backgroundColor: 'rgba(26,26,38,0.8)' },
});

export default function GlslEditorPanel({ vertexShader, fragmentShader, onVertexChange, onFragmentChange, onCompile, onExportCode }: GlslEditorPanelProps) {
  const [tab, setTab] = useState<EditorTab>('fragment');
  const [localVertex, setLocalVertex] = useState(vertexShader);
  const [localFragment, setLocalFragment] = useState(fragmentShader);

  useEffect(() => setLocalVertex(vertexShader), [vertexShader]);
  useEffect(() => setLocalFragment(fragmentShader), [fragmentShader]);

  const handleCompile = useCallback(() => {
    onVertexChange(localVertex);
    onFragmentChange(localFragment);
    onCompile();
  }, [localVertex, localFragment, onCompile, onFragmentChange, onVertexChange]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glsl,.frag,.vert,.txt';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        if (tab === 'vertex') setLocalVertex(text);
        else setLocalFragment(text);
      };
      reader.readAsText(file);
    };
    input.click();
  }, [tab]);

  const compileKeymap = useMemo(
    () => keymap.of([{ key: 'Mod-s', run: () => { handleCompile(); return true; } }]),
    [handleCompile],
  );

  const extensions = useMemo(() => [cpp(), editorTheme, compileKeymap], [compileKeymap]);
  const currentCode = tab === 'vertex' ? localVertex : localFragment;
  const setCurrentCode = tab === 'vertex' ? setLocalVertex : setLocalFragment;

  return (
    <aside className="flex h-full min-h-0 flex-col bg-[#111118]">
      <div className="flex items-center justify-between border-b border-[#2a2a3a] bg-[#16161f] px-2 py-1.5">
        <div className="flex items-center gap-1.5 text-[11px] text-[#e8e8f0]"><Code className="h-3.5 w-3.5 text-[#a78bfa]" /> GLSL</div>
        <div className="text-[11px] text-[#8888aa]">{currentCode.split('\n').length} lignes</div>
      </div>

      <div className="flex border-b border-[#2a2a3a]">
        {(['fragment', 'vertex'] as const).map((value) => (
          <button key={value} onClick={() => setTab(value)} className={`flex-1 px-2 py-1.5 text-[11px] uppercase tracking-wider ${tab === value ? 'bg-[#1a1a26] text-[#a78bfa]' : 'text-[#8888aa] hover:bg-[#1a1a26]'}`}>
            {value}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1 border-b border-[#2a2a3a] px-2 py-1">
        <ToolbarButton icon={Play} label="Compiler" onClick={handleCompile} primary />
        <ToolbarButton icon={Upload} label="Importer" onClick={handleImport} />
        <ToolbarButton icon={Save} label="Exporter .frag" onClick={onExportCode} />
        <ToolbarButton icon={Trash2} label="Effacer" onClick={() => setCurrentCode('')} />
      </div>

      <div className="min-h-0 flex-1 overflow-auto shader-scrollbar">
        <CodeMirror
          value={currentCode}
          onChange={setCurrentCode}
          extensions={extensions}
          theme="dark"
          basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: true, bracketMatching: true, closeBrackets: true }}
        />
      </div>

      <div className="border-t border-[#2a2a3a] px-2 py-1 text-[10px] text-[#8888aa]">Ctrl/Cmd+S pour compiler</div>
    </aside>
  );
}

function ToolbarButton({ icon: Icon, label, onClick, primary }: { icon: React.ComponentType<{ className?: string }>; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button onClick={onClick} title={label} className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-[11px] ${primary ? 'border-[#6c63ff] bg-[#6c63ff] text-white' : 'border-[#2a2a3a] bg-[#1a1a26] text-[#e8e8f0]'}`}>
      <Icon className="h-3 w-3" />
      <span>{label}</span>
    </button>
  );
}
