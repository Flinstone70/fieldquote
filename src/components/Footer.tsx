import Link from "next/link";
import { ui } from "@/lib/ui";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-14 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
              FQ
            </span>
            <span className="text-base font-semibold tracking-tight">FieldQuote</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-500">
            Premium quoting and deposit collection for trades and field service
            businesses.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Product
            </p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>
                <a href="/#features" className="transition hover:text-neutral-950">
                  Features
                </a>
              </li>
              <li>
                <Link href="/demo" className="transition hover:text-neutral-950">
                  Live demo
                </Link>
              </li>
              <li>
                <a href="/#pricing" className="transition hover:text-neutral-950">
                  Pricing
                </a>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              App
            </p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/sign-in" className="transition hover:text-neutral-950">
                  Sign in
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="transition hover:text-neutral-950">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Contact
            </p>
            <ul className="mt-4 space-y-2 text-sm text-neutral-600">
              <li>
                <a
                  href="mailto:hello@fieldquote.app"
                  className="transition hover:text-neutral-950"
                >
                  hello@fieldquote.app
                </a>
              </li>
              <li>Stripe payments</li>
              <li>UK-ready pricing</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-neutral-200">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-6 text-xs text-neutral-400 sm:px-6">
          <p>© {new Date().getFullYear()} FieldQuote. All rights reserved.</p>
          <p>Built for businesses that charge premium rates.</p>
        </div>
      </div>
    </footer>
  );
}
