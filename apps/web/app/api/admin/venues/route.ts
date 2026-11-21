import { NextRequest } from "next/server";
import { venueCreateSchema, venueQuerySchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { createVenueRecord, listPublicVenues } from "@we-arrange/service-venue";
import { requireConciergeOrAdmin } from "@/services/auth";
import { created, fail, ok, parseJsonBody, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    await requireConciergeOrAdmin();
    const query = parseSearchParams(request.url, venueQuerySchema);
    const adminClient = createServiceRoleClient();
    const result = await listPublicVenues(adminClient, query, { includeAllStatuses: true });
    return ok(result.items, result.meta);
  } catch (err) {
    return fail(err, "Failed to list venues.");
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireConciergeOrAdmin();
    const body = await parseJsonBody(request, venueCreateSchema);
    const adminClient = createServiceRoleClient();
    const createdVenue = await createVenueRecord(adminClient, body);
    return created(createdVenue);
  } catch (err) {
    return fail(err, "Failed to create venue.");
  }
}

