"use client";

import DashboardOverviewHeader from "../../components/DashboardOverviewHeader";
import BalanceAgingCards, { BalanceMetric } from "../../components/BalanceAgingCard";

const sampleMetrics: BalanceMetric[] = [
  {
    key: "balance-60",
    title: "BALANCE > 60",
    icon: "calendar",
    color: "green",
    amountTM: 20_362_265_430,
    amountLM: 17_641_705_930,
    pctToOsaTM: 1.94,
    pctToOsaLM: 1.68,
  },
  {
    key: "balance-90",
    title: "BALANCE > 90",
    icon: "calendar",
    color: "orange",
    amountTM: 7_560_463_880,
    amountLM: 6_079_174_050,
    pctToOsaTM: 0.72,
    pctToOsaLM: 0.58,
  },
  {
    key: "balance-120",
    title: "BALANCE > 120",
    icon: "calendar",
    color: "purple",
    amountTM: 3_896_336_590,
    amountLM: 3_060_405_530,
    pctToOsaTM: 0.37,
    pctToOsaLM: 0.29,
  },
  {
    key: "powo",
    title: "POWO",
    icon: "flag",
    color: "blue",
    amountTM: 16_595_841_100,
    amountLM: 13_899_632_520,
    pctToOsaTM: 1.58,
    pctToOsaLM: 1.32,
  },
];

export default function DashboardExamplePage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <DashboardOverviewHeader
          osaTotalTM={1_050_030_244_210}
          osaTotalLM={1_051_943_186_960}
          onApply={(filters) => console.log("Apply filters:", filters)}
        />
        <BalanceAgingCards metrics={sampleMetrics} />
      </div>
    </main>
  );
}