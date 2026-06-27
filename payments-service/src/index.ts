import express from "express";
import paymentsRouter from "./routes/payments";
import webhooksRouter from "./routes/webhooks";

const app = express();
const PORT = process.env.PORT || 8002;

// Raw body for Stripe webhooks MUST come before express.json()
app.use("/payments/webhook", express.raw({ type: "application/json" }));
app.use(express.json());

app.use("/payments", paymentsRouter);
app.use("/payments", webhooksRouter);

app.get("/health", (_req, res) => res.json({ status: "healthy", service: "payments-service" }));

app.listen(PORT, () => console.log(`payments-service running on :${PORT}`));

export default app;
