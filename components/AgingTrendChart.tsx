"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  LabelList,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { BucketKey, TrendPoint } from "@/services/AgingChart";

export type PenMode = "cumulative" | "daily";

interface Props {
  bucketKey: BucketKey;
  threshold: number;
  series: TrendPoint[];
  /** short names of the two selected months, e.g. "Jan 2026" */
  label1: string;
  label2: string;
  penMode: PenMode;
  loading?: boolean;
}

type LineKey = "am1" | "am2" | "pen1" | "pen2" | "bal1" | "bal2";

const bn = (v: number) => `${(v / 1e9).toFixed(1)}bn`;
const pctFmt = (v: number) => `${v.toFixed(2)}%`;

/**
 * "daily"      -> plots pen as stored: am(day + 1) - am(day), negative = AM went down.
 * "cumulative" -> total reduction since day 1 (positive = AM went down), as in the
 *                 reference dashboard. It stops at the last day that has a pen value.
 */
function buildRows(series: TrendPoint[], mode: PenMode): TrendPoint[] {
  if (mode === "daily") return series;

  let cum1 = 0;
  let cum2 = 0;
  let stop1 = false;
  let stop2 = false;

  return series.map((p) => {
    if (p.pen1 == null) stop1 = true;
    if (!stop1) cum1 += -(p.pen1 as number);

    if (p.pen2 == null) stop2 = true;
    if (!stop2) cum2 += -(p.pen2 as number);

    return { ...p, pen1: stop1 ? null : cum1, pen2: stop2 ? null : cum2 };
  });
}

/** Tracks an element's width, so BAL labels can thin out on narrow charts. */
function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, width] as const;
}

interface LabelRenderProps {
  x?: number | string;
  y?: number | string;
  value?: unknown;
  index?: number;
}

/**
 * Data label for a BAL point. Month 1 sits above the point and month 2 below it, so the
 * two lines do not print on top of each other. Only every `step`-th day is labelled, and
 * `step` grows as the chart gets narrower. A dark outline keeps the text readable over lines.
 */
const balLabel = (color: string, dy: number, step: number) =>
  function BalLabel({ x, y, value, index }: LabelRenderProps) {
    if (value == null || x == null || y == null) return null;
    if ((index ?? 0) % step !== 0) return null;
    return (
      <text
        x={Number(x)}
        y={Number(y) + dy}
        fill={color}
        fontSize={10}
        fontWeight={600}
        textAnchor="middle"
        stroke="#0f172a"
        strokeWidth={3}
        strokeLinejoin="round"
        paintOrder="stroke"
      >
        {pctFmt(Number(value))}
      </text>
    );
  };

interface TipProps {
  active?: boolean;
  label?: number | string;
  payload?: { dataKey?: string | number; name?: string; value?: number | null; color?: string }[];
}

function ChartTooltip({ active, label, payload }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs shadow-xl backdrop-blur">
      <p className="mb-1 font-semibold text-slate-200">Tanggal {label}</p>
      <ul className="space-y-0.5">
        {payload.map((p) => (
          <li key={String(p.dataKey)} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-medium text-slate-100">
              {p.value == null
                ? "-"
                : String(p.dataKey).startsWith("bal")
                  ? pctFmt(p.value)
                  : bn(p.value)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AgingTrendChart({
  bucketKey,
  threshold,
  series,
  label1,
  label2,
  penMode,
  loading,
}: Props) {
  const [hidden, setHidden] = useState<Set<LineKey>>(new Set());
  const [boxRef, width] = useElementWidth<HTMLDivElement>();

  const rows = useMemo(() => buildRows(series, penMode), [series, penMode]);
  const hasData = rows.some((r) => r.am1 != null || r.am2 != null);

  // ~34px of room per label: 31 days in the plot area decide how many days to skip.
  const perDay = Math.max(width - 100, 1) / 31;
  const labelStep = width === 0 ? 3 : Math.max(1, Math.ceil(34 / perDay));

  const code = bucketKey === "POWO" ? "POWO" : String(threshold);
  const title = bucketKey === "POWO" ? `POWO (> ${threshold})` : `Balance > ${threshold}`;

  const lines: { key: LineKey; name: string; color: string; axis: "amount" | "pct"; dashed?: boolean }[] = [
    { key: "am1", name: `AM${code} · ${label1}`, color: "#3b82f6", axis: "amount" },
    { key: "am2", name: `AM${code} · ${label2}`, color: "#ec4899", axis: "amount", dashed: true },
    { key: "pen1", name: `Penyelesaian ${code} · ${label1}`, color: "#f97316", axis: "amount" },
    { key: "pen2", name: `Penyelesaian ${code} · ${label2}`, color: "#eab308", axis: "amount", dashed: true },
    { key: "bal1", name: `BAL${code} · ${label1}`, color: "#f8fafc", axis: "pct" },
    { key: "bal2", name: `BAL${code} · ${label2}`, color: "#22c55e", axis: "pct", dashed: true },
  ];

  const toggle = (k: LineKey) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return (
    <section className="relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow-lg sm:p-5">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-slate-100 sm:text-lg">{title}</h2>
        <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-400">
          AM &amp; Penyelesaian (bn) · BAL (% OSA)
        </span>
      </header>

      {/* Clickable legend: wraps nicely on mobile, click to hide / show a series */}
      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1.5">
        {lines.map((l) => {
          const off = hidden.has(l.key);
          return (
            <button
              key={l.key}
              type="button"
              onClick={() => toggle(l.key)}
              className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] transition-opacity hover:bg-slate-800 ${
                off ? "opacity-40" : "opacity-100"
              }`}
              aria-pressed={!off}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: l.color }} />
              <span className="text-slate-300">{l.name}</span>
            </button>
          );
        })}
      </div>

      <div
        ref={boxRef}
        className={`relative h-[320px] w-full transition-opacity sm:h-[400px] lg:h-[440px] ${loading ? "opacity-50" : ""}`}
      >
        {!hasData && !loading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            Belum ada data untuk periode ini
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 16, right: 4, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(d: number) => String(d).padStart(2, "0")}
                tickLine={false}
                axisLine={{ stroke: "#334155" }}
                interval="preserveStartEnd"
                minTickGap={8}
              />
              <YAxis
                yAxisId="amount"
                domain={[0, (max: number) => max * 1.1]}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(v: number) => `${Math.round(v / 1e9)}bn`}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <YAxis
                yAxisId="pct"
                orientation="right"
                // headroom so the labels above the top points are not clipped
                domain={[0, (max: number) => max * 1.2]}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(v: number) => `${v.toFixed(1)}%`}
                tickLine={false}
                axisLine={false}
                width={44}
              />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#475569", strokeDasharray: "4 4" }} />

              {lines.map((l) => (
                <Line
                  key={l.key}
                  yAxisId={l.axis}
                  type="monotone"
                  dataKey={l.key}
                  name={l.name}
                  stroke={l.color}
                  strokeWidth={2}
                  strokeDasharray={l.dashed ? "5 4" : undefined}
                  dot={{ r: 2, strokeWidth: 0, fill: l.color }}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                  hide={hidden.has(l.key)}
                  isAnimationActive={false}
                >
                  {l.key === "bal1" && <LabelList dataKey="bal1" content={balLabel(l.color, -9, labelStep)} />}
                  {l.key === "bal2" && <LabelList dataKey="bal2" content={balLabel(l.color, 16, labelStep)} />}
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-blue-500" />
          </div>
        )}
      </div>
    </section>
  );
}