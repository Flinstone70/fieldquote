import { randomInt, randomUUID } from "crypto";
import { ensureSchema, getSql, useDatabase } from "@/lib/db/client";
import { rowToUser } from "@/lib/db/mappers";
import { readJsonFile, writeJsonFile } from "@/lib/store";
import { normaliseEmail } from "@/lib/auth/password";
import { getTrialEndDate } from "@/lib/subscription";
import type { OtpPurpose, OtpRecord, SubscriptionPlan, SubscriptionStatus, User } from "@/lib/types";

const USERS_FILE = "users.json";
const OTPS_FILE = "otps.json";
const OTP_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function normaliseUser(user: User): User {
  return {
    ...user,
    trialEndsAt: user.trialEndsAt ?? getTrialEndDate(new Date(user.createdAt)),
    subscriptionPlan: user.subscriptionPlan ?? "none",
    subscriptionStatus: user.subscriptionStatus ?? "trialing",
  };
}

async function listUsersJson(): Promise<User[]> {
  const users = await readJsonFile<User[]>(USERS_FILE, []);
  return users.map(normaliseUser);
}

async function writeUsersJson(users: User[]): Promise<void> {
  await writeJsonFile(USERS_FILE, users);
}

async function listOtpsJson(): Promise<OtpRecord[]> {
  return readJsonFile<OtpRecord[]>(OTPS_FILE, []);
}

