export const ui = {
  page: "flex-1 bg-white text-neutral-950",
  pageMuted: "flex-1 bg-neutral-50 text-neutral-950",
  container: "mx-auto max-w-6xl px-5 sm:px-6",
  narrow: "mx-auto max-w-3xl px-5 sm:px-6",
  heading: "font-semibold tracking-tight text-neutral-950",
  subtext: "text-neutral-500 leading-relaxed",
  label: "mb-1.5 block text-xs font-medium uppercase tracking-wider text-neutral-500",
  input:
    "w-full rounded-lg border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-950 placeholder:text-neutral-400 transition focus:border-neutral-950 focus:outline-none focus:ring-2 focus:ring-neutral-950/10",
  card: "rounded-2xl border border-neutral-200 bg-white shadow-sm shadow-neutral-950/5 transition hover:shadow-md hover:shadow-neutral-950/5",
  cardFlat: "rounded-2xl border border-neutral-200 bg-white",
  cardMuted: "rounded-2xl border border-neutral-200 bg-neutral-50/80",
  btnPrimary:
    "inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-50",
  btnSecondary:
    "inline-flex items-center justify-center rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-950 transition hover:border-neutral-950 hover:bg-neutral-50 active:scale-[0.98]",
  btnGhost:
    "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-950",
  sectionLabel:
    "mb-3 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-neutral-400",
  divider: "border-t border-neutral-200",
} as const;
