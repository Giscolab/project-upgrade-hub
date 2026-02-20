import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MIGRATION_PLAN, MIGRATION_PLAN_LAST_VERIFIED, getMigrationProgress } from '../config/migrationPlan';

const STATUS_LABEL: Record<string, string> = {
  done: 'Done',
  in_progress: 'In progress',
  pending: 'Pending',
};

const STATUS_CLASS: Record<string, string> = {
  done: 'bg-green-500/20 text-green-300 border-green-500/30',
  in_progress: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  pending: 'bg-muted text-muted-foreground border-border',
};

interface MigrationChecklistPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function MigrationChecklistPanel({ open, onClose }: MigrationChecklistPanelProps) {
  const progress = getMigrationProgress();
  if (!open) return null;

  return (
    <div className="absolute inset-0 z-40 flex items-start justify-end bg-black/40 p-4">
      <section className="max-h-[70vh] w-[40rem] overflow-auto rounded-lg border border-[#2a2a3a] bg-[#111118] p-3 text-xs text-[#8888aa] shader-scrollbar">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[#e8e8f0]">Migration checklist (legacy → React)</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {progress.completionPercent}% approx. · vérifié {MIGRATION_PLAN_LAST_VERIFIED}
            </Badge>
            <button type="button" onClick={onClose} className="rounded border border-[#2a2a3a] p-1 text-[#8888aa] hover:bg-[#1a1a26]">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {MIGRATION_PLAN.map((item) => (
            <article key={item.id} className="rounded-md border border-[#2a2a3a] p-2">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="font-medium text-[#e8e8f0]">{item.id}</p>
                <span className={`rounded border px-2 py-0.5 text-[10px] ${STATUS_CLASS[item.status]}`}>{STATUS_LABEL[item.status]}</span>
              </div>
              <p>Legacy: {item.legacyFile}</p>
              <p>React target: {item.reactTarget}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
