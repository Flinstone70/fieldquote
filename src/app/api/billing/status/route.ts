import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { findUserById } from "@/lib/auth/users";
import { userToSession } from "@/lib/db/mappers";
import { paidPlans } from "@/lib/pricing";
import { hasActiveSubscription, subscriptionLabel } from "@/lib/subscription";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorised." }, { status: 401 });
  }

  const user = await findUserById(session.userId);
  if (!user) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  return NextResponse.json({
    user: userToSession(user),
    label: subscriptionLabel(user),
    canCreateQuotes: hasActiveSubscription(user),
    plans: {
      professional: {
        price: paidPlans.find((p) => p.plan === "professional")?.price ?? "£79",
        name: "Professional",
      },
      business: {
        price: paidPlans.find((p) => p.plan === "business")?.price ?? "£149",
        name: "Business",
      },
    },
  });
}
