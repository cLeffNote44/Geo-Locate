import { useState } from "react";
import type { GameSummary } from "../types";
import { copyShareText } from "../lib/share";

interface EndOverlayProps {
  summary?: GameSummary;
  onPlayAgain: () => void;
  onChangeMap: () => void;
  onMainMenu: () => void;
}

export default function EndOverlay({
  summary,
  onPlayAgain,
  onChangeMap,
  onMainMenu,
}: EndOverlayProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!summary) return;
    const ok = await copyShareText(summary);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-3 items-center px-4 py-4 bg-black/50 border-t border-white/[.08] shrink-0">
      {/* Score summary row */}
      {summary && summary.score > 0 && (
        <div className="flex gap-4 items-center text-sm flex-wrap justify-center mb-1">
          <div className="flex items-center gap-1.5">
            <span className="text-amber-400 font-black text-lg">{summary.score.toLocaleString()}</span>
            <span className="text-slate-500 text-xs">POINTS</span>
          </div>
          {summary.maxStreak >= 3 && (
            <div className="flex items-center gap-1">
              <span className="text-orange-400 font-bold">🔥 {summary.maxStreak}</span>
              <span className="text-slate-500 text-xs">MAX STREAK</span>
            </div>
          )}
          {summary.difficulty !== "normal" && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${
              summary.difficulty === "hard" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"
            }`}>
              {summary.difficulty === "hard" ? "💀 Hard" : "🟢 Easy"}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-2.5 justify-center flex-wrap">
        <button className="btn-primary !text-base !px-6 !py-3" onClick={onPlayAgain}>
          🔄 Play Again
        </button>
        {summary && (
          <button
            className="btn-ghost !px-5 !py-3 !text-[15px]"
            onClick={handleShare}
          >
            {copied ? "✅ Copied!" : "📤 Share"}
          </button>
        )}
        <button className="btn-ghost !px-6 !py-3 !text-[15px]" onClick={onChangeMap}>
          🗺 Change Map
        </button>
        <button className="btn-ghost !px-6 !py-3 !text-[15px]" onClick={onMainMenu}>
          🏠 Main Menu
        </button>
      </div>
    </div>
  );
}
