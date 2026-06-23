import Link from "next/link";
import { ui } from "@/lib/ui";

export function GettingStarted() {
  const steps = [
    {
      title: "Verify your work email",
      href: "/verify-email",
    },
    {
      title: "Create your first client quote",
      href: "/dashboard/new",
    },
    {
      title: "Set up PayPal billing (after trial)",
      href: "/dashboard/billing",
    },
  ];

  return (
    <div className={`${ui.card} mb-10 overflow-hidden`}>
      <div className="border-b border-neutral-100 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
          Getting started
        </p>
        <h2 className="mt-1 text-lg font-semibold tracking-tight">
          Launch your company account
        </h2>
      </div>
      <div className="divide-y divide-neutral-100">
        {steps.map((step, index) => (
          <Link
            key={step.title}
            href={step.href}
            className="flex items-center gap-4 px-6 py-4 transition hover:bg-neutral-50"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-neutral-200 text-xs font-semibold text-neutral-500">
              {index + 1}
            </span>
            <span className="flex-1 text-sm font-medium text-neutral-800">
              {step.title}
            </span>
            <span className="text-sm text-neutral-400">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
