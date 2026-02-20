interface ColorSwatchProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export default function ColorSwatch({ label, value, onChange }: ColorSwatchProps) {
  return (
    <label className="flex items-center gap-2 rounded border border-[#2a2a3a] bg-[#1a1a26] p-1.5 text-[#e8e8f0]">
      <span className="relative h-6 w-6 overflow-hidden rounded border border-[#2a2a3a]">
        <span className="absolute inset-0" style={{ backgroundColor: value }} />
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] text-[#8888aa]">{label}</span>
        <span className="block truncate font-mono text-[11px] text-[#e8e8f0]">{value.toUpperCase()}</span>
      </span>
    </label>
  );
}
