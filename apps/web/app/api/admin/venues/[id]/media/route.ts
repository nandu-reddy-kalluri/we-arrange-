import { NextRequest } from "next/server";
import {
  positiveIntIdSchema,
  venueMediaCreateSchema,
  venueMediaUploadSignSchema,
} from "@we-arrange/validation";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { addVenueMediaRecord, deleteVenueMediaRecord } from "@we-arrange/service-venue";
import { requireConciergeOrAdmin } from "@/services/auth";
import { created, fail, ok } from "@/services/http/response";
import { createSignedMediaUploadUrl } from "@/services/storage/mediaAdapter";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireConciergeOrAdmin();
    const { id } = await context.params;
    const venueId = positiveIntIdSchema.parse(id);
    const raw = (await request.json().catch(() => null)) as Record<string, unknown> | null;

    if (raw && "fileName" in raw && "contentType" in raw) {
      const signReq = venueMediaUploadSignSchema.parse(raw);
      const signed = createSignedMediaUploadUrl({
        scope: "venues",
        ownerId: venueId,
        fileName: signReq.fileName,
        contentType: signReq.contentType,
        fileSizeBytes: signReq.fileSizeBytes,
      });
      return ok(signed);
    }

    const body = venueMediaCreateSchema.parse(raw);
    const adminClient = createServiceRoleClient();
    const media = await addVenueMediaRecord(adminClient, venueId, body);
    return created(media);
  } catch (err) {
    return fail(err, "Failed to manage venue media.");
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireConciergeOrAdmin();
    const { id } = await context.params;
    const venueId = positiveIntIdSchema.parse(id);
    const mediaId = positiveIntIdSchema.parse(request.nextUrl.searchParams.get("mediaId"));
    const mediaType =
      request.nextUrl.searchParams.get("mediaType") === "video" ? "video" : "image";
    const adminClient = createServiceRoleClient();
    const res = await deleteVenueMediaRecord(adminClient, venueId, mediaId, mediaType);
    return ok(res);
  } catch (err) {
    return fail(err, "Failed to delete venue media.");
  }
}

