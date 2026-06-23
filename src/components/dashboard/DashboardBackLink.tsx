import Link from "next/link";

export function DashboardBackLink({
  href = "/dashboard",
  label = "Back to overview",
}: {
  href?: string;
  label?: string;
}) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 transition-colors duration-150 hover:text-neutral-950"
    >
      <span aria-hidden className="text-base leading-none">
        ←
      </span>
      {label}
    </Link>
  );
}
