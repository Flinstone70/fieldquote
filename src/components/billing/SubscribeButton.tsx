"use client";

import { useState } from "react";
import { ui } from "@/lib/ui";
import type { PayPalPlanKey } from "@/lib/types";

export function SubscribeButton({
  plan,
  label,
  highlighted = false,
}: {
  plan: PayPalPlanKey;
  label: string;
  highlighted?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function subscribe() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/paypal/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Could not start PayPal checkout");
      window.location.href = data.approvalUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={subscribe}
        disabled={loading}
        className={
          highlighted
            ? `${ui.btnPrimary} w-full`
            : `${ui.btnSecondary} w-full`
        }
      >
        {loading ? "Redirecting to PayPal..." : label}
      </button>
      {error ? (
        <p className="mt-2 text-xs text-neutral-500">{error}</p>
      ) : null}
    </div>
  );
}
