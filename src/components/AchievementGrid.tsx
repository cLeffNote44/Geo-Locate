import type { AchievementId, AchievementRecord } from "../types";
import { ACHIEVEMENTS } from "../lib/achievements";

interface AchievementGridProps {
  achievements: Record<AchievementId, AchievementRecord>;
}

export default function AchievementGrid({ achievements }: AchievementGridProps) {
  const unlockedCount = ACHIEVEMENTS.filter((a) => achievements[a.id]?.unlocked).length;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Achievements
        </div>
        <div className="text-xs text-slate-400">
          {unlockedCount}/{ACHIEVEMENTS.length} unlocked
        </div>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {ACHIEVEMENTS.map((a) => {
          const unlocked = achievements[a.id]?.unlocked;
          return (
            <div
              key={a.id}
              className={`
                flex flex-col items-center gap-1 p-3 rounded-xl text-center transition-all
                ${unlocked
                  ? "bg-yellow-500/10 border border-yellow-500/30"
                  : "bg-white/[.03] border border-white/[.06] opacity-40"
                }
              `}
              title={a.description}
            >
              <span className={`text-2xl ${unlocked ? "" : "grayscale"}`}>{a.emoji}</span>
              <span className="text-[10px] font-semibold text-slate-300 leading-tight">
                {a.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
