import { NextResponse } from "next/server";
import { createPublicAnonClient } from "@we-arrange/database/clients";

export const dynamic = "force-dynamic";

/**
 * Health check endpoint for container orchestrators, uptime monitors, and CI/CD pipelines (OPS-001).
 * Verifies live Supabase PostgreSQL connectivity and latency without logging credentials or leaking internal details.
 */
export async function GET() {
  const startTime = Date.now();
  let dbStatus: "healthy" | "degraded" | "unhealthy" = "healthy";
  let dbLatencyMs = 0;

  try {
    const supabase = createPublicAnonClient();
    const dbStart = Date.now();
    const { error } = await supabase.from("venue_types").select("type_id").limit(1);
    dbLatencyMs = Date.now() - dbStart;

    if (error) {
      dbStatus = "degraded";
    }
  } catch {
    dbStatus = "unhealthy";
  }

  const isHealthy = dbStatus !== "unhealthy";
  const body = {
    status: isHealthy ? "pass" : "fail",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    latencyMs: Date.now() - startTime,
    checks: {
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
    },
  };

  return NextResponse.json(body, {
    status: isHealthy ? 200 : 503,
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
