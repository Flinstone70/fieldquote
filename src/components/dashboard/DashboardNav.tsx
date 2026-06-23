"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { hasActiveSubscription, subscriptionLabel } from "@/lib/subscription";
import type { SubscriptionStatus } from "@/lib/types";
import { ui } from "@/lib/ui";

const links = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/new", label: "New quote" },
  { href: "/dashboard/billing", label: "Billing" },
];

export function DashboardNav({
  businessName,
  email,
  subscriptionStatus,
  trialEndsAt,
}: {
  businessName: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string;
}) {
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const user = {
    subscriptionStatus,
    trialEndsAt,
    subscriptionPlan: "none" as const,
    emailVerified: true,
    id: "",
    email,
    passwordHash: "",
    businessName,
    createdAt: "",
  };
  const active = hasActiveSubscription(user);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className={`${ui.card} overflow-hidden`}>
      <div className="flex flex-col gap-6 border-b border-neutral-100 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-neutral-400">
            Company workspace
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{businessName}</h1>
          <p className="mt-1 text-sm text-neutral-500">{email}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-wide ring-1 ring-inset ${
              active
                ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                : "bg-amber-50 text-amber-900 ring-amber-200"
            }`}
          >
            {subscriptionLabel(user)}
          </span>
          <Link href="/dashboard/new" prefetch className={ui.btnPrimary}>
            + New quote
          </Link>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto p-2">
        {links.map((link) => {
          const activeLink = isActive(link.href, link.exact);
          const isPending = pendingHref === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              onClick={() => setPendingHref(link.href)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-150 ${
                activeLink
                  ? "bg-neutral-950 text-white shadow-sm"
                  : isPending
                    ? "bg-neutral-200 text-neutral-700"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
