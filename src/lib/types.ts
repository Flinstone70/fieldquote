export type SubscriptionPlan = "none" | "professional" | "business";

export type SubscriptionStatus =
  | "none"
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled";

export type OtpPurpose = "email_verify" | "login";

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  businessName: string;
  emailVerified: boolean;
  createdAt: string;
  trialEndsAt: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionStatus: SubscriptionStatus;
  paypalSubscriptionId?: string;
}

export interface OtpRecord {
  id: string;
  userId: string;
  email: string;
  code: string;
  purpose: OtpPurpose;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

export interface SessionUser {
  userId: string;
  email: string;
  businessName: string;
  emailVerified: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan: SubscriptionPlan;
  trialEndsAt: string;
}

export type QuoteStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "deposit_paid"
  | "declined";

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPricePence: number;
}

export interface Quote {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  businessName: string;
  businessEmail: string;
  clientName: string;
  clientEmail: string;
  jobTitle: string;
  jobDescription: string;
  lineItems: LineItem[];
  depositPercent: number;
  status: QuoteStatus;
  acceptedAt?: string;
  depositPaidAt?: string;
  stripeSessionId?: string;
}

export interface CreateQuoteInput {
  businessName: string;
  businessEmail: string;
  clientName: string;
  clientEmail: string;
  jobTitle: string;
  jobDescription: string;
  lineItems: Omit<LineItem, "id">[];
  depositPercent: number;
}

export type PayPalPlanKey = "professional" | "business";
