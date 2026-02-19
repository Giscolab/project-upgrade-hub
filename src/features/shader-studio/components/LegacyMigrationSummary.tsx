import { LEGACY_AUDIO_DEFAULTS, LEGACY_PARAMS, LEGACY_VIDEO_DEFAULTS } from '../config/legacyConfig';

export default function LegacyMigrationSummary() {
  return (
    <section className="glass-panel absolute bottom-14 left-4 z-30 w-[32rem] rounded-lg p-3 text-xs text-muted-foreground">
      <p className="mb-2 text-foreground">Legacy → React migration snapshot</p>
      <p>Legacy params migrated to typed React config: <strong>{LEGACY_PARAMS.length}</strong>.</p>
      <p>Audio defaults migrated: bass {LEGACY_AUDIO_DEFAULTS.gainBass}, mid {LEGACY_AUDIO_DEFAULTS.gainMid}, high {LEGACY_AUDIO_DEFAULTS.gainHigh}.</p>
      <p>Video defaults migrated: {LEGACY_VIDEO_DEFAULTS.fps} fps / {LEGACY_VIDEO_DEFAULTS.duration}s.</p>
    </section>
  );
}
