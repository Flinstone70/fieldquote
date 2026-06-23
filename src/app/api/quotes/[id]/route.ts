import { NextResponse } from "next/server";
import { requireSessionApi } from "@/lib/auth/guards";
import { getQuoteForUser } from "@/lib/quotes-store";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireSessionApi();
  if (auth.error) return auth.error;

  const { id } = await params;
  const quote = await getQuoteForUser(id, auth.session.userId);

  if (!quote) {
    return NextResponse.json({ error: "Quote not found." }, { status: 404 });
  }

  return NextResponse.json({ quote });
}
