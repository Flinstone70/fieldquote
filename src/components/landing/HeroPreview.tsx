import { ui } from "@/lib/ui";

export function HeroPreview() {
  return (
    <div className={`${ui.card} relative overflow-hidden p-1 animate-fade-up animate-delay-200`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(0,0,0,0.05),transparent_45%)]" />
      <div className="relative rounded-[14px] bg-neutral-50 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-neutral-300" />
          <span className="h-2 w-2 rounded-full bg-neutral-300" />
          <span className="h-2 w-2 rounded-full bg-neutral-300" />
          <span className="ml-auto text-[10px] text-neutral-400">fieldquote.app/demo</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
              Client quote · FQ-DEMO
            </p>
            <p className="mt-1 text-lg font-semibold tracking-tight">
              Consumer unit upgrade
            </p>
          </div>
          <span className="rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
            Awaiting approval
          </span>
        </div>

        <div className="mt-5 space-y-2">
          {[
            { label: "Labour & installation", amount: "£650.00" },
            { label: "Materials — board & breakers", amount: "£285.00" },
            { label: "Testing & certification", amount: "£120.00" },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm transition hover:border-neutral-300"
            >
              <span className="text-neutral-600">{row.label}</span>
              <span className="font-medium tabular-nums text-neutral-950">
                {row.amount}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-end justify-between border-t border-neutral-200 pt-4">
          <div>
            <p className="text-xs text-neutral-400">Deposit due (30%)</p>
            <p className="text-2xl font-semibold tracking-tight tabular-nums">
              £316.50
            </p>
          </div>
          <div className="rounded-full bg-neutral-950 px-5 py-2.5 text-xs font-medium text-white shadow-lg shadow-neutral-950/20">
            Accept & pay
          </div>
        </div>
      </div>
    </div>
  );
}
