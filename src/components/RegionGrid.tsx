import { REGION_OPTIONS } from "../data/regions";
import type { RegionValue } from "../types";

interface RegionGridProps {
  selected: RegionValue | null;
  onSelect: (id: RegionValue) => void;
}

export default function RegionGrid({ selected, onSelect }: RegionGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-[640px] mb-2">
      {REGION_OPTIONS.map((r) => {
        const isActive = selected === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={`
              flex flex-col items-center gap-1 px-3 py-5 rounded-xl text-sm font-semibold transition-all cursor-pointer min-h-[72px]
              ${isActive ? "border-[1.5px] border-blue-500 bg-blue-500/20 text-sky-400 shadow-[0_0_16px_rgba(59,130,246,.3)]" : ""}
              ${!isActive ? "border-[1.5px] border-white/10 bg-white/[.04] text-slate-300 hover:bg-white/[.08]" : ""}
            `}
          >
            <span className="text-2xl">{r.emoji}</span>
            <span className="mt-1 text-[13px] font-semibold">{r.label}</span>
          </button>
        );
      })}
    </div>
  );
}
