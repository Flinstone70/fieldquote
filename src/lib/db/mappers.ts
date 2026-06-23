import type { User } from "@/lib/types";

type UserRow = {
  id: string;
  email: string;
  password_hash: string;
  business_name: string;
  email_verified: boolean;
  created_at: string | Date;
  trial_ends_at: string | Date;
  subscription_plan: string;
  subscription_status: string;
  paypal_subscription_id: string | null;
};

export function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    businessName: row.business_name,
    emailVerified: row.email_verified,
    createdAt: new Date(row.created_at).toISOString(),
    trialEndsAt: new Date(row.trial_ends_at).toISOString(),
    subscriptionPlan: row.subscription_plan as User["subscriptionPlan"],
    subscriptionStatus: row.subscription_status as User["subscriptionStatus"],
    paypalSubscriptionId: row.paypal_subscription_id ?? undefined,
  };
}

export function userToSession(user: User) {
  return {
    userId: user.id,
    email: user.email,
    businessName: user.businessName,
    emailVerified: user.emailVerified,
    subscriptionStatus: user.subscriptionStatus,
    subscriptionPlan: user.subscriptionPlan,
    trialEndsAt: user.trialEndsAt,
  };
}
