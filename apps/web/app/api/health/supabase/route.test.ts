import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import Module from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

interface MockedResponse {
  status: number;
  headers: Record<string, string>;
  body: {
    status: string;
    ok: boolean;
    environment: {
      configured: boolean;
      keySource: string | null;
      missing?: string[];
    };
    clientInitialized: boolean;
    service: {
      endpoint: string;
      reachable: boolean;
      httpStatus: number | null;
      timedOut?: boolean;
    };
    databaseConnectivity: string;
    rlsVerification: string;
    note: string;
  };
}

function transpileAndLoad<T>(filePath: string): T {
  const source = fs.readFileSync(filePath, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  });
  const mod = new Module(filePath);
  mod.filename = filePath;
  (mod as unknown as { paths: string[] }).paths = (
    Module as unknown as { _nodeModulePaths: (dir: string) => string[] }
  )._nodeModulePaths(path.dirname(filePath));
  (mod as unknown as { _compile: (code: string, filename: string) => void })._compile(
    outputText,
    filePath
  );
  return mod.exports as T;
}

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "../../../../../..");
const envModule = transpileAndLoad(
  path.join(repoRoot, "packages/auth/src/env.ts")
);

let shouldFailClient = false;
const originalFetch = globalThis.fetch;
const moduleWithLoad = Module as unknown as {
  _load: (request: string, parent: NodeModule | null, isMain: boolean) => unknown;
};
const originalLoad = moduleWithLoad._load;

moduleWithLoad._load = function patchedLoad(
  request: string,
  parent: NodeModule | null,
  isMain: boolean
) {
  if (request === "next/server") {
    return {
      NextResponse: {
        json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
          status: init?.status ?? 200,
          headers: init?.headers ?? {},
          body,
        }),
      },
    };
  }
  if (request === "@we-arrange/auth") return envModule;
  if (request === "@/services/supabase/server") {
    return {
      createSupabaseServerClient: async () => {
        if (shouldFailClient) {
          throw new Error("sensitive internal client failure");
        }
        return { auth: {} };
      },
    };
  }
  return originalLoad.call(this, request, parent, isMain);
};

const { GET } = transpileAndLoad<{ GET: () => Promise<MockedResponse> }>(
  path.join(currentDir, "route.ts")
);

moduleWithLoad._load = originalLoad;

