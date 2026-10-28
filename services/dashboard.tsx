import { fetchClient } from "./FetchClient";
import type { BalanceMetric } from "../components/BalanceAgingCard";

export interface DashboardOverview {
  osaTotalTM: number;
  osaTotalLM: number;
  metrics: BalanceMetric[];
}

export interface DashboardFilters {
  thisMonth: string; // yyyy-mm-dd
  lastMonth: string; // yyyy-mm-dd
  cabang: string;
}

export const fetchDashboardOverview = (
  filters: DashboardFilters,
  signal?: AbortSignal,
): Promise<DashboardOverview> => {
  const qs = new URLSearchParams({
    tm: filters.thisMonth,
    lm: filters.lastMonth,
    cabang: filters.cabang,
  });

  // fetchClient prepends API_CONFIG.BASE_URL, adds the headers, and handles
  // the 401 -> logout flow. `signal` passes straight through to fetch.
  return fetchClient(`/dashboard/overview?${qs}`, {
    method: "GET",
    signal,
  });
};