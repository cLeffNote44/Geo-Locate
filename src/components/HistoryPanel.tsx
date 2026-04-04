import type { HistoryEntry } from "../types";

interface HistoryPanelProps {
  history: HistoryEntry[];
}

export default function HistoryPanel({ history }: HistoryPanelProps) {
  return (
    <div className="w-full max-w-[680px] mt-9">
      <div className="text-[13px] font-bold text-slate-600 uppercase tracking-widest mb-3 text-left w-full">
        📋 Game History
      </div>
      <div className="card">
        {history.length === 0 ? (
          <div className="text-slate-600 text-center py-5 text-[15px]">
            No games yet — your record will appear here!
          </div>
        ) : (
          history.map((h, i) => (
            <div
              key={i}
              className="p-3 rounded-lg mb-2.5 bg-white/[.03]"
              style={{ borderLeft: `4px solid ${h.won ? "#22c55e" : "#ef4444"}` }}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[15px] text-slate-200">
                  {h.region}
                  {h.mode === "practice" && (
                    <span className="ml-2 text-xs text-indigo-400">(Practice)</span>
                  )}
                </span>
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-bold text-white ${h.won ? "bg-green-900" : "bg-red-900"}`}
                >
                  {h.won ? "🏆 WIN" : "💀 LOSS"}
                </span>
              </div>
              <div className="flex gap-4 flex-wrap text-slate-400 text-[13px]">
                <span>🗺 {h.found}/{h.total} ({h.pct}%)</span>
                {h.mode === "classic" && <span>❤️ {h.livesLeft}/3 left</span>}
                <span>⏱ {h.secs}s</span>
                <span className="text-slate-600">{h.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
