import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { createPayPalSubscription } from "@/lib/paypal";
import { hasActiveSubscription } from "@/lib/subscription";
import type { PayPalPlanKey } from "@/lib/types";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const plan = body.plan as PayPalPlanKey;
    if (plan !== "professional" && plan !== "business") {
      return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
    }

    const user = await findUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    if (user.subscriptionStatus === "active" && hasActiveSubscription(user)) {
      return NextResponse.json(
        { error: "You already have an active subscription." },
        { status: 400 },
      );
    }

    const { approvalUrl } = await createPayPalSubscription({
      plan,
      userId: user.id,
      businessName: user.businessName,
      email: user.email,
    });

    return NextResponse.json({ approvalUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not start PayPal checkout.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
