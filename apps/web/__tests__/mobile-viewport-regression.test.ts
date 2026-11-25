import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("Mobile Safari & Chrome Viewport Regression & Safe-Area Suite", () => {
  it("verifies RootLayout exports viewport with viewportFit: cover for iOS Safari notch handling", () => {
    const layoutPath = path.resolve(process.cwd(), "apps/web/app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf8");

    expect(layoutContent).toContain('viewportFit: "cover"');
    expect(layoutContent).toContain('width: "device-width"');
    expect(layoutContent).toContain("initialScale: 1");
    expect(layoutContent).toContain('themeColor: "#8B263E"');
  });

  it("verifies mobile sticky consultation bars apply safe-area-inset-bottom on both venues and vendors", () => {
    const venueClientPath = path.resolve(
      process.cwd(),
      "apps/web/app/(public)/venues/[slug]/VenueDetailsClient.tsx"
    );
    const vendorClientPath = path.resolve(
      process.cwd(),
      "apps/web/app/(public)/vendors/[slug]/VendorDetailsClient.tsx"
    );

    const venueContent = fs.readFileSync(venueClientPath, "utf8");
    const vendorContent = fs.readFileSync(vendorClientPath, "utf8");

    // Both must use safe-area-inset-bottom for notched iOS Safari devices
    expect(venueContent).toContain("env(safe-area-inset-bottom");
    expect(vendorContent).toContain("env(safe-area-inset-bottom");
  });

  it("verifies FloatingConciergeButton positions above mobile sticky consultation bar and respects safe area", () => {
    const buttonPath = path.resolve(
      process.cwd(),
      "apps/web/components/layout/FloatingConciergeButton.tsx"
    );
    const content = fs.readFileSync(buttonPath, "utf8");

    // Must calculate height above bottom bar including safe area inset
    expect(content).toContain("env(safe-area-inset-bottom");
    // Must satisfy minimum 44px touch target (w-11 = 44px)
    expect(content).toMatch(/w-11|w-12/);
    expect(content).toMatch(/h-11|h-12/);
  });

  it("verifies z-index stacking order prevents mobile UI control clipping", () => {
    const venueClientPath = path.resolve(
      process.cwd(),
      "apps/web/app/(public)/venues/[slug]/VenueDetailsClient.tsx"
    );
    const buttonPath = path.resolve(
      process.cwd(),
      "apps/web/components/layout/FloatingConciergeButton.tsx"
    );

    const venueContent = fs.readFileSync(venueClientPath, "utf8");
    const buttonContent = fs.readFileSync(buttonPath, "utf8");

    // Stacking tier:
    // Floating Concierge: z-30
    // Sticky bottom bar: z-40
    // Fullscreen lightbox/modals: z-[200]
    expect(buttonContent).toContain("z-30");
    expect(venueContent).toContain("z-40");
    expect(venueContent).toContain("z-[200]");
  });

  it("verifies mobile experience root prevents horizontal page shaking/overflow", () => {
    const mobileHomePath = path.resolve(
      process.cwd(),
      "apps/web/features/home/components/MobileHomeExperience.tsx"
    );
    const content = fs.readFileSync(mobileHomePath, "utf8");
    expect(content).toContain("overflow-x-hidden");
  });
});
