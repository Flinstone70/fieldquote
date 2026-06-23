"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/lib/types";
import { ui } from "@/lib/ui";

export function Header({ marketing = false, app = false }: { marketing?: boolean; app?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setAuthChecked(true));
  }, [pathname]);

  async function signOut() {
    await fetch("/api/auth/sign-out", { method: "POST" });
    setUser(null);
    router.push("/");
    router.refresh();
  }

  const navLinks = marketing
    ? [
        { href: "#features", label: "Features" },
        { href: "#how-it-works", label: "How it works" },
        { href: "#pricing", label: "Pricing" },
        { href: "/demo", label: "Live demo" },
      ]
    : [];

  const showMarketingAuth = marketing && authChecked && !user;
  const showAppAuth = !marketing && !app && authChecked && !user;
  const showSignedIn = authChecked && user;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "border-b border-neutral-200/90 bg-white/90 shadow-sm shadow-neutral-950/5 backdrop-blur-lg"
            : "border-b border-transparent bg-white/80 backdrop-blur-md"
        }`}
      >
        <div className={`${ui.container} flex items-center justify-between py-4`}>
          <Link href={user ? "/dashboard" : "/"} className="group flex items-center gap-2.5">
            <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-neutral-950 text-xs font-semibold text-white ring-2 ring-transparent transition group-hover:scale-105 group-hover:ring-amber-400/40">
              FQ
            </span>
            <div className="leading-none">
              <span className="block text-base font-semibold tracking-tight text-neutral-950">
                FieldQuote
              </span>
              <span className="hidden text-[10px] uppercase tracking-[0.18em] text-neutral-400 sm:block">
                UK · Premium quoting
              </span>
            </div>
          </Link>

          {!app ? (
            <nav className="hidden items-center gap-1 lg:flex">
              {navLinks.map((link) =>
                link.href.startsWith("#") ? (
                  <a key={link.href} href={link.href} className={ui.btnGhost}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} className={ui.btnGhost}>
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          ) : null}

          <div className="flex items-center gap-2">
            {showSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="hidden max-w-[160px] truncate text-sm font-medium text-neutral-700 transition hover:text-neutral-950 sm:inline"
                >
                  {user.businessName}
                </Link>
                {!app ? (
                  <>
                    <Link href="/dashboard/billing" className={`hidden sm:inline-flex ${ui.btnGhost}`}>
                      Billing
                    </Link>
                    <Link href="/dashboard/new" className={`hidden sm:inline-flex ${ui.btnPrimary}`}>
                      New quote
                    </Link>
                  </>
                ) : null}
                <button type="button" onClick={signOut} className={ui.btnGhost}>
                  Sign out
                </button>
              </>
            ) : showMarketingAuth || showAppAuth ? (
              <>
                <Link href="/sign-in" className={ui.btnGhost}>
                  Sign in
                </Link>
                <Link href="/sign-up" className={ui.btnPrimary}>
                  Create account
                </Link>
              </>
            ) : null}

            {!app ? (
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 lg:hidden"
              >
                <span className="text-lg leading-none">{open ? "×" : "☰"}</span>
              </button>
            ) : null}
          </div>
        </div>
      </header>

      {open && !app ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-neutral-950/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-[73px] w-full max-w-sm border-b border-l border-neutral-200 bg-white p-5 shadow-xl">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) =>
                link.href.startsWith("#") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    onClick={() => setOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              {showSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                  >
                    {user.businessName}
                  </Link>
                  <Link href="/dashboard/new" className={`${ui.btnPrimary} mt-3 w-full`}>
                    New quote
                  </Link>
                  <button type="button" onClick={signOut} className={`${ui.btnSecondary} mt-2 w-full`}>
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/sign-in" className="rounded-xl px-4 py-3 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
                    Sign in
                  </Link>
                  <Link href="/sign-up" className={`${ui.btnPrimary} mt-3 w-full`}>
                    Create account
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      ) : null}
    </>
  );
}
