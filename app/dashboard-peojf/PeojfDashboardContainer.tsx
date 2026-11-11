"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchClient } from "../../services/FetchClient";
import PeojfDashboard, { PeojfDashboardProps } from "../../components/PeojfDashboard";

type Filters = { period?: string; area?: string; peojf?: string };

export default function PeojfDashboardContainer() {
  const [data, setData] = useState<PeojfDashboardProps | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const reqId = useRef(0); // ignore stale responses

  const load = useCallback(async (f: Filters = {}) => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams(
        Object.entries(f).filter(([, v]) => v) as [string, string][]
      ).toString();

      const body = await fetchClient(`/dashboard/peojf${qs ? `?${qs}` : ""}`);

      if (id === reqId.current) setData(body);
    } catch (e) {
      if (id === reqId.current) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!data && loading) {
    return <p className="p-6 text-sm text-slate-500">Loading…</p>;
  }
  if (!data && error) {
    return (
      <div className="p-6 text-sm text-red-600">
        {error}{" "}
        <button className="underline" onClick={() => load()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={loading ? "opacity-60 transition-opacity" : ""}>
      {error && <p className="px-6 pt-2 text-sm text-red-600">{error}</p>}
      <PeojfDashboard {...data!} onFilterChange={load} />
    </div>
  );
}