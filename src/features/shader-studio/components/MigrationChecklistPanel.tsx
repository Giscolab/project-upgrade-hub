import { Badge } from '@/components/ui/badge';
import { MIGRATION_PLAN, getMigrationProgress } from '../config/migrationPlan';

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

export default function MigrationChecklistPanel() {
  const progress = getMigrationProgress();

  return (
    <section className="glass-panel absolute bottom-14 right-4 z-30 max-h-[40vh] w-[40rem] overflow-auto rounded-lg p-3 text-xs text-muted-foreground">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-foreground">Migration checklist (legacy → React)</p>
        <Badge variant="outline" className="text-xs">
          {progress.completionPercent}% approx.
        </Badge>
      </div>

      <div className="space-y-3">
        {MIGRATION_PLAN.map((item) => (
          <article key={item.id} className="rounded-md border border-border/60 p-2">
            <div className="mb-1 flex items-center justify-between gap-2">
              <p className="font-medium text-foreground">{item.id}</p>
              <span className={`rounded border px-2 py-0.5 text-[10px] ${STATUS_CLASS[item.status]}`}>
                {STATUS_LABEL[item.status]}
              </span>
            </div>
            <p>Legacy: {item.legacyFile}</p>
            <p>React target: {item.reactTarget}</p>
            <p className="mt-1">Remaining: {item.remainingWork[0]}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
