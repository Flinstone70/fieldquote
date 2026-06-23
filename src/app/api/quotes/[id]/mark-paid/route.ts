import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getQuoteForUser, updateQuoteStatus } from "@/lib/quotes-store";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const { id } = await params;
  const quote = await getQuoteForUser(id, session.userId);
  if (!quote) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  const updated = await updateQuoteStatus(id, "deposit_paid", {
    depositPaidAt: new Date().toISOString(),
  });

  return NextResponse.json({ quote: updated });
}
