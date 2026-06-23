import { NextResponse } from "next/server";
import { getQuote, updateQuoteStatus } from "@/lib/quotes-store";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const quote = await getQuote(id);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  const updated = await updateQuoteStatus(id, "deposit_paid", {
    depositPaidAt: new Date().toISOString(),
  });

  return NextResponse.json({ quote: updated });
}
