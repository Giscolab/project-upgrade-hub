import { useEffect, useRef, useCallback } from 'react';
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  ShaderMaterial,
  Mesh,
  Color4,
  Effect,
  MeshBuilder,
  PostProcess,
  DefaultRenderingPipeline,
  ChromaticAberrationPostProcess,
  Texture,
} from '@babylonjs/core';
import { ShaderParams, DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER } from '@/types/shader';

interface BabylonCanvasProps {
  params: ShaderParams;
  vertexShader?: string;
  fragmentShader?: string;
  shaderToyChannels?: Array<string | null>;
  onCanvasReady?: (canvas: HTMLCanvasElement | null) => void;
  onShaderError?: (message: string | null) => void;
}

const SHADERTOY_CHANNEL_COUNT = 4;

function toShaderToyFragment(fragmentSource: string) {
  if (!fragmentSource.includes('mainImage')) {
    return fragmentSource;
  }

  return `
${fragmentSource}

void main() {
  vec4 fragColor = vec4(0.0);
  mainImage(fragColor, gl_FragCoord.xy);
  gl_FragColor = fragColor;
}
`;
}

function hexToVec3(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

function createMeshForGeometry(type: string, scene: Scene): Mesh {
  switch (type) {
    case 'box': return MeshBuilder.CreateBox('mesh', { size: 1.6 }, scene);
    case 'torus': return MeshBuilder.CreateTorus('mesh', { diameter: 2, thickness: 0.6, tessellation: 128 }, scene);
    case 'plane': return MeshBuilder.CreatePlane('mesh', { size: 2.5 }, scene);
    case 'cylinder': return MeshBuilder.CreateCylinder('mesh', { height: 2, diameterTop: 1, diameterBottom: 1, tessellation: 128 }, scene);
    case 'cone': return MeshBuilder.CreateCylinder('mesh', { height: 2, diameterTop: 0, diameterBottom: 1.4, tessellation: 128 }, scene);
    case 'torusKnot': return MeshBuilder.CreateTorusKnot('mesh', { radius: 0.8, tube: 0.3, radialSegments: 128, tubularSegments: 64 }, scene);
    case 'icosphere': return MeshBuilder.CreateIcoSphere('mesh', { radius: 1, subdivisions: 4 }, scene);
    case 'octahedron': return MeshBuilder.CreatePolyhedron('mesh', { type: 1, size: 1.2 }, scene);
    case 'dodecahedron': return MeshBuilder.CreatePolyhedron('mesh', { type: 3, size: 1.2 }, scene);
    case 'tetrahedron': return MeshBuilder.CreatePolyhedron('mesh', { type: 0, size: 1.2 }, scene);
    case 'capsule': return MeshBuilder.CreateCapsule('mesh', { height: 2, radius: 0.6, tessellation: 24 }, scene);
    case 'disc': return MeshBuilder.CreateDisc('mesh', { radius: 1.2, tessellation: 128 }, scene);
    case 'ground': return MeshBuilder.CreateGround('mesh', { width: 3, height: 3, subdivisions: 128 }, scene);
    case 'hemisphere': return MeshBuilder.CreateSphere('mesh', { diameter: 2, segments: 64, slice: 0.5 }, scene);
    case 'sphere':
    default: return MeshBuilder.CreateSphere('mesh', { diameter: 2, segments: 128 }, scene);
  }
}

const BabylonCanvas = ({ params, vertexShader, fragmentShader, shaderToyChannels, onCanvasReady, onShaderError }: BabylonCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const materialRef = useRef<ShaderMaterial | null>(null);
  const timeRef = useRef(0);
  const paramsRef = useRef(params);

  paramsRef.current = params;

  const setupScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Cleanup previous
    if (engineRef.current) {
      engineRef.current.dispose();
    }

    const engine = new Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
    engineRef.current = engine;

    const scene = new Scene(engine);
    sceneRef.current = scene;
    
    const bgColor = hexToVec3(paramsRef.current.colors.background);
    scene.clearColor = new Color4(bgColor[0], bgColor[1], bgColor[2], 1);

    // Camera
    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 4, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1.5;
    camera.upperRadiusLimit = 15;
    camera.wheelPrecision = 30;

    // Register custom shader
    const vs = vertexShader || DEFAULT_VERTEX_SHADER;
    const fs = toShaderToyFragment(fragmentShader || DEFAULT_FRAGMENT_SHADER);

    Effect.ShadersStore['customVertexShader'] = vs;
    Effect.ShadersStore['customFragmentShader'] = fs;

    // Create material
    const material = new ShaderMaterial('shader', scene, {
      vertex: 'custom',
      fragment: 'custom',
    }, {
      attributes: ['position', 'normal', 'uv'],
      uniforms: [
        'world',
        'worldViewProjection',
        'uTime',
        'uAmplitude',
        'uFrequency',
        'uTwist',
        'uPulse',
        'uMorphFactor',
        'uMetalness',
        'uRimPower',
        'uFresnelStrength',
        'uColor1',
        'uColor2',
        'uColor3',
        'iTime',
        'iResolution',
        'iMouse',
        'iChannelTime',
        'iChannelResolution',
      ],
      samplers: ['iChannel0', 'iChannel1', 'iChannel2', 'iChannel3'],
    });

    materialRef.current = material;
    material.wireframe = paramsRef.current.wireframe;

    // Create mesh
    const mesh = createMeshForGeometry(params.geometry, scene);
    mesh.material = material;
    meshRef.current = mesh;

    const channels: Texture[] = Array.from({ length: SHADERTOY_CHANNEL_COUNT }, (_, index) => {
      const input = shaderToyChannels?.[index];
      if (input) {
        return new Texture(input, scene, true, false, Texture.TRILINEAR_SAMPLINGMODE);
      }
      return Texture.CreateFromBase64String(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=',
        `fallbackChannel${index}`,
        scene,
      );
    });

    Effect.ShadersStore.pixelFragmentShader = `
      precision highp float;
      varying vec2 vUV;
      uniform sampler2D textureSampler;
      uniform vec2 resolution;
      uniform float pixelSize;
      void main(){
        vec2 dxy = pixelSize / resolution;
        vec2 coord = dxy * floor(vUV / dxy);
        gl_FragColor = texture2D(textureSampler, coord);
      }
    `;
    Effect.ShadersStore.glitchFragmentShader = `
      precision highp float;
      varying vec2 vUV;
      uniform sampler2D textureSampler;
      uniform float intensity;
      uniform float time;
      void main(){
        float offset = sin(vUV.y * 40.0 + time * 8.0) * intensity * 0.03;
        float r = texture2D(textureSampler, vUV + vec2(offset, 0.0)).r;
        float g = texture2D(textureSampler, vUV).g;
        float b = texture2D(textureSampler, vUV - vec2(offset, 0.0)).b;
        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `;
    Effect.ShadersStore.vignetteFragmentShader = `
      precision highp float;
      varying vec2 vUV;
      uniform sampler2D textureSampler;
      uniform float intensity;
      void main(){
        vec4 color = texture2D(textureSampler, vUV);
        float dist = distance(vUV, vec2(0.5));
        float vig = smoothstep(0.2, 0.8, dist);
        color.rgb *= (1.0 - vig * intensity);
        gl_FragColor = color;
      }
    `;

    const pixelPP = new PostProcess('pixel', 'pixel', ['pixelSize', 'resolution'], null, 1.0, camera);
    const glitchPP = new PostProcess('glitch', 'glitch', ['intensity', 'time'], null, 1.0, camera);
    const vignettePP = new PostProcess('vignette', 'vignette', ['intensity'], null, 1.0, camera);
    const rgbShiftPP = new ChromaticAberrationPostProcess('rgb-shift', 800, 600, 1, camera);
    const postPipeline = new DefaultRenderingPipeline('default-pipeline', true, scene, [camera]);

    postPipeline.bloomEnabled = paramsRef.current.postProcessing.bloom;
    postPipeline.bloomWeight = paramsRef.current.postProcessing.bloomIntensity;

    // Render loop
    engine.runRenderLoop(() => {
      const p = paramsRef.current;
      timeRef.current += engine.getDeltaTime() * 0.001 * p.speed;

      material.setFloat('uTime', timeRef.current);
      material.setFloat('uAmplitude', p.amplitude);
      material.setFloat('uFrequency', p.frequency);
      material.setFloat('uTwist', p.material.twist);
      material.setFloat('uPulse', p.material.pulse);
      material.setFloat('uMorphFactor', p.material.morphFactor);
      material.setFloat('uMetalness', p.material.metalness);
      material.setFloat('uRimPower', p.material.rimPower);
      material.setFloat('uFresnelStrength', p.material.fresnelStrength);
      material.setFloat('iTime', timeRef.current);
      material.setVector3('iResolution', new Vector3(engine.getRenderWidth(), engine.getRenderHeight(), 1));
      material.setVector3('iMouse', Vector3.Zero());
      material.setArray4('iChannelTime', [timeRef.current, timeRef.current, timeRef.current, timeRef.current]);
      material.setArray4('iChannelResolution', [
        channels[0].getSize().width,
        channels[0].getSize().height,
        channels[1].getSize().width,
        channels[1].getSize().height,
      ]);
      channels.forEach((channel, index) => {
        material.setTexture(`iChannel${index}`, channel);
      });

      const c1 = hexToVec3(p.colors.color1);
      const c2 = hexToVec3(p.colors.color2);
      const c3 = hexToVec3(p.colors.color3);
      material.setVector3('uColor1', new Vector3(c1[0], c1[1], c1[2]));
      material.setVector3('uColor2', new Vector3(c2[0], c2[1], c2[2]));
      material.setVector3('uColor3', new Vector3(c3[0], c3[1], c3[2]));

      if (mesh) {
        mesh.scaling.setAll(p.scale);
      }

      if (p.autoRotate && mesh) {
        mesh.rotation.y += engine.getDeltaTime() * 0.001 * p.rotationSpeed;
      }

      pixelPP.onApply = (effect) => {
        effect.setFloat('pixelSize', p.postProcessing.pixelArt ? p.postProcessing.pixelSize : 1);
        effect.setFloat2('resolution', engine.getRenderWidth(), engine.getRenderHeight());
      };
      glitchPP.onApply = (effect) => {
        effect.setFloat('intensity', p.postProcessing.glitch ? p.postProcessing.glitchIntensity : 0);
        effect.setFloat('time', timeRef.current);
      };
      vignettePP.onApply = (effect) => {
        effect.setFloat('intensity', p.postProcessing.vignette ? p.postProcessing.vignetteIntensity : 0);
      };
      rgbShiftPP.aberrationAmount = p.postProcessing.rgbShift ? p.postProcessing.rgbShiftAmount * 400 : 0;
      postPipeline.bloomEnabled = p.postProcessing.bloom;
      postPipeline.bloomWeight = p.postProcessing.bloomIntensity;

      const shaderError = material.getEffect()?.getCompilationError() || null;
      onShaderError?.(shaderError);

      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      channels.forEach((channel) => channel.dispose());
      engine.dispose();
    };
  }, [vertexShader, fragmentShader, params.geometry, onShaderError, shaderToyChannels]);

  // Initial setup & re-setup on geometry/shader change
  useEffect(() => {
    const cleanup = setupScene();
    onCanvasReady?.(canvasRef.current);
    return cleanup;
  }, [onCanvasReady, setupScene]);

  // Update wireframe without re-creating scene
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.wireframe = params.wireframe;
    }
  }, [params.wireframe]);

  // Update background color
  useEffect(() => {
    if (sceneRef.current) {
      const bg = hexToVec3(params.colors.background);
      sceneRef.current.clearColor = new Color4(bg[0], bg[1], bg[2], 1);
    }
  }, [params.colors.background]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full outline-none"
      onDoubleClick={() => {
        canvasRef.current?.requestFullscreen?.();
      }}
    />
  );
};

export default BabylonCanvas;
