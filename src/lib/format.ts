export function formatGBP(pence: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(pence / 100);
}

export function quoteTotalPence(lineItems: { quantity: number; unitPricePence: number }[]): number {
  return lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPricePence,
    0,
  );
}

export function depositPence(totalPence: number, depositPercent: number): number {
  return Math.round(totalPence * (depositPercent / 100));
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatQuoteRef(id: string): string {
  return `FQ-${id.slice(0, 8).toUpperCase()}`;
}
