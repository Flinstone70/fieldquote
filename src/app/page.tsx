import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { ComparisonTable } from "@/components/landing/ComparisonTable";
import { FAQ } from "@/components/landing/FAQ";
import { FeatureShowcase } from "@/components/landing/FeatureShowcase";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { ROICalculator } from "@/components/landing/ROICalculator";
import { TrustGrid, TrustMarquee } from "@/components/landing/TrustMarquee";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ui } from "@/lib/ui";

const stats = [
  { value: "2 min", label: "Average quote setup" },
  { value: "1 link", label: "Client approval flow" },
  { value: "30%", label: "Typical deposit rate" },
  { value: "24/7", label: "Client access" },
];

const steps = [
  {
    step: "01",
    title: "Create a professional quote",
    body: "Add your business details, scope of work, line items, and deposit percentage. FieldQuote calculates totals automatically.",
  },
  {
    step: "02",
    title: "Send a single client link",
    body: "Text or email one clean URL. Your client opens it on any device — no apps, no logins, no confusion.",
  },
  {
    step: "03",
    title: "Collect approval and deposit",
    body: "They accept the job and pay the deposit by card. You get a confirmed booking before work begins.",
  },
];

const testimonials = [
  {
    quote:
      "Our quotes finally look like they come from a serious company. Clients stop asking for PDFs and start paying deposits.",
    name: "James R.",
    role: "Electrical contractor, London",
  },
  {
    quote:
      "We cut quote follow-ups in half. One link, one decision — that's it. It feels premium without being complicated.",
    name: "Sarah M.",
    role: "Cleaning business owner",
  },
  {
    quote:
      "I show prospects the demo page on my phone. They get it instantly. That's half the sale done.",
    name: "Daniel K.",
    role: "Roofing company director",
  },
];

const plans = [
  {
    name: "Professional",
    price: "£79",
    description: "For established sole traders ready to look the part.",
    features: [
      "Unlimited quotes",
      "Branded client pages",
      "Stripe deposit collection",
      "Dashboard & status tracking",
      "Email-ready share links",
    ],
  },
  {
    name: "Business",
    price: "£149",
    description: "For teams booking high-value jobs every week.",
    features: [
      "Everything in Professional",
      "Multiple team members",
      "Quote templates",
      "Priority support",
      "Advanced reporting (soon)",
    ],
    highlighted: true,
  },
];

