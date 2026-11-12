"use client";

// app/aging-trend/page.tsx
import { useEffect, useMemo, useState } from "react";
import AgingTrendChart, { type PenMode } from "../../components/AgingTrendChart";
import { fetchAgingTrend, type AgingTrend, type YearMonth } from "../../services/AgingChart";
import { useUserData } from "@/redux/store";

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];
const SHORT_MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

const toKey = (ym: YearMonth) => `${ym.year}-${String(ym.month).padStart(2, "0")}`;
const toShort = (ym: YearMonth) => `${SHORT_MONTHS[ym.month - 1]} ${ym.year}`;

const selectCls =
  "rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-60";
const labelCls = "text-[11px] font-medium uppercase tracking-wide text-slate-400";

function MonthPicker({
  label,
  value,
  years,
  onChange,
}: {
  label: string;
  value: YearMonth;
  years: number[];
  onChange: (next: YearMonth) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className={labelCls}>{label}</span>
      <div className="flex gap-2">
        <select
          aria-label={`${label}, bulan`}
          className={selectCls}
          value={value.month}
          onChange={(e) => onChange({ ...value, month: Number(e.target.value) })}
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          aria-label={`${label}, tahun`}
          className={selectCls}
          value={value.year}
          onChange={(e) => onChange({ ...value, year: Number(e.target.value) })}
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

export default function AgingTrendPage() {
  // Default: the current month (month 2) against the month before it (month 1).
  const [m1, setM1] = useState<YearMonth>(() => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() - 1);
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [m2, setM2] = useState<YearMonth>(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() + 1 };
  });
  const [penMode, setPenMode] = useState<PenMode>("cumulative");

  const [data, setData] = useState<AgingTrend | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useUserData();
  const token = user?.jwt.token;

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => y - i);
  }, []);

  // loading / error are set in the event handler, not inside the effect
  const changeMonths = (next1: YearMonth, next2: YearMonth) => {
    setLoading(true);
    setError(null);
    setM1(next1);
    setM2(next2);
  };

  const key1 = toKey(m1);
  const key2 = toKey(m2);

  useEffect(() => {
    const controller = new AbortController();
    
    if (!token) {
      return;
    }

    fetchAgingTrend(key1, key2, controller.signal, token)
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [key1, key2, token]);

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-slate-100 sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        {/* Header + filters */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">AGING TREND</h1>
            <p className="mt-1 text-sm text-slate-400">
              {toShort(m1)} dibanding {toShort(m2)}
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
            <MonthPicker label="Month 1" value={m1} years={years} onChange={(next) => changeMonths(next, m2)} />
            <MonthPicker label="Month 2" value={m2} years={years} onChange={(next) => changeMonths(m1, next)} />

            {/* Late = branch filter. Placeholder until the branch filter is added. */}
            <div className="flex flex-col gap-1">
              <span className={labelCls}>Late</span>
              <select className={selectCls} disabled aria-label="Late (cabang)">
                <option>Semua</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className={labelCls}>Penyelesaian</span>
              <div className="flex overflow-hidden rounded-lg border border-slate-700 text-sm">
                {(["cumulative", "daily"] as PenMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPenMode(m)}
                    className={`px-3 py-2 transition-colors ${
                      penMode === m ? "bg-blue-600 text-white" : "bg-slate-900 text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    {m === "cumulative" ? "Kumulatif" : "Harian"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <p className="rounded-lg border border-red-900 bg-red-950/60 p-4 text-sm text-red-300">
            Gagal memuat data: {error}
          </p>
        )}

        {/* All four charts (60, 90, 120, POWO): 1 column on mobile, 2 on large screens */}
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {!data
            ? [0, 1, 2, 3].map((i) => (
                <div key={i} className="h-[490px] animate-pulse rounded-2xl border border-slate-800 bg-slate-900" />
              ))
            : data.buckets.map((b) => (
                <AgingTrendChart
                  key={b.key}
                  bucketKey={b.key}
                  threshold={b.threshold}
                  series={b.series}
                  label1={toShort(m1)}
                  label2={toShort(m2)}
                  penMode={penMode}
                  loading={loading}
                />
              ))}
        </div>
      </div>
    </main>
  );
}