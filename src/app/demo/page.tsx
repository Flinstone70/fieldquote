import Link from "next/link";
import { Header } from "@/components/Header";
import { ClientQuoteView } from "@/components/ClientQuoteView";
import { demoQuote } from "@/lib/demo-quote";
import { ui } from "@/lib/ui";

export const metadata = {
  title: "Live demo — FieldQuote",
  description:
    "See exactly what your clients experience when they receive a FieldQuote proposal.",
};

export default function DemoPage() {
  return (
    <>
      <Header />
      <main className={ui.page}>
        <div className="border-b border-neutral-200 bg-neutral-50">
          <div className={`${ui.container} py-8`}>
            <p className={ui.sectionLabel}>Live demo</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              This is what your clients see
            </h1>
            <p className="mt-3 max-w-2xl text-neutral-500 leading-relaxed">
              A real example of a premium client quote page. Send prospects this
              link when selling FieldQuote — or recreate it for your own business
              in under two minutes.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/sign-up" className={ui.btnPrimary}>
                Create company account
              </Link>
              <Link href="/#pricing" className={ui.btnSecondary}>
                View pricing
              </Link>
            </div>
          </div>
        </div>
        <div className="py-10 sm:py-14">
          <div className="mx-auto max-w-3xl px-5 sm:px-6">
            <ClientQuoteView quote={demoQuote} demo />
          </div>
        </div>
      </main>
    </>
  );
}
