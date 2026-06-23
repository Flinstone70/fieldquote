/**
 * Creates PayPal subscription plans in sandbox (or live if PAYPAL_MODE=live).
 * Run: node scripts/setup-paypal-plans.mjs
 *
 * Requires PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in environment.
 */

const mode = process.env.PAYPAL_MODE === "live" ? "live" : "sandbox";
const api =
  mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function token() {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) throw new Error("Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET");

  const auth = Buffer.from(`${id}:${secret}`).toString("base64");
  const res = await fetch(`${api}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.access_token;
}

async function createProduct(accessToken) {
  const res = await fetch(`${api}/v1/catalogs/products`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "FieldQuote",
      description: "Premium quoting for UK trades",
      type: "SERVICE",
      category: "SOFTWARE",
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.id;
}

async function createPlan(accessToken, productId, name, price) {
  const res = await fetch(`${api}/v1/billing/plans`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      name,
      description: `${name} monthly subscription`,
      billing_cycles: [
        {
          frequency: { interval_unit: "MONTH", interval_count: 1 },
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: { value: price, currency_code: "GBP" },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        payment_failure_threshold: 2,
      },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data));
  return data.id;
}

async function main() {
  const accessToken = await token();
  const productId = await createProduct(accessToken);
  const professional = await createPlan(
    accessToken,
    productId,
    "FieldQuote Professional",
    "79.00",
  );
  const business = await createPlan(
    accessToken,
    productId,
    "FieldQuote Business",
    "149.00",
  );

  console.log("\nAdd these to Vercel / .env.local:\n");
  console.log(`PAYPAL_PLAN_PROFESSIONAL=${professional}`);
  console.log(`PAYPAL_PLAN_BUSINESS=${business}`);
  console.log(`\nPayPal mode: ${mode}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
