import type { AchievementId } from "../types";
import { getAchievementDef } from "../lib/achievements";

interface AchievementToastProps {
  achievementIds: AchievementId[];
  onDone: () => void;
}

export default function AchievementToast({ achievementIds, onDone }: AchievementToastProps) {
  if (achievementIds.length === 0) return null;

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[400] flex flex-col gap-2 items-center"
      onClick={onDone}
    >
      {achievementIds.map((id) => {
        const def = getAchievementDef(id);
        if (!def) return null;
        return (
          <div
            key={id}
            className="flex items-center gap-3 bg-yellow-900/90 border border-yellow-500/50 rounded-2xl px-5 py-3 shadow-[0_4px_24px_rgba(234,179,8,.4)] cursor-pointer"
            style={{ animation: "pop-in .3s ease" }}
          >
            <span className="text-3xl">{def.emoji}</span>
            <div>
              <div className="text-yellow-300 font-bold text-sm">Achievement Unlocked!</div>
              <div className="text-white font-bold text-base">{def.name}</div>
              <div className="text-yellow-200/70 text-xs">{def.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
