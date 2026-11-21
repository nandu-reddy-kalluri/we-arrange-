import crypto from "node:crypto";
import { AppError } from "@we-arrange/database/errors";

export interface GatewayPaymentIntentRequest {
  paymentId: number;
  bookingId: number;
  amountInr: number;
  currency: "INR";
  paymentMethod: string;
  idempotencyKey: string;
}

export interface GatewayPaymentIntentResult {
  provider: string;
  providerOrderId: string;
  amountInr: number;
  currency: "INR";
  status: "Pending";
  configured: boolean;
}

export interface PaymentWebhookEvent {
  eventId: string;
  eventType: "payment.captured" | "payment.failed" | "refund.processed";
  paymentId: number;
  transactionReference: string;
  amountInr: number;
  currency: "INR";
  rawPayload: Record<string, unknown>;
}

export function createGatewayPaymentIntent(
  req: GatewayPaymentIntentRequest
): GatewayPaymentIntentResult {
  const provider = process.env.PAYMENT_GATEWAY_PROVIDER?.trim() || "unconfigured";
  const gatewayConfigured = Boolean(
    process.env.PAYMENT_GATEWAY_KEY_ID?.trim() &&
      process.env.PAYMENT_GATEWAY_KEY_SECRET?.trim()
  );

  // Never simulate a real paid/captured transaction: status always stays Pending until signed webhook confirmation
  const deterministicOrderId = `gw_ord_${req.paymentId}_${crypto
    .createHash("sha256")
    .update(req.idempotencyKey)
    .digest("hex")
    .slice(0, 16)}`;

  return {
    provider,
    providerOrderId: deterministicOrderId,
    amountInr: req.amountInr,
    currency: req.currency,
    status: "Pending",
    configured: gatewayConfigured,
  };
}

export function verifyPaymentWebhookSignature(
  rawBody: string,
  providedSignature: string | null,
  overrideSecret?: string
): boolean {
  const secret = (overrideSecret ?? process.env.PAYMENT_WEBHOOK_SECRET ?? "").trim();
  if (!secret) {
    throw new AppError(
      "SERVICE_UNAVAILABLE",
      503,
      "Payment webhook verification secret is not configured."
    );
  }
  if (!providedSignature) {
    return false;
  }

  const normalizedProvided = providedSignature.replace(/^sha256=/i, "").trim();
  const expectedHex = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  const a = Buffer.from(normalizedProvided, "hex");
  const b = Buffer.from(expectedHex, "hex");
  if (a.length === 0 || a.length !== b.length) {
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}

