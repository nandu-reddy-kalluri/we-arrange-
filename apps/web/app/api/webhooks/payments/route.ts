import { NextRequest } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { processVerifiedPaymentWebhook } from "@we-arrange/service-booking";
import { AppError, fail, ok } from "@/services/http/response";
import { verifyPaymentWebhookSignature } from "@/services/payments/adapter";

const webhookPayloadSchema = z.object({
  eventType: z.enum(["payment.captured", "payment.failed"]),
  paymentId: z.coerce.number().int().positive(),
  transactionReference: z.string().trim().min(4).max(160),
  gateway: z.string().trim().min(2).max(60).default("unknown"),
  amountInr: z.coerce.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature =
      request.headers.get("x-ymwa-signature") ??
      request.headers.get("x-razorpay-signature");

    if (!verifyPaymentWebhookSignature(rawBody, signature)) {
      throw new AppError("UNAUTHENTICATED", 401, "Invalid payment webhook signature.");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      throw new AppError("VALIDATION_ERROR", 400, "Invalid JSON webhook payload.");
    }

    const event = webhookPayloadSchema.parse(parsedJson);
    const adminClient = createServiceRoleClient();
    const result = await processVerifiedPaymentWebhook(adminClient, {
      ...event,
      rawPayload:
        parsedJson && typeof parsedJson === "object"
          ? (parsedJson as Record<string, unknown>)
          : {},
    });

    return ok(result);
  } catch (err) {
    return fail(err, "Webhook processing failed.");
  }
}

