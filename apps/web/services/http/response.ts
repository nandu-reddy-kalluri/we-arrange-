import { NextResponse } from "next/server";
import { ZodError, type ZodType } from "zod";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import type { PaginationMeta } from "@we-arrange/database/repository";

export { AppError, mapDatabaseError };

export interface ApiSuccessBody<T> {
  ok: true;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
}

export interface ApiErrorBody {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export function ok<T>(
  data: T,
  meta?: PaginationMeta | Record<string, unknown>,
  status = 200
) {
  const body: ApiSuccessBody<T> = meta ? { ok: true, data, meta } : { ok: true, data };
  return NextResponse.json(body, { status });
}

export function created<T>(data: T) {
  return ok(data, undefined, 201);
}

export function fail(err: unknown, fallbackMessage = "Request failed.") {
  if (err instanceof AppError) {
    return NextResponse.json<ApiErrorBody>(
      {
        ok: false,
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
      { status: err.status }
    );
  }

  if (err instanceof ZodError) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const key = issue.path.length > 0 ? issue.path.join(".") : "_root";
      if (!fieldErrors[key]) fieldErrors[key] = [];
      fieldErrors[key].push(issue.message);
    }
    return NextResponse.json<ApiErrorBody>(
      {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details: { fieldErrors },
        },
      },
      { status: 400 }
    );
  }

  const mapped = mapDatabaseError(err, fallbackMessage);
  return NextResponse.json<ApiErrorBody>(
    {
      ok: false,
      error: {
        code: mapped.code,
        message: mapped.message,
      },
    },
    { status: mapped.status }
  );
}

export async function parseJsonBody<T>(request: Request, schema: ZodType<T>): Promise<T> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new AppError("VALIDATION_ERROR", 400, "Invalid JSON request body.");
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
}

export function parseSearchParams<T>(
  urlOrSearchParams: string | URL | URLSearchParams,
  schema: ZodType<T>
): T {
  const sp =
    urlOrSearchParams instanceof URLSearchParams
      ? urlOrSearchParams
      : (typeof urlOrSearchParams === "string"
          ? new URL(urlOrSearchParams, "http://localhost").searchParams
          : urlOrSearchParams.searchParams);

  const raw: Record<string, string | string[]> = {};
  for (const key of new Set(sp.keys())) {
    const values = sp.getAll(key);
    raw[key] = values.length > 1 ? values : (values[0] ?? "");
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw parsed.error;
  }
  return parsed.data;
}

const REDACTED_KEYS = new Set([
  "authorization",
  "cookie",
  "password",
  "token",
  "phone",
  "email",
  "supabase_service_role_key",
  "service_role_key",
  "signature",
  "secret",
]);

export function redactLogData(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (REDACTED_KEYS.has(k.toLowerCase())) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function logApiEvent(event: {
  route: string;
  method: string;
  userId?: string | null;
  status: number;
  errorCode?: string;
  durationMs?: number;
  meta?: Record<string, unknown>;
}) {
  const safePayload = redactLogData({
    ts: new Date().toISOString(),
    route: event.route,
    method: event.method,
    userId: event.userId ?? null,
    status: event.status,
    ...(event.errorCode ? { errorCode: event.errorCode } : {}),
    ...(event.durationMs !== undefined ? { durationMs: event.durationMs } : {}),
    ...(event.meta ?? {}),
  });
  if (event.status >= 500) {
    console.error("[YMWA_API]", JSON.stringify(safePayload));
  } else {
    console.info("[YMWA_API]", JSON.stringify(safePayload));
  }
}
