"use client";

import Link from "next/link";
import type { SessionUser } from "@/lib/types";
import { ui } from "@/lib/ui";

export function AlreadySignedIn({ user }: { user: SessionUser }) {
  async function signOut() {
    try {
      await fetch("/api/auth/sign-out", { method: "POST", cache: "no-store" });
    } finally {
      window.location.assign("/sign-in");
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
        <p className="text-sm font-medium text-amber-950">Already signed in</p>
        <p className="mt-1 text-sm text-amber-900/80">
          You are signed in as <strong>{user.businessName}</strong> ({user.email}).
          Sign out first if you want to use a different company account.
        </p>
      </div>
      <Link href="/dashboard" className={`${ui.btnPrimary} block w-full text-center`}>
        Go to workspace
      </Link>
      <button type="button" onClick={signOut} className={`${ui.btnSecondary} w-full`}>
        Sign out & use another account
      </button>
    </div>
  );
}
