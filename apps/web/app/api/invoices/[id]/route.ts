import { NextRequest } from "next/server";
import { positiveIntIdSchema } from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { mapDatabaseError } from "@we-arrange/database/errors";
import { requireAuthenticatedUser } from "@/services/auth";
import { AppError, fail, ok } from "@/services/http/response";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const invoiceId = positiveIntIdSchema.parse(id);
    const client = ctx.isConciergeOrAdmin ? createServiceRoleClient() : ctx.supabase;

    const { data: invoice, error } = await client
      .from("invoices")
      .select("*")
      .eq("invoice_id", invoiceId)
      .maybeSingle();

    if (error) throw mapDatabaseError(error, "Failed to load invoice.");
    if (!invoice) throw new AppError("NOT_FOUND", 404, "Invoice not found.");

    if (!ctx.isConciergeOrAdmin && invoice.user_id !== ctx.userId) {
      throw new AppError("FORBIDDEN", 403, "Access denied to this invoice.");
    }

    return ok(invoice);
  } catch (err) {
    return fail(err, "Failed to fetch invoice.");
  }
}

