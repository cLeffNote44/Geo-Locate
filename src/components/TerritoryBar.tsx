interface TerritoryBarProps {
  playerArea: number;
  aiArea: number;
  totalArea: number;
  playerCountries: number;
  aiCountries: number;
  totalCountries: number;
  turn: "player" | "ai";
  finished: boolean;
}

export default function TerritoryBar({
  playerArea,
  aiArea,
  totalArea,
  playerCountries,
  aiCountries,
  totalCountries,
  turn,
  finished,
}: TerritoryBarProps) {
  const playerPct = totalArea > 0 ? Math.round((playerArea / totalArea) * 100) : 0;
  const aiPct = totalArea > 0 ? Math.round((aiArea / totalArea) * 100) : 0;
  const unclaimedPct = 100 - playerPct - aiPct;

  const playerWon = playerArea > aiArea;

  return (
    <div className="px-3 py-2 bg-black/50 border-b border-white/[.07]">
      {/* Turn indicator or result */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-400">
            🛡 You: {playerCountries}
          </span>
          <span className="text-[10px] text-slate-500">
            {(playerArea / 1000).toFixed(0)}K km²
          </span>
        </div>

        {!finished ? (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
            turn === "player"
              ? "bg-blue-500/20 text-blue-400"
              : "bg-red-500/20 text-red-400"
          }`}>
            {turn === "player" ? "YOUR TURN" : "AI THINKING..."}
          </span>
        ) : (
          <span className={`text-xs font-black ${playerWon ? "text-blue-400" : "text-red-400"}`}>
            {playerWon ? "🏆 VICTORY" : playerArea === aiArea ? "🤝 DRAW" : "💀 DEFEAT"}
          </span>
        )}

        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">
            {(aiArea / 1000).toFixed(0)}K km²
          </span>
          <span className="text-xs font-bold text-red-400">
            🤖 AI: {aiCountries}
          </span>
        </div>
      </div>

      {/* Territory bar */}
      <div className="h-3 bg-slate-800 rounded-full overflow-hidden flex">
        {playerPct > 0 && (
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-[width] duration-500"
            style={{ width: `${playerPct}%` }}
          />
        )}
        {unclaimedPct > 0 && (
          <div
            className="h-full bg-slate-700 transition-[width] duration-500"
            style={{ width: `${unclaimedPct}%` }}
          />
        )}
        {aiPct > 0 && (
          <div
            className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-[width] duration-500"
            style={{ width: `${aiPct}%` }}
          />
        )}
      </div>

      {/* Percentage labels */}
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-blue-400 font-bold tabular-nums">{playerPct}%</span>
        <span className="text-[10px] text-slate-600">
          {totalCountries - playerCountries - aiCountries} unclaimed
        </span>
        <span className="text-[10px] text-red-400 font-bold tabular-nums">{aiPct}%</span>
      </div>
    </div>
  );
}
