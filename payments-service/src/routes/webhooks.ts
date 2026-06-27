import { Router, Request, Response } from "express";
import { constructWebhookEvent } from "../services/stripeService";

const router = Router();

// Stripe sends raw body — must be registered before express.json() middleware
router.post("/webhook", async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;
  let event;
  try {
    event = constructWebhookEvent(req.body as Buffer, sig);
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
  }

  switch (event.type) {
    case "invoice.payment_succeeded":
      await handleInvoicePaid(event.data.object as any);
      break;
    case "invoice.payment_failed":
      await handleInvoiceFailed(event.data.object as any);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionCancelled(event.data.object as any);
      break;
    case "customer.subscription.updated":
      await handleSubscriptionUpdated(event.data.object as any);
      break;
    default:
      break;
  }

  res.json({ received: true });
});

async function handleInvoicePaid(invoice: any) {
  // TODO: mark subscription active, send receipt email via notifications-service
  console.log("Invoice paid:", invoice.id);
}

async function handleInvoiceFailed(invoice: any) {
  // TODO: notify customer, retry logic, grace period
  console.log("Invoice failed:", invoice.id);
}

async function handleSubscriptionCancelled(subscription: any) {
  // TODO: deprovision tenant resources
  console.log("Subscription cancelled:", subscription.id);
}

async function handleSubscriptionUpdated(subscription: any) {
  // TODO: sync plan changes to catalog-service entitlements
  console.log("Subscription updated:", subscription.id);
}

export default router;
