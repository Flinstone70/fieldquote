import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { sendQuoteToClientEmail } from "@/lib/email";
import { getQuoteForUser } from "@/lib/quotes-store";
import {
  depositPence,
  formatGBP,
  formatQuoteRef,
  quoteTotalPence,
} from "@/lib/format";

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

  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const quoteUrl = `${origin.replace(/\/$/, "")}/q/${quote.id}`;
  const total = quoteTotalPence(quote.lineItems);
  const deposit = depositPence(total, quote.depositPercent);

  try {
    await sendQuoteToClientEmail({
      to: quote.clientEmail,
      clientName: quote.clientName,
      businessName: quote.businessName,
      jobTitle: quote.jobTitle,
      quoteRef: formatQuoteRef(quote.id),
      depositLabel: formatGBP(deposit),
      quoteUrl,
    });

    return NextResponse.json({ ok: true, sentTo: quote.clientEmail });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not send quote email.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
