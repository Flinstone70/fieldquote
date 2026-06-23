import Link from "next/link";
import type { ReactNode } from "react";

type Crumb = {
  label: string;
  href?: string;
};

export function DashboardPageHeader({
  crumbs,
  title,
  description,
  badge,
}: {
  crumbs: Crumb[];
  title: string;
  description?: string;
  badge?: ReactNode;
}) {
  return (
    <div className="mb-8 space-y-5">
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm"
      >
        {crumbs.map((crumb, index) => (
          <span key={`${crumb.label}-${index}`} className="flex items-center gap-2">
            {index > 0 ? (
              <span aria-hidden className="text-neutral-300">
                /
              </span>
            ) : null}
            {crumb.href ? (
              <Link
                href={crumb.href}
                className="font-medium text-neutral-500 transition-colors duration-150 hover:text-neutral-950"
              >
                {crumb.label}
              </Link>
            ) : (
              <span className="font-medium text-neutral-950">{crumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-neutral-200 pb-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-950 sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">{description}</p>
          ) : null}
        </div>
        {badge ? <div className="shrink-0">{badge}</div> : null}
      </div>
    </div>
  );
}
