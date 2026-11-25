import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import {
  buildPaginationMeta,
  normalizePagination,
  sanitizePostgrestFilterTerm,
} from "@we-arrange/database/repository";
import type { Database } from "@we-arrange/database/types";

const SAFE_USER_COLUMNS =
  "user_id, role_id, full_name, email, phone, status, created_at, updated_at";

export async function listUsersForAdmin(
  adminClient: SupabaseClient<Database>,
  options: { page?: number; limit?: number; status?: string; search?: string }
) {
  const { page, limit, from, to } = normalizePagination(options);
  let query = adminClient
    .from("users")
    .select(SAFE_USER_COLUMNS, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.status) {
    query = query.eq("status", options.status as Database["public"]["Enums"]["status_enum"]);
  }
  if (options.search) {
    const q = sanitizePostgrestFilterTerm(options.search);
    if (q) {
      query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`);
    }
  }

  const [{ data: users, error, count }, { data: roles }] = await Promise.all([
    query,
    adminClient.from("roles").select("role_id, role_name"),
  ]);

  if (error) throw mapDatabaseError(error, "Failed to list users.");
  const roleMap = new Map((roles ?? []).map((r) => [r.role_id, r.role_name]));

  return {
    items: (users ?? []).map((u) => ({
      ...u,
      roleName: u.role_id ? (roleMap.get(u.role_id) ?? null) : null,
    })),
    meta: buildPaginationMeta(page, limit, count ?? users?.length ?? 0),
  };
}

export async function updateUserRoleAndStatus(
  adminClient: SupabaseClient<Database>,
  actorUserId: string,
  targetUserId: string,
  input: {
    roleName?: "customer" | "vendor" | "concierge" | "admin";
    status?: "Active" | "Inactive" | "Pending";
  }
) {
  if (actorUserId === targetUserId && input.status === "Inactive") {
    throw new AppError("UNPROCESSABLE_ENTITY", 422, "Cannot deactivate your own admin account.");
  }

  const updateData: Database["public"]["Tables"]["users"]["Update"] = {
    updated_at: new Date().toISOString(),
  };

  if (input.roleName) {
    const { data: role } = await adminClient
      .from("roles")
      .select("role_id, role_name")
      .ilike("role_name", input.roleName)
      .maybeSingle();

    if (!role) {
      throw new AppError("NOT_FOUND", 404, `Role '${input.roleName}' does not exist.`);
    }
    updateData.role_id = role.role_id;
  }

  if (input.status) {
    updateData.status = input.status;
  }

  const { data, error } = await adminClient
    .from("users")
    .update(updateData)
    .eq("user_id", targetUserId)
    .select(SAFE_USER_COLUMNS)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to update user.");
  if (!data) throw new AppError("NOT_FOUND", 404, "User not found.");

  await adminClient.from("moderation_logs").insert({
    moderator_id: actorUserId,
    action: "user_update",
    remarks: `Updated user ${targetUserId}${input.roleName ? ` role=${input.roleName}` : ""}${input.status ? ` status=${input.status}` : ""}`,
  });

  return data;
}

export async function listRolesAndPermissions(adminClient: SupabaseClient<Database>) {
  const [{ data: roles, error: rErr }, { data: permissions }, { data: mappings }] =
    await Promise.all([
      adminClient.from("roles").select("*").order("role_id", { ascending: true }),
      adminClient.from("permissions").select("*").order("permission_id", { ascending: true }),
      adminClient.from("role_permissions").select("*"),
    ]);

  if (rErr) throw mapDatabaseError(rErr, "Failed to list roles.");
  const permById = new Map((permissions ?? []).map((p) => [p.permission_id, p]));

  return {
    roles: (roles ?? []).map((role) => ({
      ...role,
      permissions: (mappings ?? [])
        .filter((m) => m.role_id === role.role_id)
        .map((m) => permById.get(m.permission_id))
        .filter(Boolean),
    })),
    permissions: permissions ?? [],
  };
}

export async function createRoleWithPermissions(
  adminClient: SupabaseClient<Database>,
  input: { roleName: string; permissionNames?: string[] },
  actorUserId?: string
) {
  const { data: role, error } = await adminClient
    .from("roles")
    .insert({ role_name: input.roleName, status: "Active" })
    .select("*")
    .single();

  if (error || !role) throw mapDatabaseError(error, "Failed to create role.");

  if (input.permissionNames && input.permissionNames.length > 0) {
    const { data: perms } = await adminClient
      .from("permissions")
      .select("permission_id, permission_name")
      .in("permission_name", input.permissionNames);

    if (perms && perms.length > 0) {
      await adminClient.from("role_permissions").insert(
        perms.map((p) => ({
          role_id: role.role_id,
          permission_id: p.permission_id,
        }))
      );
    }
  }

  if (actorUserId) {
    await adminClient.from("moderation_logs").insert({
      moderator_id: actorUserId,
      action: "role_create",
      remarks: `Created role "${input.roleName}" with permissions: ${input.permissionNames?.join(", ") ?? "none"}`,
    });
  }

  return role;
}

export async function listAdmins(adminClient: SupabaseClient<Database>) {
  const { data, error } = await adminClient
    .from("admins")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw mapDatabaseError(error, "Failed to load admin list.");
  return data ?? [];
}

export async function assignOrUpdateAdmin(
  adminClient: SupabaseClient<Database>,
  actorUserId: string,
  input: {
    userId: string;
    adminName: string;
    status: "active" | "inactive" | "pending";
  }
) {
  if (input.userId === actorUserId && input.status !== "active") {
    throw new AppError("UNPROCESSABLE_ENTITY", 422, "Cannot disable your own admin access.");
  }

  const { data: userExists } = await adminClient
    .from("users")
    .select("user_id, status")
    .eq("user_id", input.userId)
    .maybeSingle();

  if (!userExists) {
    throw new AppError("NOT_FOUND", 404, "Target user must exist before granting admin access.");
  }
  if (input.status === "active" && userExists.status && userExists.status !== "Active") {
    throw new AppError("UNPROCESSABLE_ENTITY", 422, "Cannot activate admin access for an inactive user account.");
  }

  const { data: existing } = await adminClient
    .from("admins")
    .select("admin_id")
    .eq("user_id", input.userId)
    .maybeSingle();

  const result = existing
    ? await adminClient
        .from("admins")
        .update({ admin_name: input.adminName, status: input.status })
        .eq("admin_id", existing.admin_id)
        .select("*")
        .single()
    : await adminClient
        .from("admins")
        .insert({
          user_id: input.userId,
          admin_name: input.adminName,
          status: input.status,
        })
        .select("*")
        .single();

  if (result.error || !result.data) {
    throw mapDatabaseError(result.error, "Failed to update admin roster.");
  }

  await adminClient.from("moderation_logs").insert({
    moderator_id: actorUserId,
    action: "admin_roster_update",
    remarks: `Admin ${input.userId} set to ${input.status}`,
  });

  return result.data;
}

export async function getAppSettingsAndConfigs(adminClient: SupabaseClient<Database>) {
  const [settingsRes, currenciesRes, languagesRes] = await Promise.all([
    adminClient.from("app_settings").select("*").order("setting_key", { ascending: true }),
    adminClient.from("currencies").select("*").order("currency_id", { ascending: true }),
    adminClient.from("languages").select("*").order("language_id", { ascending: true }),
  ]);

  if (settingsRes.error) {
    throw mapDatabaseError(settingsRes.error, "Failed to fetch application settings.");
  }

  return {
    settings: settingsRes.data ?? [],
    currencies: currenciesRes.data ?? [],
    languages: languagesRes.data ?? [],
  };
}

export async function upsertAppSetting(
  adminClient: SupabaseClient<Database>,
  input: {
    settingKey: string;
    settingValue: string;
    description?: string;
    dataType: "text" | "number" | "boolean" | "json";
  },
  actorUserId?: string
) {
  const { data: existing } = await adminClient
    .from("app_settings")
    .select("setting_id")
    .eq("setting_key", input.settingKey)
    .maybeSingle();

  const nowIso = new Date().toISOString();
  const res = existing
    ? await adminClient
        .from("app_settings")
        .update({
          setting_value: input.settingValue,
          description: input.description ?? null,
          data_type: input.dataType,
          updated_at: nowIso,
        })
        .eq("setting_id", existing.setting_id)
        .select("*")
        .single()
    : await adminClient
        .from("app_settings")
        .insert({
          setting_key: input.settingKey,
          setting_value: input.settingValue,
          description: input.description ?? null,
          data_type: input.dataType,
          status: "Active",
          updated_at: nowIso,
        })
        .select("*")
        .single();

  if (res.error || !res.data) {
    throw mapDatabaseError(res.error, "Failed to save application setting.");
  }

  if (actorUserId) {
    await adminClient.from("moderation_logs").insert({
      moderator_id: actorUserId,
      action: "setting_update",
      remarks: `Updated setting "${input.settingKey}"`,
    });
  }

  return res.data;
}

export async function listModerationLogs(
  adminClient: SupabaseClient<Database>,
  options: { page?: number; limit?: number }
) {
  const { page, limit, from, to } = normalizePagination(options);
  const { data, error, count } = await adminClient
    .from("moderation_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw mapDatabaseError(error, "Failed to list moderation logs.");
  return {
    items: data ?? [],
    meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0),
  };
}


const ADMIN_ALLOWED_STATUSES = [
  "Active",
  "Inactive",
  "Draft",
  "Pending",
  "Published",
  "Approved",
  "Rejected",
] as const;

type AdminStatusEnum = Database["public"]["Enums"]["status_enum"];

function resolveAdminStatusFilter(status?: string): AdminStatusEnum | undefined {
  if (!status || status.trim() === "") return undefined;
  const trimmed = status.trim();
  if ((ADMIN_ALLOWED_STATUSES as readonly string[]).includes(trimmed)) {
    return trimmed as AdminStatusEnum;
  }
  throw new AppError("VALIDATION_ERROR", 400, `Unsupported status filter: ${trimmed}`);
}

export async function listVendorsForAdmin(
  adminClient: SupabaseClient<Database>,
  filters: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    verified?: string;
  } = {}
) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const limit = Math.min(50, Math.max(1, Math.trunc(filters.limit ?? 20)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const statusFilter = resolveAdminStatusFilter(filters.status);

  let query = adminClient
    .from("vendors")
    .select(
      "vendor_id, category_id, user_id, vendor_name, slug, description, logo, cover_image, rating, is_verified, status, created_at, updated_at, metadata",
      { count: "exact" }
    );

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }
  if (filters.verified === "true") {
    query = query.eq("is_verified", true);
  } else if (filters.verified === "false") {
    query = query.eq("is_verified", false);
  }
  if (filters.search && filters.search.trim().length > 0) {
    query = query.ilike("vendor_name", `%${filters.search.trim()}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw mapDatabaseError(error, "Failed to list vendors.");
  }

  const total = count ?? 0;
  return {
    items: data ?? [],
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function listReviewsForAdmin(
  adminClient: SupabaseClient<Database>,
  filters: { page?: number; limit?: number; status?: string } = {}
) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const limit = Math.min(50, Math.max(1, Math.trunc(filters.limit ?? 20)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const statusFilter = resolveAdminStatusFilter(filters.status);

  let query = adminClient
    .from("reviews")
    .select(
      "review_id, user_id, venue_id, vendor_id, rating, review_text, status, created_at, updated_at",
      { count: "exact" }
    );

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw mapDatabaseError(error, "Failed to list reviews for moderation.");
  }

  const total = count ?? 0;
  return {
    items: data ?? [],
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function listQuotesForAdmin(
  adminClient: SupabaseClient<Database>,
  filters: { page?: number; limit?: number; status?: string } = {}
) {
  const page = Math.max(1, Math.trunc(filters.page ?? 1));
  const limit = Math.min(50, Math.max(1, Math.trunc(filters.limit ?? 20)));
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  const statusFilter = resolveAdminStatusFilter(filters.status);

  let query = adminClient
    .from("quotes")
    .select(
      "quote_id, enquiry_id, venue_id, vendor_id, collected_by, package_name, base_cost_inr, currency, catering_included, inclusions, exclusions, notes, valid_until, status, created_at, updated_at",
      { count: "exact" }
    );

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    throw mapDatabaseError(error, "Failed to list quotes.");
  }

  const total = count ?? 0;
  return {
    items: data ?? [],
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}
