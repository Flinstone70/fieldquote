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
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
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

    await sendOtpEmail({
      to: user.email,
      code,
      purpose: "email_verify",
      businessName: user.businessName,
    });

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
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not create account.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
