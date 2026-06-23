import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { getQuotePublicUrl } from "@/lib/app-url";
import { sendQuoteToClientEmail } from "@/lib/email";
import {
  depositPence,
  formatGBP,
  formatQuoteRef,
  quoteTotalPence,
} from "@/lib/format";
import { createQuote, listQuotes } from "@/lib/quotes-store";
import { hasActiveSubscription } from "@/lib/subscription";
import type { CreateQuoteInput } from "@/lib/types";

type CreateQuoteBody = CreateQuoteInput & { sendToClient?: boolean };

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const quotes = await listQuotes(session.userId);
  return NextResponse.json({ quotes });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  try {
    const user = await findUserById(session.userId);
    if (!user || !hasActiveSubscription(user)) {
      return NextResponse.json(
        {
          error:
            "Your free trial has ended. Subscribe via PayPal on the billing page to create quotes.",
        },
        { status: 402 },
      );
    }

    const body = (await request.json()) as CreateQuoteBody;

    if (
      !body.clientName ||
      !body.clientEmail ||
      !body.jobTitle ||
      !body.lineItems?.length
    ) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    if (body.depositPercent < 0 || body.depositPercent > 100) {
      return NextResponse.json(
        { error: "Deposit must be between 0 and 100." },
        { status: 400 },
      );
    }

    const quote = await createQuote(session.userId, {
      ...body,
      businessName: body.businessName?.trim() || session.businessName,
      businessEmail: body.businessEmail?.trim() || session.email,
    });

    let emailed = false;
    if (body.sendToClient) {
      try {
        const quoteUrl = getQuotePublicUrl(quote.id);
        const total = quoteTotalPence(quote.lineItems);
        const deposit = depositPence(total, quote.depositPercent);

        await sendQuoteToClientEmail({
          to: quote.clientEmail,
          clientName: quote.clientName,
          businessName: quote.businessName,
          jobTitle: quote.jobTitle,
          quoteRef: formatQuoteRef(quote.id),
          depositLabel: formatGBP(deposit),
          quoteUrl,
        });
        emailed = true;
      } catch (error) {
        console.error("Quote created but email failed:", error);
      }
    }

    return NextResponse.json({ quote, emailed }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create quote." },
      { status: 500 },
    );
  }
}
