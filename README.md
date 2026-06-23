# FieldQuote (Archived / Paused)

Project status: paused on `2026-06-24`  
Current branch: `main`  
Last known good deployed commit: `00d1d4e`

This repository is intentionally archived for now so work is preserved and easy to restart later.

## What FieldQuote Is

FieldQuote is a SaaS app for trades and field-service businesses to:

- create professional quotes
- send client quote links
- track accept/decline/payment status
- run subscription billing (PayPal)

## Current Product State

- Auth and guards are implemented (OTP + session checks + route protection).
- PayPal subscription flow is implemented (sandbox and live-ready).
- PayPal webhook signature verification is implemented.
- Rate limiting and core security headers are implemented.
- Pricing ladder is implemented:
  - Free Trial: 14 days
  - Professional: £79/month (up to 50 quotes/month)
  - Business: £149/month (unlimited quotes)

## Quick Restart

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env template and fill values:

   ```bash
   cp .env.example .env.local
   ```

3. Run local app:

   ```bash
   npm run dev
   ```

4. Build check:

   ```bash
   npm run build
   ```

## Environment Variables (Core)

- `AUTH_SECRET`
- `DATABASE_URL`
- `NEXT_PUBLIC_APP_URL`
- `PAYPAL_MODE`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_PLAN_PROFESSIONAL`
- `PAYPAL_PLAN_BUSINESS`
- `PAYPAL_WEBHOOK_ID`

Optional:

- SMTP or Resend env vars for email sending
- Stripe env vars for deposit collection

## Before Relaunching

Follow [docs/ARCHIVE_NOTES.md](docs/ARCHIVE_NOTES.md) for:

- legal/policy checklist
- sandbox-to-live checklist
- parent-approval summary
- rollback plan

## Notes

- Repository may contain additional local unstaged edits from experiments.
- Do not use this README as legal advice; validate legal/tax requirements with local professionals before launch.
