import { randomUUID } from "crypto";
import { ensureSchema, getSql, useDatabase } from "@/lib/db/client";
import type { CreateQuoteInput, Quote } from "./types";
import { readJsonFile, writeJsonFile } from "./store";

const QUOTES_FILE = "quotes.json";

async function ensureStoreJson(): Promise<Quote[]> {
  const quotes = await readJsonFile<Quote[]>(QUOTES_FILE, []);
  return quotes.map((quote) => ({
    ...quote,
    userId: quote.userId ?? "legacy",
  }));
}

async function writeStoreJson(quotes: Quote[]): Promise<void> {
  await writeJsonFile(QUOTES_FILE, quotes);
}

function mapQuoteRow(row: Record<string, unknown>): Quote {
  const rawLineItems = row.line_items;
  let lineItems: Quote["lineItems"];
  if (typeof rawLineItems === "string") {
    lineItems = JSON.parse(rawLineItems) as Quote["lineItems"];
  } else if (Array.isArray(rawLineItems)) {
    lineItems = rawLineItems as Quote["lineItems"];
  } else {
    lineItems = [];
  }

  return {
    id: String(row.id),
    userId: row.user_id as string,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    businessName: row.business_name as string,
    businessEmail: row.business_email as string,
    clientName: row.client_name as string,
    clientEmail: row.client_email as string,
    jobTitle: row.job_title as string,
    jobDescription: (row.job_description as string) ?? "",
    lineItems,
    depositPercent: Number(row.deposit_percent),
    status: row.status as Quote["status"],
    acceptedAt: row.accepted_at
      ? new Date(row.accepted_at as string).toISOString()
      : undefined,
    depositPaidAt: row.deposit_paid_at
      ? new Date(row.deposit_paid_at as string).toISOString()
      : undefined,
    stripeSessionId: (row.stripe_session_id as string) ?? undefined,
  };
}

export async function listQuotes(userId: string): Promise<Quote[]> {
  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM quotes WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
    return rows.map((row) => mapQuoteRow(row as Record<string, unknown>));
  }
  const quotes = await ensureStoreJson();
  return quotes
    .filter((quote) => quote.userId === userId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

export async function getQuote(id: string): Promise<Quote | null> {
  const quoteId = id.trim();
  if (!quoteId) return null;

  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT * FROM quotes WHERE id = ${quoteId} LIMIT 1`;
    return rows[0] ? mapQuoteRow(rows[0] as Record<string, unknown>) : null;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not configured on the live site. Quotes cannot be loaded.",
    );
  }

  const quotes = await ensureStoreJson();
  return quotes.find((quote) => quote.id === quoteId) ?? null;
}

export async function getQuoteForUser(
  id: string,
  userId: string,
): Promise<Quote | null> {
  const quote = await getQuote(id);
  if (!quote || quote.userId !== userId) return null;
  return quote;
}

export async function createQuote(
  userId: string,
  input: CreateQuoteInput,
): Promise<Quote> {
  const now = new Date().toISOString();
  const quote: Quote = {
    id: randomUUID(),
    userId,
    createdAt: now,
    updatedAt: now,
    businessName: input.businessName.trim(),
    businessEmail: input.businessEmail.trim(),
    clientName: input.clientName.trim(),
    clientEmail: input.clientEmail.trim(),
    jobTitle: input.jobTitle.trim(),
    jobDescription: input.jobDescription.trim(),
    lineItems: input.lineItems.map((item) => ({
      id: randomUUID(),
      description: item.description.trim(),
      quantity: item.quantity,
      unitPricePence: item.unitPricePence,
    })),
    depositPercent: input.depositPercent,
    status: "sent",
  };

  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();
    await sql`
      INSERT INTO quotes (
        id, user_id, created_at, updated_at, business_name, business_email,
        client_name, client_email, job_title, job_description, line_items,
        deposit_percent, status
      ) VALUES (
        ${quote.id}, ${quote.userId}, ${quote.createdAt}, ${quote.updatedAt},
        ${quote.businessName}, ${quote.businessEmail}, ${quote.clientName},
        ${quote.clientEmail}, ${quote.jobTitle}, ${quote.jobDescription},
        ${JSON.stringify(quote.lineItems)}, ${quote.depositPercent}, ${quote.status}
      )
    `;
    return quote;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "DATABASE_URL is not configured on the live site. Quotes cannot be saved.",
    );
  }

  const quotes = await ensureStoreJson();
  quotes.push(quote);
  await writeStoreJson(quotes);
  return quote;
}

export async function updateQuoteStatus(
  id: string,
  status: Quote["status"],
  extra: Partial<Quote> = {},
): Promise<Quote | null> {
  const existing = await getQuote(id);
  if (!existing) return null;

  const updated: Quote = {
    ...existing,
    ...extra,
    status,
    updatedAt: new Date().toISOString(),
  };

  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();
    await sql`
      UPDATE quotes SET
        status = ${updated.status},
        updated_at = ${updated.updatedAt},
        accepted_at = ${updated.acceptedAt ?? null},
        deposit_paid_at = ${updated.depositPaidAt ?? null},
        stripe_session_id = ${updated.stripeSessionId ?? null}
      WHERE id = ${id}
    `;
    return updated;
  }

  const quotes = await ensureStoreJson();
  const index = quotes.findIndex((quote) => quote.id === id);
  if (index === -1) return null;
  quotes[index] = updated;
  await writeStoreJson(quotes);
  return updated;
}
