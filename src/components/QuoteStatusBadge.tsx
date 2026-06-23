import type { QuoteStatus } from "@/lib/types";

const styles: Record<QuoteStatus, string> = {
  draft: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  sent: "bg-neutral-950 text-white ring-neutral-950",
  accepted: "bg-neutral-100 text-neutral-950 ring-neutral-300",
  deposit_paid: "bg-neutral-950 text-white ring-neutral-950",
  declined: "bg-neutral-100 text-neutral-500 ring-neutral-200 line-through",
};

const labels: Record<QuoteStatus, string> = {
  draft: "Draft",
  sent: "Waiting for client",
  accepted: "Payment pending",
  deposit_paid: "Deposit paid",
  declined: "Declined",
};

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
