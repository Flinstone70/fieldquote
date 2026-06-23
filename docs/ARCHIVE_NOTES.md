# Archive Notes

Updated: 2026-06-24  
Status: project paused intentionally

## Why This Exists

This file preserves a clean restart path for FieldQuote and gives a parent-safe checklist for relaunching in a legal, low-risk way.

## Current Known Good State

- App runs and builds with Next.js 16.
- Security hardening in place:
  - webhook signature verification for PayPal
  - rate limiting on auth and public mutation endpoints
  - OTP brute-force protection
  - security headers in `next.config.ts`
- Billing status and plan messaging are aligned with `src/lib/pricing.ts`.

## Parent-Approval Summary (Plain English)

- Business model: software subscription (standard SaaS model).
- Payments: handled by PayPal/Stripe (regulated processors).
- Card storage: app does not store raw card details.
- Data controls: login + route guards + tenant isolation + security headers.
- Remaining responsibility: legal pages, tax registration, and business setup must be completed before real sales.

## Relaunch Checklist

## 1) Product Readiness

- [ ] Run `npm run build` locally.
- [ ] Verify sign-up/sign-in/OTP flow.
- [ ] Verify quote creation and client link rendering.
- [ ] Verify billing page plan copy and limits.

## 2) Legal & Trust

- [ ] Add Terms of Service page.
- [ ] Add Privacy Policy page.
- [ ] Add Refund/Cancellation Policy page.
- [ ] Link all policies from footer.
- [ ] Add support email/contact details.

## 3) Sandbox Verification

- [ ] `PAYPAL_MODE=sandbox`.
- [ ] Create sandbox plans (`npm run paypal:plans`).
- [ ] Confirm webhook URL and webhook ID configured.
- [ ] Complete end-to-end sandbox subscription test.
- [ ] Confirm account unlocks after webhook activation.

## 4) Live Go-Live (Only After Approval)

- [ ] Upgrade to PayPal Business.
- [ ] Create live app credentials.
- [ ] Create live subscription plans.
- [ ] Configure live webhook and `PAYPAL_WEBHOOK_ID`.
- [ ] Set Vercel env vars for Production.
- [ ] Redeploy and run one real low-risk purchase test.

## 5) Rollback Plan

If live launch has issues:

1. Set `PAYPAL_MODE=sandbox`.
2. Restore previous working env vars.
3. Redeploy on Vercel.
4. Pause outbound subscriptions until issue is fixed.

## Files To Check First On Restart

- `src/lib/pricing.ts`
- `src/app/dashboard/billing/page.tsx`
- `src/app/api/paypal/subscribe/route.ts`
- `src/app/api/webhooks/paypal/route.ts`
- `src/lib/rate-limit.ts`
- `src/lib/auth/guards.ts`
- `.env.example`

## Known Local Working-Tree Edits (Not Archived Here)

As of archive time, there were local unstaged changes in:

- `scripts/setup-paypal-plans.mjs`
- `src/app/q/[id]/page.tsx`
- `src/components/ClientQuoteView.tsx`

Review these before next push so accidental experiments are not published.
