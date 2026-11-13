import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@we-arrange/types";
import { createServiceRoleClient } from "@we-arrange/database/clients";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import { slugify } from "@we-arrange/database/repository";
import type { Database } from "@we-arrange/database/types";
import { createSupabaseServerClient } from "@/services/supabase/server";
import { resolveAuthenticatedContext, type AuthenticatedContext } from "./rbac";

export interface RegisterCustomerInput {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
}

export interface RegisterVendorInput extends RegisterCustomerInput {
  businessName: string;
  categorySlug: string;
  city?: string;
  description?: string;
  website?: string;
}

const VENDOR_CATEGORY_ALIAS_MAP: Record<string, string> = {
  makeup: "bridal-makeup",
  "bridal-makeup": "bridal-makeup",
  photography: "photographers",
  photographers: "photographers",
  decor: "decorators",
  decorators: "decorators",
  catering: "catering",
  mehendi: "mehendi",
};

export async function syncPublicUserRecord(
  adminClient: SupabaseClient<Database>,
  params: {
    userId: string;
    email: string;
    fullName: string;
    phone?: string | null;
    roleName: "customer" | "vendor";
  }
): Promise<{ userId: string; roleId: number | null }> {
  const { data: roleRow, error: roleError } = await adminClient
    .from("roles")
    .select("role_id, role_name")
    .ilike("role_name", params.roleName)
    .maybeSingle();

  if (roleError) {
    throw mapDatabaseError(roleError, "Failed to look up application role.");
  }

  const { error: userUpsertError } = await adminClient.from("users").upsert(
    {
      user_id: params.userId,
      role_id: roleRow?.role_id ?? null,
      full_name: params.fullName.trim(),
      email: params.email.toLowerCase().trim(),
      phone: params.phone?.trim() ?? null,
      status: "Active",
    },
    { onConflict: "user_id" }
  );

  if (userUpsertError) {
    throw mapDatabaseError(userUpsertError, "Failed to synchronize user profile.");
  }

  const { data: existingProfile } = await adminClient
    .from("user_profile")
    .select("profile_id")
    .eq("user_id", params.userId)
    .maybeSingle();

  if (!existingProfile) {
    const { error: profileError } = await adminClient.from("user_profile").insert({
      user_id: params.userId,
      preferences: {},
    });
    if (profileError) {
      throw mapDatabaseError(profileError, "Failed to create customer extended profile.");
    }
  }

  return { userId: params.userId, roleId: roleRow?.role_id ?? null };
}

export async function registerCustomerAccount(
  input: RegisterCustomerInput,
  deps?: {
    supabase?: SupabaseClient<Database>;
    adminClient?: SupabaseClient<Database>;
  }
) {
  const supabase = deps?.supabase ?? (await createSupabaseServerClient());
  const adminClient = deps?.adminClient ?? createServiceRoleClient();
  const normalizedEmail = input.email.toLowerCase().trim();

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
      },
    },
  });

  if (error || !data.user) {
    throw new AppError(
      error?.status === 422 || error?.message?.toLowerCase().includes("already")
        ? "CONFLICT"
        : "VALIDATION_ERROR",
      error?.status === 422 ? 409 : 400,
      error?.message || "Unable to register account."
    );
  }

  try {
    await syncPublicUserRecord(adminClient, {
      userId: data.user.id,
      email: normalizedEmail,
      fullName: input.fullName,
      phone: input.phone ?? null,
      roleName: "customer",
    });
  } catch (syncErr) {
    await adminClient.auth?.admin?.deleteUser?.(data.user.id).catch(() => undefined);
    throw syncErr;
  }

  return {
    userId: data.user.id,
    email: normalizedEmail,
    fullName: input.fullName.trim(),
    role: "customer" as UserRole,
    requiresEmailConfirmation: !data.session,
  };
}

export async function registerVendorAccount(
  input: RegisterVendorInput,
  deps?: {
    supabase?: SupabaseClient<Database>;
    adminClient?: SupabaseClient<Database>;
  }
) {
  const supabase = deps?.supabase ?? (await createSupabaseServerClient());
  const adminClient = deps?.adminClient ?? createServiceRoleClient();
  const normalizedEmail = input.email.toLowerCase().trim();
  const normalizedCatSlug =
    VENDOR_CATEGORY_ALIAS_MAP[input.categorySlug.toLowerCase().trim()] ??
    input.categorySlug.toLowerCase().trim();

  const { data: category, error: catError } = await adminClient
    .from("vendor_categories")
    .select("category_id, slug")
    .eq("slug", normalizedCatSlug)
    .maybeSingle();

  if (catError) {
    throw mapDatabaseError(catError, "Failed to validate vendor category.");
  }
  if (!category) {
    throw new AppError("VALIDATION_ERROR", 400, "Unknown vendor category.");
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim(),
      },
    },
  });

  if (error || !data.user) {
    throw new AppError(
      error?.status === 422 ? "CONFLICT" : "VALIDATION_ERROR",
      error?.status === 422 ? 409 : 400,
      error?.message || "Unable to register vendor account."
    );
  }

  const uniqueSlug = `${slugify(input.businessName) || "vendor"}-${Date.now().toString(36)}`;
  let vendorRow: { vendor_id: number; slug: string | null; is_verified: boolean | null; status: string | null };

  try {
    await syncPublicUserRecord(adminClient, {
      userId: data.user.id,
      email: normalizedEmail,
      fullName: input.fullName,
      phone: input.phone ?? null,
      roleName: "vendor",
    });

    const { data: insertedVendor, error: vendorError } = await adminClient
      .from("vendors")
      .insert({
        user_id: data.user.id,
        category_id: category.category_id,
        vendor_name: input.businessName.trim(),
        slug: uniqueSlug,
        description: input.description?.trim() ?? null,
        is_verified: false, // Vendors can NEVER self-verify
        status: "Pending", // Requires admin vetting approval
        metadata: {
          ...(input.city ? { city: input.city.trim(), base_city: input.city.trim() } : {}),
        },
      })
      .select("vendor_id, slug, is_verified, status")
      .single();

    if (vendorError || !insertedVendor) {
      throw mapDatabaseError(vendorError, "Failed to create pending vendor profile.");
    }
    vendorRow = insertedVendor;

    const { error: contactErr } = await adminClient.from("vendor_contacts").insert({
      vendor_id: vendorRow.vendor_id,
      contact_person: input.fullName.trim(),
      email: normalizedEmail,
      phone: input.phone?.trim() ?? null,
    });
    if (contactErr) {
      throw mapDatabaseError(contactErr, "Failed to save vendor contact profile.");
    }
  } catch (provErr) {
    await adminClient.auth?.admin?.deleteUser?.(data.user.id).catch(() => undefined);
    throw provErr;
  }

  return {
    userId: data.user.id,
    vendorId: vendorRow.vendor_id,
    vendorSlug: vendorRow.slug,
    email: normalizedEmail,
    role: "vendor" as UserRole,
    isVerified: false,
    status: vendorRow.status,
    requiresEmailConfirmation: !data.session,
  };
}

