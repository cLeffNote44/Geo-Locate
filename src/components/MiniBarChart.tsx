interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface MiniBarChartProps {
  data: BarData[];
  maxValue?: number;
  suffix?: string;
}

export default function MiniBarChart({ data, maxValue, suffix = "" }: MiniBarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs text-slate-500 w-24 text-right truncate shrink-0">
            {d.label}
          </span>
          <div className="flex-1 h-5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.max(2, (d.value / max) * 100)}%`,
                background: d.color ?? "linear-gradient(90deg, #3b82f6, #8b5cf6)",
              }}
            />
          </div>
          <span className="text-xs font-bold text-slate-300 w-12 tabular-nums">
            {d.value}{suffix}
          </span>
        </div>
      ))}
    </div>
  );
}
