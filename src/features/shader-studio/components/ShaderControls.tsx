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
        id="rotationSpeed"
        label="Rotation"
        value={params.rotationSpeed}
        {...PARAM_RANGE.rotationSpeed}
        onChange={(rotationSpeed) => onParamsChange({ ...params, rotationSpeed })}
      />

      <div className="grid grid-cols-2 gap-3 pt-2">
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
          { key: 'vignette', label: 'Vignette', nested: true },
        ].map((toggle) => {
          const checked = toggle.nested
            ? params.postProcessing[toggle.key as keyof ShaderParams['postProcessing']] as boolean
            : params[toggle.key as keyof ShaderParams] as boolean;

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
