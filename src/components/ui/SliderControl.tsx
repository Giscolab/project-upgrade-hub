interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (value: number) => void;
}

export default function SliderControl({ label, value, min, max, step, unit, onChange }: SliderControlProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-[#8888aa]">{label}</span>
        <span className="font-mono text-xs text-[#e8e8f0]">
          {value.toFixed(step < 1 ? 2 : 0)}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full"
      />
    </div>
  );
}
