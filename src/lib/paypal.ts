import { uk } from "@/lib/uk-copy";
import { getAppOrigin } from "@/lib/app-url";
import type { PayPalPlanKey } from "@/lib/types";

const PAYPAL_API =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

export function getPayPalPlanId(plan: PayPalPlanKey): string {
  const id =
    plan === "professional"
      ? process.env.PAYPAL_PLAN_PROFESSIONAL
      : process.env.PAYPAL_PLAN_BUSINESS;
  if (!id) {
    throw new Error(
      `PayPal plan ID missing for ${plan}. Set PAYPAL_PLAN_PROFESSIONAL / PAYPAL_PLAN_BUSINESS.`,
    );
  }
  return id;
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !secret) {
    throw new Error("PayPal credentials are not configured.");
  }

  const auth = Buffer.from(`${clientId}:${secret}`).toString("base64");
  const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error("Could not authenticate with PayPal.");
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function createPayPalSubscription(input: {
  plan: PayPalPlanKey;
  userId: string;
  businessName: string;
  email: string;
}): Promise<{ approvalUrl: string; subscriptionId: string }> {
  const token = await getPayPalAccessToken();
  const planId = getPayPalPlanId(input.plan);
  const appUrl = getAppOrigin();

  const response = await fetch(`${PAYPAL_API}/v1/billing/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      plan_id: planId,
      custom_id: input.userId,
      subscriber: {
        name: { given_name: input.businessName.slice(0, 140) },
        email_address: input.email,
      },
      application_context: {
        brand_name: uk.brand,
        locale: "en-GB",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        return_url: `${appUrl}/dashboard/billing?paypal=success`,
        cancel_url: `${appUrl}/dashboard/billing?paypal=cancelled`,
      },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? "Could not create PayPal subscription.");
  }

  const approvalUrl = (data.links as { rel: string; href: string }[]).find(
    (link) => link.rel === "approve",
  )?.href;

  if (!approvalUrl) {
    throw new Error("PayPal did not return an approval link.");
  }

  return { approvalUrl, subscriptionId: data.id as string };
}

export async function getPayPalSubscription(subscriptionId: string) {
  const token = await getPayPalAccessToken();
  const response = await fetch(
    `${PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) return null;
  return response.json();
}

export function planFromPayPalPlanId(planId: string): PayPalPlanKey | null {
  if (planId === process.env.PAYPAL_PLAN_PROFESSIONAL) return "professional";
  if (planId === process.env.PAYPAL_PLAN_BUSINESS) return "business";
  return null;
}

/**
 * Verifies a PayPal webhook came from PayPal using the transmission headers and
 * the configured webhook ID. Without this, anyone could POST a fake
 * "subscription activated" event and unlock a paid plan for free.
 */
export async function verifyPayPalWebhook(
  headers: Headers,
  rawBody: string,
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) return false;

  const transmissionId = headers.get("paypal-transmission-id");
  const transmissionTime = headers.get("paypal-transmission-time");
  const transmissionSig = headers.get("paypal-transmission-sig");
  const certUrl = headers.get("paypal-cert-url");
  const authAlgo = headers.get("paypal-auth-algo");

  if (
    !transmissionId ||
    !transmissionTime ||
    !transmissionSig ||
    !certUrl ||
    !authAlgo
  ) {
    return false;
  }

  try {
    const token = await getPayPalAccessToken();
    const response = await fetch(
      `${PAYPAL_API}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transmission_id: transmissionId,
          transmission_time: transmissionTime,
          cert_url: certUrl,
          auth_algo: authAlgo,
          transmission_sig: transmissionSig,
          webhook_id: webhookId,
          webhook_event: JSON.parse(rawBody),
        }),
      },
    );

    if (!response.ok) return false;
    const data = (await response.json()) as { verification_status?: string };
    return data.verification_status === "SUCCESS";
  } catch {
    return false;
  }
}
