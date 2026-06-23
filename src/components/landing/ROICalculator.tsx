"use client";

import { useMemo, useState } from "react";
import { formatGBP } from "@/lib/format";
import { ui } from "@/lib/ui";

export function ROICalculator() {
  const [jobsPerMonth, setJobsPerMonth] = useState(8);
  const [avgJobValue, setAvgJobValue] = useState(1200);
  const [depositPercent, setDepositPercent] = useState(25);
  const [noShowRate, setNoShowRate] = useState(15);

  const results = useMemo(() => {
    const monthlyQuoted = jobsPerMonth * avgJobValue;
    const depositPerJob = avgJobValue * (depositPercent / 100);
    const lostToNoShows = jobsPerMonth * (noShowRate / 100) * depositPerJob;
    const recoveredWithDeposits = lostToNoShows * 0.7;
    const subscriptionCost = 79;
    const netBenefit = recoveredWithDeposits - subscriptionCost;

    return {
      monthlyQuoted,
      depositPerJob,
      recoveredWithDeposits,
      netBenefit,
    };
  }, [jobsPerMonth, avgJobValue, depositPercent, noShowRate]);

  return (
    <div className={`${ui.card} grid gap-10 p-8 lg:grid-cols-2 lg:p-10`}>
      <div>
        <p className={ui.sectionLabel}>ROI calculator</p>
        <h3 className="text-2xl font-semibold tracking-tight">
          See what one secured deposit is worth
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-neutral-500">
          Adjust the numbers to match your business. Most operators recover the
          subscription cost from a single avoided no-show.
        </p>

        <div className="mt-8 space-y-6">
          {[
            {
              label: "Quotes sent per month",
              value: jobsPerMonth,
              min: 1,
              max: 40,
              step: 1,
              set: setJobsPerMonth,
            },
            {
              label: "Average job value (£)",
              value: avgJobValue,
              min: 200,
              max: 10000,
              step: 50,
              set: setAvgJobValue,
            },
            {
              label: "Deposit required (%)",
              value: depositPercent,
              min: 10,
              max: 50,
              step: 5,
              set: setDepositPercent,
            },
            {
              label: "Jobs lost to no-shows (%)",
              value: noShowRate,
              min: 0,
              max: 40,
              step: 5,
              set: setNoShowRate,
            },
          ].map((field) => (
            <label key={field.label} className="block">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-neutral-600">{field.label}</span>
                <span className="font-medium tabular-nums text-neutral-950">
                  {field.label.includes("£") ? `£${field.value}` : field.value}
                  {field.label.includes("%") ? "%" : ""}
                </span>
              </div>
              <input
                type="range"
                min={field.min}
                max={field.max}
                step={field.step}
                value={field.value}
                onChange={(e) => field.set(Number(e.target.value))}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-neutral-950"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-between rounded-2xl bg-neutral-950 p-8 text-white">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
            Your estimate
          </p>
          <div className="mt-8 space-y-5">
            <div>
              <p className="text-sm text-neutral-400">Monthly quote volume</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {formatGBP(Math.round(results.monthlyQuoted * 100))}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-400">Typical deposit per job</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {formatGBP(Math.round(results.depositPerJob * 100))}
              </p>
            </div>
            <div className="border-t border-neutral-800 pt-5">
              <p className="text-sm text-neutral-400">
                Estimated monthly value from fewer no-shows
              </p>
              <p className="mt-1 text-3xl font-semibold tabular-nums tracking-tight">
                {formatGBP(Math.round(results.recoveredWithDeposits * 100))}
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <p className="text-sm text-neutral-300">
            Net after Professional plan (£79/mo):
          </p>
          <p
            className={`mt-1 text-xl font-semibold tabular-nums ${results.netBenefit >= 0 ? "text-white" : "text-neutral-400"}`}
          >
            {results.netBenefit >= 0 ? "+" : ""}
            {formatGBP(Math.round(results.netBenefit * 100))} / month
          </p>
        </div>
      </div>
    </div>
  );
}
