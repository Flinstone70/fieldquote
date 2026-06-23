import { after } from "next/server";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { sendQuoteToClientEmail } from "@/lib/email";
import { getQuoteForUser } from "@/lib/quotes-store";
import { getQuotePublicUrl } from "@/lib/app-url";
import {
  depositPence,
  formatGBP,
  formatQuoteRef,
  quoteTotalPence,
} from "@/lib/format";

export const maxDuration = 30;

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

  const quoteUrl = getQuotePublicUrl(quote.id);
  const total = quoteTotalPence(quote.lineItems);
  const deposit = depositPence(total, quote.depositPercent);

  const emailInput = {
    to: quote.clientEmail,
    clientName: quote.clientName,
    businessName: quote.businessName,
    jobTitle: quote.jobTitle,
    quoteRef: formatQuoteRef(quote.id),
    depositLabel: formatGBP(deposit),
    quoteUrl,
  };

  after(async () => {
    try {
      await sendQuoteToClientEmail(emailInput);
    } catch (error) {
      console.error("Background quote email failed:", error);
    }
  });

  return NextResponse.json({
    ok: true,
    queued: true,
    sentTo: quote.clientEmail,
    quoteUrl,
  });
}
