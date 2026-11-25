import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@we-arrange/types";
import { createBearerSupabaseClient, createServiceRoleClient } from "@we-arrange/database/clients";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import type { Database } from "@we-arrange/database/types";
import { createSupabaseServerClient } from "@/services/supabase/server";

export interface AuthenticatedContext {
  userId: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: UserRole;
  roleId: number | null;
  isActiveAdmin: boolean;
  isConciergeOrAdmin: boolean;
  vendorId: number | null;
  supabase: SupabaseClient<Database>;
}

const VALID_ROLES = new Set<UserRole>(["customer", "vendor", "concierge", "admin"]);

export function normalizeUserRole(rawRoleName: string | null | undefined): UserRole {
  const normalized = (rawRoleName ?? "").toLowerCase().trim() as UserRole;
  return VALID_ROLES.has(normalized) ? normalized : "customer";
}

export async function resolveAuthenticatedContext(
  existingSupabase?: SupabaseClient<Database>,
  existingAdminClient?: SupabaseClient<Database>
): Promise<AuthenticatedContext> {
  let supabase = existingSupabase ?? (await createSupabaseServerClient());
  let { data: authData, error: authError } = await supabase.auth.getUser();

  if ((authError || !authData?.user) && !existingSupabase) {
    let authHeader: string | null = null;
    try {
      const { headers } = await import("next/headers");
      authHeader = (await headers()).get("authorization");
    } catch {
      authHeader = null;
    }
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      const jwt = authHeader.slice(7).trim();
      if (jwt) {
        ({ data: authData, error: authError } = await supabase.auth.getUser(jwt));
        if (!authError && authData?.user) {
          supabase = createBearerSupabaseClient(jwt);
        }
      }
    }
  }

  if (authError || !authData?.user) {
    throw new AppError("UNAUTHENTICATED", 401, "Authentication required.");
  }

  const authUser = authData.user;
  let adminClient: SupabaseClient<Database>;
  if (existingAdminClient) {
    adminClient = existingAdminClient;
  } else {
    try {
      adminClient = createServiceRoleClient();
    } catch {
      adminClient = supabase;
    }
  }

  const { data: dbUser, error: userError } = await adminClient
    .from("users")
    .select("user_id, role_id, full_name, email, phone, status")
    .eq("user_id", authUser.id)
    .maybeSingle();

  if (userError) {
    throw mapDatabaseError(userError, "Failed to verify user account.");
  }

  if (dbUser && dbUser.status && dbUser.status !== "Active") {
    throw new AppError("FORBIDDEN", 403, "This user account is currently inactive.");
  }

  let resolvedRole: UserRole = "customer";
  if (dbUser?.role_id) {
    const { data: roleRow, error: roleError } = await adminClient
      .from("roles")
      .select("role_name, status")
      .eq("role_id", dbUser.role_id)
      .maybeSingle();

    if (roleError) {
      throw mapDatabaseError(roleError, "Failed to resolve assigned role.");
    }
    const isRoleActive = !roleRow?.status || roleRow.status === "Active";
    if (roleRow && isRoleActive) {
      const candidateRole = normalizeUserRole(roleRow.role_name);
      // Never elevate to admin via public.roles without an active public.admins row
      resolvedRole = candidateRole === "admin" ? "customer" : candidateRole;
    }
  }

  // Strictly verify active membership in public.admins (never trust user_metadata)
  const { data: adminRow, error: adminError } = await adminClient
    .from("admins")
    .select("admin_id, status")
    .eq("user_id", authUser.id)
    .maybeSingle();

  if (adminError) {
    throw mapDatabaseError(adminError, "Failed to verify administrator status.");
  }

  const isActiveUser = Boolean(dbUser && dbUser.status === "Active");
  const isActiveAdmin = Boolean(isActiveUser && adminRow && adminRow.status === "active");
  const hasNonActiveAdminRecord = Boolean(adminRow && adminRow.status !== "active");

  if (isActiveAdmin) {
    resolvedRole = "admin";
  } else if (!isActiveUser || (hasNonActiveAdminRecord && resolvedRole === "concierge")) {
    // Revoked/pending/inactive admin records or missing public.users rows must not gain staff access
    resolvedRole = "customer";
  }

  let vendorId: number | null = null;
  if (resolvedRole === "vendor") {
    const { data: vendorRow } = await adminClient
      .from("vendors")
      .select("vendor_id")
      .eq("user_id", authUser.id)
      .maybeSingle();
    vendorId = vendorRow?.vendor_id ?? null;
  }

  return {
    userId: authUser.id,
    email: dbUser?.email ?? authUser.email ?? "",
    fullName: dbUser?.full_name ?? authUser.email?.split("@")[0] ?? "YMWA User",
    phone: dbUser?.phone ?? null,
    role: resolvedRole,
    roleId: dbUser?.role_id ?? null,
    isActiveAdmin,
    isConciergeOrAdmin: isActiveAdmin || (!hasNonActiveAdminRecord && resolvedRole === "concierge"),
    vendorId,
    supabase,
  };
}

export async function requireAuthenticatedUser(
  existingSupabase?: SupabaseClient<Database>,
  existingAdminClient?: SupabaseClient<Database>
): Promise<AuthenticatedContext> {
  return resolveAuthenticatedContext(existingSupabase, existingAdminClient);
}

export async function requireRole(
  allowedRoles: readonly UserRole[],
  existingSupabase?: SupabaseClient<Database>,
  existingAdminClient?: SupabaseClient<Database>
): Promise<AuthenticatedContext> {
  const ctx = await resolveAuthenticatedContext(existingSupabase, existingAdminClient);
  if (!allowedRoles.includes(ctx.role)) {
    throw new AppError(
      "FORBIDDEN",
      403,
      `Access denied. Required role: ${allowedRoles.join(" or ")}.`
    );
  }
  return ctx;
}

export async function requireConciergeOrAdmin(
  existingSupabase?: SupabaseClient<Database>,
  existingAdminClient?: SupabaseClient<Database>
): Promise<AuthenticatedContext> {
  const ctx = await resolveAuthenticatedContext(existingSupabase, existingAdminClient);
  if (!ctx.isConciergeOrAdmin) {
    throw new AppError(
      "FORBIDDEN",
      403,
      "Concierge or Administrator privileges are required."
    );
  }
  return ctx;
}

export async function requireActiveAdmin(
  existingSupabase?: SupabaseClient<Database>,
  existingAdminClient?: SupabaseClient<Database>
): Promise<AuthenticatedContext> {
  const ctx = await resolveAuthenticatedContext(existingSupabase, existingAdminClient);
  if (!ctx.isActiveAdmin) {
    throw new AppError("FORBIDDEN", 403, "Active Administrator privileges are required.");
  }
  return ctx;
}

export async function requireVendorOwner(
  existingSupabase?: SupabaseClient<Database>,
  existingAdminClient?: SupabaseClient<Database>
): Promise<AuthenticatedContext & { vendorId: number }> {
  const ctx = await requireRole(["vendor", "admin"], existingSupabase, existingAdminClient);
  if (!ctx.vendorId) {
    throw new AppError(
      "FORBIDDEN",
      403,
      "No vendor listing is linked to this authenticated account."
    );
  }
  return { ...ctx, vendorId: ctx.vendorId };
}

