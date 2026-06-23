import type { PayPalPlanKey } from "@/lib/types";

export const FREE_TRIAL_DAYS = 14;

export const paidPlans: Array<{
  plan: PayPalPlanKey;
  name: string;
  price: string;
  amountPounds: number;
  highlighted?: boolean;
  bestFor: string;
  features: string[];
}> = [
  {
    plan: "professional",
    name: "Professional",
    price: "£79",
    amountPounds: 79,
    bestFor: "Owner-operators and solo trades",
    features: [
      "Up to 50 quotes per month",
      "Client approval links",
      "Email quote sending",
      "Deposit payment collection",
      "Dashboard pipeline tracking",
    ],
  },
  {
    plan: "business",
    name: "Business",
    price: "£149",
    amountPounds: 149,
    highlighted: true,
    bestFor: "Growing teams and multi-crew companies",
    features: [
      "Everything in Professional",
      "Unlimited quotes",
      "No FieldQuote branding on client pages",
      "Priority support",
      "Team features (soon)",
      "Advanced reporting (soon)",
    ],
  },
];
