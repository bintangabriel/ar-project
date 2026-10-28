"use client";

import { useMemo, useState } from "react";

/* ---------- Types ---------- */

export type PeojfRow = {
  id: string;
  name: string;
  totalSk: number;
  skSuccess: number;
};

export type SkSummary = {
  total: number;
  success: number;
  inProgress: number;
  failed: number;
};

export type PeojfDashboardProps = {
  summary?: SkSummary;
  rows?: PeojfRow[];
  periods?: string[];
  areas?: string[];
  peojfOptions?: string[];
  onFilterChange?: (filters: { period: string; area: string; peojf: string }) => void;
};

/* ---------- Default (demo) data: replace with your API data ---------- */

const defaultSummary: SkSummary = {
  total: 1250,
  success: 720,
  inProgress: 420,
  failed: 110,
};

const defaultRows: PeojfRow[] = [
  { id: "1", name: "Andi", totalSk: 180, skSuccess: 166 },
  { id: "2", name: "Budi", totalSk: 160, skSuccess: 125 },
  { id: "3", name: "Chandra", totalSk: 130, skSuccess: 93 },
  { id: "4", name: "Dedi", totalSk: 140, skSuccess: 95 },
  { id: "5", name: "Eko", totalSk: 130, skSuccess: 81 },
];

/* ---------- Helpers ---------- */

const nf = new Intl.NumberFormat("id-ID");
const pct = (value: number, total: number) =>
  total === 0 ? 0 : (value / total) * 100;
const fmtPct = (n: number, digits = 1) =>
  `${n.toFixed(digits).replace(".", ",")}%`;

const rankColors = [
  "bg-green-600",
  "bg-slate-400",
  "bg-orange-400",
  "bg-slate-400",
  "bg-slate-400",
];

/* ---------- Small UI pieces ---------- */

function Select({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`h-9 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${className}`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  tone: "blue" | "green" | "orange" | "red";
  icon: React.ReactNode;
}) {
  const tones = {
    blue: { bg: "bg-blue-50 border-blue-200", text: "text-blue-700", num: "text-blue-900" },
    green: { bg: "bg-green-50 border-green-200", text: "text-green-700", num: "text-green-800" },
    orange: { bg: "bg-orange-50 border-orange-200", text: "text-orange-700", num: "text-orange-800" },
    red: { bg: "bg-red-50 border-red-200", text: "text-red-700", num: "text-red-800" },
  }[tone];

  return (
    <div className={`flex items-center gap-3 rounded-xl border p-3 ${tones.bg}`}>
      <div className="shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className={`truncate text-xs font-semibold ${tones.text}`}>{label}</p>
        <p className={`text-2xl font-bold leading-tight ${tones.num}`}>{value}</p>
        {sub && <p className={`text-xs ${tones.text}`}>{sub}</p>}
      </div>
    </div>
  );
}

const DocIcon = (
  <svg viewBox="0 0 24 24" className="h-9 w-9 text-blue-600" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </svg>
);

const CheckIcon = (
  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  </span>
);

const ClockIcon = (
  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-white">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </svg>
  </span>
);

const CrossIcon = (
  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600 text-white">
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  </span>
);

/* ---------- Main component ---------- */

export default function PeojfDashboard({
  summary = defaultSummary,
  rows = defaultRows,
  periods = ["Aug 2026", "Sep 2026", "Oct 2026"],
  areas = ["All", "Area 1", "Area 2"],
  peojfOptions = ["All", ...defaultRows.map((r) => r.name)],
  onFilterChange,
}: PeojfDashboardProps) {
  const [period, setPeriod] = useState(periods[0]);
  const [area, setArea] = useState(areas[0]);
  const [peojf, setPeojf] = useState(peojfOptions[0]);

  const update = (next: Partial<{ period: string; area: string; peojf: string }>) => {
    const f = { period, area, peojf, ...next };
    onFilterChange?.(f);
  };

  const top5 = useMemo(
    () =>
      rows
        .map((r) => ({ ...r, rate: pct(r.skSuccess, r.totalSk) }))
        .sort((a, b) => b.rate - a.rate)
        .slice(0, 5),
    [rows]
  );

  return (
    <section className="w-full bg-slate-50 mt-5 p-4 sm:p-6 lg:p-8">
      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-700">Periode</span>
        <Select
          value={period}
          options={periods}
          onChange={(v) => { setPeriod(v); update({ period: v }); }}
        />
        <span className="ml-2 text-sm font-semibold text-slate-700">Area</span>
        <Select
          value={area}
          options={areas}
          onChange={(v) => { setArea(v); update({ area: v }); }}
          className="w-20"
        />
        <span className="ml-2 text-sm font-semibold text-slate-700">PEOJF</span>
        <Select
          value={peojf}
          options={peojfOptions}
          onChange={(v) => { setPeojf(v); update({ peojf: v }); }}
          className="w-20"
        />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          tone="blue"
          label="Total SK Diterima"
          value={nf.format(summary.total)}
          icon={DocIcon}
        />
        <StatCard
          tone="green"
          label="SK Sukses"
          value={nf.format(summary.success)}
          sub={`(${fmtPct(pct(summary.success, summary.total))})`}
          icon={CheckIcon}
        />
        <StatCard
          tone="orange"
          label="Dalam Proses"
          value={nf.format(summary.inProgress)}
          sub={`(${fmtPct(pct(summary.inProgress, summary.total))})`}
          icon={ClockIcon}
        />
        <StatCard
          tone="red"
          label="SK Gagal"
          value={nf.format(summary.failed)}
          sub={`(${fmtPct(pct(summary.failed, summary.total))})`}
          icon={CrossIcon}
        />
      </div>

      {/* Top 5 table */}
      <div className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm">
        <h3 className="border-b border-slate-200 px-4 py-3 text-sm font-bold text-slate-800">
          Top 5 PEOJF berdasarkan Success Rate
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-600">
                <th className="px-4 py-2 font-semibold">Rank</th>
                <th className="px-2 py-2 font-semibold">PEOJF</th>
                <th className="px-2 py-2 text-right font-semibold">Total SK</th>
                <th className="px-2 py-2 text-right font-semibold">SK Sukses</th>
                <th className="px-2 py-2" />
                <th className="px-4 py-2 text-right font-semibold">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {top5.map((r, i) => (
                <tr key={r.id} className="border-t border-slate-100">
                  <td className="px-4 py-2">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${rankColors[i] ?? "bg-slate-400"}`}
                    >
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-2 py-2 font-medium text-slate-800">{r.name}</td>
                  <td className="px-2 py-2 text-right text-slate-700">{r.totalSk}</td>
                  <td className="px-2 py-2 text-right font-semibold text-green-700">
                    {r.skSuccess}
                  </td>
                  <td className="w-40 min-w-[7rem] px-2 py-2">
                    <div className="h-4 w-full overflow-hidden rounded-sm bg-slate-200">
                      <div
                        className={`h-full rounded-sm ${i === 4 ? "bg-green-400" : "bg-green-600"}`}
                        style={{ width: `${r.rate}%` }}
                        role="progressbar"
                        aria-valuenow={Math.round(r.rate)}
                        aria-valuemin={0}
                        aria-valuemax={100}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right font-semibold text-slate-800">
                    {fmtPct(r.rate, 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}