import { useRef, useEffect, useState, useCallback, memo } from "react";
import * as d3 from "d3";
import type { CountryId, MapFeature } from "../types";

interface ZoomMapProps {
  paths: MapFeature[];
  correctIds: Set<CountryId>;
  wrongIds: Set<CountryId>;
  revealId: CountryId | null;
  answerRevealed: boolean;
  ended: boolean;
  practiceMode: boolean;
  onCountryClick: (id: CountryId) => void;
  onCountrySelect?: (id: CountryId) => void;
}

const isTouch = typeof window !== "undefined" && "ontouchstart" in window;

const CountryPath = memo(function CountryPath({
  feature,
  fill,
  onClick,
  onHover,
  onLeave,
}: {
  feature: MapFeature;
  fill: string;
  onClick: () => void;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <path
      d={feature.d}
      fill={fill}
      stroke="#2a3a5a"
      strokeWidth={0.5}
      strokeLinejoin="round"
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        cursor: "pointer",
        transition: "fill 0.2s ease",
      }}
    />
  );
});

export default function ZoomMap({
  paths,
  correctIds,
  wrongIds,
  revealId,
  answerRevealed,
  ended,
  practiceMode,
  onCountryClick,
  onCountrySelect,
}: ZoomMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>(null);
  const [hovered, setHovered] = useState<CountryId | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  const getFill = useCallback(
    (id: CountryId): string => {
      if (answerRevealed && id === revealId) return "#22c55e";
      if (correctIds.has(id)) return "#86EFAC";
      if (wrongIds.has(id) && ended) return "#FCA5A5";
      if (id === revealId && !answerRevealed) return "#FCA5A5";
      return "#F5F0E8";
    },
    [correctIds, wrongIds, revealId, answerRevealed, ended],
  );

  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 18])
      .on("zoom", (e) => {
        g.attr("transform", e.transform);
        setZoomLevel(e.transform.k);
        const sw = Math.max(0.15, 0.5 / e.transform.k);
        g.selectAll("path").attr("stroke-width", sw);
      });

    zoomRef.current = zoom;
    svg.call(zoom);

    return () => {
      svg.on(".zoom", null);
    };
  }, [paths]);

  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    d3.select(svgRef.current)
      .transition()
      .duration(500)
      .call(zoomRef.current.transform, d3.zoomIdentity);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const showTooltip = !isTouch && (ended || practiceMode);
  const hoveredName =
    hovered && paths.find((p) => p.id === hovered)?.name;

  const tooltipMaxLeft = svgRef.current?.clientWidth
    ? svgRef.current.clientWidth - 120
    : 680;

  return (
    <div className="relative w-full h-full">
      <svg
        ref={svgRef}
        viewBox="0 0 800 490"
        className="w-full h-full block select-none"
        style={{ cursor: "grab", touchAction: "none" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHovered(null)}
      >
        <rect width="800" height="490" fill="#1a2744" />
        <g ref={gRef}>
          {paths.map((p) => (
            <CountryPath
              key={p.id}
              feature={p}
              fill={getFill(p.id)}
              onClick={() => {
                if (ended && onCountrySelect) {
                  onCountrySelect(p.id);
                } else {
                  onCountryClick(p.id);
                }
              }}
              onHover={() => setHovered(p.id)}
              onLeave={() => setHovered(null)}
            />
          ))}
        </g>
      </svg>

      {/* Zoom controls */}
      <div className="absolute top-2.5 right-2.5 flex flex-col items-center bg-black/70 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
        <button
          className="min-w-[44px] min-h-[44px] bg-transparent border-none text-slate-300 cursor-pointer text-lg font-bold flex items-center justify-center hover:bg-white/10 active:bg-white/20"
          onClick={() =>
            svgRef.current &&
            zoomRef.current &&
            d3
              .select(svgRef.current)
              .transition()
              .duration(300)
              .call(zoomRef.current.scaleBy, 1.6)
          }
        >
          +
        </button>
        <div className="text-[10px] text-slate-500 py-0.5 font-semibold select-none">
          {Math.round(zoomLevel * 100)}%
        </div>
        <button
          className="min-w-[44px] min-h-[44px] bg-transparent border-none text-slate-300 cursor-pointer text-lg font-bold flex items-center justify-center hover:bg-white/10 active:bg-white/20"
          onClick={() =>
            svgRef.current &&
            zoomRef.current &&
            d3
              .select(svgRef.current)
              .transition()
              .duration(300)
              .call(zoomRef.current.scaleBy, 0.625)
          }
        >
          -
        </button>
        <div className="w-4/5 h-px bg-white/10 my-0.5" />
        <button
          className="min-w-[44px] min-h-[44px] bg-transparent border-none text-slate-300 cursor-pointer text-lg font-bold flex items-center justify-center hover:bg-white/10 active:bg-white/20"
          onClick={resetZoom}
        >
          ⌂
        </button>
      </div>

      {/* Hint badge — adapts to touch/mouse */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/55 text-slate-600 px-3.5 py-1 rounded-full text-[11px] font-semibold pointer-events-none whitespace-nowrap tracking-wide">
        {isTouch ? "👆 Pinch to zoom · Drag to pan" : "🖱 Scroll to zoom · Drag to pan"}
      </div>

      {/* Tooltip (hidden on touch devices) */}
      {showTooltip && hovered && hoveredName && (
        <div
          className="absolute bg-black/90 text-slate-200 px-3.5 py-1.5 rounded-full text-[13px] font-semibold pointer-events-none border border-white/10 whitespace-nowrap shadow-lg z-50"
          style={{
            left: Math.min(tooltipPos.x + 14, tooltipMaxLeft),
            top: Math.max(tooltipPos.y - 36, 4),
          }}
        >
          {hoveredName}
        </div>
      )}
    </div>
  );
}
