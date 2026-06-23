import Link from "next/link";
import { ui } from "@/lib/ui";
import { uk } from "@/lib/uk-copy";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className={`${ui.page} min-h-screen`}>
      <div className="mx-auto grid min-h-screen max-w-6xl lg:grid-cols-2">
        <div className="hidden flex-col justify-between border-r border-neutral-800 bg-neutral-950 p-10 text-white lg:flex">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-neutral-950">
                FQ
              </span>
              <span className="text-base font-semibold">{uk.brand}</span>
            </Link>
            <h2 className="mt-16 text-3xl font-semibold leading-tight tracking-tight">
              The quoting platform UK trades rely on to look professional.
            </h2>
            <p className="mt-4 max-w-md text-neutral-400 leading-relaxed">
              Send proposals, collect approvals, and secure deposits — all
              through one secure company account.
            </p>
          </div>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex gap-2"><span className="text-amber-400">✓</span> UK pricing in GBP</li>
            <li className="flex gap-2"><span className="text-amber-400">✓</span> Email verification on sign-up</li>
            <li className="flex gap-2"><span className="text-amber-400">✓</span> One-time passcode on every sign-in</li>
            <li className="flex gap-2"><span className="text-amber-400">✓</span> Secure client quote links</li>
          </ul>
        </div>

        <div className="flex flex-col justify-center px-5 py-12 sm:px-10">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-950 text-xs font-semibold text-white">
                FQ
              </span>
              <span className="font-semibold">{uk.brand}</span>
            </Link>
          </div>
          <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">
              {subtitle}
            </p>
            <div className="mt-8">{children}</div>
            {footer ? <div className="mt-6 text-center text-sm">{footer}</div> : null}
          </div>
        </div>
      </div>
    </main>
  );
}