export default function HomePage() {
  return (
    <>
      <Header marketing />
      <main className={ui.page}>
        <section className="grain relative overflow-hidden border-b border-neutral-200">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(0,0,0,0.04),transparent_40%)]" />
          <div className={`${ui.container} relative grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28`}>
            <div className="animate-fade-up">
              <p className={ui.sectionLabel}>
                <span className="h-px w-8 bg-neutral-300" />
                For trades & field services
              </p>
              <h1 className="text-4xl font-semibold leading-[1.06] tracking-tight text-neutral-950 sm:text-5xl lg:text-[3.4rem]">
                Quote like a premium firm.{" "}
                <span className="text-neutral-400">Get paid before you start.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-500">
                FieldQuote gives your business a client experience that feels
                enterprise-grade — professional proposals, one-click approval,
                and secure deposit collection.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/sign-up" className={ui.btnPrimary}>
                  Create company account
                </Link>
                <Link href="/demo" className={ui.btnSecondary}>
                  View live demo
                </Link>
              </div>
              <p className="mt-5 text-xs text-neutral-400">
                No credit card required · Set up in minutes · Cancel anytime
              </p>
            </div>
            <HeroPreview />
          </div>
        </section>

        <TrustMarquee />

        <section className="border-b border-neutral-200 bg-neutral-50">
          <div className={`${ui.container} grid grid-cols-2 gap-6 py-12 md:grid-cols-4`}>
            {stats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 80}>
                <div className="text-center md:text-left">
                  <p className="text-2xl font-semibold tracking-tight tabular-nums text-neutral-950 sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </section>

        <section id="features" className="scroll-mt-24 py-24">
          <div className={ui.container}>
            <AnimatedSection className="mx-auto max-w-2xl text-center">
              <p className={ui.sectionLabel}>Capabilities</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Everything you need to close jobs with confidence
              </h2>
              <p className="mt-4 text-neutral-500 leading-relaxed">
                A complete quoting workflow — from first estimate to confirmed
                deposit — designed to feel effortless for you and impressive
                for your clients.
              </p>
            </AnimatedSection>
            <div className="mt-16">
              <FeatureShowcase />
            </div>
          </div>
        </section>

        <section className="border-y border-neutral-200 bg-neutral-50 py-24">
          <div className={ui.container}>
            <AnimatedSection className="mx-auto max-w-2xl text-center">
              <p className={ui.sectionLabel}>Why FieldQuote</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                PDFs and WhatsApp messages don&apos;t close premium jobs
              </h2>
              <p className="mt-4 text-neutral-500 leading-relaxed">
                Your price reflects your quality. Your quote experience should
                too.
              </p>
            </AnimatedSection>
            <div className="mt-12">
              <ComparisonTable />
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 py-24">
          <div className={ui.container}>
            <AnimatedSection className="max-w-2xl">
              <p className={ui.sectionLabel}>Process</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Three steps. Zero friction.
              </h2>
              <p className="mt-4 text-neutral-500 leading-relaxed">
                Replace messy PDFs and endless follow-ups with a workflow your
                clients actually complete.
              </p>
            </AnimatedSection>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {steps.map((item, i) => (
                <AnimatedSection key={item.step} delay={i * 100}>
                  <article className={`${ui.card} group h-full p-8 transition hover:-translate-y-0.5`}>
                    <p className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-400">
                      Step {item.step}
                    </p>
                    <h3 className="mt-4 text-xl font-semibold tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                      {item.body}
                    </p>
                    <div className="mt-6 h-px w-12 bg-neutral-200 transition group-hover:w-full group-hover:bg-neutral-950" />
                  </article>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-neutral-50 py-24">
          <div className={ui.container}>
            <AnimatedSection className="mx-auto max-w-2xl text-center">
              <p className={ui.sectionLabel}>Industries</p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Built for any business that quotes before work begins
              </h2>
            </AnimatedSection>
            <div className="mt-12">
              <TrustGrid />
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className={ui.container}>
            <AnimatedSection>
              <ROICalculator />
            </AnimatedSection>
          </div>
        </section>

        <section className="border-y border-neutral-200 py-24">
          <div className={ui.container}>
            <AnimatedSection className="mx-auto max-w-2xl text-center">
              <p className={ui.sectionLabel}>Trusted by operators</p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Built for businesses that can&apos;t afford to look cheap
              </h2>
            </AnimatedSection>
            <div className="mt-14 grid gap-6 md:grid-cols-3">
              {testimonials.map((item, i) => (
                <AnimatedSection key={item.name} delay={i * 80}>
                  <blockquote className={`${ui.cardFlat} h-full p-8`}>
                    <p className="text-base leading-relaxed text-neutral-700">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <footer className="mt-6 border-t border-neutral-100 pt-6">
                      <p className="font-medium text-neutral-950">{item.name}</p>
                      <p className="text-sm text-neutral-500">{item.role}</p>
                    </footer>
                  </blockquote>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-24 bg-neutral-950 py-24 text-white">
          <div className={ui.container}>
            <AnimatedSection className="mx-auto max-w-2xl text-center">
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                Pricing
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Invest less than one lost job
              </h2>
              <p className="mt-4 text-neutral-400 leading-relaxed">
                One secured deposit pays for your subscription many times over.
              </p>
            </AnimatedSection>
            <div className="mt-14 grid gap-6 md:grid-cols-2">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-8 transition ${
                    plan.highlighted
                      ? "border-white bg-white text-neutral-950 shadow-2xl shadow-black/20"
                      : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700"
                  }`}
                >
                  {plan.highlighted ? (
                    <span className="inline-flex rounded-full bg-neutral-950 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                      Most popular
                    </span>
                  ) : null}
                  <h3 className="mt-4 text-xl font-semibold">{plan.name}</h3>
                  <p className={`mt-2 text-sm ${plan.highlighted ? "text-neutral-500" : "text-neutral-400"}`}>
                    {plan.description}
                  </p>
                  <p className="mt-8 text-5xl font-semibold tracking-tight tabular-nums">
                    {plan.price}
                    <span className={`text-base font-normal ${plan.highlighted ? "text-neutral-400" : "text-neutral-500"}`}>
                      /month
                    </span>
                  </p>
                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className={`flex items-center gap-3 text-sm ${plan.highlighted ? "text-neutral-700" : "text-neutral-300"}`}>
                        <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] ${plan.highlighted ? "bg-neutral-950 text-white" : "bg-white text-neutral-950"}`}>
                          ✓
                        </span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition ${
                      plan.highlighted
                        ? "bg-neutral-950 text-white hover:bg-neutral-800"
                        : "bg-white text-neutral-950 hover:bg-neutral-100"
                    }`}
                  >
                    Get started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-24 py-24">
          <div className={`${ui.container} grid gap-12 lg:grid-cols-2`}>
            <AnimatedSection>
              <p className={ui.sectionLabel}>FAQ</p>
              <h2 className="text-3xl font-semibold tracking-tight">
                Questions from business owners
              </h2>
              <p className="mt-4 text-neutral-500 leading-relaxed">
                Straight answers about how FieldQuote works and what your
                clients will experience.
              </p>
              <div className="mt-8">
                <Link href="/demo" className={ui.btnSecondary}>
                  Open live demo →
                </Link>
              </div>
            </AnimatedSection>
            <FAQ />
          </div>
        </section>

        <section id="contact" className="scroll-mt-24 border-t border-neutral-200 bg-neutral-950 py-24 text-white">
          <div className={`${ui.container} grid gap-10 lg:grid-cols-2 lg:items-center`}>
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-neutral-500">
                Ready to sell smarter?
              </p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Show clients a quote experience worth paying for
              </h2>
              <p className="mt-4 text-neutral-400 leading-relaxed">
                Start free today. When you&apos;re ready to pitch other businesses,
                send them your live demo link — it sells better than any slide
                deck.
              </p>
            </div>
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-8">
              <p className="text-sm font-medium text-white">Quick start</p>
              <ol className="mt-4 space-y-3 text-sm text-neutral-400">
                <li>1. Create a quote for your business</li>
                <li>2. Share <Link href="/demo" className="text-white underline underline-offset-4">/demo</Link> with prospects</li>
                <li>3. Connect Stripe and start collecting deposits</li>
              </ol>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/sign-up" className="inline-flex rounded-full bg-white px-6 py-3 text-sm font-medium text-neutral-950 transition hover:bg-neutral-100">
                  Create account
                </Link>
                <a href="mailto:hello@fieldquote.app?subject=FieldQuote%20demo" className="inline-flex rounded-full border border-neutral-700 px-6 py-3 text-sm font-medium text-white transition hover:border-white">
                  Book a walkthrough
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-neutral-200 bg-neutral-50 py-24">
          <div className={`${ui.container} text-center`}>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Your next quote could look like a £1,000/month product
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-neutral-500 leading-relaxed">
              Create a professional quote in minutes. Send it to a client today.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/sign-up" className={ui.btnPrimary}>
                Create company account
              </Link>
              <Link href="/demo" className={ui.btnSecondary}>
                View live demo
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
