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
import { sendOtpEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
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
        needsEmailVerification: true,
        email: user.email,
      });
    }

    await purgeExpiredOtps();
    const { code } = await createOtp(user.id, user.email, "login");
    await sendOtpEmail({
      to: user.email,
      code,
      purpose: "login",
      businessName: user.businessName,
    });
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
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not sign in.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
