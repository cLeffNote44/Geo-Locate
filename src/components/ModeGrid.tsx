import type { GameMode, Screen } from "../types";
import { hasPlayedToday, getDailyStreak } from "../lib/daily";

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
  { mode: "territory", emoji: "⚔️", name: "Territory Wars", description: "Compete vs AI to control the map" },
];

interface ModeGridProps {
  navigate: (screen: Screen) => void;
}

export default function ModeGrid({ navigate }: ModeGridProps) {
  const played = hasPlayedToday();
  const streak = getDailyStreak();

  return (
    <div className="w-full max-w-[640px]">
      {/* Daily Challenge card */}
      <button
        onClick={() => navigate({ kind: "daily" })}
        className={`w-full flex items-center gap-4 p-4 mb-3 rounded-xl border-[1.5px] cursor-pointer transition-all ${
          played
            ? "border-green-500/30 bg-green-500/[.06] hover:bg-green-500/[.1]"
            : "border-amber-500/30 bg-amber-500/[.08] hover:bg-amber-500/[.12] hover:scale-[1.01]"
        } active:scale-[0.99]`}
      >
        <span className="text-3xl">{played ? "✅" : "📅"}</span>
        <div className="text-left flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">Daily Challenge</span>
            {streak > 0 && (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/20 px-1.5 py-0.5 rounded">
                🔥 {streak}
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500">
            {played ? "Completed today! Come back tomorrow" : "10 countries — one attempt per day"}
          </span>
        </div>
        {!played && (
          <span className="text-xs font-bold text-amber-400">PLAY →</span>
        )}
      </button>

      {/* Regular mode grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
    </div>
  );
}
