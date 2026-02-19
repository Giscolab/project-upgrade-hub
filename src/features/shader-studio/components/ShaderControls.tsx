import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShaderParams } from '@/types/shader';
import { GEOMETRY_OPTIONS, NOISE_OPTIONS, PARAM_RANGE } from '../config/defaults';

interface ShaderControlsProps {
  params: ShaderParams;
  onParamsChange: (params: ShaderParams) => void;
  onReset: () => void;
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
      <Slider id={id} min={min} max={max} step={step} value={[value]} onValueChange={(v) => onChange(v[0])} />
    </div>
  );
}

function ColorInput({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  return (
    <label className="space-y-1 text-xs">
      <span className="block text-muted-foreground">{label}</span>
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-full cursor-pointer rounded border border-border bg-transparent" />
    </label>
  );
}

export default function ShaderControls({ params, onParamsChange, onReset }: ShaderControlsProps) {
  return (
    <aside className="glass-panel absolute right-4 top-20 z-30 max-h-[calc(100vh-6rem)] w-80 space-y-4 overflow-auto rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Controls</h2>
        <Button size="sm" variant="secondary" onClick={onReset}>Reset</Button>
      </div>

      <div className="space-y-1">
        <Label>Geometry</Label>
        <Select value={params.geometry} onValueChange={(v) => onParamsChange({ ...params, geometry: v as ShaderParams['geometry'] })}>
          <SelectTrigger><SelectValue placeholder="Geometry" /></SelectTrigger>
          <SelectContent>{GEOMETRY_OPTIONS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label>Noise</Label>
        <Select value={params.noise} onValueChange={(v) => onParamsChange({ ...params, noise: v as ShaderParams['noise'] })}>
          <SelectTrigger><SelectValue placeholder="Noise" /></SelectTrigger>
          <SelectContent>{NOISE_OPTIONS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <ParamSlider id="speed" label="Speed" value={params.speed} {...PARAM_RANGE.speed} onChange={(speed) => onParamsChange({ ...params, speed })} />
      <ParamSlider id="amplitude" label="Amplitude" value={params.amplitude} {...PARAM_RANGE.amplitude} onChange={(amplitude) => onParamsChange({ ...params, amplitude })} />
      <ParamSlider id="frequency" label="Frequency" value={params.frequency} {...PARAM_RANGE.frequency} onChange={(frequency) => onParamsChange({ ...params, frequency })} />
      <ParamSlider id="scale" label="Scale" value={params.scale} {...PARAM_RANGE.scale} onChange={(scale) => onParamsChange({ ...params, scale })} />
      <ParamSlider id="rotationSpeed" label="Rotation" value={params.rotationSpeed} {...PARAM_RANGE.rotationSpeed} onChange={(rotationSpeed) => onParamsChange({ ...params, rotationSpeed })} />

      <div className="grid grid-cols-2 gap-2">
        <ColorInput value={params.colors.color1} onChange={(color1) => onParamsChange({ ...params, colors: { ...params.colors, color1 } })} label="Color A" />
        <ColorInput value={params.colors.color2} onChange={(color2) => onParamsChange({ ...params, colors: { ...params.colors, color2 } })} label="Color B" />
        <ColorInput value={params.colors.color3} onChange={(color3) => onParamsChange({ ...params, colors: { ...params.colors, color3 } })} label="Color C" />
        <ColorInput value={params.colors.background} onChange={(background) => onParamsChange({ ...params, colors: { ...params.colors, background } })} label="Background" />
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        {[
          { key: 'wireframe', label: 'Wireframe' },
          { key: 'autoRotate', label: 'Auto rotate' },
          { key: 'bloom', label: 'Bloom', nested: true },
          { key: 'rgbShift', label: 'RGB Shift', nested: true },
          { key: 'glitch', label: 'Glitch', nested: true },
          { key: 'pixelArt', label: 'Pixel', nested: true },
          { key: 'vignette', label: 'Vignette', nested: true },
        ].map((toggle) => {
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
                    onParamsChange({ ...params, postProcessing: { ...params.postProcessing, [toggle.key]: next } });
                    return;
                  }
                  onParamsChange({ ...params, [toggle.key]: next });
                }}
              />
            </label>
          );
        })}
      </div>

      <ParamSlider id="bloomIntensity" label="Bloom Intensity" value={params.postProcessing.bloomIntensity} {...PARAM_RANGE.bloomIntensity} onChange={(bloomIntensity) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, bloomIntensity } })} />
      <ParamSlider id="rgbShiftAmount" label="RGB Shift Amount" value={params.postProcessing.rgbShiftAmount} {...PARAM_RANGE.rgbShiftAmount} onChange={(rgbShiftAmount) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, rgbShiftAmount } })} />
      <ParamSlider id="glitchIntensity" label="Glitch Intensity" value={params.postProcessing.glitchIntensity} {...PARAM_RANGE.glitchIntensity} onChange={(glitchIntensity) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, glitchIntensity } })} />
      <ParamSlider id="pixelSize" label="Pixel Size" value={params.postProcessing.pixelSize} {...PARAM_RANGE.pixelSize} onChange={(pixelSize) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, pixelSize } })} />
      <ParamSlider id="vignetteIntensity" label="Vignette Intensity" value={params.postProcessing.vignetteIntensity} {...PARAM_RANGE.vignetteIntensity} onChange={(vignetteIntensity) => onParamsChange({ ...params, postProcessing: { ...params.postProcessing, vignetteIntensity } })} />
    </aside>
  );
}
