"use client";

import { useEffect, useState } from "react";
import DashboardOverviewHeader from "../../components/DashboardOverviewHeader";
import BalanceAgingCards from "../../components/BalanceAgingCard";
import {
  fetchDashboardOverview,
  type DashboardFilters,
  type DashboardOverview,
} from "../../services/dashboard";

const INITIAL_FILTERS: DashboardFilters = {
  thisMonth: "2026-10-28",
  lastMonth: "2026-09-28",
  cabang: "", // first option of cabangOptions; "" / "all" = no filter
};

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>(INITIAL_FILTERS);
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Loading/error are reset in the event handler, not in the effect,
  // so the effect only calls setState from async callbacks.
  const handleApply = (next: DashboardFilters) => {
    setLoading(true);
    setError(null);
    setFilters(next);
  };

  useEffect(() => {
    const controller = new AbortController();

    fetchDashboardOverview(filters, controller.signal)
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [filters]);

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardOverviewHeader
          initialThisMonth={INITIAL_FILTERS.thisMonth}
          initialLastMonth={INITIAL_FILTERS.lastMonth}
          osaTotalTM={data?.osaTotalTM ?? 0}
          osaTotalLM={data?.osaTotalLM ?? 0}
          onApply={handleApply}
        />

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            Gagal memuat data: {error}
          </p>
        )}

        <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
          <BalanceAgingCards metrics={data?.metrics ?? []} />
        </div>
      </div>
    </main>
  );
}