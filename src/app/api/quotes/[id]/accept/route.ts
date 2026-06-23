import { NextResponse } from "next/server";
import { getQuote, updateQuoteStatus } from "@/lib/quotes-store";
import { createDepositCheckoutSession, isStripeConfigured } from "@/lib/stripe";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  const limit = await rateLimit(`accept:${getClientIp(request)}`, 20, 300);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const quote = await getQuote(id);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  if (quote.status !== "sent") {
    return NextResponse.json(
      { error: "This quote has already been actioned." },
      { status: 400 },
    );
  }

  if (isStripeConfigured()) {
    const session = await createDepositCheckoutSession(quote);

    await updateQuoteStatus(id, "accepted", {
      acceptedAt: new Date().toISOString(),
      stripeSessionId: session.id,
    });

    return NextResponse.json({
      quote: await getQuote(id),
      checkoutUrl: session.url,
    });
  }

  const updated = await updateQuoteStatus(id, "deposit_paid", {
    acceptedAt: new Date().toISOString(),
    depositPaidAt: new Date().toISOString(),
  });

  return NextResponse.json({ quote: updated });
}
