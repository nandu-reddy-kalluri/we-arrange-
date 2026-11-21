import { NextRequest } from "next/server";
import { createPublicAnonClient } from "@we-arrange/database/clients";
import { comparisonPreviewSchema } from "@we-arrange/validation";
import { buildComparisonPreview } from "@we-arrange/service-booking";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function POST(request: NextRequest) {
  try {
    const body = await parseJsonBody(request, comparisonPreviewSchema);
    const supabase = createPublicAnonClient();
    const matrix = await buildComparisonPreview(supabase, body);
    return ok(matrix);
  } catch (err) {
    return fail(err, "Failed to build comparison preview.");
  }
}

