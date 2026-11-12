import { fetchClient } from "./FetchClient";

export type BucketKey = "B1" | "B2" | "B3" | "POWO";

export interface YearMonth {
  year: number;
  month: number;
}

/** Fields ending in 1 belong to the first selected month, fields ending in 2 to the second. */
export interface TrendPoint {
  day: number;
  am1: number | null;
  am2: number | null;
  /** am(day + 1) - am(day), as stored by the backend */
  pen1: number | null;
  pen2: number | null;
  /** percent of OSA, e.g. 1.28 */
  bal1: number | null;
  bal2: number | null;
}

export interface AgingTrend {
  months: [YearMonth, YearMonth];
  buckets: { key: BucketKey; threshold: number; series: TrendPoint[] }[];
}

export const fetchAgingTrend = (
  m1: string,
  m2: string,
  signal?: AbortSignal,
  token?: string,
): Promise<AgingTrend> => {
  const qs = new URLSearchParams({ m1, m2 });
  return fetchClient(`/aging/trend?${qs}`, { method: "GET", signal, headers: token ? { "Authorization": `Bearer ${token}` } : undefined });
};