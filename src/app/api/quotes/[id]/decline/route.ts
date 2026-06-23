import { NextResponse } from "next/server";
import { getQuote, updateQuoteStatus } from "@/lib/quotes-store";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
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
