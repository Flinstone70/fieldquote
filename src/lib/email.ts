import nodemailer from "nodemailer";
import { uk } from "@/lib/uk-copy";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function hasSmtpConfig(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

async function sendViaSmtp(payload: EmailPayload): Promise<void> {
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "587");
  const from = process.env.EMAIL_FROM ?? `${uk.brand} <${user}>`;

  const transport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  await transport.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}

async function sendViaResend(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY!;
  const from =
    process.env.EMAIL_FROM ?? `${uk.brand} <${uk.supportEmail}>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Email delivery failed: ${body}`);
  }
}

function logDevEmail(payload: EmailPayload): void {
  console.log("\n========== FIELDQUOTE EMAIL (dev mode) ==========");
  console.log(`To: ${payload.to}`);
  console.log(`Subject: ${payload.subject}`);
  console.log(payload.text);
  console.log("=================================================\n");
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  if (process.env.RESEND_API_KEY) {
    await sendViaResend(payload);
    return;
  }

  if (hasSmtpConfig()) {
    await sendViaSmtp(payload);
    return;
  }

  if (process.env.NODE_ENV !== "production") {
    logDevEmail(payload);
    return;
  }

  throw new Error(
    "No email provider configured. Set SMTP_USER + SMTP_PASS (free Gmail) or RESEND_API_KEY on Vercel.",
  );
}

export async function sendOtpEmail(input: {
  to: string;
  code: string;
  purpose: "email_verify" | "login";
  businessName?: string;
}): Promise<void> {
  const subject =
    input.purpose === "email_verify"
      ? `${uk.brand} — verify your work email`
      : `${uk.brand} — your sign-in code`;

  const intro =
    input.purpose === "email_verify"
      ? `Welcome${input.businessName ? ` to ${uk.brand}, ${input.businessName}` : ""}. Verify your work email to activate your company account.`
      : "Use this one-time passcode to sign in to your FieldQuote account.";

  const text = `${intro}

Your code: ${input.code}

This code expires in 10 minutes. If you did not request this, you can ignore this email.

${uk.brand} · ${uk.country}`;

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:520px;margin:0 auto;color:#0a0a0a">
      <p style="color:#737373;font-size:12px;text-transform:uppercase;letter-spacing:.15em">${uk.brand}</p>
      <h1 style="font-size:22px;font-weight:600">${subject}</h1>
      <p style="color:#525252;line-height:1.6">${intro}</p>
      <p style="font-size:32px;font-weight:700;letter-spacing:.25em;margin:24px 0">${input.code}</p>
      <p style="color:#737373;font-size:14px">Expires in 10 minutes. Never share this code with anyone.</p>
    </div>
  `;

  await sendEmail({ to: input.to, subject, text, html });
}

export async function sendSubscriptionActiveEmail(input: {
  to: string;
  businessName: string;
  planLabel: string;
}): Promise<void> {
  const subject = `${uk.brand} subscription active`;
  const text = `Hi ${input.businessName},

Your ${input.planLabel} subscription is now active. You can sign in and start sending client quotes immediately.

${uk.brand}`;

  await sendEmail({
    to: input.to,
    subject,
    text,
    html: `<p>${text.replace(/\n/g, "<br/>")}</p>`,
  });
}
