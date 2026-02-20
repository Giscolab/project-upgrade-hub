import { ReactNode, useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface PanelSectionProps {
  title: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function PanelSection({ title, icon, defaultOpen = true, children }: PanelSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="rounded-md border border-[#2a2a3a] bg-[#111118]">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center gap-2 border-b border-[#2a2a3a] bg-[#16161f] px-2 py-1.5 text-left text-[11px] uppercase tracking-wider text-[#e8e8f0]"
      >
        {icon}
        <span className="flex-1">{title}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 ${open ? 'rotate-0' : '-rotate-90'}`} />
      </button>
      <div className={`grid transition-all duration-150 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="space-y-2 p-2">{children}</div>
        </div>
      </div>
    </section>
  );
}
