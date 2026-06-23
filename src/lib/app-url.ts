/** Public site origin for links in emails and Stripe redirects. */
export function getAppOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim().replace(/\/$/, "");

  if (configured && !configured.includes("localhost")) {
    return configured;
  }

  const vercel = process.env.VERCEL_URL?.trim().replace(/\/$/, "");
  if (vercel) {
    return vercel.startsWith("http") ? vercel : `https://${vercel}`;
  }

  if (configured) return configured;
  return "http://localhost:3000";
}

export function getQuotePublicUrl(quoteId: string): string {
  return `${getAppOrigin()}/q/${quoteId}`;
}
