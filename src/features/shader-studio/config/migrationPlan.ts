export type MigrationStatus = "done" | "in_progress" | "pending";

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

export const MIGRATION_PLAN_LAST_VERIFIED = "2026-02-23";

export const MIGRATION_PLAN: MigrationItem[] = [
  {
    id: "render-core",
    legacyFile: "App.js + shaders.js",
    reactTarget: "src/components/shader/BabylonCanvas.tsx",
    status: "done",
    scope: "Babylon scene lifecycle, shader uniforms, geometry coverage",
    completedWork: [
      "React canvas orchestration exists",
      "Shader uniforms (time, amplitude, frequency, colors) wired",
      "Scale updates are applied at runtime",
      "Extended geometry support migrated with MeshBuilder",
      "Pixel/glitch/vignette post-process chain is now connected in the Babylon React flow",
      "Legacy bridge files (App.js, shaders.js) deleted — React is sole runtime",
    ],
    remainingWork: [],
    validationChecks: [
      "Geometry switch updates mesh without leaks",
      "Scale and rotation controls update in real time",
      "Shader compile/runtime errors are surfaced in UI overlay",
    ],
  },
  {
    id: "ui-controls",
    legacyFile: "App.js tweakpane sections",
    reactTarget: "src/features/shader-studio/components/ShaderControls.tsx",
    status: "done",
    scope: "All legacy tweakpane controls replaced by React UI",
    completedWork: [
      "Main shader controls migrated (geometry, noise, speed, amplitude, frequency, scale)",
      "Color pickers and key toggles migrated",
      "Post-process intensity sliders added",
      "Scale slider and color pickers are now exposed in the React controls panel",
      "Advanced material controls (metalness, fresnel, rim) are now wired to runtime uniforms",
      "Migration coverage panels are now rendered in the main Shader Studio page",
      "ShaderControls toggle rendering loop has been stabilized and typechecked",
      "Shader compile/runtime error overlay is now wired in ShaderStudioPage",
      "GLSL editor panel (edit/compile/export) is wired in ShaderStudioPage",
      "Preuve de parite entrypoint legacy main.js documentee: docs/migration-evidence/main-js-parity.md",
      "Legacy Config.js bridge deleted — React defaults are canonical",
    ],
    remainingWork: [],
    validationChecks: [
      "Every React control updates rendered output",
      "Reset restores same values as documented defaults",
      "Keyboard accessibility and focus order validated",
      "Preuve Gate 1-5 main.js disponible: docs/migration-evidence/main-js-parity.md",
    ],
  },
  {
    id: "audio-engine",
    legacyFile: "AudioEngine.js",
    reactTarget: "src/features/shader-studio/hooks + services",
    status: "done",
    scope: "Audio input, FFT analysis, band mapping, beat detection",
    completedWork: [
      "Audio settings state scaffold created in React",
      "Web Audio runtime hook integrated in ShaderStudioPage",
      "Live mic FFT bands map to shader params in React flow",
      "File source selector + pause/resume controls wired in React panel",
      "Beat pulse detection + threshold calibration controls wired in React UI",
      "Legacy AudioEngine.js bridge deleted — React hook is sole runtime",
    ],
    remainingWork: [],
    validationChecks: [
      "FFT updates at stable frame rate",
      "Band mapping changes affect correct uniforms",
      "Stop/reset releases audio resources cleanly",
    ],
  },
  {
    id: "midi",
    legacyFile: "MidiHandler.js",
    reactTarget: "src/features/shader-studio/hooks/useMidiRuntime.ts",
    status: "done",
    scope: "MIDI learn, mapping persistence, input monitor",
    completedWork: [
      "Web MIDI lifecycle hook wired in main React page",
      "CC events can update mapped shader parameters at runtime",
      "MIDI status feedback is displayed in the React panel",
      "Legacy MidiHandler.js bridge deleted — React hook is sole runtime",
    ],
    remainingWork: [],
    validationChecks: [
      "Incoming CC values update mapped parameters",
      "Disconnected device is handled without crash",
      "Mapping table export/import works",
    ],
  },
  {
    id: "video-export",
    legacyFile: "VideoRecorder.js",
    reactTarget: "src/features/shader-studio/services/videoExportService.ts",
    status: "done",
    scope: "Render capture (webm/mp4), bitrate/resolution presets",
    completedWork: [
      "Video settings state scaffold created in React",
      "MediaRecorder runtime service wired for canvas capture",
      "Export action connected in Audio/Export panel",
      "MediaRecorder export now reports progress and supports cancellation via AbortController",
      "React panel now exposes duration/codec/resolution controls for video export",
      "PNG export action is wired in the React panel with toBlob and toDataURL fallback support",
      "Legacy VideoRecorder.js bridge deleted — React service is sole runtime",
    ],
    remainingWork: [],
    validationChecks: [
      "Export duration matches configured value",
      "Output file plays in browser and external player",
      "No dropped frame spike during capture",
    ],
  },
  {
    id: "shadertoy-webgpu",
    legacyFile: "ShadertoyExporter.js + WebGPUCompute.js",
    reactTarget: "src/features/shader-studio/services/* + ShaderStudioPage",
    status: "done",
    scope: "Export ShaderToy et diagnostics compute WebGPU dans le flux React",
    completedWork: [
      "Service TypeScript buildShadertoyShaderFromParams ajoute",
      "Bouton React Export ShaderToy branche au panneau Audio/Export",
      "Service WebGPUComputeService TypeScript branche a un bouton de diagnostic React",
      "Legacy ShadertoyExporter.js + WebGPUCompute.js bridges deleted — React services are sole runtime",
      "Preuve de parite Shadertoy bridge documentee: docs/migration-evidence/shadertoy-exporter-parity.md",
    ],
    remainingWork: [],
    validationChecks: [
      "Le fichier .frag exporte contient les parametres shader React courants",
      "Preuve Gate 1-5 disponible: docs/migration-evidence/shadertoy-exporter-parity.md",
      "Le test WebGPU affiche un statut succes/erreur sans crash UI",
    ],
  },
  {
    id: "preset-storage",
    legacyFile: "App.js localStorage and history blocks",
    reactTarget: "src/features/shader-studio/state",
    status: "done",
    scope: "State persistence, preset save/load, undo/redo",
    completedWork: [
      "Local storage persistence for shader/audio/video states",
      "Versioned persistence payload with legacy key migration",
      "Named preset save/load/delete flow added with version tagging",
      "Undo/redo actions now available in UI and keyboard shortcuts",
    ],
    remainingWork: [],
    validationChecks: [
      "Reload restores all panels and scene params",
      "Undo/redo produces deterministic state transitions",
      "Invalid saved data falls back safely",
    ],
  },
];

export function getMigrationProgress() {
  const total = MIGRATION_PLAN.length;
  const done = MIGRATION_PLAN.filter((item) => item.status === "done").length;
  const inProgress = MIGRATION_PLAN.filter(
    (item) => item.status === "in_progress",
  ).length;
  const pending = MIGRATION_PLAN.filter(
    (item) => item.status === "pending",
  ).length;
  const completionPercent = Math.round(
    ((done + inProgress * 0.5) / total) * 100,
  );

  return { total, done, inProgress, pending, completionPercent };
}
