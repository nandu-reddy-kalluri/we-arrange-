import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  createBearerSupabaseClient,
  createPublicAnonClient,
  createServiceRoleClient,
} from "@we-arrange/database/clients";
import type { Database } from "@we-arrange/database/types";

/**
 * Live Supabase Integration Suite (opt-in after Migrations 01–11 are applied).
 * Run with:
 *   YMWA_LIVE_INTEGRATION=1 pnpm test:integration
 *
 * Uses ephemeral test accounts deleted cleanly in afterAll — never modifies or
 * promotes existing production user records.
 */

// Load apps/web/.env.local if present so CLI invocations pick up local secrets automatically.
const envLocalPath = path.resolve(process.cwd(), "apps/web/.env.local");
if (fs.existsSync(envLocalPath)) {
  for (const rawLine of fs.readFileSync(envLocalPath, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
}

const LIVE_ENABLED = process.env.YMWA_LIVE_INTEGRATION === "1";

const actorState = vi.hoisted(() => ({
  bearerToken: null as string | null,
}));

vi.mock("@/services/supabase/server", async () => {
  const { createBearerSupabaseClient: makeBearer, createPublicAnonClient: makeAnon } =
    await import("@we-arrange/database/clients");
  return {
    createSupabaseServerClient: async () =>
      actorState.bearerToken ? makeBearer(actorState.bearerToken) : makeAnon(),
  };
});

import { GET as healthGet } from "@/app/api/health/supabase/route";
import { GET as venuesGet } from "@/app/api/venues/route";
import { GET as vendorsGet } from "@/app/api/vendors/route";
import { GET as searchGet } from "@/app/api/search/route";
import {
  GET as customerProfileGet,
  PATCH as customerProfilePatch,
} from "@/app/api/customer/profile/route";
import {
  GET as favoritesGet,
  POST as favoritesPost,
} from "@/app/api/favorites/route";
import {
  GET as enquiriesGet,
  POST as enquiriesPost,
} from "@/app/api/enquiries/route";
import { GET as conciergeLeadsGet } from "@/app/api/concierge/leads/route";
import { POST as conciergeQuotePost } from "@/app/api/concierge/enquiries/[id]/quotes/route";
import { POST as quoteRespondPost } from "@/app/api/quotes/[id]/respond/route";
import {
  GET as bookingsGet,
  POST as bookingsPost,
} from "@/app/api/bookings/route";
import { POST as paymentIntentPost } from "@/app/api/payments/intent/route";
import { POST as paymentWebhookPost } from "@/app/api/webhooks/payments/route";
import {
  PATCH as vendorProfilePatch,
} from "@/app/api/vendor/me/route";
import {
  GET as vendorResourceGet,
  POST as vendorResourcePost,
} from "@/app/api/vendor/me/[resource]/route";
import { GET as adminUsersGet } from "@/app/api/admin/users/route";
import { GET as adminVenuesGet } from "@/app/api/admin/venues/route";
import { PATCH as adminVendorVerifyPatch } from "@/app/api/admin/vendors/[id]/verify/route";

interface TestActor {
  userId: string;
  email: string;
  token: string;
  client: SupabaseClient<Database>;
}

async function createSignedInActor(
  adminClient: SupabaseClient<Database>,
  label: string
): Promise<TestActor> {
  const runId = crypto.randomBytes(4).toString("hex");
  const email = `ymwa-it-${label}-${runId}@example.com`;
  const password = `Ymwa#It!${runId}99`;

  const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: `IT ${label}` },
  });
  if (createErr || !created.user) {
    throw new Error(`Failed creating test auth user (${label}): ${createErr?.message}`);
  }

  const anon = createPublicAnonClient();
  const { data: signedIn, error: signErr } = await anon.auth.signInWithPassword({
    email,
    password,
  });
  if (signErr || !signedIn.session?.access_token) {
    await adminClient.auth.admin.deleteUser(created.user.id);
    throw new Error(`Failed signing in test user (${label}): ${signErr?.message}`);
  }

  return {
    userId: created.user.id,
    email,
    token: signedIn.session.access_token,
    client: createBearerSupabaseClient(signedIn.session.access_token),
  };
}

