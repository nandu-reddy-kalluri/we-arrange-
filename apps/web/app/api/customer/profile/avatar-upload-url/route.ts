import { NextRequest } from "next/server";
import { avatarUploadUrlSchema } from "@we-arrange/validation";
import { requireAuthenticatedUser } from "@/services/auth";
import { fail, ok, parseJsonBody } from "@/services/http/response";
import { createSignedMediaUploadUrl } from "@/services/storage/mediaAdapter";

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAuthenticatedUser();
    const body = await parseJsonBody(request, avatarUploadUrlSchema);
    const signed = createSignedMediaUploadUrl({
      scope: "avatars",
      ownerId: ctx.userId,
      fileName: body.fileName,
      contentType: body.contentType,
      fileSizeBytes: body.fileSizeBytes,
    });
    return ok(signed);
  } catch (err) {
    return fail(err, "Failed to generate avatar upload URL.");
  }
}

