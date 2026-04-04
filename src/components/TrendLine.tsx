interface TrendLineProps {
  values: number[];
  height?: number;
  color?: string;
  suffix?: string;
}

export default function TrendLine({ values, height = 80, color = "#3b82f6", suffix = "%" }: TrendLineProps) {
  if (values.length < 2) {
    return (
      <div className="text-xs text-slate-600 text-center py-4">
        Need at least 2 games to show trend
      </div>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 4;
  const w = 300;
  const h = height;

  const points = values.map((v, i) => {
    const x = padding + (i / (values.length - 1)) * (w - padding * 2);
    const y = h - padding - ((v - min) / range) * (h - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");
  const lastVal = values[values.length - 1];
  const firstVal = values[0];
  const trend = lastVal - firstVal;

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none">
        <polyline
          points={polyline}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Dots at each point */}
        {values.map((v, i) => {
          const x = padding + (i / (values.length - 1)) * (w - padding * 2);
          const y = h - padding - ((v - min) / range) * (h - padding * 2);
          return <circle key={i} cx={x} cy={y} r={2.5} fill={color} />;
        })}
      </svg>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{values.length} games ago</span>
        <span className={trend >= 0 ? "text-green-400" : "text-red-400"}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}{suffix} overall
        </span>
      </div>
    </div>
  );
}
