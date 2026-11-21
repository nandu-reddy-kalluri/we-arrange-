import { describe, expect, it } from "vitest";
import {
  bookingCreateFromQuoteSchema,
  comparisonSheetCreateSchema,
  favoriteCreateSchema,
  paymentIntentCreateSchema,
  quoteCreateSchema,
  reviewCreateSchema,
  unifiedSearchQuerySchema,
  vendorSelfUpdateSchema,
  venueQuerySchema,
} from "../src";

describe("@we-arrange/validation Domain Schemas", () => {
  it("enforces non-price sorting rules on venue & search queries", () => {
    expect(venueQuerySchema.parse({ page: "2", limit: "15", sortBy: "rating" })).toMatchObject({
      page: 2,
      limit: 15,
      sortBy: "rating",
    });

    expect(venueQuerySchema.safeParse({ sortBy: "price" }).success).toBe(false);
    expect(venueQuerySchema.safeParse({ sortBy: "price_asc" }).success).toBe(false);
    expect(unifiedSearchQuerySchema.safeParse({ sortBy: "cheapest" }).success).toBe(false);
    expect(venueQuerySchema.safeParse({ limit: "999" }).success).toBe(false);
  });

  it("blocks privileged fields in vendorSelfUpdateSchema", () => {
    expect(vendorSelfUpdateSchema.safeParse({ vendorName: "Royal Studio" }).success).toBe(true);
    expect(vendorSelfUpdateSchema.safeParse({ isVerified: true }).success).toBe(false);
    expect(vendorSelfUpdateSchema.safeParse({ status: "Active" }).success).toBe(false);
    expect(vendorSelfUpdateSchema.safeParse({ userId: "123e4567-e89b-12d3-a456-426614174000" }).success).toBe(false);
  });

  it("enforces target exclusivity on favorites, quotes, and reviews", () => {
    expect(favoriteCreateSchema.safeParse({ venueId: 12 }).success).toBe(true);
    expect(favoriteCreateSchema.safeParse({ venueId: 12, vendorId: 5 }).success).toBe(false);
    expect(favoriteCreateSchema.safeParse({}).success).toBe(false);

    expect(
      quoteCreateSchema.safeParse({
        venueId: 10,
        packageName: "Royal Muhurtham",
        baseCostInr: 450000,
      }).success
    ).toBe(true);
    expect(
      quoteCreateSchema.safeParse({
        venueId: 10,
        vendorId: 20,
        packageName: "Both",
        baseCostInr: 1000,
      }).success
    ).toBe(false);

    expect(
      reviewCreateSchema.safeParse({
        vendorId: 7,
        rating: 5,
        reviewText: "Fantastic photography team and timely delivery.",
      }).success
    ).toBe(true);
    expect(
      reviewCreateSchema.safeParse({
        venueId: 1,
        vendorId: 7,
        rating: 5,
        reviewText: "Invalid dual target review text.",
      }).success
    ).toBe(false);
  });

  it("validates comparison sheets, bookings, and INR payment intents", () => {
    expect(comparisonSheetCreateSchema.safeParse({ title: "Top 1", quoteIds: [1] }).success).toBe(false);
    expect(
      comparisonSheetCreateSchema.safeParse({ title: "Hyderabad Shortlist", quoteIds: [1, 2] }).success
    ).toBe(true);

    expect(
      bookingCreateFromQuoteSchema.safeParse({ quoteId: 101, eventDate: "2026-12-10" }).success
    ).toBe(true);
    expect(
      bookingCreateFromQuoteSchema.safeParse({ quoteId: 101, eventDate: "12/10/2026" }).success
    ).toBe(false);

    expect(
      paymentIntentCreateSchema.safeParse({
        bookingId: 5,
        amountInr: 50000,
        idempotencyKey: "idem_booking_5_deposit_1",
      }).success
    ).toBe(true);
    expect(
      paymentIntentCreateSchema.safeParse({
        bookingId: 5,
        amountInr: 0,
        idempotencyKey: "short",
      }).success
    ).toBe(false);
  });
});

