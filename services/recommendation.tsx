// ADJUST this import to wherever your fetchClient lives (it is reused as-is, not modified).
  import { fetchClient } from "../services/FetchClient";

export type CustomerForm = {
  pekerjaan: string;
  sumberDana: string;
  rincianSumberDana: string;
  ansusDetail: string;
  keberadaanDebitur: string;
  keberadaanUnit: string;
  kategoriKasus: string;
};

export type RecommendationItem = {
  rank: number;
  peojf: string;
  probability: number;          // 0..1
  nCases: number;               // past cases behind this score; small = less reliable
  overallRate: number | null;   // this PEOJF's overall success rate in the training data
};

export type GroupResult = {
  available: boolean;           // false when that model is not installed / failed
  label: string;
  reason?: string;
  items: RecommendationItem[];
};

export type RecommendationResponse = {
  data: { pay: GroupResult; cr: GroupResult };
  meta: { topN: number; minCases: number };
};

export type FormOptions = {
  pekerjaan: string[];
  sumberDana: string[];
  keberadaanDebitur: string[];
  keberadaanUnit: string[];
  kategoriKasus: string[];
};

export const getRecommendation = (form: CustomerForm, token: string,topN = 5): Promise<RecommendationResponse> =>
  fetchClient("/recommendation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...form, topN }),
  });

export const getFormOptions = async (token: string): Promise<FormOptions> =>
  (await fetchClient("/recommendation/options", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })).data;
