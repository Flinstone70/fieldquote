import Link from "next/link";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { SubscribeButton } from "@/components/billing/SubscribeButton";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { hasActiveSubscription, subscriptionLabel } from "@/lib/subscription";
import { ui } from "@/lib/ui";
import { uk } from "@/lib/uk-copy";

export const metadata = { title: "Billing" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ paypal?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const user = await findUserById(session.userId);
  if (!user) redirect("/sign-in");

  const { paypal } = await searchParams;
  const active = hasActiveSubscription(user);
  const label = subscriptionLabel(user);

  return (
    <>
      <Header />
      <main className={ui.pageMuted}>
        <div className={`${ui.container} py-10 sm:py-14`}>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-500 transition hover:text-neutral-950"
          >
            ← Back to dashboard
          </Link>

          <p className={`${ui.sectionLabel} mt-6`}>Billing</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Company subscription
          </h1>
          <p className="mt-2 max-w-2xl text-neutral-500 leading-relaxed">
            PayPal collects your monthly fee in GBP. You can run a PayPal Business
            account from Singapore — UK companies pay you in pounds.
          </p>

          {paypal === "success" ? (
            <div className={`${ui.cardFlat} mt-8 border-neutral-950 bg-neutral-950 p-5 text-white`}>
              <p className="font-medium">PayPal approval received</p>
              <p className="mt-1 text-sm text-neutral-400">
                Your subscription activates within a minute once PayPal confirms.
                Refresh this page shortly.
              </p>
            </div>
          ) : null}

          {paypal === "cancelled" ? (
            <div className={`${ui.cardMuted} mt-8 p-5`}>
              <p className="text-sm text-neutral-600">
                PayPal checkout was cancelled. Choose a plan below when you are ready.
              </p>
            </div>
          ) : null}

          <div className={`${ui.card} mt-8 p-6 sm:p-8`}>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
              Current status
            </p>
            <p className="mt-2 text-xl font-semibold">{label}</p>
            <p className="mt-2 text-sm text-neutral-500">
              {active
                ? "Your company can create and send client quotes."
                : "Subscribe to continue after your trial."}
            </p>
          </div>

          {user.subscriptionStatus !== "active" ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {[
                {
                  plan: "professional" as const,
                  name: "Professional",
                  price: "£79",
                  features: [
                    "Unlimited quotes",
                    "Client approval links",
                    "Dashboard & tracking",
                    "14-day free trial included",
                  ],
                },
                {
                  plan: "business" as const,
                  name: "Business",
                  price: "£149",
                  highlighted: true,
                  features: [
                    "Everything in Professional",
                    "Priority support",
                    "Team features (soon)",
                    "Best for busy crews",
                  ],
                },
              ].map((item) => (
                <div
                  key={item.plan}
                  className={`${ui.cardFlat} p-8 ${item.highlighted ? "ring-1 ring-neutral-950" : ""}`}
                >
                  {item.highlighted ? (
                    <span className="text-[10px] font-medium uppercase tracking-wider text-neutral-400">
                      Most popular
                    </span>
                  ) : null}
                  <h2 className="mt-2 text-xl font-semibold">{item.name}</h2>
                  <p className="mt-4 text-4xl font-semibold tabular-nums">
                    {item.price}
                    <span className="text-base font-normal text-neutral-400">/month</span>
                  </p>
                  <ul className="mt-6 space-y-2 text-sm text-neutral-600">
                    {item.features.map((feature) => (
                      <li key={feature}>✓ {feature}</li>
                    ))}
                  </ul>
                  <div className="mt-8">
                    <SubscribeButton
                      plan={item.plan}
                      label={`Subscribe with PayPal — ${item.price}/mo`}
                      highlighted={item.highlighted}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`${ui.cardMuted} mt-10 p-6`}>
              <p className="text-sm text-neutral-600">
                Manage or cancel your subscription in your{" "}
                <a
                  href="https://www.paypal.com/myaccount/autopay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-neutral-950 underline underline-offset-4"
                >
                  PayPal account
                </a>
                .
              </p>
            </div>
          )}

          <p className="mt-10 text-xs text-neutral-400">{uk.vatNote}</p>
        </div>
      </main>
    </>
  );
}
