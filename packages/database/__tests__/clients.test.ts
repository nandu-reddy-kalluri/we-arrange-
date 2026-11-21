import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createBearerSupabaseClient,
  createPublicAnonClient,
  createServiceRoleClient,
  getSupabaseServiceRoleEnv,
} from "../src/clients";

describe("@we-arrange/database client factories", () => {
  const savedEnv = {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anon: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    pub: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    service: process.env.SUPABASE_SERVICE_ROLE_KEY,
  };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://zujjiiljvjwgcxtaqype.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key-value";
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  afterEach(() => {
    if ("window" in globalThis) {
      delete (globalThis as { window?: unknown }).window;
    }
    if (savedEnv.url !== undefined) process.env.NEXT_PUBLIC_SUPABASE_URL = savedEnv.url;
    else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (savedEnv.anon !== undefined) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedEnv.anon;
    else delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (savedEnv.pub !== undefined) {
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = savedEnv.pub;
    } else {
      delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    }
    if (savedEnv.service !== undefined) {
      process.env.SUPABASE_SERVICE_ROLE_KEY = savedEnv.service;
    } else {
      delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    }
  });

  it("creates a public anon client when public env vars are valid", () => {
    const client = createPublicAnonClient();
    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
    expect(typeof client.auth.getUser).toBe("function");
  });

  it("creates a bearer-authenticated client and rejects malformed tokens", () => {
    expect(() => createBearerSupabaseClient("")).toThrow(/bearer access token/i);
    expect(() => createBearerSupabaseClient("bad token with spaces")).toThrow(/bearer access token/i);

    const client = createBearerSupabaseClient("header.payload.signature");
    expect(client).toBeDefined();
    expect(typeof client.from).toBe("function");
  });

  it("rejects missing, placeholder, or whitespace service-role keys without leaking secrets", () => {
    expect(() => getSupabaseServiceRoleEnv()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);

    process.env.SUPABASE_SERVICE_ROLE_KEY = "your-server-only-service-role-key";
    expect(() => getSupabaseServiceRoleEnv()).toThrow(/SUPABASE_SERVICE_ROLE_KEY/);

    process.env.SUPABASE_SERVICE_ROLE_KEY = "secret key with space";
    let thrownMessage = "";
    try {
      getSupabaseServiceRoleEnv();
    } catch (error) {
      thrownMessage = error instanceof Error ? error.message : String(error);
    }
    expect(thrownMessage).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(thrownMessage).not.toContain("secret key with space");
  });

  it("blocks service-role calls in browser runtimes and creates a client server-side", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-secret-value";

    (globalThis as { window?: unknown }).window = {};
    expect(() => getSupabaseServiceRoleEnv()).toThrow(/browser runtime/i);
    expect(() => createServiceRoleClient()).toThrow(/browser runtime/i);

    delete (globalThis as { window?: unknown }).window;
    const serviceClient = createServiceRoleClient();
    expect(serviceClient).toBeDefined();
    expect(typeof serviceClient.from).toBe("function");
  });
});

