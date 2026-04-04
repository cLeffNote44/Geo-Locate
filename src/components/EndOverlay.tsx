interface EndOverlayProps {
  onPlayAgain: () => void;
  onChangeMap: () => void;
  onMainMenu: () => void;
}

export default function EndOverlay({
  onPlayAgain,
  onChangeMap,
  onMainMenu,
}: EndOverlayProps) {
  return (
    <div className="flex gap-2.5 justify-center px-4 py-3.5 bg-black/50 border-t border-white/[.08] flex-wrap shrink-0">
      <button className="btn-primary !text-base !px-6 !py-3" onClick={onPlayAgain}>
        🔄 Play Again
      </button>
      <button className="btn-ghost !px-6 !py-3 !text-[15px]" onClick={onChangeMap}>
        🗺 Change Map
      </button>
      <button className="btn-ghost !px-6 !py-3 !text-[15px]" onClick={onMainMenu}>
        🏠 Main Menu
      </button>
    </div>
  );
}
