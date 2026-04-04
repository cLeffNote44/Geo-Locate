import type { GameMode, Screen } from "../types";

interface ModeOption {
  mode: GameMode;
  emoji: string;
  name: string;
  description: string;
}

const MODES: ModeOption[] = [
  { mode: "classic", emoji: "🎯", name: "Classic", description: "3 lives, find each country" },
  { mode: "practice", emoji: "📚", name: "Practice", description: "No penalty, learn at your pace" },
  { mode: "timed", emoji: "⏱️", name: "Timed", description: "Race the clock, find them all" },
  { mode: "speedrun", emoji: "🏁", name: "Speed Run", description: "All countries, fastest time wins" },
  { mode: "flags", emoji: "🏴", name: "Flags", description: "Identify countries by their flag" },
  { mode: "capitals", emoji: "🏛️", name: "Capitals", description: "Find countries by capital city" },
];

interface ModeGridProps {
  navigate: (screen: Screen) => void;
}

export default function ModeGrid({ navigate }: ModeGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-[640px]">
      {MODES.map((m) => (
        <button
          key={m.mode}
          onClick={() => navigate({ kind: "regionSelect", mode: m.mode })}
          className="flex flex-col items-center gap-2 p-5 rounded-xl border-[1.5px] border-white/10 bg-white/[.04] text-slate-300 cursor-pointer transition-all hover:bg-white/[.08] hover:border-white/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <span className="text-3xl">{m.emoji}</span>
          <span className="text-sm font-bold text-white">{m.name}</span>
          <span className="text-[11px] text-slate-500 leading-tight text-center">
            {m.description}
          </span>
        </button>
      ))}
    </div>
  );
}
