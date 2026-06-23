import { NextResponse } from "next/server";
import { verifyPassword, validateWorkEmail } from "@/lib/auth/password";
import {
  createPendingToken,
  setPendingCookie,
} from "@/lib/auth/session";
import {
  createOtp,
  findUserByEmail,
  purgeExpiredOtps,
} from "@/lib/auth/users";
import { devOtpCode, sendOtpEmail } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimit(`signin:${ip}`, 10, 300);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please try again in a few minutes." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");

    const emailError = validateWorkEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 },
      );
    }

    if (!user.emailVerified) {
      await purgeExpiredOtps();
      const { code } = await createOtp(user.id, user.email, "email_verify");
      try {
        await sendOtpEmail({
          to: user.email,
          code,
          purpose: "email_verify",
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
          purpose: "email_verify",
        }),
      );
      return NextResponse.json({
        ok: true,
        needsEmailVerification: true,
        email: user.email,
        devCode: devOtpCode(code),
      });
    }

    await purgeExpiredOtps();
    const { code } = await createOtp(user.id, user.email, "login");
    try {
      await sendOtpEmail({
        to: user.email,
        code,
        purpose: "login",
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
        purpose: "login",
      }),
    );

    return NextResponse.json({
      ok: true,
      needsLoginOtp: true,
      email: user.email,
      devCode: devOtpCode(code),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not sign in.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
