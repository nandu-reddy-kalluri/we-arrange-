import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  loginWithPassword,
  registerVendorAccount,
  requireActiveAdmin,
  requireConciergeOrAdmin,
  requireRole,
  resolveAuthenticatedContext,
} from "@/services/auth";
import { AppError } from "@we-arrange/database/errors";
import { createMockSupabaseClient } from "./helpers/mockSupabase";

describe("Module 2: Authentication, DB RBAC & Legacy Auth Retirement", () => {
  it("never exposes .admin_auth.json or hardcoded password in lib/adminAuth.ts", () => {
    const legacyFile = fs.readFileSync(
      path.resolve(__dirname, "../lib/adminAuth.ts"),
      "utf8"
    );
    expect(legacyFile).not.toContain("252U1R9162");
    expect(legacyFile).not.toContain(".admin_auth.json");
    expect(legacyFile).not.toContain("otpStore");
  });

  it("rejects unauthenticated requests with 401 UNAUTHENTICATED", async () => {
    const anon = createMockSupabaseClient({ user: null });
    await expect(resolveAuthenticatedContext(anon, anon)).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
      status: 401,
    });
  });

  it("ignores user_metadata.role and resolves permissions strictly from DB roles & admins", async () => {
    const tamperedUser = {
      id: "11111111-1111-1111-1111-111111111111",
      email: "customer@example.com",
      user_metadata: { role: "admin", is_admin: true },
    };

    const supabase = createMockSupabaseClient({ user: tamperedUser });
    const adminClient = createMockSupabaseClient({
      user: tamperedUser,
      onQuery: (table) => {
        if (table === "users") {
          return {
            data: {
              user_id: tamperedUser.id,
              role_id: 1,
              full_name: "Normal Customer",
              email: tamperedUser.email,
              phone: null,
              status: "Active",
            },
          };
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

    const ctx = await resolveAuthenticatedContext(supabase, adminClient);
    expect(ctx.role).toBe("customer");
    expect(ctx.isActiveAdmin).toBe(false);
    expect(ctx.isConciergeOrAdmin).toBe(false);

    await expect(requireActiveAdmin(supabase, adminClient)).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
    await expect(requireRole(["concierge", "admin"], supabase, adminClient)).rejects.toBeInstanceOf(
      AppError
    );
  });

  it("grants admin only when public.admins status = 'active' and rejects inactive admins", async () => {
    const staffUser = {
      id: "22222222-2222-2222-2222-222222222222",
      email: "staff@ymwa.in",
    };

    const supabase = createMockSupabaseClient({ user: staffUser });
    const inactiveAdminClient = createMockSupabaseClient({
      user: staffUser,
      onQuery: (table) => {
        if (table === "users") {
          return { data: { user_id: staffUser.id, role_id: 1, status: "Active" } };
        }
        if (table === "roles") {
          return { data: { role_name: "customer", status: "Active" } };
        }
        if (table === "admins") {
          return { data: { admin_id: 4, status: "inactive" } };
        }
        return { data: null };
      },
    });

    const inactiveCtx = await resolveAuthenticatedContext(supabase, inactiveAdminClient);
    expect(inactiveCtx.isActiveAdmin).toBe(false);

    await expect(
      loginWithPassword("staff@ymwa.in", "secret1234", {
        supabase,
        adminClient: inactiveAdminClient,
        requireStaff: true,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
  });

  it("forces newly registered vendors to is_verified = false and status = Pending", async () => {
    let insertedVendor: Record<string, unknown> | undefined;
    const supabase = createMockSupabaseClient({
      user: null,
      authMocks: {
        signUp: async () => ({
          data: { user: { id: "33333333-3333-3333-3333-333333333333" }, session: null },
          error: null,
        }),
      },
    });
    const adminClient = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "vendor_categories") {
          return { data: { category_id: 2, slug: "photographers" } };
        }
        if (table === "roles") {
          return { data: { role_id: 2, role_name: "vendor" } };
        }
        if (table === "vendors" && op === "insert") {
          insertedVendor = state.payload as Record<string, unknown>;
          return {
            data: { vendor_id: 901, slug: insertedVendor.slug, is_verified: false, status: "Pending" },
          };
        }
        return { data: { profile_id: 1 } };
      },
    });

    const created = await registerVendorAccount(
      {
        fullName: "Lens Craft",
        email: "studio@lenscraft.in",
        password: "StrongPassword!1",
        businessName: "Lens Craft Studio",
        categorySlug: "photography",
        city: "Hyderabad",
      },
      { supabase, adminClient }
    );

    expect(created.isVerified).toBe(false);
    expect(created.status).toBe("Pending");
    expect(insertedVendor?.is_verified).toBe(false);
    expect(insertedVendor?.status).toBe("Pending");
  });

  it("enforces F-01 hardening across active admin, inactive/pending/missing admin, active concierge, inactive user, and customer", async () => {
    const buildClient = (opts: {
      userId: string;
      userStatus: string;
      roleName: string;
      roleStatus?: string;
      adminStatus: string | null;
    }) => {
      const authUser = { id: opts.userId, email: `${opts.userId}@ymwa.in` };
      const supabase = createMockSupabaseClient({ user: authUser });
      const adminClient = createMockSupabaseClient({
        user: authUser,
        onQuery: (table) => {
          if (table === "users") {
            return {
              data: {
                user_id: opts.userId,
                role_id: 10,
                email: authUser.email,
                status: opts.userStatus,
              },
            };
          }
          if (table === "roles") {
            return {
              data: {
                role_name: opts.roleName,
                status: opts.roleStatus ?? "Active",
              },
            };
          }
          if (table === "admins") {
            return {
              data: opts.adminStatus
                ? { admin_id: 99, status: opts.adminStatus }
                : null,
            };
          }
          return { data: null };
        },
      });
      return { supabase, adminClient };
    };

    // 1. Active admin -> allowed
    const activeAdmin = buildClient({
      userId: "44444444-4444-4444-4444-444444444441",
      userStatus: "Active",
      roleName: "admin",
      adminStatus: "active",
    });
    const activeAdminCtx = await requireActiveAdmin(
      activeAdmin.supabase,
      activeAdmin.adminClient
    );
    expect(activeAdminCtx.isActiveAdmin).toBe(true);
    expect(activeAdminCtx.isConciergeOrAdmin).toBe(true);
    expect(activeAdminCtx.role).toBe("admin");

    // 2. Inactive admin with public.roles='admin' -> denied 403
    const inactiveAdmin = buildClient({
      userId: "44444444-4444-4444-4444-444444444442",
      userStatus: "Active",
      roleName: "admin",
      adminStatus: "inactive",
    });
    await expect(
      requireActiveAdmin(inactiveAdmin.supabase, inactiveAdmin.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
    await expect(
      requireConciergeOrAdmin(inactiveAdmin.supabase, inactiveAdmin.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });

    // 3. public.roles='admin' with missing public.admins row -> denied 403
    const missingAdminRow = buildClient({
      userId: "44444444-4444-4444-4444-444444444443",
      userStatus: "Active",
      roleName: "admin",
      adminStatus: null,
    });
    await expect(
      requireActiveAdmin(missingAdminRow.supabase, missingAdminRow.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
    await expect(
      requireConciergeOrAdmin(missingAdminRow.supabase, missingAdminRow.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });

    // 4. Pending admin -> denied 403
    const pendingAdmin = buildClient({
      userId: "44444444-4444-4444-4444-444444444444",
      userStatus: "Active",
      roleName: "admin",
      adminStatus: "pending",
    });
    await expect(
      requireActiveAdmin(pendingAdmin.supabase, pendingAdmin.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
    await expect(
      requireConciergeOrAdmin(pendingAdmin.supabase, pendingAdmin.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });

    // 5. Active concierge -> allowed for concierge ops, denied 403 for admin-only ops
    const activeConcierge = buildClient({
      userId: "44444444-4444-4444-4444-444444444445",
      userStatus: "Active",
      roleName: "concierge",
      adminStatus: null,
    });
    const conciergeCtx = await requireConciergeOrAdmin(
      activeConcierge.supabase,
      activeConcierge.adminClient
    );
    expect(conciergeCtx.role).toBe("concierge");
    expect(conciergeCtx.isConciergeOrAdmin).toBe(true);
    expect(conciergeCtx.isActiveAdmin).toBe(false);
    await expect(
      requireActiveAdmin(activeConcierge.supabase, activeConcierge.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });

    // 6. Inactive user even with active admin row -> denied 403
    const inactiveUser = buildClient({
      userId: "44444444-4444-4444-4444-444444444446",
      userStatus: "Inactive",
      roleName: "admin",
      adminStatus: "active",
    });
    await expect(
      requireActiveAdmin(inactiveUser.supabase, inactiveUser.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });

    // 7. Customer attempting staff/admin access -> denied 403
    const customer = buildClient({
      userId: "44444444-4444-4444-4444-444444444447",
      userStatus: "Active",
      roleName: "customer",
      adminStatus: null,
    });
    await expect(
      requireConciergeOrAdmin(customer.supabase, customer.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });

    // 8. Inactive concierge -> denied 403
    const inactiveConcierge = buildClient({
      userId: "44444444-4444-4444-4444-444444444448",
      userStatus: "Inactive",
      roleName: "concierge",
      adminStatus: null,
    });
    await expect(
      requireConciergeOrAdmin(inactiveConcierge.supabase, inactiveConcierge.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });

    // 9. Vendor attempting staff/admin access -> denied 403
    const vendor = buildClient({
      userId: "44444444-4444-4444-4444-444444444449",
      userStatus: "Active",
      roleName: "vendor",
      adminStatus: null,
    });
    await expect(
      requireConciergeOrAdmin(vendor.supabase, vendor.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
    await expect(
      requireActiveAdmin(vendor.supabase, vendor.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });

    // 10. Suspended admin (Rejected user status) -> denied 403
    const rejectedAdmin = buildClient({
      userId: "44444444-4444-4444-4444-444444444450",
      userStatus: "Rejected",
      roleName: "admin",
      adminStatus: "active",
    });
    await expect(
      requireActiveAdmin(rejectedAdmin.supabase, rejectedAdmin.adminClient)
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
  });

  it("revokes local session cookies when loginWithPassword rejects an inactive account or wrong portal role", async () => {
    const signOutScopes: Array<unknown> = [];
    const authUser = { id: "55555555-5555-5555-5555-555555555551", email: "suspended@ymwa.in" };
    const supabase = createMockSupabaseClient({
      user: authUser,
      authMocks: {
        signOut: async (opts?: unknown) => {
          signOutScopes.push(opts);
          return { error: null };
        },
      },
    });
    const inactiveAdminClient = createMockSupabaseClient({
      user: authUser,
      onQuery: (table) => {
        if (table === "users") {
          return { data: { user_id: authUser.id, role_id: 3, status: "Inactive" } };
        }
        return { data: null };
      },
    });

    await expect(
      loginWithPassword("suspended@ymwa.in", "secret1234", {
        supabase,
        adminClient: inactiveAdminClient,
        requireAdmin: true,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
    expect(signOutScopes).toContainEqual({ scope: "local" });

    // Concierge rejected on public customer login when rejectStaff = true
    const conciergeUser = { id: "55555555-5555-5555-5555-555555555552", email: "concierge@ymwa.in" };
    const conciergeSignOutScopes: Array<unknown> = [];
    const conciergeSupabase = createMockSupabaseClient({
      user: conciergeUser,
      authMocks: {
        signOut: async (opts?: unknown) => {
          conciergeSignOutScopes.push(opts);
          return { error: null };
        },
      },
    });
    const conciergeAdminClient = createMockSupabaseClient({
      user: conciergeUser,
      onQuery: (table) => {
        if (table === "users") {
          return { data: { user_id: conciergeUser.id, role_id: 1, status: "Active" } };
        }
        if (table === "roles") {
          return { data: { role_name: "concierge", status: "Active" } };
        }
        return { data: null };
      },
    });

    await expect(
      loginWithPassword("concierge@ymwa.in", "secret1234", {
        supabase: conciergeSupabase,
        adminClient: conciergeAdminClient,
        rejectAdmin: true,
        rejectStaff: true,
      })
    ).rejects.toMatchObject({ code: "FORBIDDEN", status: 403 });
    expect(conciergeSignOutScopes).toContainEqual({ scope: "local" });
  });
});

