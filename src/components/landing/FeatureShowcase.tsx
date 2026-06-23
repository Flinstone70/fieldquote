"use client";

import { useState } from "react";
import { ui } from "@/lib/ui";

const tabs = [
  {
    id: "quotes",
    label: "Quotes",
    title: "Send proposals that win trust",
    body: "Build itemised quotes with your branding, scope of work, and deposit terms. Clients see a polished page — not a messy PDF in their inbox.",
    points: ["Line-item breakdown", "Custom deposit %", "Mobile-friendly client view"],
  },
  {
    id: "approval",
    label: "Approval",
    title: "One link. One decision.",
    body: "Stop chasing replies. Clients review, accept, and confirm in a single flow — so you know exactly who's booked before you pick up tools.",
    points: ["Accept online", "Clear status tracking", "Instant notifications"],
  },
  {
    id: "payments",
    label: "Deposits",
    title: "Get paid before you start",
    body: "Collect card deposits through Stripe the moment a job is accepted. Less no-shows, fewer cancelled jobs, more cash in the bank.",
    points: ["Stripe checkout", "Secure payments", "Deposit confirmation"],
  },
  {
    id: "dashboard",
    label: "Dashboard",
    title: "Everything in one place",
    body: "See every quote, client, and payment status at a glance. Know what's pending, what's paid, and what needs a follow-up.",
    points: ["Pipeline overview", "Client links", "Status at a glance"],
  },
];

export function FeatureShowcase() {
  const [active, setActive] = useState(tabs[0].id);
  const current = tabs.find((tab) => tab.id === active) ?? tabs[0];

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                active === tab.id
                  ? "bg-neutral-950 text-white"
                  : "border border-neutral-200 text-neutral-600 hover:border-neutral-950 hover:text-neutral-950"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-8 animate-fade-in" key={current.id}>
          <h3 className="text-2xl font-semibold tracking-tight text-neutral-950">
            {current.title}
          </h3>
          <p className="mt-4 text-neutral-500 leading-relaxed">{current.body}</p>
          <ul className="mt-6 space-y-3">
            {current.points.map((point) => (
              <li
                key={point}
                className="flex items-center gap-3 text-sm text-neutral-700"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950 text-[10px] text-white">
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`${ui.card} overflow-hidden p-1`}>
        <div className="rounded-[14px] bg-neutral-50 p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-neutral-200 pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-neutral-400">
                Preview
              </p>
              <p className="mt-1 font-medium text-neutral-950">{current.title}</p>
            </div>
            <span className="rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
              Live
            </span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 transition hover:border-neutral-300"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-neutral-950" />
                  <span className="text-sm text-neutral-700">
                    {current.points[row - 1] ?? "Feature highlight"}
                  </span>
                </div>
                <span className="text-xs text-neutral-400">Ready</span>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-xl bg-neutral-950 p-4 text-white">
            <p className="text-xs text-neutral-400">Typical deposit collected</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">£425.00</p>
          </div>
        </div>
      </div>
    </div>
  );
}
