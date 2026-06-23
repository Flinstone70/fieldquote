"use client";

import { useEffect, useState } from "react";
import { ui } from "@/lib/ui";

export function SendQuotePanel({
  quoteId,
  clientEmail,
  clientName,
  initiallySent = false,
}: {
  quoteId: string;
  clientEmail: string;
  clientName: string;
  initiallySent?: boolean;
}) {
  const [shareUrl, setShareUrl] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(initiallySent);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setShareUrl(`${window.location.origin}/q/${quoteId}`);
  }, [quoteId]);

  async function sendEmail() {
    setSending(true);
    setError("");
    try {
      const response = await fetch(`/api/quotes/${quoteId}/send`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Could not send email");
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send email");
    } finally {
      setSending(false);
    }
  }

  async function copyLink() {
    const url = shareUrl || `${window.location.origin}/q/${quoteId}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`${ui.card} p-6 transition-all duration-300`}>
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
        Send to client
      </p>
      <h2 className="mt-2 text-lg font-semibold tracking-tight">
        Deliver this quote to {clientName}
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Email a secure link to{" "}
        <span className="font-medium text-neutral-950">{clientEmail}</span>. They
        will review, accept, and pay the deposit — not you.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={sendEmail}
          disabled={sending}
          className={`${ui.btnPrimary} sm:min-w-[180px]`}
        >
          {sending
            ? "Sending..."
            : sent
              ? "Resend to client"
              : "Email quote to client"}
        </button>
        <button type="button" onClick={copyLink} className={ui.btnSecondary}>
          {copied ? "Link copied ✓" : "Copy client link"}
        </button>
        <a
          href={`/q/${quoteId}?preview=1`}
          target="_blank"
          rel="noopener noreferrer"
          className={ui.btnGhost}
        >
          Preview client page ↗
        </a>
      </div>

      {sent ? (
        <p className="mt-4 animate-fade-in rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          Quote emailed to {clientEmail}. Status updates appear here when they
          respond.
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {error}
        </p>
      ) : null}

      <div className="mt-5 rounded-xl border border-neutral-100 bg-neutral-50/80 px-4 py-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
          Client link
        </p>
        <code className="mt-1 block break-all text-xs text-neutral-600">
          {shareUrl || `/q/${quoteId}`}
        </code>
      </div>
    </div>
  );
}
