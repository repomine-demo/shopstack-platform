export type PlanTier = "starter" | "growth" | "enterprise";
export type SubscriptionStatus = "active" | "past_due" | "cancelled" | "trialing";

export interface Subscription {
  id: string;
  tenantId: string;
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  tenantId: string;
  stripeInvoiceId: string;
  amountDue: number;
  amountPaid: number;
  currency: string;
  status: "draft" | "open" | "paid" | "void" | "uncollectible";
  invoiceUrl: string;
  paidAt: Date | null;
  createdAt: Date;
}

export interface ChargeRequest {
  userId: string;
  tenantId: string;
  amount: number;
  currency: string;
  description: string;
  paymentMethodId: string;
}
