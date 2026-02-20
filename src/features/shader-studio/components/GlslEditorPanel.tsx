import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { EditorView, keymap } from '@codemirror/view';
import { Badge } from '@/components/ui/badge';
import { Code, Download, Upload, Trash2, Eye, EyeOff, Play, Save } from 'lucide-react';

interface GlslEditorPanelProps {
  vertexShader: string;
  fragmentShader: string;
  onVertexChange: (code: string) => void;
  onFragmentChange: (code: string) => void;
  onCompile: () => void;
  onExportCode: () => void;
}

type EditorTab = 'vertex' | 'fragment';

function detectShaderToy(code: string): boolean {
  return /void\s+mainImage\s*\(/.test(code);
}

const editorTheme = EditorView.theme({
  '&': {
    fontSize: '12px',
    backgroundColor: 'transparent',
  },
  '.cm-content': {
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    caretColor: 'hsl(265 80% 60%)',
  },
  '.cm-cursor': {
    borderLeftColor: 'hsl(265 80% 60%)',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': {
    backgroundColor: 'hsla(265, 80%, 60%, 0.2) !important',
  },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: '1px solid hsla(220, 14%, 20%, 0.4)',
    color: 'hsl(220 10% 40%)',
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'hsla(265, 80%, 60%, 0.1)',
  },
  '.cm-activeLine': {
    backgroundColor: 'hsla(220, 14%, 20%, 0.3)',
  },
  '.cm-line': {
    padding: '0 4px',
  },
});

export default function GlslEditorPanel({
  vertexShader,
  fragmentShader,
  onVertexChange,
  onFragmentChange,
  onCompile,
  onExportCode,
}: GlslEditorPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [tab, setTab] = useState<EditorTab>('fragment');
  const [localVertex, setLocalVertex] = useState(vertexShader);
  const [localFragment, setLocalFragment] = useState(fragmentShader);

  const isShaderToy = useMemo(() => detectShaderToy(localFragment), [localFragment]);

  // Sync external changes
  useEffect(() => { setLocalVertex(vertexShader); }, [vertexShader]);
  useEffect(() => { setLocalFragment(fragmentShader); }, [fragmentShader]);

  const handleCompile = useCallback(() => {
    onVertexChange(localVertex);
    onFragmentChange(localFragment);
    onCompile();
  }, [localVertex, localFragment, onVertexChange, onFragmentChange, onCompile]);

  const handleClear = useCallback(() => {
    if (tab === 'vertex') {
      setLocalVertex('');
    } else {
      setLocalFragment('');
    }
  }, [tab]);

  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.glsl,.frag,.vert,.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const text = reader.result as string;
        if (tab === 'vertex') {
          setLocalVertex(text);
        } else {
          setLocalFragment(text);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [tab]);

  // Ctrl+S compile keymap
  const compileKeymap = useMemo(
    () =>
      keymap.of([
        {
          key: 'Mod-s',
          run: () => {
            handleCompile();
            return true;
          },
        },
      ]),
    [handleCompile],
  );

  const extensions = useMemo(() => [cpp(), editorTheme, compileKeymap], [compileKeymap]);

  const currentCode = tab === 'vertex' ? localVertex : localFragment;
  const setCurrentCode = tab === 'vertex' ? setLocalVertex : setLocalFragment;

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="glass-panel absolute left-4 top-20 z-30 flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-primary/20"
        title="Ouvrir l'éditeur GLSL"
      >
        <Code className="h-4 w-4 text-primary" />
      </button>
    );
  }

  return (
    <aside className="glass-panel absolute left-4 top-20 z-30 flex max-h-[calc(100vh-7rem)] w-[420px] flex-col rounded-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold tracking-wide text-foreground">GLSL EDITOR</span>
          {isShaderToy && (
            <Badge variant="outline" className="border-accent/50 text-[10px] text-accent">
              ShaderToy
            </Badge>
          )}
        </div>
        <button
          onClick={() => setCollapsed(true)}
          className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Réduire l'éditeur"
        >
          <EyeOff className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border/40">
        {(['fragment', 'vertex'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wider transition-colors ${
              tab === t
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-border/40 px-2 py-1.5">
        <ToolbarButton icon={Play} label="Compiler (Ctrl+S)" onClick={handleCompile} accent />
        <ToolbarButton icon={Upload} label="Importer" onClick={handleImport} />
        <ToolbarButton icon={Save} label="Exporter .frag" onClick={onExportCode} />
        <ToolbarButton icon={Trash2} label="Effacer" onClick={handleClear} />
        <div className="ml-auto text-[10px] text-muted-foreground">
          {currentCode.split('\n').length} lignes
        </div>
      </div>

      {/* Editor */}
      <div className="min-h-0 flex-1 overflow-auto shader-scrollbar">
        <CodeMirror
          value={currentCode}
          onChange={setCurrentCode}
          extensions={extensions}
          theme="dark"
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: false,
          }}
          style={{ fontSize: '12px' }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border/40 px-3 py-1.5 text-[10px] text-muted-foreground">
        <span>Ctrl+S pour compiler</span>
        {isShaderToy && <span className="text-accent">Mode ShaderToy détecté</span>}
      </div>
    </aside>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1 rounded px-2 py-1 text-[11px] transition-colors ${
        accent
          ? 'bg-primary/20 text-primary hover:bg-primary/30'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      }`}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
