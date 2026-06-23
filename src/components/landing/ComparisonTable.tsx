import { ui } from "@/lib/ui";

const rows = [
  {
    feature: "Professional client presentation",
    fieldquote: true,
    pdf: false,
    email: false,
  },
  {
    feature: "One-click client approval",
    fieldquote: true,
    pdf: false,
    email: false,
  },
  {
    feature: "Card deposit collection",
    fieldquote: true,
    pdf: false,
    email: false,
  },
  {
    feature: "Live payment status",
    fieldquote: true,
    pdf: false,
    email: false,
  },
  {
    feature: "Mobile-friendly for clients",
    fieldquote: true,
    pdf: "partial",
    email: true,
  },
  {
    feature: "Pipeline dashboard",
    fieldquote: true,
    pdf: false,
    email: false,
  },
];

function Cell({ value }: { value: boolean | "partial" | string }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-neutral-950 text-[10px] text-white">
        ✓
      </span>
    );
  }
  if (value === "partial") {
    return <span className="text-xs text-neutral-400">Partial</span>;
  }
  if (value === false) {
    return <span className="text-neutral-300">—</span>;
  }
  return <span className="text-xs text-neutral-500">{value}</span>;
}

export function ComparisonTable() {
  return (
    <div className={`${ui.card} overflow-hidden`}>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50 text-xs font-medium uppercase tracking-wider text-neutral-400">
              <th className="px-6 py-4">Capability</th>
              <th className="px-6 py-4">FieldQuote</th>
              <th className="px-6 py-4">PDF quotes</th>
              <th className="px-6 py-4">Email / WhatsApp</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.feature} className="border-b border-neutral-50">
                <td className="px-6 py-4 font-medium text-neutral-950">
                  {row.feature}
                </td>
                <td className="px-6 py-4">
                  <Cell value={row.fieldquote} />
                </td>
                <td className="px-6 py-4">
                  <Cell value={row.pdf} />
                </td>
                <td className="px-6 py-4">
                  <Cell value={row.email} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