async function writeOtpsJson(otps: OtpRecord[]): Promise<void> {
  await writeJsonFile(OTPS_FILE, otps);
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const normalised = normaliseEmail(email);
  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM users WHERE email = ${normalised} LIMIT 1
    `;
    return rows[0] ? rowToUser(rows[0] as never) : null;
  }
  const users = await listUsersJson();
  return users.find((u) => u.email === normalised) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`SELECT * FROM users WHERE id = ${id} LIMIT 1`;
    return rows[0] ? rowToUser(rows[0] as never) : null;
  }
  const users = await listUsersJson();
  return users.find((u) => u.id === id) ?? null;
}

export async function findUserByPayPalSubscriptionId(
  subscriptionId: string,
): Promise<User | null> {
  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();
    const rows = await sql`
      SELECT * FROM users WHERE paypal_subscription_id = ${subscriptionId} LIMIT 1
    `;
    return rows[0] ? rowToUser(rows[0] as never) : null;
  }
  const users = await listUsersJson();
  return users.find((u) => u.paypalSubscriptionId === subscriptionId) ?? null;
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  businessName: string;
}): Promise<User> {
  const now = new Date().toISOString();
  const user: User = {
    id: randomUUID(),
    email: normaliseEmail(input.email),
    passwordHash: input.passwordHash,
    businessName: input.businessName.trim(),
    emailVerified: false,
    createdAt: now,
    trialEndsAt: getTrialEndDate(),
    subscriptionPlan: "none",
    subscriptionStatus: "trialing",
  };

  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();
    await sql`
      INSERT INTO users (
        id, email, password_hash, business_name, email_verified,
        created_at, trial_ends_at, subscription_plan, subscription_status
      ) VALUES (
        ${user.id}, ${user.email}, ${user.passwordHash}, ${user.businessName},
        ${user.emailVerified}, ${user.createdAt}, ${user.trialEndsAt},
        ${user.subscriptionPlan}, ${user.subscriptionStatus}
      )
    `;
    return user;
  }

  const users = await listUsersJson();
  users.push(user);
  await writeUsersJson(users);
  return user;
}

export async function markEmailVerified(userId: string): Promise<User | null> {
  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();
    await sql`UPDATE users SET email_verified = TRUE WHERE id = ${userId}`;
    return findUserById(userId);
  }
  const users = await listUsersJson();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;
  users[index] = { ...users[index], emailVerified: true };
  await writeUsersJson(users);
  return users[index];
}

export async function updateUserSubscription(
  userId: string,
  update: {
    subscriptionStatus?: SubscriptionStatus;
    subscriptionPlan?: SubscriptionPlan;
    paypalSubscriptionId?: string | null;
  },
): Promise<User | null> {
  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();
    const current = await findUserById(userId);
    if (!current) return null;
    await sql`
      UPDATE users SET
        subscription_status = ${update.subscriptionStatus ?? current.subscriptionStatus},
        subscription_plan = ${update.subscriptionPlan ?? current.subscriptionPlan},
        paypal_subscription_id = ${update.paypalSubscriptionId !== undefined ? update.paypalSubscriptionId : current.paypalSubscriptionId ?? null}
      WHERE id = ${userId}
    `;
    return findUserById(userId);
  }

  const users = await listUsersJson();
  const index = users.findIndex((u) => u.id === userId);
  if (index === -1) return null;
  users[index] = {
    ...users[index],
    ...update,
    paypalSubscriptionId:
      update.paypalSubscriptionId === null
        ? undefined
        : update.paypalSubscriptionId ?? users[index].paypalSubscriptionId,
  };
  await writeUsersJson(users);
  return users[index];
}

function generateOtpCode(): string {
  return String(randomInt(100000, 1000000));
}

export async function createOtp(
  userId: string,
  email: string,
  purpose: OtpPurpose,
): Promise<{ record: OtpRecord; code: string }> {
  const now = Date.now();
  const code = generateOtpCode();
  const record: OtpRecord = {
    id: randomUUID(),
    userId,
    email: normaliseEmail(email),
    code,
    purpose,
    expiresAt: new Date(now + OTP_TTL_MS).toISOString(),
    used: false,
    attempts: 0,
    createdAt: new Date().toISOString(),
  };

  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();
    const recent = await sql`
      SELECT * FROM otps
      WHERE user_id = ${userId} AND purpose = ${purpose} AND used = FALSE
      ORDER BY created_at DESC LIMIT 1
    `;
    if (
      recent[0] &&
      now - new Date(recent[0].created_at as string).getTime() < RESEND_COOLDOWN_MS
    ) {
      throw new Error("Please wait a minute before requesting another code.");
    }
    await sql`
      UPDATE otps SET used = TRUE
      WHERE user_id = ${userId} AND purpose = ${purpose} AND used = FALSE
    `;
    await sql`
      INSERT INTO otps (id, user_id, email, code, purpose, expires_at, used, created_at)
      VALUES (
        ${record.id}, ${record.userId}, ${record.email}, ${record.code},
        ${record.purpose}, ${record.expiresAt}, ${record.used}, ${record.createdAt}
      )
    `;
    return { record, code };
  }

  const otps = await listOtpsJson();
  const recent = otps.find(
    (o) =>
      o.userId === userId &&
      o.purpose === purpose &&
      !o.used &&
      now - new Date(o.createdAt).getTime() < RESEND_COOLDOWN_MS,
  );
  if (recent) {
    throw new Error("Please wait a minute before requesting another code.");
  }
  for (const item of otps.filter(
    (o) => o.userId === userId && o.purpose === purpose && !o.used,
  )) {
    item.used = true;
  }
  otps.push(record);
  await writeOtpsJson(otps);
  return { record, code };
}

const MAX_OTP_ATTEMPTS = 5;

export async function verifyOtp(input: {
  userId: string;
  code: string;
  purpose: OtpPurpose;
}): Promise<{ ok: true; user: User } | { ok: false; error: string }> {
  const user = await findUserById(input.userId);
  if (!user) return { ok: false, error: "Account not found." };

  const code = input.code.trim();

  if (useDatabase()) {
    await ensureSchema();
    const sql = getSql();

    // Get the latest active code for this user+purpose, regardless of value,
    // so we can count failed attempts and lock out brute-force guessing.
    const rows = await sql`
      SELECT * FROM otps
      WHERE user_id = ${input.userId}
        AND purpose = ${input.purpose}
        AND used = FALSE
      ORDER BY created_at DESC LIMIT 1
    `;
    const record = rows[0] as
      | { id: string; code: string; expires_at: string; attempts: number }
      | undefined;

    if (!record) {
      return { ok: false, error: "Invalid or expired code. Request a new one." };
    }
    if (new Date(record.expires_at).getTime() < Date.now()) {
      await sql`UPDATE otps SET used = TRUE WHERE id = ${record.id}`;
      return { ok: false, error: "This code has expired. Request a new one." };
    }
    if (record.attempts >= MAX_OTP_ATTEMPTS) {
      await sql`UPDATE otps SET used = TRUE WHERE id = ${record.id}`;
      return {
        ok: false,
        error: "Too many incorrect attempts. Request a new code.",
      };
    }
    if (record.code !== code) {
      await sql`UPDATE otps SET attempts = attempts + 1 WHERE id = ${record.id}`;
      const left = MAX_OTP_ATTEMPTS - (record.attempts + 1);
      return {
        ok: false,
        error:
          left > 0
            ? `Invalid code. ${left} attempt${left === 1 ? "" : "s"} left.`
            : "Too many incorrect attempts. Request a new code.",
      };
    }
    await sql`UPDATE otps SET used = TRUE WHERE id = ${record.id}`;
    return { ok: true, user };
  }

  const otps = await listOtpsJson();
  const record = otps
    .filter(
      (o) =>
        o.userId === input.userId && o.purpose === input.purpose && !o.used,
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];

  if (!record) {
    return { ok: false, error: "Invalid or expired code. Request a new one." };
  }
  if (new Date(record.expiresAt).getTime() < Date.now()) {
    record.used = true;
    await writeOtpsJson(otps);
    return { ok: false, error: "This code has expired. Request a new one." };
  }
  const attempts = record.attempts ?? 0;
  if (attempts >= MAX_OTP_ATTEMPTS) {
    record.used = true;
    await writeOtpsJson(otps);
    return {
      ok: false,
      error: "Too many incorrect attempts. Request a new code.",
    };
  }
  if (record.code !== code) {
    record.attempts = attempts + 1;
    await writeOtpsJson(otps);
    const left = MAX_OTP_ATTEMPTS - record.attempts;
    return {
      ok: false,
      error:
        left > 0
          ? `Invalid code. ${left} attempt${left === 1 ? "" : "s"} left.`
          : "Too many incorrect attempts. Request a new code.",
    };
  }
  record.used = true;
  await writeOtpsJson(otps);
  return { ok: true, user };
}

export async function purgeExpiredOtps(): Promise<void> {
  if (useDatabase()) return;
  const otps = await listOtpsJson();
  const now = Date.now();
  const filtered = otps.filter(
    (o) => o.used || new Date(o.expiresAt).getTime() > now - 24 * 60 * 60 * 1000,
  );
  if (filtered.length !== otps.length) {
    await writeOtpsJson(filtered);
  }
}
