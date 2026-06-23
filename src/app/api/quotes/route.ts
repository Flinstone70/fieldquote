import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { createQuote, listQuotes } from "@/lib/quotes-store";
import { hasActiveSubscription } from "@/lib/subscription";
import type { CreateQuoteInput } from "@/lib/types";

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

    const body = (await request.json()) as CreateQuoteInput;

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
    return NextResponse.json({ quote }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create quote." },
      { status: 500 },
    );
  }
}
