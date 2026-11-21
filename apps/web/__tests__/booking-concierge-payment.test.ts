import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addBookingDocument,
  assignEnquirySpecialist,
  createAdminRefund,
  createBookingFromAcceptedQuote,
  createComparisonSheet,
  createCuratedQuote,
  createCustomerEnquiry,
  createOrReusePaymentIntent,
  getEnquiryDetail,
  processVerifiedPaymentWebhook,
  respondToQuote,
  updateBookingStatus,
  updateCuratedQuote,
  validateAndCalculateCoupon,
} from "@we-arrange/service-booking";
import { AppError } from "@we-arrange/database/errors";
import { createGatewayPaymentIntent, verifyPaymentWebhookSignature } from "@/services/payments/adapter";
import { getPrivateVenueContactsForStaff } from "@/services/concierge/conciergeService";
import { createMockSupabaseClient } from "./helpers/mockSupabase";

const authMock = vi.hoisted(() => ({
  requireConciergeOrAdmin: vi.fn(),
}));

const dbClientsMock = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock("@/services/auth", () => authMock);
vi.mock("@we-arrange/database/clients", () => dbClientsMock);

import { POST as webhookPost } from "@/app/api/webhooks/payments/route";
import { GET as conciergeVenueContactsGet } from "@/app/api/concierge/venues/[id]/contacts/route";

