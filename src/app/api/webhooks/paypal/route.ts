import { NextResponse } from "next/server";
import {
  findUserById,
  findUserByPayPalSubscriptionId,
  updateUserSubscription,
} from "@/lib/auth/users";
import { sendSubscriptionActiveEmail } from "@/lib/email";
import { planFromPayPalPlanId, verifyPayPalWebhook } from "@/lib/paypal";

type PayPalWebhook = {
  event_type: string;
  resource: {
    id?: string;
    custom_id?: string;
    plan_id?: string;
    status?: string;
  };
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    const verified = await verifyPayPalWebhook(request.headers, rawBody);
    if (!verified) {
      // Reject anything we can't cryptographically attribute to PayPal.
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
    }

    const body = JSON.parse(rawBody) as PayPalWebhook;
    const eventType = body.event_type;
    const resource = body.resource ?? {};
    const subscriptionId = resource.id;
    const userId = resource.custom_id;
    const planId = resource.plan_id;

    let user =
      (userId ? await findUserById(userId) : null) ??
      (subscriptionId
        ? await findUserByPayPalSubscriptionId(subscriptionId)
        : null);

    if (!user) {
      return NextResponse.json({ received: true });
    }

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.RE-ACTIVATED": {
        const planKey = planId ? planFromPayPalPlanId(planId) : null;
        const resolvedPlan = planKey ?? "professional";
        await updateUserSubscription(user.id, {
          subscriptionStatus: "active",
          subscriptionPlan: resolvedPlan,
          paypalSubscriptionId: subscriptionId ?? user.paypalSubscriptionId,
        });
        await sendSubscriptionActiveEmail({
          to: user.email,
          businessName: user.businessName,
          planLabel: resolvedPlan === "business" ? "Business" : "Professional",
        }).catch(() => undefined);
        break;
      }
      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.EXPIRED":
        await updateUserSubscription(user.id, {
          subscriptionStatus: "cancelled",
        });
        break;
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED":
        await updateUserSubscription(user.id, {
          subscriptionStatus: "past_due",
        });
        break;
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
