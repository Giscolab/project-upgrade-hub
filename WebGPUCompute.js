import { WebGPUComputeService } from './src/features/shader-studio/services/webgpuComputeService.ts';

/**
 * Legacy WebGPU compatibility class.
 */
export class WebGPUCompute {
  constructor() {
    this.service = new WebGPUComputeService();
  }

  static isSupported() {
    return WebGPUComputeService.isSupported();
  }

  async init() {
    await this.service.init();
  }

  async runParticleSimulation(options = {}) {
    return this.service.runParticleSimulation(options);
  }

  async runBenchmark(options = {}) {
    const start = performance.now();
    const result = await this.service.runParticleSimulation(options);
    const elapsedMs = performance.now() - start;
    return {
      ...result,
      elapsedMs,
    };
  }
}

export default WebGPUCompute;