describe("Enquiries, Quotes, Comparisons, Bookings & Payments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates enquiry in Pending state with null assigned_specialist_id and logs history", async () => {
    let insertedEnquiry: Record<string, unknown> | null = null as Record<string, unknown> | null;
    let insertedHistory: Record<string, unknown> | null = null as Record<string, unknown> | null;

    const client = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "enquiries" && op === "insert") {
          insertedEnquiry = state.payload as Record<string, unknown>;
          return { data: { enquiry_id: 10, ...insertedEnquiry }, error: null };
        }
        if (table === "enquiry_status_history" && op === "insert") {
          insertedHistory = state.payload as Record<string, unknown>;
          return { data: insertedHistory, error: null };
        }
        return { data: [], error: null };
      },
    });

    const res = await createCustomerEnquiry(client, client, "cust-1", {
      venueId: 12,
      subject: "December wedding shortlist",
      message: "Looking for lawn + banquet for 500 guests",
      eventDate: "2027-12-10",
      guestCount: 500,
    });

    expect(res.enquiry_id).toBe(10);
    expect(insertedEnquiry?.status).toBe("Pending");
    expect(insertedEnquiry?.assigned_specialist_id).toBeNull();
    expect(String(insertedEnquiry?.message)).toContain("Event Date: 2027-12-10");
    expect(insertedHistory?.enquiry_id).toBe(10);
  });

  it("blocks cross-user enquiry access with 403 and rejects non-staff specialist assignment", async () => {
    const client = createMockSupabaseClient({
      onQuery: (table, op) => {
        if (table === "enquiries" && op === "select") {
          return { data: { enquiry_id: 10, user_id: "cust-owner", status: "Pending" }, error: null };
        }
        if (table === "admins") return { data: null, error: null };
        if (table === "users") {
          return { data: { user_id: "cust-2", role_id: 1, status: "Active" }, error: null };
        }
        if (table === "roles") return { data: { role_name: "customer" }, error: null };
        return { data: [], error: null };
      },
    });

    await expect(
      getEnquiryDetail(client, 10, { viewerUserId: "cust-other", isStaff: false })
    ).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });

    await expect(
      assignEnquirySpecialist(client, 10, { specialistId: "cust-2", assignedBy: "admin-1" })
    ).rejects.toMatchObject({ status: 400, code: "VALIDATION_ERROR" });
  });

  it("handles human-curated quote expiration, cross-enquiry comparison guard & quote approval", async () => {
    const client = createMockSupabaseClient({
      onQuery: (table, op) => {
        if (table === "enquiries" && op === "select") {
          return { data: { enquiry_id: 10, user_id: "cust-1" }, error: null };
        }
        if (table === "quotes" && op === "insert") {
          return { data: { quote_id: 77, enquiry_id: 10, status: "Published" }, error: null };
        }
        if (table === "quotes" && op === "select") {
          return {
            data: [
              {
                quote_id: 77,
                enquiry_id: 10,
                user_id: "cust-1",
                status: "Published",
                valid_until: "2020-01-01",
              },
              {
                quote_id: 78,
                enquiry_id: 99,
                status: "Published",
              },
            ],
            error: null,
          };
        }
        return { data: [], error: null };
      },
    });

    const quote = await createCuratedQuote(client, 10, "concierge-1", {
      venueId: 4,
      packageName: "Royal Mandap Package",
      baseCostInr: 750000,
      cateringIncluded: true,
      inclusions: ["Decor", "Buffet"],
      exclusions: ["DJ license"],
      status: "Published",
    });
    expect(quote.quote_id).toBe(77);

    // Expired quote cannot be Approved
    await expect(
      respondToQuote(client, 77, "cust-1", "Approved")
    ).rejects.toMatchObject({ status: 422 });

    // Cross-enquiry quote_ids rejected for comparison sheets
    await expect(
      createComparisonSheet(client, 10, "concierge-1", {
        title: "Top 2 Venues",
        quoteIds: [77, 78],
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  it("enforces booking only from Approved quote and prevents duplicate booking (409)", async () => {
    let quoteStatus = "Published";
    let hasBooking = false;

    const client = createMockSupabaseClient({
      onQuery: (table, op) => {
        if (table === "quotes" && op === "select") {
          return {
            data: {
              quote_id: 50,
              enquiry_id: 10,
              venue_id: 4,
              vendor_id: null,
              base_cost_inr: 600000,
              status: quoteStatus,
              notes: "Curated deal",
            },
            error: null,
          };
        }
        if (table === "enquiries" && op === "select") {
          return { data: { enquiry_id: 10, user_id: "cust-1" }, error: null };
        }
        if (table === "bookings" && op === "select") {
          return { data: hasBooking ? { booking_id: 901 } : null, error: null };
        }
        if (table === "booking_status" && op === "select") {
          return { data: { status_id: 1, status_name: "Pending" }, error: null };
        }
        if (table === "bookings" && op === "insert") {
          hasBooking = true;
          return { data: { booking_id: 901, quote_id: 50, total_amount: 600000 }, error: null };
        }
        return { data: [], error: null };
      },
    });

    await expect(
      createBookingFromAcceptedQuote(client, { userId: "cust-1", isStaff: false }, {
        quoteId: 50,
        eventDate: "2027-11-22",
      })
    ).rejects.toMatchObject({ status: 422 });

    quoteStatus = "Approved";
    const booking = await createBookingFromAcceptedQuote(
      client,
      { userId: "cust-1", isStaff: false },
      { quoteId: 50, eventDate: "2027-11-22", guestCount: 300 }
    );
    expect(booking.booking_id).toBe(901);

    await expect(
      createBookingFromAcceptedQuote(client, { userId: "cust-1", isStaff: false }, {
        quoteId: 50,
        eventDate: "2027-11-22",
      })
    ).rejects.toMatchObject({ status: 409, code: "CONFLICT" });
  });

  it("handles payment intent idempotency, coupon caps, HMAC webhooks & refund balance guards", async () => {
    const futureDate = "2099-12-31T23:59:59.000Z";
    let txInserted = false;
    let paymentUpdated = false;

    const client = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "coupons" && op === "select") {
          return {
            data: {
              coupon_id: 3,
              coupon_code: "WED10",
              status: "Active",
              discount_type: "percentage",
              discount_value: 10,
              maximum_discount: 15000,
              minimum_amount: 50000,
              usage_limit: 100,
              used_count: 5,
              valid_from: "2020-01-01T00:00:00.000Z",
              valid_until: futureDate,
            },
            error: null,
          };
        }
        if (table === "payments" && op === "select") {
          const isByIdemp = state.filters.some((f) => f.args[0] === "idempotency_key");
          if (isByIdemp) {
            return { data: null, error: null };
          }
          return {
            data: {
              payment_id: 201,
              user_id: "cust-1",
              booking_id: 901,
              amount: 185000,
              payment_method: "upi",
              payment_status: paymentUpdated ? "Paid" : "Pending",
            },
            error: null,
          };
        }
        if (table === "bookings" && op === "select") {
          return {
            data: { booking_id: 901, user_id: "cust-1", total_amount: 200000 },
            error: null,
          };
        }
        if (table === "payments" && op === "insert") {
          return {
            data: { payment_id: 201, ...(state.payload as Record<string, unknown>) },
            error: null,
          };
        }
        if (table === "transactions" && op === "select") {
          return { data: txInserted ? { transaction_id: 55 } : null, error: null };
        }
        if (table === "transactions" && op === "insert") {
          txInserted = true;
          return { data: { transaction_id: 55 }, error: null };
        }
        if (table === "payments" && op === "update") {
          paymentUpdated = true;
          return { data: [{ payment_id: 201 }], error: null };
        }
        if (table === "refunds" && op === "select") {
          return { data: [{ amount: 100000, refund_status: "Pending" }], error: null };
        }
        return { data: [], error: null };
      },
    });

    const coupon = await validateAndCalculateCoupon(client, "WED10", 200000);
    expect(coupon.discountInr).toBe(15000);
    expect(coupon.finalAmountInr).toBe(185000);

    const intent = await createOrReusePaymentIntent(client, "cust-1", {
      bookingId: 901,
      amountInr: 200000,
      paymentMethod: "upi",
      couponCode: "WED10",
      idempotencyKey: "idem_key_123456",
    });
    expect(intent.reused).toBe(false);
    expect(intent.payment.amount).toBe(185000);
    expect(intent.payment.payment_status).toBe("Pending");

    const gwIntent = createGatewayPaymentIntent({
      paymentId: 201,
      bookingId: 901,
      amountInr: 185000,
      currency: "INR",
      paymentMethod: "upi",
      idempotencyKey: "idem_key_123456",
    });
    expect(gwIntent.status).toBe("Pending");

    // Signature helper verification
    const payload = JSON.stringify({
      eventType: "payment.captured",
      paymentId: 201,
      transactionReference: "pay_ref_abc",
      gateway: "razorpay",
      amountInr: 185000,
    });
    const secret = "whsec_test_secret";
    const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    expect(verifyPaymentWebhookSignature(payload, sig, secret)).toBe(true);
    expect(verifyPaymentWebhookSignature(payload, "0000", secret)).toBe(false);

    // Webhook handler end-to-end (fails 503 if secret missing, 401 if bad sig, 200 if valid)
    const oldSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    delete process.env.PAYMENT_WEBHOOK_SECRET;
    const res503 = await webhookPost(
      new NextRequest("http://localhost/api/webhooks/payments", {
        method: "POST",
        body: payload,
      })
    );
    expect(res503.status).toBe(503);

    process.env.PAYMENT_WEBHOOK_SECRET = secret;
    dbClientsMock.createServiceRoleClient.mockReturnValue(client);
    const res401 = await webhookPost(
      new NextRequest("http://localhost/api/webhooks/payments", {
        method: "POST",
        headers: { "x-ymwa-signature": "deadbeef" },
        body: payload,
      })
    );
    expect(res401.status).toBe(401);

    const res200 = await webhookPost(
      new NextRequest("http://localhost/api/webhooks/payments", {
        method: "POST",
        headers: { "x-ymwa-signature": `sha256=${sig}` },
        body: payload,
      })
    );
    expect(res200.status).toBe(200);
    expect(paymentUpdated).toBe(true);

    // Replay returns duplicate=true without double-inserting
    const replay = await processVerifiedPaymentWebhook(client, {
      eventType: "payment.captured",
      paymentId: 201,
      transactionReference: "pay_ref_abc",
      gateway: "razorpay",
      amountInr: 185000,
      rawPayload: {},
    });
    expect(replay.duplicate).toBe(true);

    // Refund exceeding remaining INR 85,000 balance fails with 422
    await expect(
      createAdminRefund(client, 201, { amountInr: 90000, reason: "Customer cancellation" })
    ).rejects.toMatchObject({ status: 422 });

    if (oldSecret !== undefined) {
      process.env.PAYMENT_WEBHOOK_SECRET = oldSecret;
    } else {
      delete process.env.PAYMENT_WEBHOOK_SECRET;
    }
  });

  it("denies concierge PII route to non-staff and allows booking owner documents only", async () => {
    authMock.requireConciergeOrAdmin.mockRejectedValueOnce(
      new AppError("FORBIDDEN", 403, "Forbidden")
    );

    const res = await conciergeVenueContactsGet(
      new NextRequest("http://localhost/api/concierge/venues/5/contacts"),
      { params: Promise.resolve({ id: "5" }) }
    );
    expect(res.status).toBe(403);

    const client = createMockSupabaseClient({
      onQuery: (table) => {
        if (table === "venues") {
          return {
            data: {
              venue_id: 5,
              venue_name: "Palace Grounds",
              phone: "+91-9999988888",
              website: null,
              google_maps: null,
              address: "Road No 12",
            },
            error: null,
          };
        }
        if (table === "venue_contacts") {
          return { data: [{ contact_id: 1, contact_name: "Manager" }], error: null };
        }
        if (table === "bookings") {
          return { data: { booking_id: 901, user_id: "cust-1" }, error: null };
        }
        return { data: [], error: null };
      },
    });

    const staffContacts = await getPrivateVenueContactsForStaff(client, 5);
    expect(staffContacts.primaryPhone).toBe("+91-9999988888");
    expect(staffContacts.contacts).toHaveLength(1);

    await expect(
      addBookingDocument(
        client,
        901,
        { userId: "cust-other", isStaff: false },
        {
          documentName: "Contract.pdf",
          documentUrl: "https://cdn.example.com/contract.pdf",
          documentType: "contract",
        }
      )
    ).rejects.toMatchObject({ status: 403 });
  });

  it("enforces valid booking status transitions, concierge scope, and quote approval guards", async () => {
    let currentBookingStatusId = 1;
    let currentQuoteStatus: "Draft" | "Published" | "Approved" | "Rejected" = "Published";
    const statusNameById: Record<number, string> = {
      1: "Pending",
      2: "Confirmed",
      3: "In Progress",
      4: "Completed",
      5: "Cancelled",
      6: "Refunded",
    };
    const idByStatusName: Record<string, number> = {
      pending: 1,
      confirmed: 2,
      "in progress": 3,
      completed: 4,
      cancelled: 5,
      refunded: 6,
    };

    const client = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "bookings" && op === "select") {
          return {
            data: { booking_id: 901, status_id: currentBookingStatusId, enquiry_id: 10 },
            error: null,
          };
        }
        if (table === "enquiries" && op === "select") {
          return {
            data: { enquiry_id: 10, assigned_specialist_id: "concierge-a" },
            error: null,
          };
        }
        if (table === "booking_status" && op === "select") {
          const byIdFilter = state.filters.find((f) => f.args[0] === "status_id");
          if (byIdFilter) {
            const id = Number(byIdFilter.args[1]);
            return { data: { status_id: id, status_name: statusNameById[id] ?? "Pending" }, error: null };
          }
          const byNameFilter = state.filters.find((f) => f.args[0] === "status_name");
          const rawName = String(byNameFilter?.args[1] ?? "Pending").toLowerCase();
          const matchedId = idByStatusName[rawName];
          return {
            data: matchedId
              ? { status_id: matchedId, status_name: statusNameById[matchedId] }
              : null,
            error: null,
          };
        }
        if (table === "bookings" && op === "update") {
          const payload = state.payload as { status_id: number };
          currentBookingStatusId = payload.status_id;
          return {
            data: { booking_id: 901, status_id: currentBookingStatusId },
            error: null,
          };
        }
        if (table === "quotes" && op === "select") {
          return {
            data: {
              quote_id: 55,
              enquiry_id: 10,
              collected_by: "concierge-a",
              status: currentQuoteStatus,
            },
            error: null,
          };
        }
        if (table === "quotes" && op === "update") {
          const payload = state.payload as { status?: typeof currentQuoteStatus };
          if (payload.status) currentQuoteStatus = payload.status;
          return { data: { quote_id: 55, status: currentQuoteStatus }, error: null };
        }
        return { data: [], error: null };
      },
    });

    // Concierge B denied on Concierge A's assigned booking
    await expect(
      updateBookingStatus(
        client,
        901,
        { statusName: "Confirmed" },
        { userId: "concierge-b", isActiveAdmin: false }
      )
    ).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });

    // Invalid jump Pending -> Completed rejected with 422
    await expect(
      updateBookingStatus(
        client,
        901,
        { statusName: "Completed" },
        { userId: "concierge-a", isActiveAdmin: false }
      )
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE_ENTITY" });

    // Valid Pending -> Confirmed -> In Progress -> Completed
    const res1 = await updateBookingStatus(
      client,
      901,
      { statusName: "Confirmed" },
      { userId: "concierge-a", isActiveAdmin: false }
    );
    expect(res1.status.status_name).toBe("Confirmed");

    const res2 = await updateBookingStatus(
      client,
      901,
      { statusName: "In Progress" },
      { userId: "admin-1", isActiveAdmin: true }
    );
    expect(res2.status.status_name).toBe("In Progress");

    const res3 = await updateBookingStatus(
      client,
      901,
      { statusName: "Completed" },
      { userId: "admin-1", isActiveAdmin: true }
    );
    expect(res3.status.status_name).toBe("Completed");

    // Completed -> Pending rejected with 422
    await expect(
      updateBookingStatus(
        client,
        901,
        { statusName: "Pending" },
        { userId: "admin-1", isActiveAdmin: true }
      )
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE_ENTITY" });

    // Non-admin concierge cannot approve customer quote (403)
    await expect(
      updateCuratedQuote(
        client,
        55,
        { status: "Approved" },
        { userId: "concierge-a", isActiveAdmin: false }
      )
    ).rejects.toMatchObject({ status: 403, code: "FORBIDDEN" });

    // Finalized Approved quote cannot transition back to Draft (422)
    currentQuoteStatus = "Approved";
    await expect(
      updateCuratedQuote(
        client,
        55,
        { status: "Draft" },
        { userId: "admin-1", isActiveAdmin: true }
      )
    ).rejects.toMatchObject({ status: 422, code: "UNPROCESSABLE_ENTITY" });
  });
});
