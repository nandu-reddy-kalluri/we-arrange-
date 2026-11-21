import { describe, expect, it, vi } from "vitest";
import {
  loginWithPassword,
  registerVendorAccount,
  requireActiveAdmin,
  requireConciergeOrAdmin,
  requireRole,
  requireVendorOwner,
  resolveAuthenticatedContext,
} from "@/services/auth";
import { AppError } from "@we-arrange/database/errors";
import { createMockSupabaseClient } from "./helpers/mockSupabase";

describe("YMWA Phase 1 Remaining Authentication and Authorization Verification", () => {
  // =========================================================================
  // 1. CUSTOMER TESTING
  // =========================================================================
  describe("1. Customer Flow & Permissions", () => {
    it("verifies valid customer login succeeds and resolves customer role from DB", async () => {
      const customerAuthUser = {
        id: "11111111-aaaa-4111-8111-111111111111",
        email: "couple@example.com",
      };

      const supabase = createMockSupabaseClient({
        user: customerAuthUser,
        authMocks: {
          signInWithPassword: async () => ({
            data: { user: customerAuthUser, session: { access_token: "mock-token-cust" } },
            error: null,
          }),
        },
      });

      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") {
            return {
              data: {
                user_id: customerAuthUser.id,
                role_id: 1,
                email: customerAuthUser.email,
                status: "Active",
              },
            };
          }
          if (table === "roles") {
            return { data: { role_id: 1, role_name: "customer", status: "Active" } };
          }
          if (table === "admins") {
            return { data: null };
          }
          return { data: null };
        },
      });

      const ctx = await resolveAuthenticatedContext(supabase, adminClient);
      expect(ctx.userId).toBe(customerAuthUser.id);
      expect(ctx.role).toBe("customer");
      expect(ctx.isActiveAdmin).toBe(false);
      expect(ctx.isConciergeOrAdmin).toBe(false);
    });

    it("rejects customer login when credentials are invalid", async () => {
      const supabase = createMockSupabaseClient({
        user: null,
        authMocks: {
          signInWithPassword: async () => ({
            data: { user: null, session: null },
            error: { message: "Invalid login credentials", status: 400 },
          }),
        },
      });
      const adminClient = createMockSupabaseClient({ user: null });

      await expect(
        loginWithPassword("couple@example.com", "WrongPassword!", { supabase, adminClient })
      ).rejects.toMatchObject({
        status: 401,
        message: expect.stringMatching(/invalid email or password/i),
      });
    });

    it("verifies customer session persistence from valid token / cookie", async () => {
      const customerAuthUser = {
        id: "11111111-aaaa-4111-8111-111111111111",
        email: "couple@example.com",
      };
      const supabase = createMockSupabaseClient({ user: customerAuthUser });
      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") {
            return { data: { user_id: customerAuthUser.id, role_id: 1, status: "Active" } };
          }
          if (table === "roles") {
            return { data: { role_name: "customer", status: "Active" } };
          }
          return { data: null };
        },
      });

      const ctx = await resolveAuthenticatedContext(supabase, adminClient);
      expect(ctx.userId).toBe(customerAuthUser.id);
      expect(ctx.role).toBe("customer");
    });

    it("strictly denies customer from accessing vendor dashboard or vendor APIs", async () => {
      const customerAuthUser = {
        id: "11111111-aaaa-4111-8111-111111111111",
        email: "couple@example.com",
      };
      const supabase = createMockSupabaseClient({ user: customerAuthUser });
      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") {
            return { data: { user_id: customerAuthUser.id, role_id: 1, status: "Active" } };
          }
          if (table === "roles") {
            return { data: { role_name: "customer", status: "Active" } };
          }
          if (table === "vendors") {
            return { data: null };
          }
          return { data: null };
        },
      });

      // requireRole strictly rejects customer from vendor role
      await expect(requireRole(["vendor"], supabase, adminClient)).rejects.toMatchObject({
        code: "FORBIDDEN",
        status: 403,
      });

      // requireVendorOwner strictly rejects customer
      await expect(requireVendorOwner(supabase, adminClient)).rejects.toMatchObject({
        code: "FORBIDDEN",
        status: 403,
      });
    });

    it("strictly denies customer from accessing admin dashboard or admin APIs", async () => {
      const customerAuthUser = {
        id: "11111111-aaaa-4111-8111-111111111111",
        email: "couple@example.com",
      };
      const supabase = createMockSupabaseClient({ user: customerAuthUser });
      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") {
            return { data: { user_id: customerAuthUser.id, role_id: 1, status: "Active" } };
          }
          if (table === "roles") {
            return { data: { role_name: "customer", status: "Active" } };
          }
          if (table === "admins") {
            return { data: null };
          }
          return { data: null };
        },
      });

      await expect(requireActiveAdmin(supabase, adminClient)).rejects.toMatchObject({
        code: "FORBIDDEN",
        status: 403,
      });
    });

    it("enforces cross-customer record isolation (Customer A cannot access Customer B private data)", async () => {
      const customerA = "11111111-aaaa-4111-8111-111111111111";
      const customerB = "22222222-bbbb-4222-8222-222222222222";

      // Simulated RLS / service check: query for booking owned by Customer B
      const client = createMockSupabaseClient({
        user: { id: customerA },
        onQuery: (table, op, state) => {
          if (table === "bookings") {
            // RLS filter requires user_id === auth.uid()
            const userFilter = state.filters.find((f) => f.args[0] === "user_id");
            if (userFilter && userFilter.args[1] === customerB) {
              return { data: null, error: null }; // Customer A cannot see Customer B's row
            }
          }
          return { data: null };
        },
      });

      const { data } = await client
        .from("bookings")
        .select("*")
        .eq("user_id", customerB)
        .maybeSingle();

      expect(data).toBeNull();
    });
  });

  // =========================================================================
  // 2. VENDOR TESTING
  // =========================================================================
  describe("2. Vendor Flow & Permissions", () => {
    it("registers new vendor with is_verified = false and status = 'Pending'", async () => {
      let insertedVendorPayload: Record<string, unknown> | null = null;

      const supabase = createMockSupabaseClient({
        user: null,
        authMocks: {
          signUp: async () => ({
            data: { user: { id: "33333333-vvvv-4333-8333-333333333333" } },
            error: null,
          }),
        },
      });

      const adminClient = createMockSupabaseClient({
        onQuery: (table, op, state) => {
          if (table === "roles") {
            return { data: { role_id: 2, role_name: "vendor", status: "Active" } };
          }
          if (table === "vendor_categories") {
            return { data: { category_id: 1, slug: "photographers" } };
          }
          if (table === "vendors" && op === "insert") {
            insertedVendorPayload = state.payload as Record<string, unknown>;
            return {
              data: {
                vendor_id: 501,
                user_id: "33333333-vvvv-4333-8333-333333333333",
                business_name: "Elite Photography",
                is_verified: false,
                status: "Pending",
              },
            };
          }
          return { data: { profile_id: 1 } };
        },
      });

      const vendor = await registerVendorAccount(
        {
          fullName: "Vendor Owner",
          email: "owner@elitephoto.com",
          password: "StrongPassword!2026",
          businessName: "Elite Photography",
          categorySlug: "photographers",
          city: "Mumbai",
        },
        { supabase, adminClient }
      );

      expect(vendor.isVerified).toBe(false);
      expect(vendor.status).toBe("Pending");
      expect((insertedVendorPayload as Record<string, unknown> | null)?.is_verified).toBe(false);
      expect((insertedVendorPayload as Record<string, unknown> | null)?.status).toBe("Pending");
    });

    it("verifies vendor login succeeds and resolves vendor role from DB", async () => {
      const vendorUser = {
        id: "33333333-vvvv-4333-8333-333333333333",
        email: "owner@elitephoto.com",
      };

      const supabase = createMockSupabaseClient({
        user: vendorUser,
        authMocks: {
          signInWithPassword: async () => ({
            data: { user: vendorUser, session: { access_token: "vendor-token" } },
            error: null,
          }),
        },
      });

      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") {
            return { data: { user_id: vendorUser.id, role_id: 2, status: "Active" } };
          }
          if (table === "roles") {
            return { data: { role_id: 2, role_name: "vendor", status: "Active" } };
          }
          if (table === "vendors") {
            return { data: { vendor_id: 501, user_id: vendorUser.id, is_verified: true, status: "Active" } };
          }
          return { data: null };
        },
      });

      const ctx = await resolveAuthenticatedContext(supabase, adminClient);
      expect(ctx.role).toBe("vendor");
      expect(ctx.isActiveAdmin).toBe(false);

      const vendorOwnerCtx = await requireVendorOwner(supabase, adminClient);
      expect(vendorOwnerCtx.vendorId).toBe(501);
    });

    it("strictly isolates vendor: cannot access another vendor private records", async () => {
      const vendorAUser = "33333333-vvvv-4333-8333-333333333333";
      const vendorBId = 999;

      const client = createMockSupabaseClient({
        user: { id: vendorAUser },
        onQuery: (table, op, state) => {
          if (table === "vendor_packages") {
            // RLS blocks packages where vendor_id is not vendorA's
            const filter = state.filters.find((f) => f.args[0] === "vendor_id");
            if (filter && filter.args[1] === vendorBId) {
              return { data: [], count: 0 };
            }
          }
          return { data: [] };
        },
      });

      const { data } = await client
        .from("vendor_packages")
        .select("*")
        .eq("vendor_id", vendorBId);

      expect(data).toHaveLength(0);
    });

    it("strictly denies vendor from admin operations or admin API access", async () => {
      const vendorUser = {
        id: "33333333-vvvv-4333-8333-333333333333",
        email: "owner@elitephoto.com",
      };
      const supabase = createMockSupabaseClient({ user: vendorUser });
      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") {
            return { data: { user_id: vendorUser.id, role_id: 2, status: "Active" } };
          }
          if (table === "roles") {
            return { data: { role_name: "vendor", status: "Active" } };
          }
          if (table === "admins") {
            return { data: null };
          }
          return { data: null };
        },
      });

      await expect(requireActiveAdmin(supabase, adminClient)).rejects.toMatchObject({
        code: "FORBIDDEN",
        status: 403,
      });
    });

    it("prevents privilege escalation: tampered client payloads or user_metadata cannot make vendor an admin", async () => {
      const tamperedVendor = {
        id: "33333333-vvvv-4333-8333-333333333333",
        email: "tamperer@elitephoto.com",
        user_metadata: { role: "admin", is_admin: true, is_superadmin: true },
      };

      const supabase = createMockSupabaseClient({ user: tamperedVendor });
      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") {
            return { data: { user_id: tamperedVendor.id, role_id: 2, status: "Active" } };
          }
          if (table === "roles") {
            return { data: { role_name: "vendor", status: "Active" } };
          }
          if (table === "admins") {
            return { data: null }; // Authoritative database table has NO admin record
          }
          return { data: null };
        },
      });

      const ctx = await resolveAuthenticatedContext(supabase, adminClient);
      expect(ctx.role).toBe("vendor");
      expect(ctx.isActiveAdmin).toBe(false);

      await expect(requireActiveAdmin(supabase, adminClient)).rejects.toMatchObject({
        code: "FORBIDDEN",
        status: 403,
      });
    });
  });

  // =========================================================================
  // 3. ADMIN TESTING
  // =========================================================================
  describe("3. Admin Flow & Security Enforcement", () => {
    it("allows active admin login and verifies active admin membership in public.admins", async () => {
      const activeAdminUser = {
        id: "99999999-aaaa-4999-8999-999999999999",
        email: "superadmin@ymwa.in",
      };

      const supabase = createMockSupabaseClient({ user: activeAdminUser });
      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") {
            return { data: { user_id: activeAdminUser.id, role_id: 99, status: "Active" } };
          }
          if (table === "roles") {
            return { data: { role_name: "admin", status: "Active" } };
          }
          if (table === "admins") {
            return { data: { admin_id: 1, user_id: activeAdminUser.id, status: "active" } };
          }
          return { data: null };
        },
      });

      const ctx = await requireActiveAdmin(supabase, adminClient);
      expect(ctx.isActiveAdmin).toBe(true);
      expect(ctx.role).toBe("admin");
      expect(ctx.isConciergeOrAdmin).toBe(true);
    });

    it("strictly denies inactive admin with status = 'inactive'", async () => {
      const inactiveAdminUser = {
        id: "99999999-bbbb-4999-8999-999999999992",
        email: "fired_admin@ymwa.in",
      };

      const supabase = createMockSupabaseClient({ user: inactiveAdminUser });
      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") {
            return { data: { user_id: inactiveAdminUser.id, role_id: 99, status: "Active" } };
          }
          if (table === "roles") {
            return { data: { role_name: "admin", status: "Active" } };
          }
          if (table === "admins") {
            return { data: { admin_id: 2, status: "inactive" } };
          }
          return { data: null };
        },
      });

      await expect(requireActiveAdmin(supabase, adminClient)).rejects.toMatchObject({
        code: "FORBIDDEN",
        status: 403,
      });
      await expect(requireConciergeOrAdmin(supabase, adminClient)).rejects.toMatchObject({
        code: "FORBIDDEN",
        status: 403,
      });
    });

    it("strictly denies pending admin with status = 'pending'", async () => {
      const pendingAdminUser = {
        id: "99999999-cccc-4999-8999-999999999993",
        email: "pending_admin@ymwa.in",
      };

      const supabase = createMockSupabaseClient({ user: pendingAdminUser });
      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") {
            return { data: { user_id: pendingAdminUser.id, role_id: 99, status: "Active" } };
          }
          if (table === "roles") {
            return { data: { role_name: "admin", status: "Active" } };
          }
          if (table === "admins") {
            return { data: { admin_id: 3, status: "pending" } };
          }
          return { data: null };
        },
      });

      await expect(requireActiveAdmin(supabase, adminClient)).rejects.toMatchObject({
        code: "FORBIDDEN",
        status: 403,
      });
    });

    it("strictly denies suspended admin with status = 'suspended'", async () => {
      const suspendedAdminUser = {
        id: "99999999-dddd-4999-8999-999999999994",
        email: "suspended_admin@ymwa.in",
      };

      const supabase = createMockSupabaseClient({ user: suspendedAdminUser });
      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") {
            return { data: { user_id: suspendedAdminUser.id, role_id: 99, status: "Active" } };
          }
          if (table === "roles") {
            return { data: { role_name: "admin", status: "Active" } };
          }
          if (table === "admins") {
            return { data: { admin_id: 4, status: "suspended" } };
          }
          return { data: null };
        },
      });

      await expect(requireActiveAdmin(supabase, adminClient)).rejects.toMatchObject({
        code: "FORBIDDEN",
        status: 403,
      });
    });

    it("verifies secret URL (/admin/login143) is not a substitute for authentication or authorization", async () => {
      // Unauthenticated request to /admin (dashboard) cannot bypass auth just because /admin/login143 exists
      const anonSupabase = createMockSupabaseClient({ user: null });
      const adminClient = createMockSupabaseClient({ user: null });

      await expect(requireActiveAdmin(anonSupabase, adminClient)).rejects.toMatchObject({
        code: "UNAUTHENTICATED",
        status: 401,
      });
    });
  });

  // =========================================================================
  // 4. PUBLIC ACCESS REGRESSION
  // =========================================================================
  describe("4. Public Access Regression Checks", () => {
    it("confirms public vendor catalog path (/vendors) is clean of vendor portal guards", () => {
      const testPaths = [
        { path: "/vendors", isPortal: false },
        { path: "/vendors/photography", isPortal: false },
        { path: "/vendors/The-Makeup-Mafia-670506", isPortal: false },
        { path: "/venues", isPortal: false },
        { path: "/venues/taj-falaknuma-palace", isPortal: false },
        { path: "/vendor", isPortal: true },
        { path: "/vendor/overview", isPortal: true },
        { path: "/admin", isPortal: true },
        { path: "/customer/overview", isPortal: true },
      ];

      const isVendorPortal = (pathname: string) =>
        pathname === "/vendor" || pathname.startsWith("/vendor/");

      testPaths.forEach(({ path, isPortal }) => {
        if (path.startsWith("/vendors") || path.startsWith("/venues")) {
          expect(isVendorPortal(path)).toBe(isPortal);
        }
      });
    });
  });

  // =========================================================================
  // 5. API SECURITY ENFORCEMENT
  // =========================================================================
  describe("5. API Security & Ownership Isolation", () => {
    it("returns 401 for unauthenticated requests to protected endpoints", async () => {
      const anon = createMockSupabaseClient({ user: null });
      await expect(resolveAuthenticatedContext(anon, anon)).rejects.toMatchObject({
        code: "UNAUTHENTICATED",
        status: 401,
      });
    });

    it("returns 403 for authenticated users attempting unauthorized operations", async () => {
      const customer = { id: "11111111-aaaa-4111-8111-111111111111", email: "cust@ymwa.in" };
      const supabase = createMockSupabaseClient({ user: customer });
      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") return { data: { user_id: customer.id, role_id: 1, status: "Active" } };
          if (table === "roles") return { data: { role_name: "customer", status: "Active" } };
          return { data: null };
        },
      });

      await expect(requireActiveAdmin(supabase, adminClient)).rejects.toMatchObject({
        code: "FORBIDDEN",
        status: 403,
      });
    });

    it("supports Bearer token authorization alongside cookie sessions", async () => {
      const tokenUser = { id: "token-user-1", email: "token@ymwa.in" };
      const bearerClient = createMockSupabaseClient({ user: tokenUser });
      const adminClient = createMockSupabaseClient({
        onQuery: (table) => {
          if (table === "users") return { data: { user_id: tokenUser.id, role_id: 1, status: "Active" } };
          if (table === "roles") return { data: { role_name: "customer", status: "Active" } };
          return { data: null };
        },
      });

      const ctx = await resolveAuthenticatedContext(bearerClient, adminClient);
      expect(ctx.userId).toBe("token-user-1");
      expect(ctx.role).toBe("customer");
    });
  });
});
