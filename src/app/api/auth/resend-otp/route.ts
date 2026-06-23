import { NextResponse } from "next/server";
import {
  createPendingToken,
  getPendingAuth,
  setPendingCookie,
} from "@/lib/auth/session";
import { createOtp, findUserById, purgeExpiredOtps } from "@/lib/auth/users";
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const pending = await getPendingAuth();
    if (!pending) {
      return NextResponse.json(
        { error: "Session expired. Start again." },
        { status: 401 },
      );
    }

    const user = await findUserById(pending.userId);
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    await purgeExpiredOtps();
    const { code } = await createOtp(user.id, user.email, pending.purpose);
    await sendOtpEmail({
      to: user.email,
      code,
      purpose: pending.purpose,
      businessName: user.businessName,
    });

    await setPendingCookie(
      await createPendingToken({
        userId: user.id,
        email: user.email,
        purpose: pending.purpose,
      }),
    );

    return NextResponse.json({ ok: true, email: user.email });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not resend code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
