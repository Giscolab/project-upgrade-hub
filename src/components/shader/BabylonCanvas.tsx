import { useEffect, useRef, useCallback } from 'react';
import { Engine, Scene, ArcRotateCamera, Vector3, ShaderMaterial, Mesh, Color4, Effect } from '@babylonjs/core';
import { ShaderParams, DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER } from '@/types/shader';

interface BabylonCanvasProps {
  params: ShaderParams;
  vertexShader?: string;
  fragmentShader?: string;
}

function hexToVec3(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [r, g, b];
}

function createMeshForGeometry(type: string, scene: Scene): Mesh {
  const opts = { diameter: 2, size: 1.6, segments: 128, subdivisions: 128 };
  switch (type) {
    case 'box': return Mesh.CreateBox('mesh', opts.size, scene);
    case 'torus': return Mesh.CreateTorus('mesh', 2, 0.6, 128, scene);
    case 'plane': return Mesh.CreatePlane('mesh', 2.5, scene);
    case 'cylinder': return Mesh.CreateCylinder('mesh', 2, 1, 1, 128, 1, scene);
    case 'cone': return Mesh.CreateCylinder('mesh', 2, 0, 1.4, 128, 1, scene);
    case 'torusKnot': return Mesh.CreateTorusKnot('mesh', 0.8, 0.3, 128, 64, 2, 3, scene);
    case 'disc': return Mesh.CreateDisc('mesh', 1.2, 128, scene);
    case 'ground': return Mesh.CreateGround('mesh', 3, 3, 128, scene);
    case 'sphere':
    default: return Mesh.CreateSphere('mesh', 128, opts.diameter, scene);
  }
}

const BabylonCanvas = ({ params, vertexShader, fragmentShader }: BabylonCanvasProps) => {
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
    
    const bgColor = hexToVec3(params.colors.background);
    scene.clearColor = new Color4(bgColor[0], bgColor[1], bgColor[2], 1);

    // Camera
    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 4, Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 1.5;
    camera.upperRadiusLimit = 15;
    camera.wheelPrecision = 30;

    // Register custom shader
    const vs = vertexShader || DEFAULT_VERTEX_SHADER;
    const fs = fragmentShader || DEFAULT_FRAGMENT_SHADER;

    Effect.ShadersStore['customVertexShader'] = vs;
    Effect.ShadersStore['customFragmentShader'] = fs;

    // Create material
    const material = new ShaderMaterial('shader', scene, {
      vertex: 'custom',
      fragment: 'custom',
    }, {
      attributes: ['position', 'normal', 'uv'],
      uniforms: ['world', 'worldViewProjection', 'uTime', 'uAmplitude', 'uFrequency', 'uColor1', 'uColor2', 'uColor3'],
    });

    materialRef.current = material;
    material.wireframe = params.wireframe;

    // Create mesh
    const mesh = createMeshForGeometry(params.geometry, scene);
    mesh.material = material;
    meshRef.current = mesh;

    // Render loop
    engine.runRenderLoop(() => {
      const p = paramsRef.current;
      timeRef.current += engine.getDeltaTime() * 0.001 * p.speed;

      material.setFloat('uTime', timeRef.current);
      material.setFloat('uAmplitude', p.amplitude);
      material.setFloat('uFrequency', p.frequency);

      const c1 = hexToVec3(p.colors.color1);
      const c2 = hexToVec3(p.colors.color2);
      const c3 = hexToVec3(p.colors.color3);
      material.setVector3('uColor1', new Vector3(c1[0], c1[1], c1[2]));
      material.setVector3('uColor2', new Vector3(c2[0], c2[1], c2[2]));
      material.setVector3('uColor3', new Vector3(c3[0], c3[1], c3[2]));

      if (p.autoRotate && mesh) {
        mesh.rotation.y += engine.getDeltaTime() * 0.001 * p.rotationSpeed;
      }

      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.dispose();
    };
  }, [vertexShader, fragmentShader, params.geometry]);

  // Initial setup & re-setup on geometry/shader change
  useEffect(() => {
    const cleanup = setupScene();
    return cleanup;
  }, [setupScene]);

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
