"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { SubscriptionStatus } from "@/lib/types";

export function SubscriptionEnforcer({
  trialEndsAt,
  status,
}: {
  trialEndsAt: string;
  status: SubscriptionStatus;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const active =
      status === "active" ||
      (status === "trialing" && new Date(trialEndsAt).getTime() > Date.now());

    if (!active && !pathname.startsWith("/dashboard/billing")) {
      router.replace("/dashboard/billing?reason=subscription_required");
    }
  }, [pathname, router, status, trialEndsAt]);

  return null;
}
