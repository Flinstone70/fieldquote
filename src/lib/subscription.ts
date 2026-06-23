import type { User } from "@/lib/types";

const TRIAL_DAYS = 14;

export function getTrialEndDate(from = new Date()): string {
  const end = new Date(from);
  end.setDate(end.getDate() + TRIAL_DAYS);
  return end.toISOString();
}

export function hasActiveSubscription(user: User): boolean {
  if (user.subscriptionStatus === "active") return true;
  if (user.subscriptionStatus === "trialing") {
    return new Date(user.trialEndsAt).getTime() > Date.now();
  }
  return false;
}

export function subscriptionLabel(user: User): string {
  if (user.subscriptionStatus === "active") {
    return user.subscriptionPlan === "business"
      ? "Business · Active"
      : "Professional · Active";
  }
  if (user.subscriptionStatus === "trialing" && hasActiveSubscription(user)) {
    const days = Math.ceil(
      (new Date(user.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
    );
    return `Free trial · ${days} day${days === 1 ? "" : "s"} left`;
  }
  if (user.subscriptionStatus === "cancelled") return "Subscription cancelled";
  if (user.subscriptionStatus === "past_due") return "Payment issue — update PayPal";
  return "Trial ended — subscribe to continue";
}
