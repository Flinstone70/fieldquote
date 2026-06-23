"use client";

import { useState } from "react";
import { ui } from "@/lib/ui";

const items = [
  {
    q: "Who is FieldQuote for?",
    a: "FieldQuote is built for trades and field service businesses — plumbers, electricians, cleaners, landscapers, and any team that sends quotes and collects deposits before starting work.",
  },
  {
    q: "How do clients pay the deposit?",
    a: "You send a single secure link. Your client reviews the quote, accepts it, and pays the deposit by card through Stripe. No PDFs, no chasing bank details.",
  },
  {
    q: "Do I need Stripe to get started?",
    a: "You can create and send quotes immediately. Connect Stripe when you're ready to collect real card payments — setup takes a few minutes.",
  },
  {
    q: "Will this look professional to my clients?",
    a: "Yes. Client quote pages are designed to feel like a premium proposal — clean layout, clear pricing, and a simple accept-and-pay flow that builds trust.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Absolutely. FieldQuote is monthly with no long-term contracts. Cancel whenever you want — your data stays yours.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-neutral-200 rounded-2xl border border-neutral-200 bg-white">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : index)}
              className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left transition hover:bg-neutral-50"
            >
              <span className="text-sm font-medium text-neutral-950 sm:text-base">
                {item.q}
              </span>
              <span
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-xs text-neutral-500 transition ${isOpen ? "rotate-45 border-neutral-950 bg-neutral-950 text-white" : ""}`}
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-all duration-300 ease-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
            >
              <div className="overflow-hidden">
                <p className={`px-6 pb-5 text-sm leading-relaxed text-neutral-500 ${ui.subtext}`}>
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
