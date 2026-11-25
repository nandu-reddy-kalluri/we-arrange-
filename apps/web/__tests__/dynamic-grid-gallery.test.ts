import { describe, expect, it } from "vitest";
import {
  DEFAULT_GALLERY_ITEMS,
  DEFAULT_FALLBACK_IMAGE,
  normalizeGalleryItems,
  calculateGridTemplate,
  type GalleryItem,
} from "@/components/ui/dynamicGalleryData";
import { realWeddingDetails } from "@/mock-data/real-weddings";

describe("DynamicGridGallery — Expandable Interactive Image Grid Suite", () => {
  it("provides valid default gallery items structure", () => {
    expect(DEFAULT_GALLERY_ITEMS.length).toBe(6);
    for (const item of DEFAULT_GALLERY_ITEMS) {
      expect(item.src).toBeTruthy();
      expect(item.alt).toBeTruthy();
    }
    expect(DEFAULT_FALLBACK_IMAGE).toBeTruthy();
  });

  it("handles variable image counts safely (1, 2, 3, 4, 5, 6+ images) without breaking", () => {
    // 1 image
    const one = [{ src: "https://example.com/1.jpg", alt: "1" }];
    const normOne = normalizeGalleryItems(one);
    expect(normOne.length).toBe(1);
    const tmplOne = calculateGridTemplate(normOne.length, null);
    expect(tmplOne.cols).toBe(1);
    expect(tmplOne.rows).toBe(1);
    expect(tmplOne.gridTemplateColumns).toBe("1fr");

    // 2 images
    const two = ["https://example.com/1.jpg", "https://example.com/2.jpg"];
    const normTwo = normalizeGalleryItems(two);
    expect(normTwo.length).toBe(2);
    const tmplTwo = calculateGridTemplate(normTwo.length, 0, false, 1.85);
    expect(tmplTwo.cols).toBe(2);
    expect(tmplTwo.rows).toBe(1);
    expect(tmplTwo.gridTemplateColumns).toBe("1.85fr 0.9fr");

    // 3 images
    const three = ["1.jpg", "2.jpg", "3.jpg"];
    const normThree = normalizeGalleryItems(three);
    expect(normThree.length).toBe(3);
    const tmplThree = calculateGridTemplate(normThree.length, 1, false, 1.85);
    expect(tmplThree.gridTemplateColumns).toBe("0.9fr 1.85fr 0.9fr");

    // 4 images (2x2)
    const four = ["1.jpg", "2.jpg", "3.jpg", "4.jpg"];
    const normFour = normalizeGalleryItems(four);
    expect(normFour.length).toBe(4);
    const tmplFour = calculateGridTemplate(normFour.length, 3, false, 1.85);
    expect(tmplFour.cols).toBe(2);
    expect(tmplFour.rows).toBe(2);
    expect(tmplFour.gridTemplateColumns).toBe("0.9fr 1.85fr");
    expect(tmplFour.gridTemplateRows).toBe("0.9fr 1.85fr");

    // 5 images (showcase hero on left, 2x2 on right)
    const five = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg"];
    const normFive = normalizeGalleryItems(five);
    expect(normFive.length).toBe(5);
    const tmplFiveUnhovered = calculateGridTemplate(normFive.length, null);
    expect(tmplFiveUnhovered.gridTemplateColumns).toBe("1.4fr 1fr 1fr");
    const tmplFiveHover0 = calculateGridTemplate(normFive.length, 0, false, 1.85);
    expect(tmplFiveHover0.gridTemplateColumns).toContain("fr");

    // 6+ images (3x2 grid)
    const seven = ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg", "7.jpg"];
    const normSeven = normalizeGalleryItems(seven);
    expect(normSeven.length).toBe(7);
    const visible6 = normSeven.slice(0, 6);
    expect(visible6.length).toBe(6);
    const tmpl6 = calculateGridTemplate(visible6.length, 4, false, 1.85);
    expect(tmpl6.cols).toBe(3);
    expect(tmpl6.rows).toBe(2);
    expect(tmpl6.gridTemplateColumns).toBe("0.9fr 1.85fr 0.9fr");
    expect(tmpl6.gridTemplateRows).toBe("0.9fr 1.85fr");
  });

  it("disables dynamic distortion on mobile touch devices to prevent layout jumps", () => {
    // Touch device: hoveredIndex should not distort grid
    const tmplTouch = calculateGridTemplate(6, 2, true, 1.85);
    expect(tmplTouch.gridTemplateColumns).toBe("1fr 1fr 1fr");
    expect(tmplTouch.gridTemplateRows).toBe("1fr 1fr");
  });

  it("integrates seamlessly with real wedding gallery media data", () => {
    const wedding = realWeddingDetails["elegant-city-affair"];
    expect(wedding).toBeDefined();
    expect(wedding.gallery.length).toBeGreaterThanOrEqual(1);

    const normalized = normalizeGalleryItems(wedding.gallery, "/images/editorial/hero_venue.png");
    expect(normalized.length).toBe(wedding.gallery.length);
    for (const item of normalized) {
      expect(item.src).toBeTruthy();
      expect(item.alt).toBeTruthy();
    }
  });

  it("gracefully falls back on empty or undefined items without throwing", () => {
    const empty = normalizeGalleryItems([]);
    expect(empty).toEqual([]);

    const undef = normalizeGalleryItems(undefined);
    expect(undef).toEqual([]);

    const fallbackTmpl = calculateGridTemplate(0, null);
    expect(fallbackTmpl.cols).toBe(1);
    expect(fallbackTmpl.rows).toBe(1);
  });

  it("calculates lightbox thumbnail windowing accurately for large galleries (> 12 items)", () => {
    // Sliding window logic helper matching VenueDetailsClient
    const calculateVisibleThumbnails = (
      images: string[],
      activeIndex: number | null,
      maxThumbnails = 9
    ) => {
      const all = images.map((thumbUrl, idx) => ({ thumbUrl, idx }));
      if (all.length <= 12 || activeIndex === null) {
        return all;
      }
      const half = Math.floor(maxThumbnails / 2);
      let start = Math.max(0, activeIndex - half);
      let end = start + maxThumbnails;
      if (end > all.length) {
        end = all.length;
        start = Math.max(0, end - maxThumbnails);
      }
      return all.slice(start, end);
    };

    // 10 items (<= 12) -> should show all 10
    const tenImages = Array.from({ length: 10 }, (_, i) => `https://example.com/img-${i}.jpg`);
    expect(calculateVisibleThumbnails(tenImages, 2).length).toBe(10);

    // 100 items (> 12) -> should window to 9 items
    const hundredImages = Array.from({ length: 100 }, (_, i) => `https://example.com/img-${i}.jpg`);

    // At the start (index 0)
    const atStart = calculateVisibleThumbnails(hundredImages, 0);
    expect(atStart.length).toBe(9);
    expect(atStart[0].idx).toBe(0);
    expect(atStart[8].idx).toBe(8);

    // In the middle (index 50)
    const inMiddle = calculateVisibleThumbnails(hundredImages, 50);
    expect(inMiddle.length).toBe(9);
    expect(inMiddle[0].idx).toBe(46);
    expect(inMiddle[4].idx).toBe(50); // active is centered
    expect(inMiddle[8].idx).toBe(54);

    // At the end (index 99)
    const atEnd = calculateVisibleThumbnails(hundredImages, 99);
    expect(atEnd.length).toBe(9);
    expect(atEnd[8].idx).toBe(99);
    expect(atEnd[0].idx).toBe(91);
  });
});
