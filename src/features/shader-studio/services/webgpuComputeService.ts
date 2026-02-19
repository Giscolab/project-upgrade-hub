interface GPULike {
  requestAdapter: () => Promise<GPUAdapterLike | null>;
}

interface GPUAdapterLike {
  requestDevice: () => Promise<GPUDeviceLike>;
}

interface GPUBufferLike {
  mapAsync: (mode: number) => Promise<void>;
  getMappedRange: () => ArrayBuffer;
  unmap: () => void;
  destroy: () => void;
}

interface GPUDeviceLike {
  queue: {
    writeBuffer: (buffer: GPUBufferLike, bufferOffset: number, data: BufferSource) => void;
    submit: (commandBuffers: unknown[]) => void;
  };
  createBuffer: (descriptor: { size: number; usage: number }) => GPUBufferLike;
  createShaderModule: (descriptor: { code: string }) => unknown;
  createBindGroupLayout: (descriptor: unknown) => unknown;
  createPipelineLayout: (descriptor: unknown) => unknown;
  createComputePipeline: (descriptor: unknown) => {
    getBindGroupLayout?: (index: number) => unknown;
  };
  createBindGroup: (descriptor: unknown) => unknown;
  createCommandEncoder: () => {
    beginComputePass: () => {
      setPipeline: (pipeline: unknown) => void;
      setBindGroup: (index: number, group: unknown) => void;
      dispatchWorkgroups: (count: number) => void;
      end: () => void;
    };
    copyBufferToBuffer: (source: GPUBufferLike, sourceOffset: number, destination: GPUBufferLike, destinationOffset: number, size: number) => void;
    finish: () => unknown;
  };
}

export interface ParticleSimulationOptions {
  particleCount?: number;
  deltaTime?: number;
}

export interface ParticleSimulationResult {
  particleCount: number;
  sample: { x: number; y: number; vx: number; vy: number };
}

export class WebGPUComputeService {
  private device: GPUDeviceLike | null = null;
  private adapter: GPUAdapterLike | null = null;
  private ready = false;

  static isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'gpu' in navigator;
  }

  async init(): Promise<void> {
    if (!WebGPUComputeService.isSupported()) {
      throw new Error('WebGPU non supporté dans ce navigateur');
    }
    if (this.ready) return;

    const gpu = (navigator as Navigator & { gpu?: GPULike }).gpu;
    if (!gpu) {
      throw new Error('WebGPU non exposé par le navigateur');
    }

    this.adapter = await gpu.requestAdapter();
    if (!this.adapter) throw new Error('Aucun adaptateur GPU disponible');

    this.device = await this.adapter.requestDevice();
    this.ready = true;
  }

  async runParticleSimulation(options: ParticleSimulationOptions = {}): Promise<ParticleSimulationResult> {
    await this.init();
    if (!this.device) {
      throw new Error('Device WebGPU indisponible');
    }

    const particleCount = options.particleCount ?? 4096;
    const deltaTime = options.deltaTime ?? 0.016;
    const floatsPerParticle = 4;
    const totalFloats = particleCount * floatsPerParticle;
    const initial = new Float32Array(totalFloats);

    for (let i = 0; i < particleCount; i += 1) {
      const idx = i * floatsPerParticle;
      const angle = (i / particleCount) * Math.PI * 2;
      initial[idx] = Math.cos(angle) * 0.5;
      initial[idx + 1] = Math.sin(angle) * 0.5;
      initial[idx + 2] = -Math.sin(angle) * 0.15;
      initial[idx + 3] = Math.cos(angle) * 0.15;
    }

    const simulationBuffer = this.device.createBuffer({
      size: initial.byteLength,
      usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC,
    });
    this.device.queue.writeBuffer(simulationBuffer, 0, initial);

    const readbackBuffer = this.device.createBuffer({
      size: initial.byteLength,
      usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
    });

    const paramsBuffer = this.device.createBuffer({
      size: 16,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.device.queue.writeBuffer(paramsBuffer, 0, new Float32Array([deltaTime, particleCount, 0, 0]));

    const shaderModule = this.device.createShaderModule({
      code: `
struct Particle { x: f32, y: f32, vx: f32, vy: f32 };
struct SimParams { dt: f32, count: f32, _pad0: f32, _pad1: f32 };
@group(0) @binding(0) var<storage, read_write> particles: array<Particle>;
@group(0) @binding(1) var<uniform> params: SimParams;
@compute @workgroup_size(128)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (f32(i) >= params.count) { return; }
  var p = particles[i];
  let toCenter = vec2<f32>(-p.x, -p.y);
  let swirl = vec2<f32>(-p.y, p.x);
  let accel = normalize(toCenter + swirl * 0.6) * 0.35;
  p.vx = p.vx + accel.x * params.dt;
  p.vy = p.vy + accel.y * params.dt;
  p.x = p.x + p.vx * params.dt;
  p.y = p.y + p.vy * params.dt;
  if (abs(p.x) > 1.0) { p.vx = -p.vx * 0.9; }
  if (abs(p.y) > 1.0) { p.vy = -p.vy * 0.9; }
  p.x = clamp(p.x, -1.0, 1.0);
  p.y = clamp(p.y, -1.0, 1.0);
  particles[i] = p;
}`,
    });

    const bindGroupLayout = this.device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },
      ],
    });

    const pipeline = this.device.createComputePipeline({
      layout: this.device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
      compute: { module: shaderModule, entryPoint: 'main' },
    });

    const bindGroup = this.device.createBindGroup({
      layout: pipeline.getBindGroupLayout?.(0) ?? bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: simulationBuffer } },
        { binding: 1, resource: { buffer: paramsBuffer } },
      ],
    });

    const encoder = this.device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(Math.ceil(particleCount / 128));
    pass.end();

    encoder.copyBufferToBuffer(simulationBuffer, 0, readbackBuffer, 0, initial.byteLength);
    this.device.queue.submit([encoder.finish()]);

    await readbackBuffer.mapAsync(GPUMapMode.READ);
    const copy = readbackBuffer.getMappedRange().slice(0);
    const out = new Float32Array(copy);
    readbackBuffer.unmap();

    simulationBuffer.destroy();
    readbackBuffer.destroy();
    paramsBuffer.destroy();

    return {
      particleCount,
      sample: { x: out[0], y: out[1], vx: out[2], vy: out[3] },
    };
  }
}
