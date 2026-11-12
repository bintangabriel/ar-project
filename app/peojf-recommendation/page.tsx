"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import RecommendationResults from "../../components/RecommendationResults";
import {
  CustomerForm, FormOptions, RecommendationResponse, getFormOptions, getRecommendation,
} from "../../services/recommendation";
import { useUserData } from '../../redux/store';

// All visible text in one place, change freely.
const TEXT = {
  title: "PEOJF recommendation",
  intro: "Describe the customer. You get the PEOJF with the best estimated chance for each group.",
  submit: "Get recommendation",
  loading: "Calculating…",
  payTitle: "Payment",
  crTitle: "CR (repossession)",
  note: "Chances are estimated from past cases. The order of PEOJF is a guide, not a guarantee.",
};

const EMPTY: CustomerForm = {
  pekerjaan: "", sumberDana: "", rincianSumberDana: "", ansusDetail: "",
  keberadaanDebitur: "", keberadaanUnit: "", kategoriKasus: "",
};

type SelectKey = keyof FormOptions;
const SELECTS: { key: SelectKey; label: string }[] = [
  { key: "pekerjaan", label: "PEKERJAAN" },
  { key: "sumberDana", label: "SUMBER DANA" },
  { key: "keberadaanDebitur", label: "KEBERADAAN DEBITUR" },
  { key: "keberadaanUnit", label: "KEBERADAAN UNIT" },
  { key: "kategoriKasus", label: "KATEGORI KASUS" },
];

export default function RecommendationPage() {
  const [form, setForm] = useState<CustomerForm>(EMPTY);
  const [options, setOptions] = useState<FormOptions | null>(null);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latest = useRef(0); // ignore answers of outdated requests

  const user = useUserData();

  const token = user?.jwt.token;

  useEffect(() => {
    if (token) {
      getFormOptions(token).then(setOptions).catch((e: Error) => setError(e.message));
    }
  }, [token]);

  const set = (key: keyof CustomerForm) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const canSubmit = SELECTS.every(({ key }) => form[key]) && !loading;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const id = ++latest.current;
    setLoading(true); setError(null);
    try {
      if (!token) throw new Error("Not logged in");
      const res = await getRecommendation(form, token);
      if (id === latest.current) setResult(res);
    } catch (err) {
      if (id === latest.current) { setResult(null); setError((err as Error).message); }
    } finally {
      if (id === latest.current) setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-sm font-normal text-slate-900 " +
    "focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60 " +
    "dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";
  const labelCls = "flex flex-col gap-1.5 text-[13px] font-semibold";

  return (
    <main className="px-4 pb-16 pt-6">
      <div className="mx-auto max-w-4xl mt-10">
        <h1 className="text-2xl font-bold">{TEXT.title}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{TEXT.intro}</p>

        <form className="mb-2 mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" onSubmit={onSubmit}>
          {SELECTS.map(({ key, label }) => (
            <label key={key} className={labelCls}>
              <span>{label}</span>
              <select className={inputCls} value={form[key]} onChange={set(key)} disabled={!options} required>
                <option value="">Select…</option>
                {options?.[key].map((v) => <option key={v} value={v}>{v.toUpperCase()}</option>)}
              </select>
            </label>
          ))}

          <label className={labelCls}>
            <span>RINCIAN SUMBER DANA</span>
            <input className={inputCls} value={form.rincianSumberDana} onChange={set("rincianSumberDana")} maxLength={300} />
          </label>

          <label className={`${labelCls} sm:col-span-2 lg:col-span-3`}>
            <span>ANSUS DETAIL (notes about the customer)</span>
            <textarea className={inputCls} value={form.ansusDetail} onChange={set("ansusDetail")} rows={4} maxLength={2000} />
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="justify-self-start rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2 lg:col-span-3"
          >
            {loading ? TEXT.loading : TEXT.submit}
          </button>
        </form>

        {error && <p role="alert" className="my-3 text-sm text-red-700 dark:text-red-400">{error}</p>}

        {result && (
          <>
            <div className="mb-3 mt-6 grid gap-4 md:grid-cols-2">
              <RecommendationResults title={TEXT.payTitle} group={result.data.pay} />
              <RecommendationResults title={TEXT.crTitle} group={result.data.cr} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{TEXT.note}</p>
          </>
        )}
      </div>
    </main>
  );
}