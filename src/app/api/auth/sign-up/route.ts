import { NextResponse } from "next/server";
import {
  hashPassword,
  validatePassword,
  validateWorkEmail,
} from "@/lib/auth/password";
import {
  createPendingToken,
  setPendingCookie,
} from "@/lib/auth/session";
import {
  createOtp,
  createUser,
  findUserByEmail,
  purgeExpiredOtps,
} from "@/lib/auth/users";
import { databaseErrorMessage } from "@/lib/db/client";
import { devOtpCode, sendOtpEmail } from "@/lib/email";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await rateLimit(`signup:${ip}`, 5, 600);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many sign-up attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const businessName = String(body.businessName ?? "").trim();
    const email = String(body.email ?? "");
    const password = String(body.password ?? "");

    if (!businessName) {
      return NextResponse.json(
        { error: "Enter your company or trading name." },
        { status: 400 },
      );
    }

    const emailError = validateWorkEmail(email);
    if (emailError) {
      return NextResponse.json({ error: emailError }, { status: 400 });
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Sign in instead." },
        { status: 409 },
      );
    }

    await purgeExpiredOtps();
    const passwordHash = await hashPassword(password);
    const user = await createUser({ email, passwordHash, businessName });
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
      email: user.email,
      message: "Verification code sent to your email.",
      devCode: devOtpCode(code),
    });
  } catch (error) {
    console.error("Sign-up failed:", error);
    return NextResponse.json(
      { error: databaseErrorMessage(error) },
      { status: 500 },
    );
  }
}
