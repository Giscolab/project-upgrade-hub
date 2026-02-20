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
      'Pixel/glitch/vignette post-process chain is now connected in the Babylon React flow',
    ],
    remainingWork: [
      'Reconcile legacy geometry names not yet mapped (custom shapes)',
      'Finalize parity tuning for post-process intensity/order against legacy output',
    ],
    validationChecks: [
      'Geometry switch updates mesh without leaks',
      'Scale and rotation controls update in real time',
      'Shader compile/runtime errors are surfaced in UI overlay',
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
      'Scale slider and color pickers are now exposed in the React controls panel',
      'Advanced material controls (metalness, fresnel, rim) are now wired to runtime uniforms',
      'Migration coverage panels are now rendered in the main Shader Studio page',
      'ShaderControls toggle rendering loop has been stabilized and typechecked',
      'Shader compile/runtime error overlay is now wired in ShaderStudioPage',
    ],
    remainingWork: [
      'Add texture layers and blend mode controls',
      'Add shader code editor and validation actions',
      'Connect migration checklist entries to deep links/CTAs in controls',
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
    status: 'in_progress',
    scope: 'Audio input, FFT analysis, band mapping, beat detection',
    completedWork: [
      'Audio settings state scaffold created in React',
      'Web Audio runtime hook integrated in ShaderStudioPage',
      'Live mic FFT bands map to shader params in React flow',
    ],
    remainingWork: [
      'Add file source selector + pause/resume controls',
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
    status: 'in_progress',
    scope: 'MIDI learn, mapping persistence, input monitor',
    completedWork: [
      'Web MIDI lifecycle hook wired in main React page',
      'CC events can update mapped shader parameters at runtime',
    ],
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
    status: 'in_progress',
    scope: 'Render capture (webm/mp4), bitrate/resolution presets',
    completedWork: [
      'Video settings state scaffold created in React',
      'MediaRecorder runtime service wired for canvas capture',
      'Export action connected in Audio/Export panel',
      'MediaRecorder export now reports progress and supports cancellation via AbortController',
      'React panel now exposes duration/codec/resolution controls for video export',
    ],
    remainingWork: [
      'Propagate export progress/cancel telemetry to legacy bridge compatibility layer',
      'Validate codec fallback matrix across supported browsers',
    ],
    validationChecks: [
      'Export duration matches configured value',
      'Output file plays in browser and external player',
      'No dropped frame spike during capture',
    ],
  },
  {
    id: 'shadertoy-webgpu',
    legacyFile: 'ShadertoyExporter.js + WebGPUCompute.js',
    reactTarget: 'src/features/shader-studio/services/* + ShaderStudioPage',
    status: 'in_progress',
    scope: 'Export ShaderToy et diagnostics compute WebGPU dans le flux React',
    completedWork: [
      'Service TypeScript buildShadertoyShaderFromParams ajouté',
      'Bouton React Export ShaderToy branché au panneau Audio/Export',
      'Service WebGPUComputeService TypeScript branché à un bouton de diagnostic React',
      'Legacy JS bridge files now proxy to React-first services (App, main, export, WebGPU)',
    ],
    remainingWork: [
      'Connecter les channels ShaderToy avancés (textures multiples) dans l UI',
      'Ajouter un affichage de trajectoires simulées WebGPU dans le rendu principal',
    ],
    validationChecks: [
      'Le fichier .frag exporté contient les paramètres shader React courants',
      'Le test WebGPU affiche un statut succès/erreur sans crash UI',
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
      'Versioned persistence payload with legacy key migration',
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
