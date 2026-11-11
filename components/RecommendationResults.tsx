import type { GroupResult } from "../services/recommendation";

const FEW_CASES = 30; // below this many past cases a score is shaky

const pct = (p: number) => `${(p * 100).toFixed(1)}%`;

export default function RecommendationResults({ title, group }: { title: string; group: GroupResult }) {
  return (
    <section
      aria-label={title}
      className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60"
    >
      <h2 className="mb-3 text-base font-semibold">{title}</h2>

      {!group.available ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          This model is not available right now.{group.reason ? ` (${group.reason})` : ""}
        </p>
      ) : group.items.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No PEOJF has enough past cases to recommend.</p>
      ) : (
        <ol className="grid gap-3.5">
          {group.items.map((it) => (
            <li key={it.peojf} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 flex-none place-items-center rounded-full bg-blue-600 text-xs font-bold text-white">
                {it.rank}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2">
                  <strong className="truncate">{it.peojf}</strong>
                  <span className="font-semibold tabular-nums">{pct(it.probability)}</span>
                </div>
                <div
                  role="img"
                  aria-label={`Estimated chance ${pct(it.probability)}`}
                  className="my-1.5 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
                >
                  <div className="h-full bg-blue-600" style={{ width: `${Math.min(100, it.probability * 100)}%` }} />
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {it.nCases} past cases
                  {it.overallRate !== null && ` · overall rate ${pct(it.overallRate)}`}
                  {it.nCases < FEW_CASES && (
                    <span className="text-amber-700 dark:text-amber-400"> · few cases, less reliable</span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}