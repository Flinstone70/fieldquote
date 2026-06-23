import type { QuoteStatus } from "@/lib/types";

const steps: { key: QuoteStatus; label: string; hint: string }[] = [
  {
    key: "sent",
    label: "Waiting for client",
    hint: "Quote sent — client has not responded yet",
  },
  {
    key: "accepted",
    label: "Payment pending",
    hint: "Client accepted — deposit not completed",
  },
  {
    key: "deposit_paid",
    label: "Deposit paid",
    hint: "Booking secured — ready to schedule work",
  },
];

function stepIndex(status: QuoteStatus): number {
  if (status === "declined") return -1;
  if (status === "deposit_paid") return 2;
  if (status === "accepted") return 1;
  return 0;
}

export function QuoteStatusTimeline({ status }: { status: QuoteStatus }) {
  if (status === "declined") {
    return (
      <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 transition-all duration-300">
        <p className="text-sm font-medium text-neutral-950">Declined by client</p>
        <p className="mt-1 text-sm text-neutral-500">
          The client chose not to proceed with this quote.
        </p>
      </div>
    );
  }

  const active = stepIndex(status);

  return (
    <ol className="grid gap-3 sm:grid-cols-3">
      {steps.map((step, index) => {
        const done = index < active;
        const current = index === active;
        return (
          <li
            key={step.key}
            className={`rounded-2xl border px-4 py-4 transition-all duration-300 ease-out ${
              current
                ? "border-neutral-950 bg-neutral-950 text-white shadow-md shadow-neutral-950/10"
                : done
                  ? "border-neutral-300 bg-white"
                  : "border-neutral-200 bg-neutral-50/50 text-neutral-400"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors duration-300 ${
                  current
                    ? "bg-white text-neutral-950"
                    : done
                      ? "bg-neutral-950 text-white"
                      : "bg-neutral-200 text-neutral-500"
                }`}
              >
                {done ? "✓" : index + 1}
              </span>
              <p
                className={`text-sm font-medium ${
                  current ? "text-white" : done ? "text-neutral-950" : ""
                }`}
              >
                {step.label}
              </p>
            </div>
            <p
              className={`mt-2 text-xs leading-relaxed ${
                current ? "text-neutral-400" : "text-neutral-500"
              }`}
            >
              {step.hint}
            </p>
          </li>
        );
      })}
    </ol>
  );
}
