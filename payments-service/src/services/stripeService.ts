import Stripe from "stripe";
import { ChargeRequest, PlanTier, Subscription } from "../models/subscription";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2024-04-10" });

const PLAN_PRICE_IDS: Record<PlanTier, string> = {
  starter: process.env.STRIPE_PRICE_STARTER || "price_starter",
  growth: process.env.STRIPE_PRICE_GROWTH || "price_growth",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "price_enterprise",
};

export async function createCustomer(email: string, tenantId: string): Promise<string> {
  const customer = await stripe.customers.create({ email, metadata: { tenant_id: tenantId } });
  return customer.id;
}

export async function createSubscription(
  customerId: string,
  plan: PlanTier
): Promise<Stripe.Subscription> {
  return stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: PLAN_PRICE_IDS[plan] }],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });
}

export async function cancelSubscription(stripeSubscriptionId: string): Promise<void> {
  await stripe.subscriptions.update(stripeSubscriptionId, { cancel_at_period_end: true });
}

export async function chargeCustomer(req: ChargeRequest): Promise<Stripe.PaymentIntent> {
  return stripe.paymentIntents.create({
    amount: req.amount,
    currency: req.currency,
    customer: req.tenantId,
    payment_method: req.paymentMethodId,
    description: req.description,
    confirm: true,
  });
}

export async function listInvoices(customerId: string): Promise<Stripe.Invoice[]> {
  const result = await stripe.invoices.list({ customer: customerId, limit: 20 });
  return result.data;
}

export function constructWebhookEvent(payload: Buffer, sig: string): Stripe.Event {
  const secret = process.env.STRIPE_WEBHOOK_SECRET || "";
  return stripe.webhooks.constructEvent(payload, sig, secret);
}