describe("GET /api/health/supabase", () => {
  const savedEnv = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    pub: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };

  beforeEach(() => {
    shouldFailClient = false;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (savedEnv.url !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = savedEnv.url;
    else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (savedEnv.anon !== undefined) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedEnv.anon;
    else delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (savedEnv.pub !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = savedEnv.pub;
    } else {
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    }
  });

  it("reports missing_environment when public env vars are missing", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zujjiiljvjwgcxtaqype.supabase.co";
    const res = await GET();
    assert.equal(res.status, 503);
    assert.equal(res.body.status, "missing_environment");
    assert.equal(res.body.service.reachable, false);
    assert.equal(res.body.databaseConnectivity, "not_verified");
    assert.equal(res.body.rlsVerification, "not_verified");
  });

  it("reports invalid_environment for invalid URL and missing or malformed key", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "not-a-url";
    const resBadUrl = await GET();
    assert.equal(resBadUrl.status, 500);
    assert.equal(resBadUrl.body.status, "invalid_environment");
    assert.equal(resBadUrl.body.environment.missing?.length, 1);

    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zujjiiljvjwgcxtaqype.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "bad key with space";
    const resBadKey = await GET();
    assert.equal(resBadKey.status, 500);
    assert.equal(resBadKey.body.status, "invalid_environment");
  });

  it("reports client_initialization_failed without leaking internal error details", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zujjiiljvjwgcxtaqype.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "secret-test-key-value";
    shouldFailClient = true;

    const res = await GET();
    assert.equal(res.status, 500);
    assert.equal(res.body.status, "client_initialization_failed");
    assert.equal(res.body.service.reachable, false);
    assert.equal(JSON.stringify(res.body).includes("sensitive internal client failure"), false);
  });

  it("reports service_unreachable with reachable=false on network error and timeout", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zujjiiljvjwgcxtaqype.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "secret-test-key-value";

    globalThis.fetch = (async () => {
      throw new Error("ECONNREFUSED 10.0.0.1:443");
    }) as typeof fetch;

    const netRes = await GET();
    assert.equal(netRes.status, 503);
    assert.equal(netRes.body.status, "service_unreachable");
    assert.equal(netRes.body.service.reachable, false);
    assert.equal(netRes.body.service.httpStatus, null);
    assert.equal(netRes.body.service.timedOut, false);
    assert.equal(JSON.stringify(netRes.body).includes("ECONNREFUSED"), false);

    globalThis.fetch = (async () => {
      const err = new Error("Request timed out");
      err.name = "TimeoutError";
      throw err;
    }) as typeof fetch;

    const timeoutRes = await GET();
    assert.equal(timeoutRes.status, 503);
    assert.equal(timeoutRes.body.status, "service_unreachable");
    assert.equal(timeoutRes.body.service.reachable, false);
    assert.equal(timeoutRes.body.service.timedOut, true);
  });

  it("reports reachable=true and auth_rejected on HTTP 401 and 403", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zujjiiljvjwgcxtaqype.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_secret_test";

    for (const code of [401, 403]) {
      globalThis.fetch = (async () =>
        ({ status: code, body: { cancel: async () => undefined } }) as unknown as Response) as typeof fetch;

      const res = await GET();
      assert.equal(res.status, 502);
      assert.equal(res.body.status, "auth_rejected");
      assert.equal(res.body.ok, false);
      assert.equal(res.body.service.reachable, true);
      assert.equal(res.body.service.httpStatus, code);
      assert.equal(res.body.databaseConnectivity, "not_verified");
      assert.equal(res.body.rlsVerification, "not_verified");
    }
  });

  it("reports reachable=true and upstream_error on HTTP 5xx (including 503)", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zujjiiljvjwgcxtaqype.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "secret-test-key-value";

    for (const code of [500, 503]) {
      globalThis.fetch = (async () =>
        ({ status: code, body: { cancel: async () => undefined } }) as unknown as Response) as typeof fetch;

      const res = await GET();
      assert.equal(res.status, 502);
      assert.equal(res.body.status, "upstream_error");
      assert.equal(res.body.ok, false);
      assert.equal(res.body.service.reachable, true);
      assert.equal(res.body.service.httpStatus, code);
      assert.match(res.body.note, /upstream error/i);
    }
  });

  it("probes /auth/v1/health with apikey only, cancels body, and leaks no secrets or OpenAPI metadata", async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zujjiiljvjwgcxtaqype.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_secret_test";

    let capturedUrl = "";
    let capturedHeaders: Record<string, string> = {};
    let cancelled = false;

    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      capturedUrl = String(input);
      capturedHeaders = (init?.headers ?? {}) as Record<string, string>;
      return {
        status: 200,
        body: {
          cancel: async () => {
            cancelled = true;
          },
        },
      } as unknown as Response;
    }) as typeof fetch;

    const res = await GET();
    assert.equal(capturedUrl, "https://zujjiiljvjwgcxtaqype.supabase.co/auth/v1/health");
    assert.equal(capturedHeaders.apikey, "sb_publishable_secret_test");
    assert.equal(capturedHeaders.Authorization, undefined);
    assert.equal(cancelled, true);

    assert.equal(res.status, 200);
    assert.equal(res.body.status, "service_reachable");
    assert.equal(res.body.ok, true);
    assert.equal(res.body.service.endpoint, "/auth/v1/health");
    assert.equal(res.body.service.reachable, true);
    assert.equal(res.body.service.httpStatus, 200);
    assert.equal(res.body.databaseConnectivity, "not_verified");
    assert.equal(res.body.rlsVerification, "not_verified");

    const serialized = JSON.stringify(res.body);
    for (const forbidden of [
      "sb_publishable_secret_test",
      "zujjiiljvjwgcxtaqype",
      "paths",
      "openapi",
    ]) {
      assert.equal(serialized.includes(forbidden), false);
    }
  });
});
