"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { depositPence, formatGBP, quoteTotalPence } from "@/lib/format";
import { ui } from "@/lib/ui";

type LineItemDraft = {
  description: string;
  quantity: string;
  unitPrice: string;
};

const emptyItem = (): LineItemDraft => ({
  description: "",
  quantity: "1",
  unitPrice: "",
});

const sections = [
  { id: "business", title: "Your business", step: 1 },
  { id: "client", title: "Client details", step: 2 },
  { id: "job", title: "Job & deposit", step: 3 },
  { id: "items", title: "Line items", step: 4 },
];

export function QuoteForm({
  defaultBusinessName = "",
  defaultBusinessEmail = "",
}: {
  defaultBusinessName?: string;
  defaultBusinessEmail?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState(0);
  const [businessName, setBusinessName] = useState(defaultBusinessName);
  const [businessEmail, setBusinessEmail] = useState(defaultBusinessEmail);
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [depositPercent, setDepositPercent] = useState("25");
  const [sendToClient, setSendToClient] = useState(true);
  const [lineItems, setLineItems] = useState<LineItemDraft[]>([emptyItem()]);

  const previewItems = useMemo(
    () =>
      lineItems
        .filter((item) => item.description || item.unitPrice)
        .map((item) => ({
          description: item.description || "Untitled item",
          quantity: Number(item.quantity) || 0,
          unitPricePence: Math.round((Number(item.unitPrice) || 0) * 100),
        })),
    [lineItems],
  );

  const totalPence = quoteTotalPence(previewItems);
  const deposit = depositPence(totalPence, Number(depositPercent) || 0);

  function updateItem(index: number, field: keyof LineItemDraft, value: string) {
    setLineItems((items) =>
      items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName,
          businessEmail,
          clientName,
          clientEmail,
          jobTitle,
          jobDescription,
          depositPercent: Number(depositPercent),
          lineItems: lineItems.map((item) => ({
            description: item.description,
            quantity: Number(item.quantity),
            unitPricePence: Math.round(Number(item.unitPrice) * 100),
          })),
          sendToClient,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to create quote");
      }

      const params = new URLSearchParams({ created: "1" });
      if (sendToClient && data.emailed) params.set("emailed", "1");
      router.push(`/dashboard/quotes/${data.quote.id}?${params.toString()}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-wrap gap-2">
          {sections.map((section, index) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(index)}
              className={`rounded-full px-4 py-2 text-xs font-medium uppercase tracking-wider transition-all duration-200 ease-out ${
                activeSection === index
                  ? "bg-neutral-950 text-white"
                  : "border border-neutral-200 text-neutral-500 hover:border-neutral-950 hover:text-neutral-950"
              }`}
            >
              {section.step}. {section.title}
            </button>
          ))}
        </div>

        <section className={`${ui.cardFlat} p-6 sm:p-8`}>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
              1
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Your business</h2>
              <p className="text-sm text-neutral-500">
                Shown on the client quote page header.
              </p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className={ui.label}>Business name</span>
              <input
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className={ui.input}
                placeholder="Smith Plumbing Ltd"
              />
            </label>
            <label className="block">
              <span className={ui.label}>Your email</span>
              <input
                required
                type="email"
                value={businessEmail}
                onChange={(e) => setBusinessEmail(e.target.value)}
                className={ui.input}
                placeholder="you@business.co.uk"
              />
            </label>
          </div>
        </section>

        <section className={`${ui.cardFlat} p-6 sm:p-8`}>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
              2
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Client details</h2>
              <p className="text-sm text-neutral-500">
                Who will receive and approve this quote.
              </p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className={ui.label}>Client name</span>
              <input
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className={ui.input}
                placeholder="Jane Cooper"
              />
            </label>
            <label className="block">
              <span className={ui.label}>Client email</span>
              <input
                required
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className={ui.input}
                placeholder="jane@email.com"
              />
            </label>
          </div>
        </section>

        <section className={`${ui.cardFlat} p-6 sm:p-8`}>
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
              3
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Job & deposit</h2>
              <p className="text-sm text-neutral-500">
                Describe the work and set your deposit percentage.
              </p>
            </div>
          </div>
          <div className="space-y-5">
            <label className="block">
              <span className={ui.label}>Job title</span>
              <input
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className={ui.input}
                placeholder="Boiler replacement"
              />
            </label>
            <label className="block">
              <span className={ui.label}>Scope of work</span>
              <textarea
                rows={4}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className={ui.input}
                placeholder="Materials, timeline, access notes, warranty..."
              />
            </label>
            <label className="block max-w-xs">
              <span className={ui.label}>Deposit (%)</span>
              <input
                required
                type="number"
                min="0"
                max="100"
                value={depositPercent}
                onChange={(e) => setDepositPercent(e.target.value)}
                className={ui.input}
              />
            </label>
          </div>
        </section>

        <section className={`${ui.cardFlat} p-6 sm:p-8`}>
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                4
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-tight">Line items</h2>
                <p className="text-sm text-neutral-500">
                  Itemised pricing your client will review.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLineItems((items) => [...items, emptyItem()])}
              className={ui.btnGhost}
            >
              + Add row
            </button>
          </div>
          <div className="space-y-3">
            <div className="hidden grid-cols-12 gap-3 px-1 text-xs font-medium uppercase tracking-wider text-neutral-400 md:grid">
              <span className="col-span-6">Description</span>
              <span className="col-span-2">Qty</span>
              <span className="col-span-3">Unit price</span>
              <span className="col-span-1" />
            </div>
            {lineItems.map((item, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-3 md:grid-cols-12 md:border-0 md:bg-transparent md:p-0"
              >
                <input
                  required
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  className={`md:col-span-6 ${ui.input}`}
                  placeholder="Description"
                />
                <input
                  required
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  className={`md:col-span-2 ${ui.input}`}
                  placeholder="Qty"
                />
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(index, "unitPrice", e.target.value)}
                  className={`md:col-span-3 ${ui.input}`}
                  placeholder="£0.00"
                />
                {lineItems.length > 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setLineItems((items) => items.filter((_, i) => i !== index))
                    }
                    className="md:col-span-1 text-xs font-medium text-neutral-400 transition hover:text-neutral-950"
                  >
                    Remove
                  </button>
                ) : (
                  <div className="hidden md:block md:col-span-1" />
                )}
              </div>
            ))}
          </div>
        </section>

        {error ? (
          <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
            {error}
          </p>
        ) : null}

        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-neutral-200 bg-white px-5 py-4 transition-all duration-200 hover:border-neutral-300">
          <input
            type="checkbox"
            checked={sendToClient}
            onChange={(e) => setSendToClient(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-neutral-300"
          />
          <span>
            <span className="block text-sm font-medium text-neutral-950">
              Email quote to client immediately
            </span>
            <span className="mt-1 block text-sm text-neutral-500">
              Sends a secure link to{" "}
              {clientEmail || "your client"} so they can accept and pay — you
              stay on your company dashboard.
            </span>
          </span>
        </label>

        <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full sm:w-auto`}>
          {loading ? "Creating quote..." : "Create quote →"}
        </button>
      </form>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className={`${ui.card} p-6`}>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Live preview
          </p>
          <h3 className="mt-2 text-lg font-semibold tracking-tight">
            {jobTitle || "Your job title"}
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            {businessName || "Your business"} → {clientName || "Client name"}
          </p>

          <div className="mt-6 space-y-2">
            {(previewItems.length ? previewItems : [{ description: "Add line items", quantity: 0, unitPricePence: 0 }]).slice(0, 4).map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border border-neutral-100 px-3 py-2 text-sm"
              >
                <span className="truncate text-neutral-600">{item.description}</span>
                <span className="ml-2 shrink-0 tabular-nums font-medium">
                  {formatGBP(item.quantity * item.unitPricePence)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2 border-t border-neutral-100 pt-4 text-sm">
            <div className="flex justify-between text-neutral-500">
              <span>Quote total</span>
              <span className="tabular-nums">{formatGBP(totalPence)}</span>
            </div>
            <div className="flex justify-between font-semibold text-neutral-950">
              <span>Deposit ({depositPercent || 0}%)</span>
              <span className="tabular-nums">{formatGBP(deposit)}</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-neutral-950 p-4 text-white">
            <p className="text-[10px] uppercase tracking-wider text-neutral-400">
              Client will see
            </p>
            <p className="mt-2 text-sm text-neutral-300">
              A clean, professional page with one button to accept and pay.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
