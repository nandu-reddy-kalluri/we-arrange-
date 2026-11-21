import { NextRequest } from "next/server";
import { notificationTemplateUpsertSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import {
  listNotificationTemplates,
  upsertNotificationTemplate,
} from "@/services/notifications/notificationService";
import { created, fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET() {
  try {
    await requireActiveAdmin();
    const adminClient = createServiceRoleClient();
    const data = await listNotificationTemplates(adminClient);
    return ok(data);
  } catch (err) {
    return fail(err, "Failed to load notification templates.");
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireActiveAdmin();
    const body = await parseJsonBody(request, notificationTemplateUpsertSchema);
    const adminClient = createServiceRoleClient();
    const template = await upsertNotificationTemplate(adminClient, body);
    return created(template);
  } catch (err) {
    return fail(err, "Failed to create notification template.");
  }
}
