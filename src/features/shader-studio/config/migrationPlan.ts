export type MigrationStatus = 'done' | 'in_progress' | 'pending';

export interface MigrationItem {
  id: string;
  legacyFile: string;
  reactTarget: string;
  status: MigrationStatus;
  scope: string;
  completedWork: string[];
  remainingWork: string[];
  validationChecks: string[];
}

export const MIGRATION_PLAN: MigrationItem[] = [
  {
    id: 'render-core',
    legacyFile: 'App.js + shaders.js',
    reactTarget: 'src/components/shader/BabylonCanvas.tsx',
    status: 'in_progress',
    scope: 'Babylon scene lifecycle, shader uniforms, geometry coverage',
    completedWork: [
      'React canvas orchestration exists',
      'Shader uniforms (time, amplitude, frequency, colors) wired',
      'Scale updates are applied at runtime',
      'Extended geometry support migrated with MeshBuilder',
    ],
    remainingWork: [
      'Migrate legacy post-process pipeline (pixel, glitch, vignette) to Babylon React flow',
      'Migrate ShaderToy mode uniforms and channel system',
      'Reconcile legacy geometry names not yet mapped (custom shapes)',
    ],
    validationChecks: [
      'Geometry switch updates mesh without leaks',
      'Scale and rotation controls update in real time',
      'Shader compile errors are surfaced in UI',
    ],
  },
  {
    id: 'ui-controls',
    legacyFile: 'App.js tweakpane sections',
    reactTarget: 'src/features/shader-studio/components/ShaderControls.tsx',
    status: 'in_progress',
    scope: 'All legacy tweakpane controls replaced by React UI',
    completedWork: [
      'Main shader controls migrated (geometry, noise, speed, amplitude, frequency, scale)',
      'Color pickers and key toggles migrated',
      'Post-process intensity sliders added',
      'Migration coverage panels are now rendered in the main Shader Studio page',
      'ShaderControls toggle rendering loop has been stabilized and typechecked',
    ],
    remainingWork: [
      'Add advanced material controls (metalness, fresnel, rim)',
      'Add texture layers and blend mode controls',
      'Add shader code editor and validation actions',
      'Link each remaining migration item to actionable UI shortcuts',
      'Finalize expert controls parity (material, texture, shader editor)',
    ],
    validationChecks: [
      'Every React control updates rendered output',
      'Reset restores same values as documented defaults',
      'Keyboard accessibility and focus order validated',
    ],
  },
  {
    id: 'audio-engine',
    legacyFile: 'AudioEngine.js',
    reactTarget: 'src/features/shader-studio/hooks + services',
    status: 'pending',
    scope: 'Audio input, FFT analysis, band mapping, beat detection',
    completedWork: [
      'Audio settings state scaffold created in React',
    ],
    remainingWork: [
      'Create React audio service wrapper around Web Audio API',
      'Map band values into shader params in render loop',
      'Add mic/file source selectors with permissions handling',
      'Implement beat flash and threshold calibration UI',
    ],
    validationChecks: [
      'FFT updates at stable frame rate',
      'Band mapping changes affect correct uniforms',
      'Stop/reset releases audio resources cleanly',
    ],
  },
  {
    id: 'midi',
    legacyFile: 'MidiHandler.js',
    reactTarget: 'src/features/shader-studio/hooks/useMidiMapping.ts',
    status: 'pending',
    scope: 'MIDI learn, mapping persistence, input monitor',
    completedWork: [],
    remainingWork: [
      'Implement Web MIDI connection lifecycle hook',
      'Add MIDI learn flow on selected React control',
      'Persist mapping table and restore on reload',
    ],
    validationChecks: [
      'Incoming CC values update mapped parameters',
      'Disconnected device is handled without crash',
      'Mapping table export/import works',
    ],
  },
  {
    id: 'video-export',
    legacyFile: 'VideoRecorder.js',
    reactTarget: 'src/features/shader-studio/services/videoExportService.ts',
    status: 'pending',
    scope: 'Render capture (webm/mp4), bitrate/resolution presets',
    completedWork: [
      'Video settings state scaffold created in React',
    ],
    remainingWork: [
      'Integrate MediaRecorder capture workflow',
      'Expose duration/codec/quality controls in React panel',
      'Add progress and cancel states',
    ],
    validationChecks: [
      'Export duration matches configured value',
      'Output file plays in browser and external player',
      'No dropped frame spike during capture',
    ],
  },
  {
    id: 'preset-storage',
    legacyFile: 'App.js localStorage and history blocks',
    reactTarget: 'src/features/shader-studio/state',
    status: 'in_progress',
    scope: 'State persistence, preset save/load, undo/redo',
    completedWork: [
      'Local storage persistence for shader/audio/video states',
    ],
    remainingWork: [
      'Add named preset manager and versioning',
      'Add undo/redo stack with bounded history',
      'Add migration layer for old storage schema',
    ],
    validationChecks: [
      'Reload restores all panels and scene params',
      'Undo/redo produces deterministic state transitions',
      'Invalid saved data falls back safely',
    ],
  },
];

export function getMigrationProgress() {
  const total = MIGRATION_PLAN.length;
  const done = MIGRATION_PLAN.filter((item) => item.status === 'done').length;
  const inProgress = MIGRATION_PLAN.filter((item) => item.status === 'in_progress').length;
  const pending = MIGRATION_PLAN.filter((item) => item.status === 'pending').length;
  const completionPercent = Math.round(((done + inProgress * 0.5) / total) * 100);

  return { total, done, inProgress, pending, completionPercent };
}
