import { DashboardPageHeader } from "@/components/dashboard/DashboardPageHeader";
import { SubscribeButton } from "@/components/billing/SubscribeButton";
import { BillingActivation } from "@/components/billing/BillingActivation";
import { requireSession } from "@/lib/auth/guards";
import { FREE_TRIAL_DAYS, paidPlans } from "@/lib/pricing";
import { countQuotesThisMonth } from "@/lib/quotes-store";
import {
  hasActiveSubscription,
  monthlyQuoteLimit,
  subscriptionLabel,
} from "@/lib/subscription";
import { ui } from "@/lib/ui";
import { uk } from "@/lib/uk-copy";

export const metadata = { title: "Billing" };

export default async function BillingPage({
  searchParams,
}: {
  searchParams: Promise<{ paypal?: string; reason?: string }>;
}) {
  const { user } = await requireSession();
  const { paypal, reason } = await searchParams;
  const active = hasActiveSubscription(user);
  const label = subscriptionLabel(user);
  const quoteLimit = monthlyQuoteLimit(user);
  const quotesUsed = active ? await countQuotesThisMonth(user.id) : 0;
  const usageText = !active
    ? null
    : Number.isFinite(quoteLimit)
      ? `${quotesUsed} of ${quoteLimit} quotes used this month`
      : "Unlimited quotes";
  const paypalManageUrl =
    process.env.PAYPAL_MODE === "live"
      ? "https://www.paypal.com/myaccount/autopay/"
      : "https://www.sandbox.paypal.com/myaccount/autopay/";

  return (
    <>
      <DashboardPageHeader
        crumbs={[
          { label: "Overview", href: "/dashboard" },
          { label: "Billing" },
        ]}
        title="Company subscription"
        description="PayPal collects your monthly fee in GBP. Subscribe to keep creating and sending client quotes after your trial."
      />

      {reason === "subscription_required" && !active ? (
        <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="font-medium text-amber-950">Subscription required</p>
          <p className="mt-1 text-sm text-amber-900/80">
            Your free trial has ended. Subscribe below to unlock quotes, client
            emails, and your company workspace.
          </p>
        </div>
      ) : null}

      {paypal === "success" ? (
        <BillingActivation initialActive={active} />
      ) : null}

      {paypal === "cancelled" ? (
        <div className={`${ui.cardMuted} mb-8 p-5`}>
          <p className="text-sm text-neutral-600">
            PayPal checkout was cancelled. Choose a plan below when you are ready.
          </p>
        </div>
      ) : null}

      <div className={`${ui.card} p-6 sm:p-8`}>
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          Current status
        </p>
        <div className="mt-2 flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              active ? "bg-emerald-500" : "bg-neutral-300"
            }`}
            aria-hidden="true"
          />
          <p className="text-xl font-semibold">{label}</p>
        </div>
        <p className="mt-2 text-sm text-neutral-500">
          {active
            ? "Your company can create and send client quotes."
            : "Subscribe to continue after your trial."}
        </p>
        {usageText ? (
          <p className="mt-3 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
            {usageText}
          </p>
        ) : null}
      </div>

      <div className={`${ui.cardMuted} mt-6 p-6`}>
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
          Plan clarity
        </p>
        <p className="mt-2 text-sm text-neutral-700">
          Free Trial gives full access for {FREE_TRIAL_DAYS} days to prove value.
          Professional is for owner-operators (up to 50 quotes/month). Business is
          for growing teams that need unlimited quoting and extra support.
        </p>
      </div>

      {user.subscriptionStatus !== "active" ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {paidPlans.map((item) => (
            <div
              key={item.plan}
              className={`${ui.cardFlat} p-8 ${item.highlighted ? "ring-1 ring-amber-500" : ""}`}
            >
              {item.highlighted ? (
                <span className="text-[10px] font-medium uppercase tracking-wider text-amber-700">
                  Most popular
                </span>
              ) : null}
              <h3 className="mt-2 text-xl font-semibold">{item.name}</h3>
              <p className="mt-1 text-sm text-neutral-500">{item.bestFor}</p>
              <p className="mt-4 text-4xl font-semibold tabular-nums">
                {item.price}
                <span className="text-base font-normal text-neutral-400">/month</span>
              </p>
              <ul className="mt-6 space-y-2.5 text-sm text-neutral-600">
                {item.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5">
                    <svg
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={`mt-0.5 h-4 w-4 shrink-0 ${
                        item.highlighted ? "text-amber-500" : "text-neutral-900"
                      }`}
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0l-3.5-3.5a1 1 0 1 1 1.4-1.4l2.8 2.8 6.8-6.8a1 1 0 0 1 1.4 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
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
        <div className={`${ui.card} mt-10 p-6 sm:p-8`}>
          <h3 className="text-base font-semibold">Manage your subscription</h3>
          <p className="mt-1.5 text-sm text-neutral-500">
            Your plan renews automatically each month via PayPal. You can update
            your payment method or cancel anytime from PayPal — your access stays
            active until the end of the paid period.
          </p>
          <a
            href={paypalManageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`${ui.btnSecondary} mt-5 inline-flex`}
          >
            Manage in PayPal
          </a>
        </div>
      )}

      <p className="mt-10 text-xs text-neutral-400">{uk.vatNote}</p>
    </>
  );
}
