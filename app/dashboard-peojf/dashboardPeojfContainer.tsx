"use client";
import { useEffect, useState } from "react";
import PeojfDashboard, { PeojfDashboardProps } from "../../components/PeojfDashboard";

export default function PeojfDashboardContainer() {
  const [data, setData] = useState<PeojfDashboardProps | null>(null);

  const load = async (f?: { period?: string; area?: string; peojf?: string }) => {
    const qs = new URLSearchParams(
      Object.entries(f ?? {}).filter(([, v]) => v) as [string, string][]
    );
    const res = await fetch(`/api/sk/dashboard?${qs}`);
    setData(await res.json());
  };

  useEffect(() => { load(); }, []);

  // if (!data) return <p className="p-6 text-sm text-slate-500">Loading…</p>;
  return <PeojfDashboard {...data} onFilterChange={load} />;
}