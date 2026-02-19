import { getLegacyCoverage } from '../config/legacyAdapter';
import { LEGACY_AUDIO_DEFAULTS, LEGACY_VIDEO_DEFAULTS } from '../config/legacyConfig';

export default function LegacyMigrationSummary() {
  const coverage = getLegacyCoverage();

  return (
    <section className="glass-panel absolute bottom-14 left-4 z-30 w-[36rem] rounded-lg p-3 text-xs text-muted-foreground">
      <p className="mb-2 text-foreground">Legacy → React migration snapshot</p>
      <p>
        Coverage: <strong>{coverage.migratedCount}</strong> / <strong>{coverage.total}</strong> params migrated to React state.
      </p>
      <p>Pending migration items: {coverage.pendingCount}.</p>
      <p>Audio defaults migrated: bass {LEGACY_AUDIO_DEFAULTS.gainBass}, mid {LEGACY_AUDIO_DEFAULTS.gainMid}, high {LEGACY_AUDIO_DEFAULTS.gainHigh}.</p>
      <p>Video defaults migrated: {LEGACY_VIDEO_DEFAULTS.fps} fps / {LEGACY_VIDEO_DEFAULTS.duration}s.</p>
      <p className="mt-2 truncate">Pending IDs: {coverage.pendingIds.join(', ') || 'none'}</p>
    </section>
  );
}
