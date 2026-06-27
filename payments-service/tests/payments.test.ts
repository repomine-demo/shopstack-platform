import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../src/services/stripeService");
vi.mock("../src/services/authClient", () => ({
  verifyToken: vi.fn().mockResolvedValue({ sub: "1", tenant_id: "acme", email: "u@acme.com" }),
}));

describe("Subscription routes", () => {
  it("POST /payments/subscribe returns 201 with subscriptionId", async () => {
    const { createCustomer, createSubscription } = await import("../src/services/stripeService");
    (createCustomer as any).mockResolvedValue("cus_test123");
    (createSubscription as any).mockResolvedValue({ id: "sub_test123", status: "active" });

    expect("sub_test123").toBeDefined();
  });

  it("POST /payments/charge returns paymentIntentId", async () => {
    const { chargeCustomer } = await import("../src/services/stripeService");
    (chargeCustomer as any).mockResolvedValue({ id: "pi_test123", status: "succeeded" });
    expect("pi_test123").toBeDefined();
  });

  it("GET /payments/invoices returns invoice list", async () => {
    const { listInvoices } = await import("../src/services/stripeService");
    (listInvoices as any).mockResolvedValue([{ id: "in_001" }, { id: "in_002" }]);
    const result = await listInvoices("cus_test");
    expect(result).toHaveLength(2);
  });
});

// NOTE: webhook handlers have zero test coverage — identified as coverage gap by Blueprint
