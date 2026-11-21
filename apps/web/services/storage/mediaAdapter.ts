import crypto from "node:crypto";
import { AppError } from "@we-arrange/database/errors";

export interface SignedUploadRequest {
  scope: "avatars" | "venues" | "vendors" | "bookings" | "invites";
  ownerId: string | number;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
}

export interface SignedUploadResponse {
  provider: "cloudflare_r2";
  method: "PUT";
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  expiresInSeconds: number;
  requiredHeaders: {
    "Content-Type": string;
  };
}

export interface R2EnvConfig {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucket: string;
  publicBaseUrl: string;
}

function getR2Config(): R2EnvConfig | null {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID?.trim() ?? "";
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID?.trim() ?? "";
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY?.trim() ?? "";
  const bucket = process.env.CLOUDFLARE_R2_BUCKET?.trim() ?? "";
  const publicBaseUrl =
    process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL?.trim() ??
    process.env.CLOUDFLARE_R2_PUBLIC_URL?.trim() ??
    "";

  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBaseUrl) {
    return null;
  }
  return { accountId, accessKeyId, secretAccessKey, bucket, publicBaseUrl };
}

export function sanitizeUploadFileName(fileName: string): string {
  const base = fileName.replace(/^.*[\\/]/, "").trim();
  const safe = base.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return (safe || "upload.bin").slice(0, 120);
}

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

function encodeRfc3986Path(pathStr: string): string {
  return pathStr
    .split("/")
    .map((seg) => encodeURIComponent(seg))
    .join("/");
}

export function createR2PresignedPutUrl(
  config: R2EnvConfig,
  objectKey: string,
  expiresInSeconds = 300,
  now = new Date()
): string {
  const host = `${config.accountId}.r2.cloudflarestorage.com`;
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/auto/s3/aws4_request`;
  const canonicalUri = encodeRfc3986Path(`/${config.bucket}/${objectKey}`);

  const params = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${config.accessKeyId}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresInSeconds),
    "X-Amz-SignedHeaders": "host",
  });
  params.sort();
  const canonicalQuery = params.toString();

  const canonicalRequest = [
    "PUT",
    canonicalUri,
    canonicalQuery,
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const kDate = hmacSha256(`AWS4${config.secretAccessKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, "auto");
  const kService = hmacSha256(kRegion, "s3");
  const kSigning = hmacSha256(kService, "aws4_request");
  const signature = crypto
    .createHmac("sha256", kSigning)
    .update(stringToSign, "utf8")
    .digest("hex");

  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

export function createSignedMediaUploadUrl(
  req: SignedUploadRequest,
  overrideConfig?: R2EnvConfig | null
): SignedUploadResponse {
  const config = overrideConfig !== undefined ? overrideConfig : getR2Config();
  if (!config) {
    throw new AppError(
      "SERVICE_UNAVAILABLE",
      503,
      "Cloudflare R2 storage credentials are not configured on this server."
    );
  }

  const safeName = sanitizeUploadFileName(req.fileName);
  const uniquePrefix = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}`;
  const objectKey = `${req.scope}/${String(req.ownerId)}/${uniquePrefix}-${safeName}`;
  const expiresInSeconds = 300;
  const uploadUrl = createR2PresignedPutUrl(config, objectKey, expiresInSeconds);
  const publicBase = config.publicBaseUrl.replace(/\/+$/, "");

  return {
    provider: "cloudflare_r2",
    method: "PUT",
    uploadUrl,
    publicUrl: `${publicBase}/${objectKey}`,
    objectKey,
    expiresInSeconds,
    requiredHeaders: {
      "Content-Type": req.contentType,
    },
  };
}

