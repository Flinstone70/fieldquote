import { getAppOrigin } from "@/lib/app-url";
import Stripe from "stripe";
import { depositPence, quoteTotalPence } from "./format";
import type { Quote } from "./types";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(key);
}

export async function createDepositCheckoutSession(
  quote: Quote,
  _origin?: string,
): Promise<Stripe.Checkout.Session> {
  const stripe = getStripe();
  const total = quoteTotalPence(quote.lineItems);
  const deposit = depositPence(total, quote.depositPercent);
  const origin = getAppOrigin();

  return stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: quote.clientEmail,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "gbp",
          unit_amount: deposit,
          product_data: {
            name: `${quote.jobTitle} — deposit`,
            description: `${quote.depositPercent}% deposit for ${quote.businessName}`,
          },
        },
      },
    ],
    metadata: {
      quoteId: quote.id,
    },
    success_url: `${origin}/q/${quote.id}?paid=1`,
    cancel_url: `${origin}/q/${quote.id}?cancelled=1`,
  });
}
