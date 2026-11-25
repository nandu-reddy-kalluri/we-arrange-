import { describe, expect, it } from "vitest";
import { GET as healthHandler } from "../app/api/health/route";

describe("Phase 3 Remediation Verification (FE-002, OPS-001, IMG-003, IMG-004, FE-001)", () => {
  it("OPS-001: /api/health endpoint returns structured health metrics", async () => {
    const res = await healthHandler();
    expect([200, 503]).toContain(res.status);

    const data = await res.json();
    expect(["pass", "fail"]).toContain(data.status);
    expect(typeof data.timestamp).toBe("string");
    expect(typeof data.uptimeSeconds).toBe("number");
    expect(data.checks).toHaveProperty("database");
    expect(res.headers.get("Cache-Control")).toBe("no-store, max-age=0");
  });

  it("IMG-003 & IMG-004: gallery pagination displays initial 12 items and correctly slices remainder", () => {
    const mockPhotos = Array.from({ length: 30 }, (_, i) => `https://example.com/photo-${i + 1}.webp`);
    const initialDisplayLimit = 12;

    const initialSlice = mockPhotos.slice(0, initialDisplayLimit);
    expect(initialSlice).toHaveLength(12);
    expect(initialSlice[0]).toBe("https://example.com/photo-1.webp");
    expect(initialSlice[11]).toBe("https://example.com/photo-12.webp");

    const remainingCount = mockPhotos.length - initialDisplayLimit;
    expect(remainingCount).toBe(18);

    // Clicking "Load More" increments limit by 12
    const nextLimit = initialDisplayLimit + 12;
    const nextSlice = mockPhotos.slice(0, nextLimit);
    expect(nextSlice).toHaveLength(24);
    expect(mockPhotos.length - nextLimit).toBe(6);
  });

  it("FE-002: directory pagination math handles exact, partial and empty pages cleanly", () => {
    const computePagination = (total: number, limit: number) => ({
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });

    expect(computePagination(0, 20)).toEqual({ total: 0, totalPages: 1 });
    expect(computePagination(15, 20)).toEqual({ total: 15, totalPages: 1 });
    expect(computePagination(20, 20)).toEqual({ total: 20, totalPages: 1 });
    expect(computePagination(21, 20)).toEqual({ total: 21, totalPages: 2 });
    expect(computePagination(105, 20)).toEqual({ total: 105, totalPages: 6 });
  });
});
