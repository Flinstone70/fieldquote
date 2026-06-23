import { neon } from "@neondatabase/serverless";

let schemaReady: Promise<void> | null = null;

/** Strip common paste mistakes from Vercel / Neon dashboard copies. */
export function normaliseDatabaseUrl(raw: string): string {
  let url = raw.trim();
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }
  return url;
}

export function useDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getSql() {
  const url = normaliseDatabaseUrl(process.env.DATABASE_URL ?? "");
  if (!url) {
    throw new Error("DATABASE_URL is not configured.");
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
      throw new Error("DATABASE_URL must start with postgresql://");
    }
  } catch {
    throw new Error(
      "DATABASE_URL is not a valid connection string. Copy the pooled URL from Neon (Connect → Connection string).",
    );
  }
  return neon(url);
}

/** Turn low-level Neon fetch errors into actionable setup hints. */
export function databaseErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message.includes("fetch failed") ||
    message.includes("Error connecting to database")
  ) {
    return (
      "Could not reach the database. On Vercel, check DATABASE_URL (Neon pooled connection string, no quotes), " +
      "confirm the Neon project is active at neon.tech, then redeploy."
    );
  }
  if (message.includes("DATABASE_URL")) {
    return message;
  }
  return "Could not save account. Please try again in a moment.";
}

export async function ensureSchema(): Promise<void> {
  if (!useDatabase()) return;
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getSql();
      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          business_name TEXT NOT NULL,
          email_verified BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL,
          trial_ends_at TIMESTAMPTZ NOT NULL,
          subscription_plan TEXT NOT NULL DEFAULT 'none',
          subscription_status TEXT NOT NULL DEFAULT 'trialing',
          paypal_subscription_id TEXT
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS otps (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          email TEXT NOT NULL,
          code TEXT NOT NULL,
          purpose TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          used BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS quotes (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL,
          business_name TEXT NOT NULL,
          business_email TEXT NOT NULL,
          client_name TEXT NOT NULL,
          client_email TEXT NOT NULL,
          job_title TEXT NOT NULL,
          job_description TEXT NOT NULL DEFAULT '',
          line_items JSONB NOT NULL,
          deposit_percent INTEGER NOT NULL,
          status TEXT NOT NULL,
          accepted_at TIMESTAMPTZ,
          deposit_paid_at TIMESTAMPTZ,
          stripe_session_id TEXT
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON quotes(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_otps_user_id ON otps(user_id)`;
    })();
  }
  await schemaReady;
}
