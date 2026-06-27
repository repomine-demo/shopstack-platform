import { Router, Request, Response } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
  createCustomer,
  createSubscription,
  cancelSubscription,
  chargeCustomer,
  listInvoices,
} from "../services/stripeService";
import { PlanTier } from "../models/subscription";

const router = Router();

router.post("/subscribe", requireAuth, async (req: Request, res: Response) => {
  const { plan, email } = req.body as { plan: PlanTier; email: string };
  const tenantId = req.user!.tenant_id;
  try {
    const customerId = await createCustomer(email, tenantId);
    const subscription = await createSubscription(customerId, plan);
    res.status(201).json({ subscriptionId: subscription.id, status: subscription.status });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/subscribe/:subscriptionId", requireAuth, async (req: Request, res: Response) => {
  try {
    await cancelSubscription(req.params.subscriptionId);
    res.json({ cancelled: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/charge", requireAuth, async (req: Request, res: Response) => {
  const { amount, currency, description, paymentMethodId } = req.body;
  try {
    const intent = await chargeCustomer({
      userId: req.user!.sub,
      tenantId: req.user!.tenant_id,
      amount,
      currency,
      description,
      paymentMethodId,
    });
    res.json({ paymentIntentId: intent.id, status: intent.status });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/invoices", requireAuth, async (req: Request, res: Response) => {
  try {
    const invoices = await listInvoices(req.user!.tenant_id);
    res.json({ invoices });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
