import crypto from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { AppError } from "@we-arrange/database/errors";
import { createMockSupabaseClient } from "./helpers/mockSupabase";

const mocks = vi.hoisted(() => ({
  createPublicAnonClient: vi.fn(),
  createServiceRoleClient: vi.fn(),
  createSupabaseServerClient: vi.fn(),
  requireAuthenticatedUser: vi.fn(),
  requireConciergeOrAdmin: vi.fn(),
  requireActiveAdmin: vi.fn(),
  requireVendorOwner: vi.fn(),
  resolveAuthenticatedContext: vi.fn(),
}));

vi.mock("@we-arrange/database/clients", () => ({
  createPublicAnonClient: mocks.createPublicAnonClient,
  createServiceRoleClient: mocks.createServiceRoleClient,
}));

vi.mock("@/services/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));

vi.mock("@/services/auth", async () => {
  const actual = await vi.importActual<typeof import("@/services/auth")>("@/services/auth");
  return {
    ...actual,
    requireAuthenticatedUser: mocks.requireAuthenticatedUser,
    requireConciergeOrAdmin: mocks.requireConciergeOrAdmin,
    requireActiveAdmin: mocks.requireActiveAdmin,
    requireVendorOwner: mocks.requireVendorOwner,
    resolveAuthenticatedContext: mocks.resolveAuthenticatedContext,
  };
});

import { POST as authRegisterPost } from "@/app/api/auth/register/route";
import { POST as authLoginPost } from "@/app/api/auth/login/route";
import { POST as authLogoutPost } from "@/app/api/auth/logout/route";
import { GET as authMeGet } from "@/app/api/auth/me/route";
import { POST as adminChangePasswordPost } from "@/app/api/admin/auth/change-password/route";
import { GET as venuesGet } from "@/app/api/venues/route";
import { GET as vendorsGet } from "@/app/api/vendors/route";
import { GET as searchGet } from "@/app/api/search/route";
import {
  GET as customerProfileGet,
  PATCH as customerProfilePatch,
} from "@/app/api/customer/profile/route";
import { POST as avatarUploadUrlPost } from "@/app/api/customer/profile/avatar-upload-url/route";
import {
  GET as favoritesGet,
  POST as favoritesPost,
} from "@/app/api/favorites/route";
import { DELETE as favoriteDelete } from "@/app/api/favorites/[id]/route";
import {
  GET as vendorResourceGet,
  POST as vendorResourcePost,
  DELETE as vendorResourceDelete,
} from "@/app/api/vendor/me/[resource]/route";
import { POST as adminVenuesPost } from "@/app/api/admin/venues/route";
import { PATCH as adminVendorVerifyPatch } from "@/app/api/admin/vendors/[id]/verify/route";
import {
  GET as bookingsGet,
  POST as bookingsPost,
} from "@/app/api/bookings/route";
import { POST as quoteRespondPost } from "@/app/api/quotes/[id]/respond/route";
import { POST as paymentIntentPost } from "@/app/api/payments/intent/route";
import { POST as couponValidatePost } from "@/app/api/payments/validate-coupon/route";
import { POST as paymentWebhookPost } from "@/app/api/webhooks/payments/route";
import { GET as invoiceGet } from "@/app/api/invoices/[id]/route";
import { POST as adminRefundPost } from "@/app/api/admin/payments/[id]/refund/route";
import {
  GET as adminCmsGet,
  POST as adminCmsPost,
  DELETE as adminCmsDelete,
} from "@/app/api/admin/cms/[resource]/route";
import { POST as blogLikePost } from "@/app/api/blogs/[id]/like/route";
import {
  GET as inviteGet,
  PATCH as invitePatch,
  DELETE as inviteDelete,
} from "@/app/api/invites/[id]/route";
import { DELETE as inviteGuestDelete } from "@/app/api/invites/[id]/guests/route";
import { DELETE as reviewDelete } from "@/app/api/reviews/[id]/route";
import { POST as reviewVotePost } from "@/app/api/reviews/[id]/vote/route";
import { GET as notificationsGet } from "@/app/api/notifications/route";
import { PATCH as notificationsReadPatch } from "@/app/api/notifications/read/route";
import {
  GET as conversationsGet,
  POST as conversationsPost,
} from "@/app/api/conversations/route";
import {
  GET as customerAnalyticsGet,
} from "@/app/api/analytics/customer/route";
import {
  GET as vendorAnalyticsGet,
} from "@/app/api/analytics/vendor/route";
import {
  GET as conciergeAnalyticsGet,
} from "@/app/api/analytics/concierge/route";
import { POST as vendorAuthRegisterPost } from "@/app/api/vendor/auth/register/route";
import { PATCH as vendorMePatch } from "@/app/api/vendor/me/route";
import {
  GET as vendorQuotesGet,
  POST as vendorQuotesPost,
} from "@/app/api/vendor/me/quotes/route";
import { GET as enquiriesGet } from "@/app/api/enquiries/route";
import { POST as adminLoginPost } from "@/app/api/admin/auth/login/route";
import { GET as adminVerifyGet } from "@/app/api/admin/auth/verify/route";
import { GET as adminVendorsGet } from "@/app/api/admin/vendors/route";
import { GET as adminReviewsGet } from "@/app/api/admin/reviews/route";
import { GET as adminQuotesGet } from "@/app/api/admin/quotes/route";
import { POST as conciergeLoginPost } from "@/app/api/concierge/auth/login/route";
import { GET as conciergeVerifyGet } from "@/app/api/concierge/auth/verify/route";
import { GET as enquiryDetailGet } from "@/app/api/enquiries/[id]/route";
import { POST as enquiryMessagePost } from "@/app/api/enquiries/[id]/messages/route";
import { PATCH as conciergeStatusPatch } from "@/app/api/concierge/enquiries/[id]/status/route";
import { PATCH as conciergeSiteVisitPatch } from "@/app/api/concierge/enquiries/[id]/site-visit/route";
import { POST as conciergeQuotesPost } from "@/app/api/concierge/enquiries/[id]/quotes/route";
import { PATCH as conciergeQuotePatch } from "@/app/api/concierge/quotes/[id]/route";
import { POST as conciergeComparisonSheetPost } from "@/app/api/concierge/enquiries/[id]/comparison-sheet/route";

describe("Comprehensive API Route Handler Audit Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("covers /api/auth/{me,logout,login,register} and blocks non-staff from /api/admin/auth/change-password", async () => {
    const supabase = createMockSupabaseClient({
      onQuery: (table) => {
        if (table === "roles") {
          return { data: { role_id: 2, role_name: "customer", status: "Active" }, error: null };
        }
        return { data: { profile_id: 1 }, error: null };
      },
    });
    (supabase.auth as unknown as Record<string, unknown>).signUp = vi.fn().mockResolvedValue({
      data: { user: { id: "user-new-1", email: "bride@example.com" }, session: null },
      error: null,
    });
    (supabase.auth as unknown as Record<string, unknown>).signInWithPassword = vi
      .fn()
      .mockResolvedValue({
        data: { user: { id: "cust-1", email: "cust@example.com" } },
        error: null,
      });
    (supabase.auth as unknown as Record<string, unknown>).getUser = vi.fn().mockResolvedValue({
      data: { user: { id: "cust-1", email: "cust@example.com" } },
      error: null,
    });
    (supabase.auth as unknown as Record<string, unknown>).signOut = vi.fn().mockResolvedValue({
      error: null,
    });

    const adminClient = createMockSupabaseClient({
      onQuery: (table, op) => {
        if (table === "users" && op === "select") {
          return {
            data: { user_id: "cust-1", role_id: 2, full_name: "Asha", email: "cust@example.com", status: "Active" },
            error: null,
          };
        }
        if (table === "roles") {
          return { data: { role_id: 2, role_name: "customer", status: "Active" }, error: null };
        }
        if (table === "admins") return { data: null, error: null };
        return { data: { user_id: "user-new-1", profile_id: 9 }, error: null };
      },
    });

    mocks.createSupabaseServerClient.mockResolvedValue(supabase);
    mocks.createServiceRoleClient.mockReturnValue(adminClient);
    mocks.requireAuthenticatedUser.mockResolvedValue({
      userId: "cust-1",
      email: "cust@example.com",
      fullName: "Asha",
      phone: null,
      role: "customer",
      roleId: 2,
      isActiveAdmin: false,
      isConciergeOrAdmin: false,
      vendorId: null,
      supabase,
    });

    const regRes = await authRegisterPost(
      new NextRequest("http://localhost/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          type: "customer",
          fullName: "Asha Rao",
          email: "bride@example.com",
          password: "Password123!",
        }),
      })
    );
    expect(regRes.status).toBe(201);

    const loginRes = await authLoginPost(
      new NextRequest("http://localhost/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "cust@example.com", password: "Password123!" }),
      })
    );
    expect(loginRes.status).toBe(200);

    const meRes = await authMeGet();
    expect(meRes.status).toBe(200);
    const meJson = await meRes.json();
    expect(meJson.data.role).toBe("customer");

    const logoutRes = await authLogoutPost();
    expect(logoutRes.status).toBe(200);

    // Security regression test: non-staff logged-in customer must be rejected (403) on admin change-password
    const adminPwdRes = await adminChangePasswordPost(
      new NextRequest("http://localhost/api/admin/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: "OldPassword1!",
          newPassword: "NewPassword1!",
          confirmPassword: "NewPassword1!",
        }),
      })
    );
    expect(adminPwdRes.status).toBe(403);
  });

  it("covers public catalog & unified search routes without leaking PII", async () => {
    let venueSelectCols = "";
    let vendorSelectCols = "";

    const anonClient = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "venues" && op === "select") {
          venueSelectCols = String(state.columns ?? "");
          return {
            data: [{ venue_id: 1, venue_name: "Taj Palace", slug: "taj-palace", status: "Active" }],
            count: 1,
            error: null,
          };
        }
        if (table === "vendors" && op === "select") {
          vendorSelectCols = String(state.columns ?? "");
          return {
            data: [{ vendor_id: 7, vendor_name: "Luxe Decor", slug: "luxe-decor", is_verified: true, status: "Active" }],
            count: 1,
            error: null,
          };
        }
        return { data: [], error: null };
      },
    });
    mocks.createPublicAnonClient.mockReturnValue(anonClient);

    const venuesRes = await venuesGet(new NextRequest("http://localhost/api/venues?city=Hyderabad"));
    expect(venuesRes.status).toBe(200);
    expect(venueSelectCols).not.toMatch(/\bphone\b/i);

    const vendorsRes = await vendorsGet(new NextRequest("http://localhost/api/vendors?verifiedOnly=true"));
    expect(vendorsRes.status).toBe(200);
    expect(vendorSelectCols).not.toMatch(/\bmetadata\b/i);
    expect(vendorSelectCols).not.toMatch(/\buser_id\b/i);

    const searchRes = await searchGet(new NextRequest("http://localhost/api/search?q=taj&scope=all"));
    expect(searchRes.status).toBe(200);
    const searchJson = await searchRes.json();
    expect(searchJson.data.venues.items).toHaveLength(1);
    expect(searchJson.data.vendors.items).toHaveLength(1);
  });

  it("covers customer profile, R2 upload signing, and favorites routes", async () => {
    const supabase = createMockSupabaseClient({
      onQuery: (table, op) => {
        if (table === "users") {
          return { data: { user_id: "cust-1", email: "c@ex.com", full_name: "Riya", phone: null }, error: null };
        }
        if (table === "user_profile" && op === "select") {
          return { data: { user_id: "cust-1", preferences: { city: "Pune" } }, error: null };
        }
        if (table === "favorites" && op === "select") {
          return { data: null, count: 0, error: null };
        }
        if (table === "favorites" && op === "insert") {
          return { data: { favorite_id: 41, venue_id: 12 }, error: null };
        }
        if (table === "favorites" && op === "delete") {
          return { data: { favorite_id: 41 }, error: null };
        }
        return { data: [], error: null };
      },
    });

    mocks.requireAuthenticatedUser.mockResolvedValue({
      userId: "cust-1",
      email: "c@ex.com",
      fullName: "Riya",
      phone: null,
      role: "customer",
      roleId: 2,
      isActiveAdmin: false,
      isConciergeOrAdmin: false,
      vendorId: null,
      supabase,
    });

    const profRes = await customerProfileGet();
    expect(profRes.status).toBe(200);

    const patchRes = await customerProfilePatch(
      new NextRequest("http://localhost/api/customer/profile", {
        method: "PATCH",
        body: JSON.stringify({ fullName: "Riya Sharma" }),
      })
    );
    expect(patchRes.status).toBe(200);

    const oldR2 = {
      id: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
      key: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
      sec: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      bkt: process.env.CLOUDFLARE_R2_BUCKET,
      pub: process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL,
    };
    process.env.CLOUDFLARE_R2_ACCOUNT_ID = "acc123";
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = "key123";
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY = "sec123";
    process.env.CLOUDFLARE_R2_BUCKET = "ymwa-media";
    process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL = "https://cdn.ymwa.in";

    const signRes = await avatarUploadUrlPost(
      new NextRequest("http://localhost/api/customer/profile/avatar-upload-url", {
        method: "POST",
        body: JSON.stringify({
          fileName: "avatar.png",
          contentType: "image/png",
          fileSizeBytes: 2048,
        }),
      })
    );
    expect(signRes.status).toBe(200);
    const signJson = await signRes.json();
    expect(signJson.data.method).toBe("PUT");
    expect(signJson.data.publicUrl).toContain("https://cdn.ymwa.in/avatars/cust-1/");

    process.env.CLOUDFLARE_R2_ACCOUNT_ID = oldR2.id;
    process.env.CLOUDFLARE_R2_ACCESS_KEY_ID = oldR2.key;
    process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY = oldR2.sec;
    process.env.CLOUDFLARE_R2_BUCKET = oldR2.bkt;
    process.env.CLOUDFLARE_R2_PUBLIC_BASE_URL = oldR2.pub;

    const favCreateRes = await favoritesPost(
      new NextRequest("http://localhost/api/favorites", {
        method: "POST",
        body: JSON.stringify({ venueId: 12 }),
      })
    );
    expect(favCreateRes.status).toBe(201);

    const favDelRes = await favoriteDelete(new NextRequest("http://localhost/api/favorites/41"), {
      params: Promise.resolve({ id: "41" }),
    });
    expect(favDelRes.status).toBe(200);
  });

  it("covers vendor /me/[resource] and admin venue/vendor governance routes", async () => {
    const supabase = createMockSupabaseClient({
      onQuery: (table, op) => {
        if (table === "vendor_services" && op === "select") {
          return { data: [{ service_id: 1, vendor_id: 88, service_name: "Candid" }], error: null };
        }
        if (table === "vendor_services" && op === "insert") {
          return { data: { service_id: 2, vendor_id: 88, service_name: "Drone" }, error: null };
        }
        if (table === "vendor_services" && op === "delete") {
          return { data: { service_id: 2 }, error: null };
        }
        return { data: [], error: null };
      },
    });
    mocks.requireVendorOwner.mockResolvedValue({
      userId: "vend-1",
      role: "vendor",
      vendorId: 88,
      supabase,
    });

    expect(
      (
        await vendorResourceGet(new NextRequest("http://localhost/api/vendor/me/services"), {
          params: Promise.resolve({ resource: "services" }),
        })
      ).status
    ).toBe(200);

    expect(
      (
        await vendorResourcePost(
          new NextRequest("http://localhost/api/vendor/me/services", {
            method: "POST",
            body: JSON.stringify({ serviceName: "Drone" }),
          }),
          { params: Promise.resolve({ resource: "services" }) }
        )
      ).status
    ).toBe(201);

    expect(
      (
        await vendorResourceDelete(
          new NextRequest("http://localhost/api/vendor/me/services?id=2", { method: "DELETE" }),
          { params: Promise.resolve({ resource: "services" }) }
        )
      ).status
    ).toBe(200);

    const adminClient = createMockSupabaseClient({
      onQuery: (table) => {
        if (table === "venues") return { data: { venue_id: 500, slug: "royal-hall" }, error: null };
        if (table === "vendors") return { data: { vendor_id: 88, is_verified: true, status: "Active" }, error: null };
        return { data: [], error: null };
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(adminClient);
    mocks.requireConciergeOrAdmin.mockResolvedValue({ userId: "admin-1", isConciergeOrAdmin: true });
    mocks.requireActiveAdmin.mockResolvedValue({ userId: "admin-1", isActiveAdmin: true });

    const createVenueRes = await adminVenuesPost(
      new NextRequest("http://localhost/api/admin/venues", {
        method: "POST",
        body: JSON.stringify({ typeId: 1, venueName: "Royal Hall" }),
      })
    );
    expect(createVenueRes.status).toBe(201);

    const verifyVendorRes = await adminVendorVerifyPatch(
      new NextRequest("http://localhost/api/admin/vendors/88/verify", {
        method: "PATCH",
        body: JSON.stringify({ isVerified: true }),
      }),
      { params: Promise.resolve({ id: "88" }) }
    );
    expect(verifyVendorRes.status).toBe(200);
  });

  it("covers quotes/bookings/payments/invoices/refunds and rejects webhook amount mismatch (422)", async () => {
    const adminClient = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "quotes" && op === "select") {
          return {
            data: { quote_id: 10, enquiry_id: 50, venue_id: 1, vendor_id: null, base_cost_inr: 150000, status: "Approved", valid_until: null },
            error: null,
          };
        }
        if (table === "enquiries") return { data: { enquiry_id: 50, user_id: "cust-1" }, error: null };
        if (table === "bookings" && op === "select") {
          const isByQuote = state.filters.some((f) => f.args[0] === "quote_id");
          return isByQuote
            ? { data: null, error: null }
            : { data: { booking_id: 901, user_id: "cust-1", total_amount: 150000 }, error: null };
        }
        if (table === "bookings" && op === "insert") {
          return { data: { booking_id: 901, user_id: "cust-1", total_amount: 150000 }, error: null };
        }
        if (table === "payments" && op === "select") {
          const isByIdemp = state.filters.some((f) => f.args[0] === "idempotency_key");
          if (isByIdemp) return { data: null, error: null };
          return { data: { payment_id: 700, user_id: "cust-1", booking_id: 901, amount: 150000, payment_status: "Pending" }, error: null };
        }
        if (table === "payments" && op === "insert") {
          return { data: { payment_id: 700, user_id: "cust-1", booking_id: 901, amount: 150000, payment_status: "Pending" }, error: null };
        }
        if (table === "invoices") {
          return { data: { invoice_id: 33, user_id: "cust-2", amount: 150000 }, error: null };
        }
        if (table === "transactions") return { data: null, error: null };
        if (table === "refunds") return { data: { refund_id: 88, refund_status: "Pending" }, error: null };
        return { data: { status_id: 1 }, error: null };
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(adminClient);
    mocks.requireAuthenticatedUser.mockResolvedValue({
      userId: "cust-1",
      isConciergeOrAdmin: false,
      vendorId: null,
      supabase: adminClient,
    });

    const bookCreateRes = await bookingsPost(
      new NextRequest("http://localhost/api/bookings", {
        method: "POST",
        body: JSON.stringify({ quoteId: 10, eventDate: "2026-12-20", guestCount: 250 }),
      })
    );
    expect(bookCreateRes.status).toBe(201);

    // Payment exceeding booking total_amount (150,000) returns 422
    const overpayRes = await paymentIntentPost(
      new NextRequest("http://localhost/api/payments/intent", {
        method: "POST",
        body: JSON.stringify({
          bookingId: 901,
          amountInr: 500000,
          paymentMethod: "upi",
          idempotencyKey: "idem_overpay_12345",
        }),
      })
    );
    expect(overpayRes.status).toBe(422);

    const intentRes = await paymentIntentPost(
      new NextRequest("http://localhost/api/payments/intent", {
        method: "POST",
        body: JSON.stringify({
          bookingId: 901,
          amountInr: 150000,
          paymentMethod: "upi",
          idempotencyKey: "idem_exact_12345",
        }),
      })
    );
    expect(intentRes.status).toBe(201);

    // Tampered webhook amount (1 INR instead of 150,000 INR) must fail with 422
    const oldSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    process.env.PAYMENT_WEBHOOK_SECRET = "audit_secret";
    const badAmountBody = JSON.stringify({
      eventType: "payment.captured",
      paymentId: 700,
      transactionReference: "tx_tampered_1",
      gateway: "razorpay",
      amountInr: 1,
    });
    const badAmountSig = crypto.createHmac("sha256", "audit_secret").update(badAmountBody).digest("hex");
    const webhook422 = await paymentWebhookPost(
      new NextRequest("http://localhost/api/webhooks/payments", {
        method: "POST",
        headers: { "x-ymwa-signature": badAmountSig },
        body: badAmountBody,
      })
    );
    expect(webhook422.status).toBe(422);
    if (oldSecret !== undefined) process.env.PAYMENT_WEBHOOK_SECRET = oldSecret;
    else delete process.env.PAYMENT_WEBHOOK_SECRET;

    // Cross-user invoice read denied (403)
    const inv403 = await invoiceGet(new NextRequest("http://localhost/api/invoices/33"), {
      params: Promise.resolve({ id: "33" }),
    });
    expect(inv403.status).toBe(403);
  });

  it("covers completed CMS CRUD, Invite/Guest DELETE, Review DELETE, Notifications, Conversations, and Analytics", async () => {
    const client = createMockSupabaseClient({
      onQuery: (table, op) => {
        if (table === "faqs") {
          if (op === "select") return { data: [{ faq_id: 1, question: "Q?" }], count: 1, error: null };
          if (op === "insert") return { data: { faq_id: 2, question: "New?" }, error: null };
          if (op === "delete") return { data: { faq_id: 2 }, error: null };
        }
        if (table === "invites" && op === "select") {
          return { data: { invite_id: 9, user_id: "cust-1" }, error: null };
        }
        if (table === "invites" && op === "delete") {
          return { data: { invite_id: 9 }, error: null };
        }
        if (table === "invite_guests" && op === "delete") {
          return { data: { guest_id: 14 }, error: null };
        }
        if (table === "reviews" && op === "select") {
          return { data: { review_id: 21, user_id: "cust-2", venue_id: 1, vendor_id: null }, error: null };
        }
        if (table === "reviews" && op === "delete") {
          return { data: { review_id: 21 }, error: null };
        }
        if (table === "notifications" && op === "select") {
          return { data: [{ notification_id: 3 }], count: 1, error: null };
        }
        if (table === "notifications" && op === "update") {
          return { data: [{ notification_id: 3 }], error: null };
        }
        if (table === "conversations" && op === "insert") {
          return { data: { conversation_id: 55, user_id: "cust-1", subject: "Visit" }, error: null };
        }
        if (table === "payments" || table === "bookings" || table === "quotes") {
          return { data: [], count: 0, error: null };
        }
        return { data: [], count: 0, error: null };
      },
    });

    mocks.createServiceRoleClient.mockReturnValue(client);
    mocks.requireConciergeOrAdmin.mockResolvedValue({ userId: "staff-1", isConciergeOrAdmin: true });
    mocks.requireAuthenticatedUser.mockResolvedValue({
      userId: "cust-1",
      isActiveAdmin: true,
      isConciergeOrAdmin: true,
      vendorId: null,
      supabase: client,
    });
    mocks.requireVendorOwner.mockResolvedValue({ userId: "vend-1", vendorId: 88, supabase: client });

    // Admin CMS GET / POST / DELETE
    expect(
      (
        await adminCmsGet(new NextRequest("http://localhost/api/admin/cms/faqs"), {
          params: Promise.resolve({ resource: "faqs" }),
        })
      ).status
    ).toBe(200);
    expect(
      (
        await adminCmsPost(
          new NextRequest("http://localhost/api/admin/cms/faqs", {
            method: "POST",
            body: JSON.stringify({ question: "Booking policy?", answer: "Full details provided." }),
          }),
          { params: Promise.resolve({ resource: "faqs" }) }
        )
      ).status
    ).toBe(201);
    expect(
      (
        await adminCmsDelete(new NextRequest("http://localhost/api/admin/cms/faqs?id=2", { method: "DELETE" }), {
          params: Promise.resolve({ resource: "faqs" }),
        })
      ).status
    ).toBe(200);

    // Invites & guests DELETE
    expect(
      (
        await inviteGuestDelete(
          new NextRequest("http://localhost/api/invites/9/guests?guestId=14", { method: "DELETE" }),
          { params: Promise.resolve({ id: "9" }) }
        )
      ).status
    ).toBe(200);
    expect(
      (
        await inviteDelete(new NextRequest("http://localhost/api/invites/9", { method: "DELETE" }), {
          params: Promise.resolve({ id: "9" }),
        })
      ).status
    ).toBe(200);

    // Review DELETE (admin + recalculates rating)
    expect(
      (
        await reviewDelete(new NextRequest("http://localhost/api/reviews/21", { method: "DELETE" }), {
          params: Promise.resolve({ id: "21" }),
        })
      ).status
    ).toBe(200);

    // Notifications, conversations, and analytics
    expect((await notificationsGet(new NextRequest("http://localhost/api/notifications"))).status).toBe(200);
    expect(
      (
        await notificationsReadPatch(
          new NextRequest("http://localhost/api/notifications/read", {
            method: "PATCH",
            body: JSON.stringify({ markAll: true }),
          })
        )
      ).status
    ).toBe(200);
    expect(
      (
        await conversationsPost(
          new NextRequest("http://localhost/api/conversations", {
            method: "POST",
            body: JSON.stringify({ subject: "Visit schedule", initialMessage: "Hello team" }),
          })
        )
      ).status
    ).toBe(201);
    expect((await customerAnalyticsGet()).status).toBe(200);
    expect((await vendorAnalyticsGet()).status).toBe(200);
    expect((await conciergeAnalyticsGet()).status).toBe(200);
  });

  it("uses server service-role client after auth for coupon validation, review votes, and blog likes", async () => {
    const authUserClient = createMockSupabaseClient({
      onQuery: () => {
        throw new Error("Should not query restricted tables via user JWT client");
      },
    });
    const voteFilters: Array<{ method: string; args: unknown[] }> = [];
    const likeFilters: Array<{ method: string; args: unknown[] }> = [];

    const serviceClient = createMockSupabaseClient({
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
              valid_until: "2099-12-31T23:59:59.000Z",
            },
            error: null,
          };
        }
        if (table === "reviews" && op === "select") {
          return { data: { review_id: 21, status: "Approved" }, error: null };
        }
        if (table === "review_votes" && op === "select") {
          voteFilters.push(...state.filters);
          return { data: null, error: null };
        }
        if (table === "review_votes" && op === "insert") {
          return { data: { vote_id: 91, review_id: 21, vote_type: "helpful" }, error: null };
        }
        if (table === "blogs" && op === "select") {
          return { data: { blog_id: 7 }, error: null };
        }
        if (table === "blog_likes" && op === "select") {
          likeFilters.push(...state.filters);
          return { data: null, error: null };
        }
        if (table === "blog_likes" && op === "insert") {
          return { data: { like_id: 44 }, error: null };
        }
        return { data: [], error: null };
      },
    });

    mocks.requireAuthenticatedUser.mockRejectedValueOnce(
      new AppError("UNAUTHENTICATED", 401, "Auth required")
    );
    const unauthCouponRes = await couponValidatePost(
      new NextRequest("http://localhost/api/payments/validate-coupon", {
        method: "POST",
        body: JSON.stringify({ couponCode: "WED10", amountInr: 100000 }),
      })
    );
    expect(unauthCouponRes.status).toBe(401);

    mocks.createServiceRoleClient.mockReturnValue(serviceClient);
    mocks.requireAuthenticatedUser.mockResolvedValue({
      userId: "cust-1",
      isActiveAdmin: false,
      isConciergeOrAdmin: false,
      vendorId: null,
      supabase: authUserClient,
    });

    const couponRes = await couponValidatePost(
      new NextRequest("http://localhost/api/payments/validate-coupon", {
        method: "POST",
        body: JSON.stringify({ couponCode: "WED10", amountInr: 200000 }),
      })
    );
    expect(couponRes.status).toBe(200);
    const couponJson = await couponRes.json();
    expect(couponJson.data).toEqual({
      couponId: 3,
      couponCode: "WED10",
      originalAmountInr: 200000,
      discountInr: 15000,
      finalAmountInr: 185000,
    });

    const voteRes = await reviewVotePost(
      new NextRequest("http://localhost/api/reviews/21/vote", {
        method: "POST",
        body: JSON.stringify({ voteType: "helpful" }),
      }),
      { params: Promise.resolve({ id: "21" }) }
    );
    expect(voteRes.status).toBe(200);
    expect(voteFilters.some((f) => f.args[0] === "user_id" && f.args[1] === "cust-1")).toBe(true);

    const likeRes = await blogLikePost(
      new NextRequest("http://localhost/api/blogs/7/like", { method: "POST" }),
      { params: Promise.resolve({ id: "7" }) }
    );
    expect(likeRes.status).toBe(200);
    expect(likeFilters.some((f) => f.args[0] === "user_id" && f.args[1] === "cust-1")).toBe(true);
  });

  it("enforces vendor registration role guards, blocks verification self-mutation, and scopes vendor enquiries/quotes", async () => {
    for (const badPayload of [
      { role: "admin" },
      { role: "concierge" },
      { role: "customer" },
      { is_verified: true },
    ]) {
      const regRes = await vendorAuthRegisterPost(
        new NextRequest("http://localhost/api/vendor/auth/register", {
          method: "POST",
          body: JSON.stringify({
            fullName: "Test Owner",
            email: "vendor@example.com",
            password: "Password!123",
            businessName: "Vendor Studio",
            categorySlug: "photographers",
            ...badPayload,
          }),
        })
      );
      expect(regRes.status).toBe(403);
    }

    mocks.requireVendorOwner.mockResolvedValue({
      userId: "vendor-user-1",
      role: "vendor",
      vendorId: 77,
      isActiveAdmin: false,
      isConciergeOrAdmin: false,
      supabase: createMockSupabaseClient({ user: { id: "vendor-user-1" } }),
    });

    const tamperPatchRes = await vendorMePatch(
      new NextRequest("http://localhost/api/vendor/me", {
        method: "PATCH",
        body: JSON.stringify({ vendorName: "Hacked", is_verified: true }),
      })
    );
    expect(tamperPatchRes.status).toBe(403);

    const statusPatchRes = await vendorMePatch(
      new NextRequest("http://localhost/api/vendor/me", {
        method: "PATCH",
        body: JSON.stringify({ status: "Active" }),
      })
    );
    expect(statusPatchRes.status).toBe(403);

    const enquiryFilters: Array<{ method: string; args: unknown[] }> = [];
    const serviceClient = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "enquiries" && op === "select") {
          enquiryFilters.push(...state.filters);
          const idFilter = state.filters.find((f) => f.args[0] === "enquiry_id");
          if (idFilter?.args[1] === 202) {
            return { data: { enquiry_id: 202, vendor_id: 88 }, error: null };
          }
          if (idFilter?.args[1] === 101) {
            return { data: { enquiry_id: 101, vendor_id: 77 }, error: null };
          }
          return {
            data: [{ enquiry_id: 101, vendor_id: 77, subject: "Wedding shoot" }],
            count: 1,
            error: null,
          };
        }
        if (table === "quotes" && op === "insert") {
          return {
            data: { quote_id: 501, enquiry_id: 101, vendor_id: 77, status: "Published" },
            error: null,
          };
        }
        if (table === "quotes" && op === "select") {
          return {
            data: [{ quote_id: 501, enquiry_id: 101, vendor_id: 77, status: "Published" }],
            error: null,
          };
        }
        return { data: [], error: null };
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(serviceClient);
    mocks.requireAuthenticatedUser.mockResolvedValue({
      userId: "vendor-user-1",
      role: "vendor",
      vendorId: 77,
      isActiveAdmin: false,
      isConciergeOrAdmin: false,
      supabase: createMockSupabaseClient({ user: { id: "vendor-user-1" } }),
    });

    const vendorEnqRes = await enquiriesGet(
      new NextRequest("http://localhost/api/enquiries")
    );
    expect(vendorEnqRes.status).toBe(200);
    expect(enquiryFilters.some((f) => f.args[0] === "vendor_id" && f.args[1] === 77)).toBe(true);

    const crossQuoteRes = await vendorQuotesPost(
      new NextRequest("http://localhost/api/vendor/me/quotes", {
        method: "POST",
        body: JSON.stringify({
          enquiryId: 202,
          packageName: "Unauthorized Quote",
          baseCostInr: 75000,
        }),
      })
    );
    expect(crossQuoteRes.status).toBe(403);

    const ownQuoteRes = await vendorQuotesPost(
      new NextRequest("http://localhost/api/vendor/me/quotes", {
        method: "POST",
        body: JSON.stringify({
          enquiryId: 101,
          packageName: "Full Candid Package",
          baseCostInr: 125000,
          cateringIncluded: false,
          inclusions: ["2 photographers", "1 cinematographer"],
        }),
      })
    );
    expect(ownQuoteRes.status).toBe(201);

    const listQuotesRes = await vendorQuotesGet();
    expect(listQuotesRes.status).toBe(200);
  });

  it("enforces Priority 4 admin-only login, verify, and admin list routes (vendors, reviews, quotes)", async () => {
    // Privilege/role override fields on POST /api/admin/auth/login must be rejected with 403
    for (const overrideField of [
      { role: "admin" },
      { isActiveAdmin: true },
      { admin_status: "active" },
    ]) {
      const tamperRes = await adminLoginPost(
        new NextRequest("http://localhost/api/admin/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: "someone@example.com",
            password: "Password123!",
            ...overrideField,
          }),
        })
      );
      expect(tamperRes.status).toBe(403);
    }

    let currentRole = "concierge";
    let currentAdminStatus: "active" | "inactive" | "pending" | null = null;

    const signOutMock = vi.fn().mockResolvedValue({ error: null });
    const supabase = createMockSupabaseClient({});
    (supabase.auth as unknown as Record<string, unknown>).signInWithPassword = vi
      .fn()
      .mockResolvedValue({
        data: { user: { id: "staff-1", email: "staff@example.com" }, session: null },
        error: null,
      });
    (supabase.auth as unknown as Record<string, unknown>).getUser = vi.fn().mockResolvedValue({
      data: { user: { id: "staff-1", email: "staff@example.com" } },
      error: null,
    });
    (supabase.auth as unknown as Record<string, unknown>).signOut = signOutMock;
    (supabase.auth as unknown as Record<string, unknown>).getSession = vi.fn().mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const adminClient = createMockSupabaseClient({
      onQuery: (table, op) => {
        if (table === "users" && op === "select") {
          return {
            data: {
              user_id: "staff-1",
              role_id: currentRole === "admin" ? 1 : 3,
              full_name: "Staff Member",
              email: "staff@example.com",
              phone: null,
              status: "Active",
            },
            error: null,
          };
        }
        if (table === "roles") {
          return {
            data: {
              role_id: currentRole === "admin" ? 1 : 3,
              role_name: currentRole,
              status: "Active",
            },
            error: null,
          };
        }
        if (table === "admins") {
          return {
            data: currentAdminStatus
              ? { admin_id: 1, user_id: "staff-1", status: currentAdminStatus }
              : null,
            error: null,
          };
        }
        if (table === "vendors" && op === "select") {
          return {
            data: [{ vendor_id: 11, vendor_name: "Royal Decor", is_verified: false, status: "Pending" }],
            count: 1,
            error: null,
          };
        }
        if (table === "reviews" && op === "select") {
          return {
            data: [{ review_id: 22, rating: 5, review_text: "Great!", status: "Pending" }],
            count: 1,
            error: null,
          };
        }
        if (table === "quotes" && op === "select") {
          return {
            data: [{ quote_id: 33, enquiry_id: 5, package_name: "Gold", base_cost_inr: 90000, status: "Draft" }],
            count: 1,
            error: null,
          };
        }
        return { data: null, error: null };
      },
    });

    mocks.createSupabaseServerClient.mockResolvedValue(supabase);
    mocks.createServiceRoleClient.mockReturnValue(adminClient);

    // Concierge denied on admin-only login (403)
    const conciergeLoginRes = await adminLoginPost(
      new NextRequest("http://localhost/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "staff@example.com", password: "Password123!" }),
      })
    );
    expect(conciergeLoginRes.status).toBe(403);
    expect(signOutMock).toHaveBeenCalled();

    // Inactive admin denied on admin-only login (403)
    currentRole = "admin";
    currentAdminStatus = "inactive";
    const inactiveAdminLoginRes = await adminLoginPost(
      new NextRequest("http://localhost/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "staff@example.com", password: "Password123!" }),
      })
    );
    expect(inactiveAdminLoginRes.status).toBe(403);

    // Active admin allowed (200)
    currentAdminStatus = "active";
    const activeAdminLoginRes = await adminLoginPost(
      new NextRequest("http://localhost/api/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "staff@example.com", password: "Password123!" }),
      })
    );
    expect(activeAdminLoginRes.status).toBe(200);

    // Verify GET /api/admin/auth/verify enforces 401 unauth, 403 non-active-admin, 200 active admin
    mocks.resolveAuthenticatedContext.mockResolvedValueOnce({
      userId: null,
      isActiveAdmin: false,
      isConciergeOrAdmin: false,
    });
    expect((await adminVerifyGet()).status).toBe(401);

    mocks.resolveAuthenticatedContext.mockResolvedValueOnce({
      userId: "concierge-1",
      email: "concierge@example.com",
      role: "concierge",
      isActiveAdmin: false,
      isConciergeOrAdmin: true,
    });
    expect((await adminVerifyGet()).status).toBe(403);

    mocks.resolveAuthenticatedContext.mockResolvedValueOnce({
      userId: "admin-1",
      email: "admin@example.com",
      role: "admin",
      isActiveAdmin: true,
      isConciergeOrAdmin: true,
    });
    expect((await adminVerifyGet()).status).toBe(200);

    // Verify GET /api/admin/{vendors,reviews,quotes} deny unauth (401) & forbidden (403)
    mocks.requireActiveAdmin.mockRejectedValue(new AppError("UNAUTHENTICATED", 401, "Sign in."));
    expect((await adminVendorsGet(new NextRequest("http://localhost/api/admin/vendors"))).status).toBe(401);
    expect((await adminReviewsGet(new NextRequest("http://localhost/api/admin/reviews"))).status).toBe(401);
    expect((await adminQuotesGet(new NextRequest("http://localhost/api/admin/quotes"))).status).toBe(401);

    mocks.requireActiveAdmin.mockRejectedValue(new AppError("FORBIDDEN", 403, "Admin only."));
    expect((await adminVendorsGet(new NextRequest("http://localhost/api/admin/vendors"))).status).toBe(403);
    expect((await adminReviewsGet(new NextRequest("http://localhost/api/admin/reviews"))).status).toBe(403);
    expect((await adminQuotesGet(new NextRequest("http://localhost/api/admin/quotes"))).status).toBe(403);

    // Active admin succeeds (200) with items + pagination meta
    mocks.requireActiveAdmin.mockResolvedValue({
      userId: "admin-1",
      email: "admin@example.com",
      role: "admin",
      isActiveAdmin: true,
      isConciergeOrAdmin: true,
      supabase,
    });

    const vRes = await adminVendorsGet(new NextRequest("http://localhost/api/admin/vendors?page=1&limit=10"));
    expect(vRes.status).toBe(200);
    const vJson = await vRes.json();
    expect(vJson.ok).toBe(true);
    expect(vJson.data).toHaveLength(1);
    expect(vJson.meta).toMatchObject({ page: 1, limit: 10, total: 1 });

    const rRes = await adminReviewsGet(new NextRequest("http://localhost/api/admin/reviews?status=Pending"));
    expect(rRes.status).toBe(200);
    const rJson = await rRes.json();
    expect(rJson.ok).toBe(true);
    expect(rJson.data[0].review_id).toBe(22);

    const qRes = await adminQuotesGet(new NextRequest("http://localhost/api/admin/quotes"));
    expect(qRes.status).toBe(200);
    const qJson = await qRes.json();
    expect(qJson.ok).toBe(true);
    expect(qJson.data[0].quote_id).toBe(33);
  });

  it("enforces Priority 5 dedicated concierge login, verify, and Concierge A vs B assignment isolation", async () => {
    for (const overrideField of [
      { role: "concierge" },
      { isActiveAdmin: true },
      { isConciergeOrAdmin: true },
    ]) {
      const tamperRes = await conciergeLoginPost(
        new NextRequest("http://localhost/api/concierge/auth/login", {
          method: "POST",
          body: JSON.stringify({
            email: "concierge@example.com",
            password: "Password123!",
            ...overrideField,
          }),
        })
      );
      expect(tamperRes.status).toBe(403);
    }

    let currentRole = "customer";
    let currentUserStatus = "Active";
    let currentAdminStatus: "active" | "pending" | "inactive" | null = null;

    const signOutMock = vi.fn().mockResolvedValue({ error: null });
    const supabase = createMockSupabaseClient({});
    (supabase.auth as unknown as Record<string, unknown>).signInWithPassword = vi
      .fn()
      .mockResolvedValue({
        data: { user: { id: "staff-c1", email: "c1@example.com" }, session: null },
        error: null,
      });
    (supabase.auth as unknown as Record<string, unknown>).getUser = vi.fn().mockResolvedValue({
      data: { user: { id: "staff-c1", email: "c1@example.com" } },
      error: null,
    });
    (supabase.auth as unknown as Record<string, unknown>).signOut = signOutMock;

    const loginAdminClient = createMockSupabaseClient({
      onQuery: (table, op) => {
        if (table === "users" && op === "select") {
          return {
            data: {
              user_id: "staff-c1",
              role_id: currentRole === "concierge" ? 3 : currentRole === "vendor" ? 4 : 2,
              full_name: "Concierge One",
              email: "c1@example.com",
              phone: null,
              status: currentUserStatus,
            },
            error: null,
          };
        }
        if (table === "roles") {
          return {
            data: { role_id: 3, role_name: currentRole, status: "Active" },
            error: null,
          };
        }
        if (table === "admins") {
          return {
            data: currentAdminStatus
              ? { admin_id: 2, user_id: "staff-c1", status: currentAdminStatus }
              : null,
            error: null,
          };
        }
        if (table === "vendors") {
          return { data: { vendor_id: 5 }, error: null };
        }
        return { data: null, error: null };
      },
    });

    mocks.createSupabaseServerClient.mockResolvedValue(supabase);
    mocks.createServiceRoleClient.mockReturnValue(loginAdminClient);

    // Customer denied (403)
    expect(
      (
        await conciergeLoginPost(
          new NextRequest("http://localhost/api/concierge/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: "c1@example.com", password: "Password123!" }),
          })
        )
      ).status
    ).toBe(403);
    expect(signOutMock).toHaveBeenCalled();

    // Vendor denied (403)
    currentRole = "vendor";
    expect(
      (
        await conciergeLoginPost(
          new NextRequest("http://localhost/api/concierge/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: "c1@example.com", password: "Password123!" }),
          })
        )
      ).status
    ).toBe(403);

    // Inactive concierge denied (403)
    currentRole = "concierge";
    currentUserStatus = "Inactive";
    expect(
      (
        await conciergeLoginPost(
          new NextRequest("http://localhost/api/concierge/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: "c1@example.com", password: "Password123!" }),
          })
        )
      ).status
    ).toBe(403);

    // Pending/revoked admin cannot fall back into concierge access (403)
    currentUserStatus = "Active";
    currentAdminStatus = "pending";
    expect(
      (
        await conciergeLoginPost(
          new NextRequest("http://localhost/api/concierge/auth/login", {
            method: "POST",
            body: JSON.stringify({ email: "c1@example.com", password: "Password123!" }),
          })
        )
      ).status
    ).toBe(403);

    // Active concierge allowed (200)
    currentAdminStatus = null;
    const conciergeOkRes = await conciergeLoginPost(
      new NextRequest("http://localhost/api/concierge/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "c1@example.com", password: "Password123!" }),
      })
    );
    expect(conciergeOkRes.status).toBe(200);
    const conciergeOkJson = await conciergeOkRes.json();
    expect(conciergeOkJson.data.user.role).toBe("concierge");
    expect(conciergeOkJson.data.user.isConciergeOrAdmin).toBe(true);
    expect(conciergeOkJson.data.user.isActiveAdmin).toBe(false);

    // Active admin allowed on concierge portal (200)
    currentAdminStatus = "active";
    const adminOnConciergeRes = await conciergeLoginPost(
      new NextRequest("http://localhost/api/concierge/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "c1@example.com", password: "Password123!" }),
      })
    );
    expect(adminOnConciergeRes.status).toBe(200);

    // Verify GET /api/concierge/auth/verify
    mocks.resolveAuthenticatedContext.mockRejectedValueOnce(
      new AppError("UNAUTHENTICATED", 401, "Sign in.")
    );
    expect((await conciergeVerifyGet()).status).toBe(401);

    mocks.resolveAuthenticatedContext.mockResolvedValueOnce({
      userId: "cust-1",
      role: "customer",
      isActiveAdmin: false,
      isConciergeOrAdmin: false,
    });
    expect((await conciergeVerifyGet()).status).toBe(403);

    mocks.resolveAuthenticatedContext.mockResolvedValueOnce({
      userId: "concierge-a",
      email: "ca@example.com",
      fullName: "Concierge A",
      role: "concierge",
      isActiveAdmin: false,
      isConciergeOrAdmin: true,
    });
    expect((await conciergeVerifyGet()).status).toBe(200);

    // Concierge A vs Concierge B assignment isolation on enquiry #800 (assigned to concierge-b)
    const workflowClient = createMockSupabaseClient({
      onQuery: (table, op) => {
        if (table === "enquiries" && op === "select") {
          return {
            data: {
              enquiry_id: 800,
              user_id: "cust-1",
              vendor_id: null,
              assigned_specialist_id: "concierge-b",
              status: "Active",
            },
            error: null,
          };
        }
        if (table === "enquiries" && op === "update") {
          return {
            data: {
              enquiry_id: 800,
              user_id: "cust-1",
              assigned_specialist_id: "concierge-b",
              status: "Approved",
            },
            error: null,
          };
        }
        if (table === "quotes" && op === "select") {
          return {
            data: {
              quote_id: 95,
              enquiry_id: 800,
              collected_by: "concierge-b",
              status: "Published",
            },
            error: null,
          };
        }
        if (table === "quotes" && op === "insert") {
          return {
            data: {
              quote_id: 96,
              enquiry_id: 800,
              collected_by: "concierge-b",
              status: "Published",
            },
            error: null,
          };
        }
        if (table === "enquiry_messages" && op === "insert") {
          return {
            data: { message_id: 1, enquiry_id: 800, sender_id: "concierge-b", message: "Hi" },
            error: null,
          };
        }
        return { data: [], error: null };
      },
    });
    mocks.createServiceRoleClient.mockReturnValue(workflowClient);

    const conciergeAActor = {
      userId: "concierge-a",
      role: "concierge" as const,
      isActiveAdmin: false,
      isConciergeOrAdmin: true,
      vendorId: null,
      supabase: workflowClient,
    };
    mocks.requireAuthenticatedUser.mockResolvedValue(conciergeAActor);
    mocks.requireConciergeOrAdmin.mockResolvedValue(conciergeAActor);

    const idCtx = { params: Promise.resolve({ id: "800" }) };
    const quoteIdCtx = { params: Promise.resolve({ id: "95" }) };

    expect((await enquiryDetailGet(new NextRequest("http://localhost/api/enquiries/800"), idCtx)).status).toBe(403);
    expect(
      (
        await enquiryMessagePost(
          new NextRequest("http://localhost/api/enquiries/800/messages", {
            method: "POST",
            body: JSON.stringify({ message: "Cross-concierge note" }),
          }),
          idCtx
        )
      ).status
    ).toBe(403);
    expect(
      (
        await conciergeStatusPatch(
          new NextRequest("http://localhost/api/concierge/enquiries/800/status", {
            method: "PATCH",
            body: JSON.stringify({ status: "Approved" }),
          }),
          idCtx
        )
      ).status
    ).toBe(403);
    expect(
      (
        await conciergeSiteVisitPatch(
          new NextRequest("http://localhost/api/concierge/enquiries/800/site-visit", {
            method: "PATCH",
            body: JSON.stringify({ siteVisitStatus: "Scheduled" }),
          }),
          idCtx
        )
      ).status
    ).toBe(403);
    expect(
      (
        await conciergeQuotesPost(
          new NextRequest("http://localhost/api/concierge/enquiries/800/quotes", {
            method: "POST",
            body: JSON.stringify({
              venueId: 1,
              packageName: "Unauthorized Quote",
              baseCostInr: 100000,
              cateringIncluded: false,
            }),
          }),
          idCtx
        )
      ).status
    ).toBe(403);
    expect(
      (
        await conciergeQuotePatch(
          new NextRequest("http://localhost/api/concierge/quotes/95", {
            method: "PATCH",
            body: JSON.stringify({ status: "Draft" }),
          }),
          quoteIdCtx
        )
      ).status
    ).toBe(403);
    expect(
      (
        await conciergeComparisonSheetPost(
          new NextRequest("http://localhost/api/concierge/enquiries/800/comparison-sheet", {
            method: "POST",
            body: JSON.stringify({ title: "Blocked Sheet", quoteIds: [95, 96] }),
          }),
          idCtx
        )
      ).status
    ).toBe(403);

    // Assigned Concierge B succeeds (200 / 201)
    const conciergeBActor = {
      userId: "concierge-b",
      role: "concierge" as const,
      isActiveAdmin: false,
      isConciergeOrAdmin: true,
      vendorId: null,
      supabase: workflowClient,
    };
    mocks.requireAuthenticatedUser.mockResolvedValue(conciergeBActor);
    mocks.requireConciergeOrAdmin.mockResolvedValue(conciergeBActor);

    expect((await enquiryDetailGet(new NextRequest("http://localhost/api/enquiries/800"), idCtx)).status).toBe(200);
    expect(
      (
        await enquiryMessagePost(
          new NextRequest("http://localhost/api/enquiries/800/messages", {
            method: "POST",
            body: JSON.stringify({ message: "Assigned concierge reply" }),
          }),
          idCtx
        )
      ).status
    ).toBe(201);
    expect(
      (
        await conciergeStatusPatch(
          new NextRequest("http://localhost/api/concierge/enquiries/800/status", {
            method: "PATCH",
            body: JSON.stringify({ status: "Approved" }),
          }),
          idCtx
        )
      ).status
    ).toBe(200);
    expect(
      (
        await conciergeSiteVisitPatch(
          new NextRequest("http://localhost/api/concierge/enquiries/800/site-visit", {
            method: "PATCH",
            body: JSON.stringify({ siteVisitStatus: "Completed" }),
          }),
          idCtx
        )
      ).status
    ).toBe(200);
    expect(
      (
        await conciergeQuotesPost(
          new NextRequest("http://localhost/api/concierge/enquiries/800/quotes", {
            method: "POST",
            body: JSON.stringify({
              venueId: 1,
              packageName: "Curated Royal Venue",
              baseCostInr: 250000,
              cateringIncluded: true,
            }),
          }),
          idCtx
        )
      ).status
    ).toBe(201);

    // Active Admin retains override access even on Concierge B's enquiry (200)
    const activeAdminActor = {
      userId: "admin-1",
      role: "admin" as const,
      isActiveAdmin: true,
      isConciergeOrAdmin: true,
      vendorId: null,
      supabase: workflowClient,
    };
    mocks.requireAuthenticatedUser.mockResolvedValue(activeAdminActor);
    mocks.requireConciergeOrAdmin.mockResolvedValue(activeAdminActor);

    expect((await enquiryDetailGet(new NextRequest("http://localhost/api/enquiries/800"), idCtx)).status).toBe(200);
    expect(
      (
        await conciergeStatusPatch(
          new NextRequest("http://localhost/api/concierge/enquiries/800/status", {
            method: "PATCH",
            body: JSON.stringify({ status: "Approved" }),
          }),
          idCtx
        )
      ).status
    ).toBe(200);
  });
});
