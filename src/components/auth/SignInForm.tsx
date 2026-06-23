"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { authCopy } from "@/lib/uk-copy";
import { ui } from "@/lib/ui";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Sign in failed");

      const params = new URLSearchParams({ email: data.email });
      if (data.devCode) params.set("dev", data.devCode);

      if (data.needsEmailVerification) {
        router.push(`/verify-email?${params.toString()}`);
        return;
      }

      router.push(`/verify-login?${params.toString()}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className={ui.label}>Work email</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={ui.input}
          placeholder="you@company.co.uk"
        />
      </label>
      <label className="block">
        <span className={ui.label}>Password</span>
        <input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={ui.input}
          placeholder="••••••••"
        />
      </label>

      <p className="text-xs text-neutral-400">
        After your password, we email a one-time passcode for security.
      </p>

      {error ? (
        <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full`}>
        {loading ? "Signing in..." : "Continue"}
      </button>
    </form>
  );
}

export function SignInFooter() {
  return (
    <p className="text-neutral-500">
      New company?{" "}
      <Link href="/sign-up" className="font-medium text-neutral-950 underline-offset-4 hover:underline">
        Create an account
      </Link>
    </p>
  );
}
