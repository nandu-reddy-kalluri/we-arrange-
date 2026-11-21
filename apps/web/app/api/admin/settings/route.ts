import { NextRequest } from "next/server";
import { appSettingUpdateSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { requireActiveAdmin } from "@/services/auth";
import { getAppSettingsAndConfigs, upsertAppSetting } from "@/services/admin/adminPortalService";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function GET() {
  try {
    await requireActiveAdmin();
    const adminClient = createServiceRoleClient();
    const data = await getAppSettingsAndConfigs(adminClient);
    return ok(data);
  } catch (err) {
    return fail(err, "Failed to load application settings.");
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireActiveAdmin();
    const body = await parseJsonBody(request, appSettingUpdateSchema);
    const adminClient = createServiceRoleClient();
    const setting = await upsertAppSetting(adminClient, body);
    return ok(setting);
  } catch (err) {
    return fail(err, "Failed to update application setting.");
  }
}
