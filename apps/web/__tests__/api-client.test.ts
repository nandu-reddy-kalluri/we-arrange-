import { afterEach, describe, expect, it, vi } from "vitest";
import {
  apiClient,
  conciergeApi,
  fetchApi,
  registerAccessTokenProvider,
} from "@we-arrange/api-client";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("@we-arrange/api-client", () => {
  afterEach(() => {
    registerAccessTokenProvider(null);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("unwraps { ok: true, data, meta } envelopes cleanly", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({ ok: true, data: { items: [1, 2] }, meta: { total: 2 } }, 200)
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiClient.get<{ items: number[] }>("/api/venues", {
      baseUrl: "http://localhost:3000",
      query: { page: 1, empty: "" },
    });

    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ items: [1, 2] });
    expect(res.meta).toEqual({ total: 2 });
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("http://localhost:3000/api/venues?page=1");
  });

  it("extracts structured error details when ok is false", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse(
        {
          ok: false,
          error: { code: "FORBIDDEN", message: "Active admin access required." },
        },
        403
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiClient.get("/api/admin/me", {
      baseUrl: "http://localhost:3000",
      retryOn401: false,
    });

    expect(res.ok).toBe(false);
    expect(res.status).toBe(403);
    expect(res.error).toBe("Active admin access required.");
    expect(res.errorCode).toBe("FORBIDDEN");
  });

  it("injects Bearer Authorization header from registerAccessTokenProvider", async () => {
    registerAccessTokenProvider(async () => "sb-access-token-123");
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true, data: { id: "u1" } }));
    vi.stubGlobal("fetch", fetchMock);

    await fetchApi("/api/auth/me", { baseUrl: "http://localhost:3000" });

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(init.headers);
    expect(headers.get("Authorization")).toBe("Bearer sb-access-token-123");
    expect(init.credentials).toBe("include");
  });

  it("attempts a single token refresh on 401 and retries the request once", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ ok: false, error: { message: "Expired" } }, 401))
      .mockResolvedValueOnce(jsonResponse({ ok: true, data: { refreshed: true } }, 200))
      .mockResolvedValueOnce(jsonResponse({ ok: true, data: { userId: "u1" } }, 200));
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiClient.get<{ userId: string }>("/api/customer/profile", {
      baseUrl: "http://localhost:3000",
    });

    expect(res.ok).toBe(true);
    expect(res.data).toEqual({ userId: "u1" });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1]?.[0]).toBe("http://localhost:3000/api/auth/refresh");
  });

  it("rejects conciergeApi.createQuote when venueId and vendorId are not mutually exclusive", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const both = await conciergeApi.createQuote(10, {
      venueId: 1,
      vendorId: 2,
      packageName: "Invalid",
      baseCostInr: 100000,
      cateringIncluded: true,
      inclusions: [],
      exclusions: [],
      status: "Draft",
    });

    expect(both.ok).toBe(false);
    expect(both.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
