import { describe, expect, it } from "vitest";
import { matchesVenueBudget, parsePlatePrices } from "../src/venueService";

describe("FUNC-001: Venue Plate Price Parsing & Budget Matching", () => {
  describe("parsePlatePrices", () => {
    it("returns empty array for empty or unpriced strings", () => {
      expect(parsePlatePrices("")).toEqual([]);
      expect(parsePlatePrices("Price on Request")).toEqual([]);
      expect(parsePlatePrices("Contact for quote")).toEqual([]);
    });

    it("parses single price strings", () => {
      expect(parsePlatePrices("₹1,500")).toEqual([1500]);
      expect(parsePlatePrices("1800 per plate")).toEqual([1800]);
    });

    it("parses multi-rate strings without numeric concatenation (FUNC-001 bug fix)", () => {
      expect(parsePlatePrices("Veg: ₹1,500 / Non-Veg: ₹2,000")).toEqual([1500, 2000]);
      expect(parsePlatePrices("₹1,500 - ₹2,500")).toEqual([1500, 2500]);
    });

    it("parses decimals and Indian notation correctly", () => {
      expect(parsePlatePrices("₹1,200.50")).toEqual([1200.5]);
      expect(parsePlatePrices("₹1,50,000 package")).toEqual([150000]);
    });
  });

  describe("matchesVenueBudget", () => {
    const multiRateRow = {
      venue_name: "Grand Ballroom",
      venue_price_tag: "Veg: ₹1,500 / Non-Veg: ₹2,000",
    };

    it("correctly matches multi-rate venue within normal user budgets", () => {
      // Previously concatenated to 15002000 and failed maxPlatePrice: 5000
      expect(matchesVenueBudget(multiRateRow, { maxPlatePrice: 5000 })).toBe(true);
      expect(matchesVenueBudget(multiRateRow, { minPlatePrice: 1000, maxPlatePrice: 2500 })).toBe(true);
      expect(matchesVenueBudget(multiRateRow, { minPlatePrice: 1800, maxPlatePrice: 2200 })).toBe(true);
      expect(matchesVenueBudget(multiRateRow, { minPlatePrice: 1200, maxPlatePrice: 1600 })).toBe(true);
    });

    it("correctly rejects multi-rate venue outside budget bounds", () => {
      // User budget is below lowest price (1500)
      expect(matchesVenueBudget(multiRateRow, { maxPlatePrice: 1400 })).toBe(false);
      // User budget is above highest price (2000)
      expect(matchesVenueBudget(multiRateRow, { minPlatePrice: 2100 })).toBe(false);
    });

    it("handles price on request filters", () => {
      const requestOnlyRow = {
        venue_name: "Secret Palace",
        venue_price_tag: "Price on Request",
      };

      expect(matchesVenueBudget(requestOnlyRow, { priceOnRequestOnly: true })).toBe(true);
      expect(matchesVenueBudget(requestOnlyRow, { maxPlatePrice: 5000 })).toBe(false);
      expect(matchesVenueBudget(multiRateRow, { priceOnRequestOnly: true })).toBe(false);
    });

    it("falls back to price_range if venue_price_tag is missing", () => {
      const fallbackRow = {
        venue_name: "Lakeside Lawn",
        price_range: "₹2,000 - ₹3,000",
      };

      expect(matchesVenueBudget(fallbackRow, { minPlatePrice: 1500, maxPlatePrice: 2500 })).toBe(true);
      expect(matchesVenueBudget(fallbackRow, { maxPlatePrice: 1800 })).toBe(false);
    });

    it("evaluates structured numeric price columns directly without regex parsing (BE-001)", () => {
      const numericRow = {
        venue_name: "Modern Convention Centre",
        min_plate_price: 1200,
        max_plate_price: 1800,
        venue_price_tag: "Veg: ₹1,200 / Non-Veg: ₹1,800",
      };

      // Within range
      expect(matchesVenueBudget(numericRow, { minPlatePrice: 1000, maxPlatePrice: 2000 })).toBe(true);
      expect(matchesVenueBudget(numericRow, { maxPlatePrice: 1500 })).toBe(true);
      expect(matchesVenueBudget(numericRow, { minPlatePrice: 1500 })).toBe(true);

      // Outside range
      expect(matchesVenueBudget(numericRow, { maxPlatePrice: 1100 })).toBe(false);
      expect(matchesVenueBudget(numericRow, { minPlatePrice: 1900 })).toBe(false);
      expect(matchesVenueBudget(numericRow, { priceOnRequestOnly: true })).toBe(false);
    });
  });
});
