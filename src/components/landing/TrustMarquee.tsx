import { ui } from "@/lib/ui";

const industries = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Landscaping",
  "HVAC",
  "Roofing",
  "Painting",
  "Handyman",
  "Pest control",
  "Locksmith",
];

export function TrustMarquee() {
  return (
    <div className="overflow-hidden border-y border-neutral-200 bg-white py-5">
      <div className="flex w-max animate-marquee gap-12 px-6">
        {[...industries, ...industries].map((name, i) => (
          <span
            key={`${name}-${i}`}
            className="whitespace-nowrap text-sm font-medium tracking-wide text-neutral-400"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

export function TrustGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
      {industries.map((name) => (
        <div
          key={name}
          className={`${ui.cardFlat} flex items-center justify-center px-4 py-5 text-center text-sm font-medium text-neutral-600 transition hover:border-neutral-950 hover:text-neutral-950`}
        >
          {name}
        </div>
      ))}
    </div>
  );
}
