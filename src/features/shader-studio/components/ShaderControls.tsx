import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShaderParams } from '@/types/shader';
import { GEOMETRY_OPTIONS, NOISE_OPTIONS, PARAM_RANGE } from '../config/defaults';

interface ShaderControlsProps {
  params: ShaderParams;
  onParamsChange: (params: ShaderParams) => void;
}

function ParamSlider({
  id,
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <Label htmlFor={id}>{label}</Label>
        <span className="text-muted-foreground">{value.toFixed(2)}</span>
      </div>
      <Slider
        id={id}
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

export default function ShaderControls({ params, onParamsChange }: ShaderControlsProps) {
  const toggles: Array<{ key: keyof ShaderParams | keyof ShaderParams['postProcessing']; label: string; nested?: boolean }> = [
    { key: 'wireframe', label: 'Wireframe' },
    { key: 'autoRotate', label: 'Auto rotate' },
    { key: 'bloom', label: 'Bloom', nested: true },
    { key: 'rgbShift', label: 'RGB Shift', nested: true },
    { key: 'glitch', label: 'Glitch', nested: true },
    { key: 'pixelArt', label: 'Pixel', nested: true },
    { key: 'vignette', label: 'Vignette', nested: true },
  ];

  return (
    <aside className="glass-panel absolute right-4 top-20 z-30 w-72 space-y-4 rounded-xl p-4">
      <div className="space-y-1">
        <Label>Geometry</Label>
        <Select value={params.geometry} onValueChange={(v) => onParamsChange({ ...params, geometry: v as ShaderParams['geometry'] })}>
          <SelectTrigger>
            <SelectValue placeholder="Geometry" />
          </SelectTrigger>
          <SelectContent>
            {GEOMETRY_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Noise</Label>
        <Select value={params.noise} onValueChange={(v) => onParamsChange({ ...params, noise: v as ShaderParams['noise'] })}>
          <SelectTrigger>
            <SelectValue placeholder="Noise" />
          </SelectTrigger>
          <SelectContent>
            {NOISE_OPTIONS.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ParamSlider
        id="speed"
        label="Speed"
        value={params.speed}
        {...PARAM_RANGE.speed}
        onChange={(speed) => onParamsChange({ ...params, speed })}
      />
      <ParamSlider
        id="amplitude"
        label="Amplitude"
        value={params.amplitude}
        {...PARAM_RANGE.amplitude}
        onChange={(amplitude) => onParamsChange({ ...params, amplitude })}
      />
      <ParamSlider
        id="frequency"
        label="Frequency"
        value={params.frequency}
        {...PARAM_RANGE.frequency}
        onChange={(frequency) => onParamsChange({ ...params, frequency })}
      />
      <ParamSlider
        id="scale"
        label="Scale"
        value={params.scale}
        {...PARAM_RANGE.scale}
        onChange={(scale) => onParamsChange({ ...params, scale })}
      />

      <ParamSlider
        id="rotationSpeed"
        label="Rotation"
        value={params.rotationSpeed}
        {...PARAM_RANGE.rotationSpeed}
        onChange={(rotationSpeed) => onParamsChange({ ...params, rotationSpeed })}
      />

      <div className="space-y-2 rounded-md border border-border/50 p-2">
        <Label className="text-xs">Material</Label>
        <ParamSlider
          id="metalness"
          label="Metalness"
          value={params.material.metalness}
          min={0}
          max={1}
          step={0.01}
          onChange={(metalness) => onParamsChange({ ...params, material: { ...params.material, metalness } })}
        />
        <ParamSlider
          id="rimPower"
          label="Rim"
          value={params.material.rimPower}
          min={0.5}
          max={8}
          step={0.1}
          onChange={(rimPower) => onParamsChange({ ...params, material: { ...params.material, rimPower } })}
        />
        <ParamSlider
          id="fresnelStrength"
          label="Fresnel"
          value={params.material.fresnelStrength}
          min={0}
          max={8}
          step={0.1}
          onChange={(fresnelStrength) => onParamsChange({ ...params, material: { ...params.material, fresnelStrength } })}
        />
      </div>

      <div className="space-y-2 rounded-md border border-border/50 p-2">
        <Label className="text-xs">Post FX intensity</Label>
        <ParamSlider
          id="bloomIntensity"
          label="Bloom"
          value={params.postProcessing.bloomIntensity}
          min={0}
          max={2}
          step={0.01}
          onChange={(bloomIntensity) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, bloomIntensity } })}
        />
        <ParamSlider
          id="rgbShiftAmount"
          label="RGB shift"
          value={params.postProcessing.rgbShiftAmount}
          min={0}
          max={0.02}
          step={0.0001}
          onChange={(rgbShiftAmount) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, rgbShiftAmount } })}
        />
        <ParamSlider
          id="glitchIntensity"
          label="Glitch"
          value={params.postProcessing.glitchIntensity}
          min={0}
          max={1}
          step={0.01}
          onChange={(glitchIntensity) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, glitchIntensity } })}
        />
        <ParamSlider
          id="pixelSize"
          label="Pixel size"
          value={params.postProcessing.pixelSize}
          min={1}
          max={16}
          step={1}
          onChange={(pixelSize) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, pixelSize } })}
        />
        <ParamSlider
          id="vignetteIntensity"
          label="Vignette"
          value={params.postProcessing.vignetteIntensity}
          min={0}
          max={1}
          step={0.01}
          onChange={(vignetteIntensity) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, vignetteIntensity } })}
        />
      </div>

      <div className="space-y-2 rounded-md border border-border/50 p-2">
        <Label className="text-xs">Texture / Blend</Label>
        <ParamSlider id="textureMix" label="Texture Mix" value={params.textureBlend.textureMix} {...PARAM_RANGE.textureMix}
          onChange={(textureMix) => onParamsChange({ ...params, textureBlend: { ...params.textureBlend, textureMix } })} />
        <ParamSlider id="layerBlend1" label="Layer 1 Blend" value={params.textureBlend.layerBlend1} {...PARAM_RANGE.layerBlend1}
          onChange={(layerBlend1) => onParamsChange({ ...params, textureBlend: { ...params.textureBlend, layerBlend1 } })} />
        <ParamSlider id="layerBlend2" label="Layer 2 Blend" value={params.textureBlend.layerBlend2} {...PARAM_RANGE.layerBlend2}
          onChange={(layerBlend2) => onParamsChange({ ...params, textureBlend: { ...params.textureBlend, layerBlend2 } })} />
        <ParamSlider id="layerOpacity1" label="Layer 1 Opacity" value={params.textureBlend.layerOpacity1} {...PARAM_RANGE.layerOpacity1}
          onChange={(layerOpacity1) => onParamsChange({ ...params, textureBlend: { ...params.textureBlend, layerOpacity1 } })} />
        <ParamSlider id="layerOpacity2" label="Layer 2 Opacity" value={params.textureBlend.layerOpacity2} {...PARAM_RANGE.layerOpacity2}
          onChange={(layerOpacity2) => onParamsChange({ ...params, textureBlend: { ...params.textureBlend, layerOpacity2 } })} />
      </div>

      <div className="space-y-2 rounded-md border border-border/50 p-2">
        <Label className="text-xs">Color Grading</Label>
        <ParamSlider id="lightIntensity" label="Light Intensity" value={params.colorGrading.lightIntensity} {...PARAM_RANGE.lightIntensity}
          onChange={(lightIntensity) => onParamsChange({ ...params, colorGrading: { ...params.colorGrading, lightIntensity } })} />
        <ParamSlider id="contrast" label="Contrast" value={params.colorGrading.contrast} {...PARAM_RANGE.contrast}
          onChange={(contrast) => onParamsChange({ ...params, colorGrading: { ...params.colorGrading, contrast } })} />
        <ParamSlider id="saturation" label="Saturation" value={params.colorGrading.saturation} {...PARAM_RANGE.saturation}
          onChange={(saturation) => onParamsChange({ ...params, colorGrading: { ...params.colorGrading, saturation } })} />
        <ParamSlider id="gamma" label="Gamma" value={params.colorGrading.gamma} {...PARAM_RANGE.gamma}
          onChange={(gamma) => onParamsChange({ ...params, colorGrading: { ...params.colorGrading, gamma } })} />
        <ParamSlider id="glowRadius" label="Glow Radius" value={params.colorGrading.glowRadius} {...PARAM_RANGE.glowRadius}
          onChange={(glowRadius) => onParamsChange({ ...params, colorGrading: { ...params.colorGrading, glowRadius } })} />
      </div>

      <div className="space-y-2 rounded-md border border-border/50 p-2">
        <Label className="text-xs">Colors</Label>
        <div className="grid grid-cols-2 gap-2">
          {(
            [
              ['color1', 'Primary'],
              ['color2', 'Secondary'],
              ['color3', 'Accent'],
              ['background', 'Background'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="space-y-1 text-xs">
              <span>{label}</span>
              <input
                type="color"
                aria-label={label}
                className="h-8 w-full cursor-pointer rounded border border-border bg-transparent"
                value={params.colors[key]}
                onChange={(event) => onParamsChange({ ...params, colors: { ...params.colors, [key]: event.target.value } })}
              />
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        {toggles.map((toggle) => {
          const checked = toggle.nested
            ? (params.postProcessing[toggle.key as keyof ShaderParams['postProcessing']] as boolean)
            : (params[toggle.key as keyof ShaderParams] as boolean);

          return (
            <label key={toggle.key} className="flex items-center justify-between gap-2 rounded-md border border-border/50 px-2 py-1.5 text-xs">
              <span>{toggle.label}</span>
              <Switch
                checked={checked}
                onCheckedChange={(next) => {
                  if (toggle.nested) {
                    onParamsChange({
                      ...params,
                      postProcessing: { ...params.postProcessing, [toggle.key]: next },
                    });
                    return;
                  }
                  onParamsChange({ ...params, [toggle.key]: next });
                }}
              />
            </label>
          );
        })}
      </div>
    </aside>
  );
}
