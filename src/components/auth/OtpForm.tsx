"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authCopy } from "@/lib/uk-copy";
import { ui } from "@/lib/ui";

export function OtpForm({
  action,
  email,
}: {
  action: "verify-email" | "verify-login";
  email?: string;
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Verification failed");
      router.push(data.redirect ?? "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/resend-otp", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not resend code");
      setMessage("A new code has been sent to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend code");
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {email ? (
        <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
          Code sent to <strong className="text-neutral-950">{email}</strong>
        </p>
      ) : null}

      <label className="block">
        <span className={ui.label}>6-digit code</span>
        <input
          required
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className={`${ui.input} text-center text-2xl tracking-[0.35em]`}
          placeholder="000000"
        />
      </label>

      <p className="text-xs text-neutral-400">{authCopy.otpExpiry}</p>

      {error ? (
        <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {message}
        </p>
      ) : null}

      <button type="submit" disabled={loading || code.length !== 6} className={`${ui.btnPrimary} w-full`}>
        {loading ? "Verifying..." : "Continue"}
      </button>

      <button
        type="button"
        onClick={resend}
        disabled={resending}
        className={`${ui.btnGhost} w-full`}
      >
        {resending ? "Sending..." : "Resend code"}
      </button>
    </form>
  );
}
