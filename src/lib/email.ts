import nodemailer, { type Transporter } from "nodemailer";
import { uk } from "@/lib/uk-copy";

type EmailPayload = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

let smtpTransport: Transporter | null = null;

function hasSmtpConfig(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY) || hasSmtpConfig();
}

/**
 * In local development we reveal the OTP to the client so sign-in works without
 * a configured email provider. In production this always returns undefined so
 * codes are only ever delivered by email.
 */
export function devOtpCode(code: string): string | undefined {
  if (process.env.NODE_ENV === "production") return undefined;
  return code;
}

function getSmtpTransport(): Transporter {
  if (smtpTransport) return smtpTransport;

  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASS!;
  const host = process.env.SMTP_HOST ?? "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT ?? "587");

  smtpTransport = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 1,
    maxMessages: 100,
    connectionTimeout: 8_000,
    greetingTimeout: 8_000,
    socketTimeout: 12_000,
  });

  return smtpTransport;
}

async function sendViaSmtp(payload: EmailPayload): Promise<void> {
  const user = process.env.SMTP_USER!;
  const from = process.env.EMAIL_FROM ?? `${uk.brand} <${user}>`;
  const transport = getSmtpTransport();

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

export type QuoteEmailInput = {
  to: string;
  clientName: string;
  businessName: string;
  jobTitle: string;
  quoteRef: string;
  depositLabel: string;
  quoteUrl: string;
};

export function buildQuoteEmailPayload(input: QuoteEmailInput): EmailPayload {
  const subject = `Quote from ${input.businessName} — ${input.jobTitle}`;
  const text = `Hi ${input.clientName},

${input.businessName} has sent you a quote for ${input.jobTitle}.

Reference: ${input.quoteRef}
Deposit to secure booking: ${input.depositLabel}

Open your quote:
${input.quoteUrl}

${uk.brand}`;

  const html = `<!DOCTYPE html>
<html>
<body style="margin:0;padding:24px;font-family:system-ui,sans-serif;background:#fafafa;color:#0a0a0a">
  <div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:16px;padding:28px">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:#737373">${uk.brand}</p>
    <h1 style="margin:0 0 12px;font-size:22px;font-weight:600">Quote from ${input.businessName}</h1>
    <p style="margin:0 0 16px;color:#525252;line-height:1.6">Hi ${input.clientName}, you have a quote for <strong>${input.jobTitle}</strong>.</p>
    <p style="margin:0 0 20px;padding:14px 16px;background:#fafafa;border-radius:12px;font-size:14px;line-height:1.6">
      Ref: ${input.quoteRef}<br/>Deposit: <strong>${input.depositLabel}</strong>
    </p>
    <a href="${input.quoteUrl}" style="display:inline-block;background:#0a0a0a;color:#fff;text-decoration:none;padding:14px 22px;border-radius:999px;font-size:14px;font-weight:600">
      View quote &amp; pay deposit
    </a>
    <p style="margin:20px 0 0;font-size:12px;color:#737373;word-break:break-all">${input.quoteUrl}</p>
  </div>
</body>
</html>`;

  return { to: input.to, subject, text, html };
}

export async function sendQuoteToClientEmail(input: QuoteEmailInput): Promise<void> {
  await sendEmail(buildQuoteEmailPayload(input));
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
