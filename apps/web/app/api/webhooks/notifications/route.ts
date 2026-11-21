import { NextRequest } from "next/server";
import { z } from "zod";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { AppError, fail, ok } from "@/services/http/response";
import {
  recordNotificationDeliveryCallback,
  verifyNotificationWebhookSignature,
} from "@/services/notifications/notificationService";

const callbackSchema = z.object({
  notificationId: z.coerce.number().int().positive().optional(),
  userId: z.string().uuid().optional(),
  channel: z.enum(["email", "sms", "in_app"]),
  deliveryStatus: z.string().trim().min(2).max(60),
});

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-ymwa-signature");

    if (!verifyNotificationWebhookSignature(rawBody, signature)) {
      throw new AppError("UNAUTHENTICATED", 401, "Invalid notification webhook signature.");
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      throw new AppError("VALIDATION_ERROR", 400, "Invalid JSON payload.");
    }

    const event = callbackSchema.parse(parsedJson);
    const adminClient = createServiceRoleClient();
    const log = await recordNotificationDeliveryCallback(adminClient, {
      ...event,
      rawPayload:
        parsedJson && typeof parsedJson === "object"
          ? (parsedJson as Record<string, unknown>)
          : {},
    });

    return ok(log);
  } catch (err) {
    return fail(err, "Failed to record notification webhook.");
  }
}

