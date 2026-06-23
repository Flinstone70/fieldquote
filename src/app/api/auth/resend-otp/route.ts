import { NextResponse } from "next/server";
import {
  createPendingToken,
  getPendingAuth,
  setPendingCookie,
} from "@/lib/auth/session";
import { createOtp, findUserById, purgeExpiredOtps } from "@/lib/auth/users";
import { devOtpCode, sendOtpEmail } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const pending = await getPendingAuth();
    if (!pending) {
      return NextResponse.json(
        { error: "Session expired. Start again." },
        { status: 401 },
      );
    }

    const ip = getClientIp(request);
    const limit = await rateLimit(`resend:${pending.userId}:${ip}`, 5, 600);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many code requests. Please wait a few minutes." },
        { status: 429 },
      );
    }

    const user = await findUserById(pending.userId);
    if (!user) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    await purgeExpiredOtps();
    const { code } = await createOtp(user.id, user.email, pending.purpose);
    try {
      await sendOtpEmail({
        to: user.email,
        code,
        purpose: pending.purpose,
        businessName: user.businessName,
      });
    } catch (emailError) {
      if (process.env.NODE_ENV === "production") throw emailError;
      console.error("Dev: OTP email failed, using on-screen code.", emailError);
    }

    await setPendingCookie(
      await createPendingToken({
        userId: user.id,
        email: user.email,
        purpose: pending.purpose,
      }),
    );

    return NextResponse.json({ ok: true, email: user.email, devCode: devOtpCode(code) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not resend code.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
