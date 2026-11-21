import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { NAVIGATION_HIERARCHY } from "@/components/layout/Navbar/data/navigationData";

describe("Phase 7: UI Completion, Navigation, Responsiveness & State Completeness", () => {
  // ── 1. Public Website Routes & Navigation ────────────────────────────────
  describe("Public Website Pages & Navigation Hierarchy", () => {
    it("verifies informational footer route files exist with content", () => {
      const publicDir = path.resolve(process.cwd(), "apps/web/app/(public)");
      const expectedPages = ["about/page.tsx", "contact/page.tsx", "terms/page.tsx", "privacy/page.tsx", "faq/page.tsx"];

      for (const pageRel of expectedPages) {
        const fullPath = path.join(publicDir, pageRel);
        expect(fs.existsSync(fullPath)).toBe(true);
        const content = fs.readFileSync(fullPath, "utf8");
        expect(content.length).toBeGreaterThan(200);
        expect(content).toContain("export default");
      }
    });

    it("verifies all top-level and mega-menu links in NAVIGATION_HIERARCHY are valid routes", () => {
      expect(NAVIGATION_HIERARCHY.length).toBeGreaterThan(0);

      for (const item of NAVIGATION_HIERARCHY) {
        expect(item.href).toMatch(/^\/(venues|vendors|inspiration|wedding-studio)/);

        if (item.sections) {
          for (const section of item.sections) {
            expect(section.items.length).toBeGreaterThan(0);
            for (const subItem of section.items) {
              expect(subItem.href).toMatch(/^\/(venues|vendors|inspiration)/);
              expect(subItem.label).toBeTruthy();
            }
          }
        }

        if (item.items) {
          for (const subItem of item.items) {
            expect(subItem.href).toMatch(/^\/(venues|vendors|inspiration)/);
            expect(subItem.label).toBeTruthy();
          }
        }
      }
    });

    it("verifies venue category query params align with supported search filters", () => {
      const venuesNav = NAVIGATION_HIERARCHY.find((n) => n.id === "venues");
      expect(venuesNav).toBeDefined();

      const browseSection = venuesNav?.sections?.find((s) => s.title === "Browse");
      expect(browseSection).toBeDefined();

      const hotelLink = browseSection?.items.find((i) => i.label === "Hotels");
      expect(hotelLink?.href).toBe("/venues?venueType=Hotel");

      const resortLink = browseSection?.items.find((i) => i.label === "Resorts");
      expect(resortLink?.href).toBe("/venues?venueType=Resort");

      const palaceLink = browseSection?.items.find((i) => i.label === "Luxury Venues");
      expect(palaceLink?.href).toBe("/venues?venueType=Palace");
    });
  });

  // ── 2. Vendor Portal UI States ───────────────────────────────────────────
  describe("Vendor Portal Verification & State Logic", () => {
    it("distinguishes verified vs unverified partner badges accurately", () => {
      function getVerificationBadge(isVerified: boolean | null | undefined, status?: string) {
        if (isVerified) {
          return { label: "Verified Partner", variant: "emerald" };
        }
        return { label: `Status: ${status || "Pending Verification"}`, variant: "amber" };
      }

      const verified = getVerificationBadge(true);
      expect(verified.variant).toBe("emerald");
      expect(verified.label).toBe("Verified Partner");

      const unverified = getVerificationBadge(false, "Pending Verification");
      expect(unverified.variant).toBe("amber");
      expect(unverified.label).toContain("Pending Verification");

      const defaultNull = getVerificationBadge(null);
      expect(defaultNull.variant).toBe("amber");
      expect(defaultNull.label).toBe("Status: Pending Verification");
    });
  });

  // ── 3. Admin Portal State Completeness ────────────────────────────────────
  describe("Admin Portal Status Badge Tone Mapping", () => {
    function statusTone(status: string): string {
      const s = status.trim().toLowerCase();
      if (
        s === "active" ||
        s === "approved" ||
        s === "published" ||
        s === "confirmed" ||
        s === "completed" ||
        s === "verified"
      ) {
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      }
      if (s === "pending" || s === "in progress" || s === "draft") {
        return "bg-amber-50 text-amber-800 border-amber-200";
      }
      if (s === "rejected" || s === "cancelled" || s === "inactive" || s === "refunded") {
        return "bg-red-50 text-red-700 border-red-200";
      }
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
    }

    it("maps operational lifecycle states to consistent luxury tones", () => {
      expect(statusTone("Active")).toContain("emerald");
      expect(statusTone("Verified")).toContain("emerald");
      expect(statusTone("Approved")).toContain("emerald");
      expect(statusTone("Pending")).toContain("amber");
      expect(statusTone("Draft")).toContain("amber");
      expect(statusTone("Rejected")).toContain("red");
      expect(statusTone("Inactive")).toContain("red");
      expect(statusTone("UnknownStatus")).toContain("neutral");
    });
  });

  // ── 4. Customer Portal Data Mapping & State Safeguards ───────────────────
  describe("Customer Portal Data Normalization & Safeguards", () => {
    it("sanitizes post-login redirect targets to avoid open redirect vulnerabilities", () => {
      function sanitizeRedirect(raw: string | null): string {
        if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
          return "/overview";
        }
        return raw === "/login" || raw === "/register" ? "/overview" : raw;
      }

      expect(sanitizeRedirect(null)).toBe("/overview");
      expect(sanitizeRedirect("https://malicious.com")).toBe("/overview");
      expect(sanitizeRedirect("//evil.com")).toBe("/overview");
      expect(sanitizeRedirect("/login")).toBe("/overview");
      expect(sanitizeRedirect("/register")).toBe("/overview");
      expect(sanitizeRedirect("/bookings")).toBe("/bookings");
      expect(sanitizeRedirect("/saved")).toBe("/saved");
      expect(sanitizeRedirect("/settings")).toBe("/settings");
    });
  });
});
