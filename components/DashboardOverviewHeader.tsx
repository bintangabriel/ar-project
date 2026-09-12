"use client";

import { useState } from "react";
import { Calendar, ChevronDown, BarChart3, ClipboardList, PieChart } from "lucide-react";
import { CabangOption, DEFAULT_CABANG_OPTIONS } from "@/config/data";

export interface DashboardOverviewHeaderProps {
  /** ISO date string, e.g. "2026-08-04" */
  initialThisMonth?: string;
  /** ISO date string, e.g. "2026-07-04" */
  initialLastMonth?: string;
  cabangOptions?: CabangOption[];
  osaTotalTM: number;
  osaTotalLM: number;
  /** Called when the user clicks "Terapkan" with the current filter selection */
  onApply?: (filters: { thisMonth: string; lastMonth: string; cabang: string }) => void;
}

function formatRupiah(value: number) {
  const formatted = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0,
  }).format(Math.abs(value));
  return `Rp${formatted}`;
}

// Converts an ISO date (yyyy-mm-dd) to the dd/mm/yyyy shown in the date inputs.
function toDisplayDate(iso: string) {
  const [y, m, d] = iso.split("-");
  if (!y || !m || !d) return iso;
  return `${d}/${m}/${y}`;
}

export default function DashboardOverviewHeader({
  initialThisMonth = "2026-08-04",
  initialLastMonth = "2026-07-04",
  cabangOptions = DEFAULT_CABANG_OPTIONS,
  osaTotalTM,
  osaTotalLM,
  onApply,
}: DashboardOverviewHeaderProps) {
  const [thisMonth, setThisMonth] = useState(initialThisMonth);
  const [lastMonth, setLastMonth] = useState(initialLastMonth);
  const [cabang, setCabang] = useState(cabangOptions[0]?.value ?? "");

  const diff = osaTotalTM - osaTotalLM;
  const pctDiff = osaTotalLM !== 0 ? (diff / osaTotalLM) * 100 : 0;
  const isDown = diff < 0;

  const handleApply = () => {
    onApply?.({ thisMonth, lastMonth, cabang });
  };

  return (
    <section className="w-full rounded-2xl bg-slate-50 p-6">
      {/* Title + filters */}
      <div className="flex flex-wrap items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">DASHBOARD</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            This Month (TM) {thisMonth} dibanding Last Month (LM) {lastMonth}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor="tm-date" className="text-xs font-medium text-slate-500">
              This Month (TM)
            </label>
            <div className="relative">
              <input
                id="tm-date"
                type="date"
                onChange={(e) => setThisMonth(e.target.value)}
                value={thisMonth}
                className="w-40 rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />\
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="lm-date" className="text-xs font-medium text-slate-500">
              Last Month (LM)
            </label>
            <div className="relative">
              <input
                id="lm-date"
                type="date"
                value={lastMonth}
                onChange={(e) => setLastMonth(e.target.value)}
                className="w-40 rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="cabang" className="text-xs font-medium text-slate-500">
              Filter by Cabang
            </label>
            <div className="relative">
              <select
                id="cabang"
                value={cabang}
                onChange={(e) => setCabang(e.target.value)}
                className="w-44 appearance-none rounded-lg border-2 border-blue-500 bg-white py-2 pl-3 pr-9 text-sm text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {cabangOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 active:bg-blue-800"
          >
            Terapkan
          </button>
        </div>
      </div>

      {/* OSA Total summary card */}
      <div className="mt-6 flex items-center justify-between overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50">
            <BarChart3 className="h-7 w-7 text-blue-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-blue-600">OSA TOTAL</p>
            <dl className="mt-2 space-y-1">
              <div className="flex items-center gap-2">
                <dt className="text-xs font-medium text-slate-400">TM</dt>
                <dd className="text-lg font-bold text-slate-900">{formatRupiah(osaTotalTM)}</dd>
              </div>
              <div className="flex items-center gap-2">
                <dt className="text-xs font-medium text-slate-400">LM</dt>
                <dd className="text-sm font-medium text-slate-400">{formatRupiah(osaTotalLM)}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="h-16 w-px bg-slate-100" />

        <div className="flex-1 pl-8">
          <p className="text-sm font-medium text-slate-500">TOTAL DIFFERENCE (TM vs LM)</p>
          <p className={`mt-2 text-2xl font-bold ${isDown ? "text-emerald-600" : "text-red-600"}`}>
            {isDown ? "-" : "+"}
            {formatRupiah(diff)}
          </p>
          <span
            className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isDown ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            }`}
          >
            {isDown ? "↓" : "↑"} {pctDiff.toFixed(2)}%
          </span>
        </div>

        <div className="relative hidden h-24 w-32 shrink-0 items-center justify-center sm:flex">
          <PieChart className="h-16 w-16 text-blue-200" />
          <ClipboardList className="absolute -right-1 -top-1 h-9 w-9 rotate-6 text-slate-300" />
        </div>
      </div>
    </section>
  );
}