describe.skipIf(!LIVE_ENABLED)("Live Supabase RBAC, RLS & API Route Integration", () => {
  const runTag = crypto.randomBytes(4).toString("hex");
  let adminClient: SupabaseClient<Database>;
  let anonClient: SupabaseClient<Database>;

  let customerA: TestActor | null = null;
  let customerB: TestActor | null = null;
  let vendorActor: TestActor | null = null;
  let conciergeActor: TestActor | null = null;
  let adminActor: TestActor | null = null;

  let realVenueId = 0;
  let testVendorId: number | null = null;
  let createdPackageId: number | null = null;
  let createdFavoriteId: number | null = null;
  let createdEnquiryId: number | null = null;
  let createdQuoteId: number | null = null;
  let createdBookingId: number | null = null;
  let createdPaymentId: number | null = null;

  beforeAll(async () => {
    if (!process.env.PAYMENT_WEBHOOK_SECRET) {
      process.env.PAYMENT_WEBHOOK_SECRET = `it-webhook-secret-${runTag}`;
    }

    adminClient = createServiceRoleClient();
    anonClient = createPublicAnonClient();

    const { data: roles, error: rolesErr } = await adminClient
      .from("roles")
      .select("role_id, role_name");
    if (rolesErr || !roles?.length) {
      throw new Error(`Roles must be seeded (M08) before running live integration: ${rolesErr?.message}`);
    }
    const roleMap = new Map(roles.map((r) => [r.role_name.toLowerCase(), r.role_id]));

    const { data: sampleVenue, error: venueErr } = await adminClient
      .from("venues")
      .select("venue_id")
      .eq("status", "Active")
      .limit(1)
      .single();
    if (venueErr || !sampleVenue) {
      throw new Error(`Expected active venue rows (M02): ${venueErr?.message}`);
    }
    realVenueId = sampleVenue.venue_id;

    // 1. Two independent customers (M08 trigger assigns customer role automatically)
    customerA = await createSignedInActor(adminClient, "cust-a");
    customerB = await createSignedInActor(adminClient, "cust-b");

    // 2. Vendor owner + dedicated ephemeral vendor listing
    vendorActor = await createSignedInActor(adminClient, "vendor");
    const vendorRoleId = roleMap.get("vendor");
    if (!vendorRoleId) throw new Error("Missing vendor role in public.roles");
    await adminClient
      .from("users")
      .update({ role_id: vendorRoleId })
      .eq("user_id", vendorActor.userId);

    const { data: sampleCat } = await adminClient
      .from("vendor_categories")
      .select("category_id")
      .limit(1)
      .maybeSingle();

    const { data: insertedVendor, error: vendErr } = await adminClient
      .from("vendors")
      .insert({
        vendor_name: `IT Vendor ${runTag}`,
        slug: `it-vendor-${runTag}`,
        user_id: vendorActor.userId,
        category_id: sampleCat?.category_id ?? 1,
        is_verified: false,
        status: "Active",
      })
      .select("vendor_id")
      .single();
    if (vendErr || !insertedVendor) {
      throw new Error(`Failed creating test vendor row: ${vendErr?.message}`);
    }
    testVendorId = insertedVendor.vendor_id;

    // 3. Concierge staff
    conciergeActor = await createSignedInActor(adminClient, "concierge");
    const conciergeRoleId = roleMap.get("concierge");
    if (!conciergeRoleId) throw new Error("Missing concierge role in public.roles");
    await adminClient
      .from("users")
      .update({ role_id: conciergeRoleId })
      .eq("user_id", conciergeActor.userId);

    // 4. Admin actor (explicitly uses test email env if provided, otherwise ephemeral disposable admin)
    adminActor = await createSignedInActor(adminClient, "admin");
    const adminRoleId = roleMap.get("admin");
    if (!adminRoleId) throw new Error("Missing admin role in public.roles");
    await adminClient
      .from("users")
      .update({ role_id: adminRoleId })
      .eq("user_id", adminActor.userId);
    await adminClient.from("admins").insert({
      user_id: adminActor.userId,
      admin_name: `IT Admin ${runTag}`,
      status: "active",
    });
  }, 60_000);

  afterAll(async () => {
    actorState.bearerToken = null;
    if (!adminClient) return;

    if (createdPaymentId) {
      await adminClient.from("invoices").delete().eq("payment_id", createdPaymentId);
      await adminClient.from("transactions").delete().eq("payment_id", createdPaymentId);
      if (createdBookingId) {
        await adminClient.from("booking_payments").delete().eq("booking_id", createdBookingId);
      }
      await adminClient.from("payments").delete().eq("payment_id", createdPaymentId);
    }
    if (createdBookingId) {
      await adminClient.from("bookings").delete().eq("booking_id", createdBookingId);
    }
    if (createdQuoteId) {
      await adminClient.from("quotes").delete().eq("quote_id", createdQuoteId);
    }
    if (createdEnquiryId) {
      await adminClient.from("enquiry_status_history").delete().eq("enquiry_id", createdEnquiryId);
      await adminClient.from("enquiry_messages").delete().eq("enquiry_id", createdEnquiryId);
      await adminClient.from("enquiries").delete().eq("enquiry_id", createdEnquiryId);
    }
    if (createdFavoriteId) {
      await adminClient.from("favorites").delete().eq("favorite_id", createdFavoriteId);
    }
    if (createdPackageId) {
      await adminClient.from("vendor_packages").delete().eq("package_id", createdPackageId);
    }
    if (testVendorId) {
      await adminClient.from("vendors").delete().eq("vendor_id", testVendorId);
    }
    for (const actor of [adminActor, conciergeActor, vendorActor, customerB, customerA]) {
      if (actor) {
        await adminClient.from("admins").delete().eq("user_id", actor.userId);
        await adminClient.auth.admin.deleteUser(actor.userId);
      }
    }
  }, 60_000);

  it("verifies anon public catalog/health API routes and PII / staging denial via live RLS", async () => {
    actorState.bearerToken = null;

    const healthRes = await healthGet();
    expect(healthRes.status).toBe(200);
    const healthJson = await healthRes.json();
    expect(healthJson.ok).toBe(true);
    expect(healthJson.status).toBe("service_reachable");

    const venuesRes = await venuesGet(new NextRequest("http://localhost/api/venues?pageSize=5"));
    expect(venuesRes.status).toBe(200);
    const venuesJson = await venuesRes.json();
    expect(venuesJson.data.length).toBeGreaterThan(0);
    expect(venuesJson.data[0].phone).toBeUndefined();
    expect(venuesJson.data[0].external_id).toBeUndefined();

    const vendorsRes = await vendorsGet(new NextRequest("http://localhost/api/vendors?pageSize=5"));
    expect(vendorsRes.status).toBe(200);
    const vendorsJson = await vendorsRes.json();
    expect(vendorsJson.data.length).toBeGreaterThan(0);
    expect(vendorsJson.data[0].metadata).toBeUndefined();
    expect(vendorsJson.data[0].user_id).toBeUndefined();

    const searchRes = await searchGet(new NextRequest("http://localhost/api/search?q=garden&scope=all"));
    expect(searchRes.status).toBe(200);

    // Direct column/table PII locks on anon role
    const { error: phoneErr } = await anonClient.from("venues").select("phone").limit(1);
    expect(phoneErr).not.toBeNull();
    const { error: metaErr } = await anonClient.from("vendors").select("metadata").limit(1);
    expect(metaErr).not.toBeNull();
    const { error: vcErr } = await anonClient.from("venue_contacts").select("*").limit(1);
    expect(vcErr).not.toBeNull();
    const { error: usersErr } = await anonClient.from("users").select("*").limit(1);
    expect(usersErr).not.toBeNull();

    // Unauthenticated API endpoints return 401
    expect((await customerProfileGet()).status).toBe(401);
    expect((await adminUsersGet(new NextRequest("http://localhost/api/admin/users"))).status).toBe(401);
  }, 30_000);

  it("enforces customer ownership, cross-customer IDOR protection, and customer enquiry/favorite routes", async () => {
    actorState.bearerToken = customerA!.token;

    const patchRes = await customerProfilePatch(
      new NextRequest("http://localhost/api/customer/profile", {
        method: "PATCH",
        body: JSON.stringify({ fullName: `Updated ${runTag}`, about: "Integration test couple" }),
      })
    );
    expect(patchRes.status).toBe(200);

    const favRes = await favoritesPost(
      new NextRequest("http://localhost/api/favorites", {
        method: "POST",
        body: JSON.stringify({ venueId: realVenueId }),
      })
    );
    expect([200, 201]).toContain(favRes.status);
    const favJson = await favRes.json();
    createdFavoriteId = favJson.data?.favorite?.favorite_id ?? null;

    const favListRes = await favoritesGet(new NextRequest("http://localhost/api/favorites"));
    expect(favListRes.status).toBe(200);

    const enqRes = await enquiriesPost(
      new NextRequest("http://localhost/api/enquiries", {
        method: "POST",
        body: JSON.stringify({
          venueId: realVenueId,
          subject: `IT Wedding Enquiry ${runTag}`,
          message: "Live integration check for luxury wedding lawn booking.",
          eventDate: "2027-12-18",
          guestCount: 350,
        }),
      })
    );
    expect(enqRes.status).toBe(201);
    const enqJson = await enqRes.json();
    createdEnquiryId = enqJson.data.enquiry_id;

    // Customer cannot access concierge or admin routes
    expect((await conciergeLeadsGet(new NextRequest("http://localhost/api/concierge/leads"))).status).toBe(403);
    expect((await adminUsersGet(new NextRequest("http://localhost/api/admin/users"))).status).toBe(403);

    // Cross-customer IDOR protection via live Postgres RLS
    const { data: leakedEnq } = await customerB!.client
      .from("enquiries")
      .select("enquiry_id")
      .eq("enquiry_id", createdEnquiryId!);
    expect(leakedEnq ?? []).toHaveLength(0);

    const { error: privEscErr } = await customerA!.client
      .from("users")
      .update({ role_id: 4 } as never)
      .eq("user_id", customerA!.userId);
    expect(privEscErr).not.toBeNull();
  }, 30_000);

  it("verifies vendor self-service mutations and blocks restricted vendor privilege fields", async () => {
    actorState.bearerToken = vendorActor!.token;

    const updateRes = await vendorProfilePatch(
      new NextRequest("http://localhost/api/vendor/me/profile", {
        method: "PATCH",
        body: JSON.stringify({ description: `Updated vendor description ${runTag}` }),
      })
    );
    expect(updateRes.status).toBe(200);

    const pkgCreateRes = await vendorResourcePost(
      new NextRequest("http://localhost/api/vendor/me/packages", {
        method: "POST",
        body: JSON.stringify({ packageName: `Royal Decor ${runTag}`, price: 150000 }),
      }),
      { params: Promise.resolve({ resource: "packages" }) }
    );
    expect(pkgCreateRes.status).toBe(201);
    createdPackageId = (await pkgCreateRes.json()).data.package_id;

    const pkgListRes = await vendorResourceGet(
      new NextRequest("http://localhost/api/vendor/me/packages"),
      { params: Promise.resolve({ resource: "packages" }) }
    );
    expect(pkgListRes.status).toBe(200);

    // Direct RLS check: vendor cannot self-verify or edit metadata
    const { error: selfVerifyErr } = await vendorActor!.client
      .from("vendors")
      .update({ is_verified: true } as never)
      .eq("vendor_id", testVendorId!);
    expect(selfVerifyErr).not.toBeNull();

    // Vendor cannot access admin venues
    expect((await adminVenuesGet(new NextRequest("http://localhost/api/admin/venues"))).status).toBe(403);
  }, 30_000);

  it("verifies concierge -> quote -> customer accept -> booking -> payment intent -> webhook -> admin verification", async () => {
    // 1. Concierge creates Published INR quote & reads enquiries
    actorState.bearerToken = conciergeActor!.token;
    const leadsRes = await conciergeLeadsGet(new NextRequest("http://localhost/api/concierge/leads"));
    expect(leadsRes.status).toBe(200);

    const quoteRes = await conciergeQuotePost(
      new NextRequest(`http://localhost/api/concierge/enquiries/${createdEnquiryId}/quotes`, {
        method: "POST",
        body: JSON.stringify({
          venueId: realVenueId,
          packageName: `Gold Lawn Package ${runTag}`,
          baseCostInr: 500000,
          cateringIncluded: true,
          inclusions: ["Stage setup", "Sound"],
          exclusions: ["Alcohol license"],
          status: "Published",
        }),
      }),
      { params: Promise.resolve({ id: String(createdEnquiryId) }) }
    );
    expect(quoteRes.status).toBe(201);
    createdQuoteId = (await quoteRes.json()).data.quote_id;

    // Concierge blocked from admin-only endpoints
    expect((await adminUsersGet(new NextRequest("http://localhost/api/admin/users"))).status).toBe(403);

    // 2. Customer approves quote -> creates booking -> initializes payment intent
    actorState.bearerToken = customerA!.token;
    const respondRes = await quoteRespondPost(
      new NextRequest(`http://localhost/api/quotes/${createdQuoteId}/respond`, {
        method: "POST",
        body: JSON.stringify({ decision: "Approved" }),
      }),
      { params: Promise.resolve({ id: String(createdQuoteId) }) }
    );
    expect(respondRes.status).toBe(200);

    const bookingRes = await bookingsPost(
      new NextRequest("http://localhost/api/bookings", {
        method: "POST",
        body: JSON.stringify({
          quoteId: createdQuoteId,
          eventDate: "2027-12-18",
          guestCount: 350,
        }),
      })
    );
    expect(bookingRes.status).toBe(201);
    createdBookingId = (await bookingRes.json()).data.booking_id;

    const listBookingsRes = await bookingsGet(new NextRequest("http://localhost/api/bookings"));
    expect(listBookingsRes.status).toBe(200);

    const intentRes = await paymentIntentPost(
      new NextRequest("http://localhost/api/payments/intent", {
        method: "POST",
        body: JSON.stringify({
          bookingId: createdBookingId,
          amountInr: 100000,
          paymentMethod: "upi",
          idempotencyKey: `it-idem-${runTag}`,
        }),
      })
    );
    expect(intentRes.status).toBe(201);
    createdPaymentId = (await intentRes.json()).data.payment.payment_id;

    // 3. Signed webhook confirms capture & issues invoice
    const webhookPayload = JSON.stringify({
      eventId: `evt_${runTag}`,
      eventType: "payment.captured",
      paymentId: createdPaymentId,
      transactionReference: `txn_${runTag}`,
      amountInr: 100000,
      currency: "INR",
    });
    const sig = crypto
      .createHmac("sha256", process.env.PAYMENT_WEBHOOK_SECRET!)
      .update(webhookPayload)
      .digest("hex");

    actorState.bearerToken = null;
    const whRes = await paymentWebhookPost(
      new NextRequest("http://localhost/api/webhooks/payments", {
        method: "POST",
        headers: { "x-ymwa-signature": sig },
        body: webhookPayload,
      })
    );
    expect(whRes.status).toBe(200);

    // 4. Admin can list users and verify/unverify vendor
    actorState.bearerToken = adminActor!.token;
    const usersRes = await adminUsersGet(new NextRequest("http://localhost/api/admin/users"));
    expect(usersRes.status).toBe(200);

    const verifyRes = await adminVendorVerifyPatch(
      new NextRequest(`http://localhost/api/admin/vendors/${testVendorId}/verify`, {
        method: "PATCH",
        body: JSON.stringify({ isVerified: true }),
      }),
      { params: Promise.resolve({ id: String(testVendorId) }) }
    );
    expect(verifyRes.status).toBe(200);
  }, 30_000);
});
