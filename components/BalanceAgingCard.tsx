import { Calendar, Flag, LucideIcon } from "lucide-react";

export interface BalanceMetric {
  key: string;
  title: string;
  icon: "calendar" | "flag";
  /** Tailwind color name driving the icon badge, title, and accents: green | orange | purple | blue */
  color: "green" | "orange" | "purple" | "blue";
  amountTM: number;
  amountLM: number;
  pctToOsaTM: number;
  pctToOsaLM: number;
}

export interface BalanceAgingCardsProps {
  metrics: BalanceMetric[];
}

const ICONS: Record<BalanceMetric["icon"], LucideIcon> = {
  calendar: Calendar,
  flag: Flag,
};

const COLOR_STYLES: Record<
  BalanceMetric["color"],
  { badge: string; icon: string; title: string }
> = {
  green: { badge: "bg-emerald-50", icon: "text-emerald-600", title: "text-emerald-600" },
  orange: { badge: "bg-orange-50", icon: "text-orange-500", title: "text-orange-500" },
  purple: { badge: "bg-violet-50", icon: "text-violet-600", title: "text-violet-600" },
  blue: { badge: "bg-blue-50", icon: "text-blue-600", title: "text-blue-600" },
};

function formatRupiah(value: number) {
  return `Rp${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 }).format(
    Math.abs(value)
  )}`;
}

function formatPct(value: number) {
  return `${value.toFixed(2)}%`;
}

function MetricCard({ metric }: { metric: BalanceMetric }) {
  const Icon = ICONS[metric.icon];
  const styles = COLOR_STYLES[metric.color];

  const amountDiff = metric.amountTM - metric.amountLM;
  const pctPointDiff = metric.pctToOsaTM - metric.pctToOsaLM;
  // Growth of the diff relative to last month's amount (e.g. "15.43%" under the diff amount).
  const growthPct = metric.amountLM !== 0 ? (amountDiff / metric.amountLM) * 100 : 0;
  const isIncrease = amountDiff >= 0;

  return (
    <div className="flex flex-col rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={`flex h-9 w-9 items-center justify-center rounded-full ${styles.badge}`}>
          <Icon className={`h-4.5 w-4.5 ${styles.icon}`} />
        </span>
        <h3 className={`text-sm font-bold tracking-wide ${styles.title}`}>{metric.title}</h3>
      </div>

      <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-2 text-sm">

        <span />
        <span className="text-xs font-medium text-slate-400">AMOUNT (Rp)</span>
        <span className="text-xs font-medium text-slate-400">% to OSA</span>
 
        <div className="col-span-3 h-px bg-slate-100" />
        
        <span className="font-medium text-slate-800">TM</span>
        <span className="font-semibold text-slate-900">{formatRupiah(metric.amountTM)}</span>
        <span className="text-slate-400">{formatPct(metric.pctToOsaTM)}</span>

        <span className="text-slate-400">LM</span>
        <span className="text-slate-400">{formatRupiah(metric.amountLM)}</span>
        <span className="text-slate-400">{formatPct(metric.pctToOsaLM)}</span>
      </div>

      <div className="my-4 h-px bg-slate-100" />

      <div className="flex items-start justify-between text-sm">
        <span className="font-medium text-slate-500">DIFF</span>
        <div className="text-right">
          <p
            className={`flex items-center justify-end gap-1 font-bold ${
              isIncrease ? "text-red-600" : "text-emerald-600"
            }`}
          >
            {formatRupiah(amountDiff)}
            <span>{isIncrease ? "↑" : "↓"}</span>
          </p>
          <p className={`text-xs font-medium ${isIncrease ? "text-red-500" : "text-emerald-500"}`}>
            {formatPct(Math.abs(growthPct))}
          </p>
        </div>
        <p
          className={`flex items-center gap-1 font-semibold ${
            pctPointDiff >= 0 ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {pctPointDiff >= 0 ? "+" : ""}
          {formatPct(pctPointDiff)}
          <span>{pctPointDiff >= 0 ? "↑" : "↓"}</span>
        </p>
      </div>

      <div
        className={`mt-4 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold ${
          isIncrease ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
        }`}
      >
        <span>{isIncrease ? "↑" : "↓"}</span>
        vs Last Month (LM)
      </div>
    </div>
  );
}

export default function BalanceAgingCards({ metrics }: BalanceAgingCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <MetricCard key={metric.key} metric={metric} />
      ))}
    </div>
  );
}