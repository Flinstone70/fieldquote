import { after, NextResponse } from "next/server";
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
import { validateWorkEmail } from "@/lib/auth/password";
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
      !body.clientName?.trim() ||
      !body.clientEmail?.trim() ||
      !body.jobTitle?.trim() ||
      !body.lineItems?.length
    ) {
      return NextResponse.json(
        { error: "Please fill in all required fields." },
        { status: 400 },
      );
    }

    if (validateWorkEmail(body.clientEmail)) {
      return NextResponse.json(
        { error: "Enter a valid client email address." },
        { status: 400 },
      );
    }

    if (body.lineItems.length > 100) {
      return NextResponse.json(
        { error: "A quote can have at most 100 line items." },
        { status: 400 },
      );
    }

    const invalidLineItem = body.lineItems.some((item) => {
      const qty = Number(item?.quantity);
      const price = Number(item?.unitPricePence);
      return (
        !item?.description?.trim() ||
        !Number.isFinite(qty) ||
        qty <= 0 ||
        qty > 1_000_000 ||
        !Number.isFinite(price) ||
        price < 0 ||
        price > 1_000_000_00
      );
    });
    if (invalidLineItem) {
      return NextResponse.json(
        {
          error:
            "Each line item needs a description, a quantity above zero, and a valid price.",
        },
        { status: 400 },
      );
    }

    const depositPercent = Number(body.depositPercent);
    if (!Number.isFinite(depositPercent) || depositPercent < 0 || depositPercent > 100) {
      return NextResponse.json(
        { error: "Deposit must be between 0 and 100." },
        { status: 400 },
      );
    }

    const quote = await createQuote(session.userId, {
      ...body,
      depositPercent,
      lineItems: body.lineItems.map((item) => ({
        description: String(item.description),
        quantity: Number(item.quantity),
        unitPricePence: Math.round(Number(item.unitPricePence)),
      })),
      businessName: body.businessName?.trim() || session.businessName,
      businessEmail: body.businessEmail?.trim() || session.email,
    });

    let emailed = false;
    if (body.sendToClient) {
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

      emailed = true;
    }

    return NextResponse.json({ quote, emailed }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Could not create quote." },
      { status: 500 },
    );
  }
}
