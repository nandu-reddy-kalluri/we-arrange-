import { NextRequest } from "next/server";
import { paymentIntentCreateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { createOrReusePaymentIntent } from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { created, fail, ok, parseJsonBody } from "@/services/http/response";
import { createGatewayPaymentIntent } from "@/services/payments/adapter";

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, paymentIntentCreateSchema);
    const adminClient = createServiceRoleClient();

    const record = await createOrReusePaymentIntent(adminClient, ctx.userId, body);
    const gatewayIntent = createGatewayPaymentIntent({
      paymentId: record.payment.payment_id,
      bookingId: body.bookingId,
      amountInr: Number(record.payment.amount),
      currency: "INR",
      paymentMethod: body.paymentMethod,
      idempotencyKey: body.idempotencyKey,
    });

    const payload = {
      payment: record.payment,
      reused: record.reused,
      gatewayIntent,
    };

    return record.reused ? ok(payload) : created(payload);
  } catch (err) {
    return fail(err, "Failed to initialize payment intent.");
  }
}

