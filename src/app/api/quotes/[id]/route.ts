import { NextResponse } from "next/server";
import { getQuote } from "@/lib/quotes-store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const quote = await getQuote(id);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  return NextResponse.json({ quote });
}
