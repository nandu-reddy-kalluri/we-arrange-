import { NextRequest } from "next/server";
import { collectionUpdateSchema, positiveIntIdSchema } from "@we-arrange/validation";
import {
  deleteCustomerCollection,
  updateCustomerCollection,
} from "@we-arrange/service-customer";
import { requireAuthenticatedUser } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const collectionId = positiveIntIdSchema.parse(id);
    const body = await parseJsonBody(request, collectionUpdateSchema);
    const updated = await updateCustomerCollection(ctx.supabase, ctx.userId, collectionId, body);
    return ok(updated);
  } catch (err) {
    return fail(err, "Failed to update collection.");
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const ctx = await requireAuthenticatedUser();
    const { id } = await context.params;
    const collectionId = positiveIntIdSchema.parse(id);
    const deleted = await deleteCustomerCollection(ctx.supabase, ctx.userId, collectionId);
    return ok(deleted);
  } catch (err) {
    return fail(err, "Failed to delete collection.");
  }
}

