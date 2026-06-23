"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authCopy } from "@/lib/uk-copy";
import { ui } from "@/lib/ui";

export function SignUpForm() {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Sign up failed");
      router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <label className="block">
        <span className={ui.label}>Company / trading name</span>
        <input
          required
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          className={ui.input}
          placeholder="Meridian Electrical Ltd"
        />
      </label>
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
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={ui.input}
          placeholder="••••••••"
        />
        <span className="mt-1.5 block text-xs text-neutral-400">
          {authCopy.passwordHint}
        </span>
      </label>

      {error ? (
        <p className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700">
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={loading} className={`${ui.btnPrimary} w-full`}>
        {loading ? "Creating account..." : "Create company account"}
      </button>

      <p className="text-center text-xs text-neutral-400">
        By creating an account you agree to secure email verification and
        one-time passcode sign-in.
      </p>
    </form>
  );
}

export function SignUpFooter() {
  return (
    <p className="text-neutral-500">
      Already have an account?{" "}
      <Link href="/sign-in" className="font-medium text-neutral-950 underline-offset-4 hover:underline">
        Sign in
      </Link>
    </p>
  );
}
