import { NextResponse } from "next/server";
import { getSupabaseConfigStatus, getSupabasePublicEnv } from "@we-arrange/auth";
import { createSupabaseServerClient } from "@/services/supabase/server";

export const dynamic = "force-dynamic";

type HealthStatus =
  | "missing_environment"
  | "invalid_environment"
  | "client_initialization_failed"
  | "service_unreachable"
  | "auth_rejected"
  | "upstream_error"
  | "service_reachable";

interface HealthResponse {
  status: HealthStatus;
  ok: boolean;
  environment: {
    configured: boolean;
    keySource: string | null;
    missing?: string[];
  };
  clientInitialized: boolean;
  service: {
    endpoint: "/auth/v1/health";
    reachable: boolean;
    httpStatus: number | null;
    timedOut?: boolean;
  };
  databaseConnectivity: "not_verified";
  rlsVerification: "not_verified";
  note: string;
}

const REQUEST_TIMEOUT_MS = 5000;
const HEALTH_PROBE_PATH = "/auth/v1/health";

function jsonHealth(body: HealthResponse, httpStatus: number) {
  return NextResponse.json(body, {
    status: httpStatus,
    headers: { "Cache-Control": "no-store" },
  });
}

function isHeaderSafeKey(key: string): boolean {
  return key.length > 0 && !/[\r\n\s]/.test(key);
}

export async function GET() {
  const config = getSupabaseConfigStatus();

  if (config.invalidUrl) {
    return jsonHealth(
      {
        status: "invalid_environment",
        ok: false,
        environment: {
          configured: false,
          keySource: config.keySource,
          missing: config.missing.length > 0 ? config.missing : undefined,
        },
        clientInitialized: false,
        service: { endpoint: HEALTH_PROBE_PATH, reachable: false, httpStatus: null },
        databaseConnectivity: "not_verified",
        rlsVerification: "not_verified",
        note: "NEXT_PUBLIC_SUPABASE_URL is not a valid http(s) URL.",
      },
      500
    );
  }

  if (!config.configured) {
    return jsonHealth(
      {
        status: "missing_environment",
        ok: false,
        environment: {
          configured: false,
          keySource: config.keySource,
          missing: config.missing,
        },
        clientInitialized: false,
        service: { endpoint: HEALTH_PROBE_PATH, reachable: false, httpStatus: null },
        databaseConnectivity: "not_verified",
        rlsVerification: "not_verified",
        note: "Required public Supabase environment variables are missing.",
      },
      503
    );
  }

  let url: string;
  let anonKey: string;
  try {
    ({ url, anonKey } = getSupabasePublicEnv());
  } catch {
    return jsonHealth(
      {
        status: "invalid_environment",
        ok: false,
        environment: {
          configured: false,
          keySource: config.keySource,
        },
        clientInitialized: false,
        service: { endpoint: HEALTH_PROBE_PATH, reachable: false, httpStatus: null },
        databaseConnectivity: "not_verified",
        rlsVerification: "not_verified",
        note: "Supabase public environment configuration is invalid.",
      },
      500
    );
  }

  if (!isHeaderSafeKey(anonKey)) {
    return jsonHealth(
      {
        status: "invalid_environment",
        ok: false,
        environment: {
          configured: false,
          keySource: config.keySource,
        },
        clientInitialized: false,
        service: { endpoint: HEALTH_PROBE_PATH, reachable: false, httpStatus: null },
        databaseConnectivity: "not_verified",
        rlsVerification: "not_verified",
        note: "Configured Supabase public key format is invalid.",
      },
      500
    );
  }

  try {
    await createSupabaseServerClient();
  } catch {
    return jsonHealth(
      {
        status: "client_initialization_failed",
        ok: false,
        environment: {
          configured: true,
          keySource: config.keySource,
        },
        clientInitialized: false,
        service: { endpoint: HEALTH_PROBE_PATH, reachable: false, httpStatus: null },
        databaseConnectivity: "not_verified",
        rlsVerification: "not_verified",
        note: "Server Supabase client initialization failed.",
      },
      500
    );
  }

  // Probe Auth health with apikey only (supports both anon JWTs and sb_publishable_* keys
  // without touching PostgREST's OpenAPI schema endpoint or assuming any database table).
  const endpoint = `${url.replace(/\/+$/, "")}${HEALTH_PROBE_PATH}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    await response.body?.cancel().catch(() => undefined);

    if (response.status >= 200 && response.status < 300) {
      return jsonHealth(
        {
          status: "service_reachable",
          ok: true,
          environment: {
            configured: true,
            keySource: config.keySource,
          },
          clientInitialized: true,
          service: {
            endpoint: HEALTH_PROBE_PATH,
            reachable: true,
            httpStatus: response.status,
          },
          databaseConnectivity: "not_verified",
          rlsVerification: "not_verified",
          note: "Supabase Auth HTTP service is reachable; SQL execution and RLS policies are not verified without a documented safe query target.",
        },
        200
      );
    }

    if (response.status === 401 || response.status === 403) {
      return jsonHealth(
        {
          status: "auth_rejected",
          ok: false,
          environment: {
            configured: true,
            keySource: config.keySource,
          },
          clientInitialized: true,
          service: {
            endpoint: HEALTH_PROBE_PATH,
            reachable: true,
            httpStatus: response.status,
          },
          databaseConnectivity: "not_verified",
          rlsVerification: "not_verified",
          note: "Supabase HTTP service responded but rejected the configured public API key.",
        },
        502
      );
    }

    return jsonHealth(
      {
        status: "upstream_error",
        ok: false,
        environment: {
          configured: true,
          keySource: config.keySource,
        },
        clientInitialized: true,
        service: {
          endpoint: HEALTH_PROBE_PATH,
          reachable: true,
          httpStatus: response.status,
        },
        databaseConnectivity: "not_verified",
        rlsVerification: "not_verified",
        note:
          response.status >= 500
            ? "Supabase HTTP service responded but returned an upstream error."
            : "Supabase HTTP service responded with an unexpected HTTP status.",
      },
      502
    );
  } catch (error) {
    const timedOut =
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError");

    return jsonHealth(
      {
        status: "service_unreachable",
        ok: false,
        environment: {
          configured: true,
          keySource: config.keySource,
        },
        clientInitialized: true,
        service: {
          endpoint: HEALTH_PROBE_PATH,
          reachable: false,
          httpStatus: null,
          timedOut,
        },
        databaseConnectivity: "not_verified",
        rlsVerification: "not_verified",
        note: timedOut
          ? "Timed out connecting to the Supabase HTTP service."
          : "Network error connecting to the Supabase HTTP service.",
      },
      503
    );
  }
}
