import { NextRequest } from "next/server";
import { enquiryCreateSchema, enquiryListQuerySchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { createCustomerEnquiry, listEnquiries } from "@we-arrange/service-booking";
import { requireAuthenticatedUser } from "@/services/auth";
import { created, fail, ok, parseJsonBody, parseSearchParams } from "@/services/http/response";

export async function GET(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const q = parseSearchParams(request.url, enquiryListQuerySchema);

    if (ctx.isConciergeOrAdmin) {
      const adminClient = createServiceRoleClient();
      const result = await listEnquiries(adminClient, {
        status: q.status,
        assignedSpecialistId: q.assignedToMe === "true" ? ctx.userId : undefined,
        page: q.page,
        limit: q.limit,
      });
      return ok(result.items, result.meta);
    }

    if (ctx.role === "vendor") {
      if (!ctx.vendorId) {
        return ok([], { page: q.page, limit: q.limit, total: 0, totalPages: 0 });
      }
      const adminClient = createServiceRoleClient();
      const result = await listEnquiries(adminClient, {
        vendorId: ctx.vendorId,
        status: q.status,
        page: q.page,
        limit: q.limit,
      });
      return ok(result.items, result.meta);
    }

    const result = await listEnquiries(ctx.supabase, {
      userId: ctx.userId,
      status: q.status,
      page: q.page,
      limit: q.limit,
    });
    return ok(result.items, result.meta);
  } catch (err) {
    return fail(err, "Failed to load enquiries.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, enquiryCreateSchema);
    const adminClient = createServiceRoleClient();
    const enquiry = await createCustomerEnquiry(ctx.supabase, adminClient, ctx.userId, body);
    return created(enquiry);
  } catch (err) {
    return fail(err, "Failed to submit enquiry.");
  }
}

