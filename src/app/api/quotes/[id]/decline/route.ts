import { NextResponse } from "next/server";
import { getQuote, updateQuoteStatus } from "@/lib/quotes-store";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;

  const limit = await rateLimit(`decline:${getClientIp(request)}`, 20, 300);
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
      { error: "This quote can no longer be declined." },
      { status: 400 },
    );
  }

  const updated = await updateQuoteStatus(id, "declined");
  return NextResponse.json({ quote: updated });
}
