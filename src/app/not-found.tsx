import Link from "next/link";
import { ui } from "@/lib/ui";

export default function NotFound() {
  return (
    <main className={`${ui.page} flex min-h-screen items-center justify-center px-5`}>
      <div className="max-w-md text-center">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-400">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="mt-3 text-neutral-500">
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className={ui.btnPrimary}>
            Back home
          </Link>
          <Link href="/dashboard" className={ui.btnSecondary}>
            Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