export async function loginWithPassword(
  email: string,
  password: string,
  deps?: {
    supabase?: SupabaseClient<Database>;
    adminClient?: SupabaseClient<Database>;
    requireStaff?: boolean;
  }
): Promise<AuthenticatedContext> {
  const supabase = deps?.supabase ?? (await createSupabaseServerClient());
  const adminClient = deps?.adminClient ?? createServiceRoleClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });

  if (error || !data.user) {
    throw new AppError("UNAUTHENTICATED", 401, "Invalid email or password.");
  }

  const ctx = await resolveAuthenticatedContext(supabase, adminClient);
  if (deps?.requireStaff && !ctx.isConciergeOrAdmin) {
    await supabase.auth.signOut().catch(() => undefined);
    throw new AppError(
      "FORBIDDEN",
      403,
      "This account is not authorized as an active Administrator or Concierge."
    );
  }

  return ctx;
}

export async function logoutSession(existingSupabase?: SupabaseClient<Database>) {
  const supabase = existingSupabase ?? (await createSupabaseServerClient());
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new AppError("INTERNAL_ERROR", 500, "Failed to terminate session cleanly.");
  }
  return { loggedOut: true };
}

export async function refreshSession(
  refreshToken?: string,
  existingSupabase?: SupabaseClient<Database>
) {
  const supabase = existingSupabase ?? (await createSupabaseServerClient());
  const { data, error } = refreshToken
    ? await supabase.auth.refreshSession({ refresh_token: refreshToken })
    : await supabase.auth.refreshSession();

  if (error || !data.session) {
    throw new AppError("UNAUTHENTICATED", 401, "Unable to refresh authentication session.");
  }

  return {
    expiresAt: data.session.expires_at ?? null,
    userId: data.user?.id ?? null,
  };
}

export async function sendPasswordResetEmail(
  email: string,
  redirectTo?: string,
  existingSupabase?: SupabaseClient<Database>
) {
  const supabase = existingSupabase ?? (await createSupabaseServerClient());
  const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
    redirectTo,
  });

  if (error) {
    throw new AppError("VALIDATION_ERROR", 400, error.message);
  }

  return { sent: true };
}

export async function completePasswordReset(
  input: { newPassword: string; code?: string },
  existingSupabase?: SupabaseClient<Database>
) {
  const supabase = existingSupabase ?? (await createSupabaseServerClient());

  if (input.code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(input.code);
    if (exchangeError) {
      throw new AppError("UNAUTHENTICATED", 401, "Invalid or expired recovery code.");
    }
  }

  const { data, error } = await supabase.auth.updateUser({ password: input.newPassword });
  if (error || !data.user) {
    throw new AppError(
      error?.status === 401 ? "UNAUTHENTICATED" : "VALIDATION_ERROR",
      error?.status === 401 ? 401 : 400,
      error?.message || "Failed to update password."
    );
  }

  return { updated: true, userId: data.user.id };
}

export async function changeAuthenticatedPassword(
  input: { currentPassword: string; newPassword: string },
  deps?: {
    supabase?: SupabaseClient<Database>;
    adminClient?: SupabaseClient<Database>;
    requireStaff?: boolean;
  }
) {
  const supabase = deps?.supabase ?? (await createSupabaseServerClient());
  const ctx = await resolveAuthenticatedContext(supabase, deps?.adminClient);

  if (deps?.requireStaff && !ctx.isConciergeOrAdmin) {
    throw new AppError(
      "FORBIDDEN",
      403,
      "Administrator or Concierge privileges are required."
    );
  }

  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: ctx.email,
    password: input.currentPassword,
  });
  if (reauthError) {
    throw new AppError("VALIDATION_ERROR", 400, "Current password is incorrect.");
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: input.newPassword,
  });
  if (updateError) {
    throw new AppError("VALIDATION_ERROR", 400, updateError.message);
  }

  return { updated: true };
}

