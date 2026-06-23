import { NextResponse } from "next/server";
import { getQuote, updateQuoteStatus } from "@/lib/quotes-store";
import { createDepositCheckoutSession, isStripeConfigured } from "@/lib/stripe";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
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
    const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const session = await createDepositCheckoutSession(quote, origin);

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
