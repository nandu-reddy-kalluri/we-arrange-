import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import { buildPaginationMeta, normalizePagination } from "@we-arrange/database/repository";
import type { Database, Json } from "@we-arrange/database/types";

export interface CustomerProfileDTO {
  userId: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  address: string | null;
  cityId: number | null;
  areaId: number | null;
  pincode: string | null;
  about: string | null;
  gender: string | null;
  dob: string | null;
  profileImage: string | null;
  preferences: Record<string, unknown>;
}

export async function getCustomerProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<CustomerProfileDTO> {
  const [{ data: userRow, error: userErr }, { data: profileRow, error: profErr }] =
    await Promise.all([
      supabase
        .from("users")
        .select("user_id, email, full_name, phone")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("user_profile")
        .select(
          "user_id, address, city_id, area_id, pincode, about, gender, dob, profile_image, preferences"
        )
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

  if (userErr) throw mapDatabaseError(userErr, "Failed to load user account.");
  if (profErr) throw mapDatabaseError(profErr, "Failed to load user profile.");
  if (!userRow && !profileRow) {
    throw new AppError("NOT_FOUND", 404, "Customer profile not found.");
  }

  const prefs =
    profileRow?.preferences &&
    typeof profileRow.preferences === "object" &&
    !Array.isArray(profileRow.preferences)
      ? (profileRow.preferences as Record<string, unknown>)
      : {};

  return {
    userId,
    email: userRow?.email ?? null,
    fullName: userRow?.full_name ?? null,
    phone: userRow?.phone ?? null,
    address: profileRow?.address ?? null,
    cityId: profileRow?.city_id ?? null,
    areaId: profileRow?.area_id ?? null,
    pincode: profileRow?.pincode ?? null,
    about: profileRow?.about ?? null,
    gender: profileRow?.gender ?? null,
    dob: profileRow?.dob ?? null,
    profileImage: profileRow?.profile_image ?? null,
    preferences: prefs,
  };
}

export async function updateCustomerProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: {
    fullName?: string;
    phone?: string | null;
    address?: string | null;
    cityId?: number | null;
    areaId?: number | null;
    pincode?: string | null;
    about?: string | null;
    gender?: string | null;
    dob?: string | null;
    profileImage?: string | null;
    preferences?: Record<string, unknown>;
  }
): Promise<CustomerProfileDTO> {
  if (input.fullName !== undefined || input.phone !== undefined) {
    const userUpdate: Database["public"]["Tables"]["users"]["Update"] = {
      updated_at: new Date().toISOString(),
    };
    if (input.fullName !== undefined) userUpdate.full_name = input.fullName;
    if (input.phone !== undefined) userUpdate.phone = input.phone;

    const { error: uErr } = await supabase
      .from("users")
      .update(userUpdate)
      .eq("user_id", userId);
    if (uErr) throw mapDatabaseError(uErr, "Failed to update account details.");
  }

  const profileFields: Database["public"]["Tables"]["user_profile"]["Update"] = {};
  if (input.address !== undefined) profileFields.address = input.address;
  if (input.cityId !== undefined) profileFields.city_id = input.cityId;
  if (input.areaId !== undefined) profileFields.area_id = input.areaId;
  if (input.pincode !== undefined) profileFields.pincode = input.pincode;
  if (input.about !== undefined) profileFields.about = input.about;
  if (input.gender !== undefined) profileFields.gender = input.gender;
  if (input.dob !== undefined) profileFields.dob = input.dob;
  if (input.profileImage !== undefined) profileFields.profile_image = input.profileImage;

  if (input.preferences !== undefined) {
    const { data: current } = await supabase
      .from("user_profile")
      .select("preferences")
      .eq("user_id", userId)
      .maybeSingle();
    const existingPrefs =
      current?.preferences &&
      typeof current.preferences === "object" &&
      !Array.isArray(current.preferences)
        ? (current.preferences as Record<string, unknown>)
        : {};
    profileFields.preferences = { ...existingPrefs, ...input.preferences } as Json;
  }

  if (Object.keys(profileFields).length > 0) {
    profileFields.updated_at = new Date().toISOString();
    const { data: updated, error: pErr } = await supabase
      .from("user_profile")
      .update(profileFields)
      .eq("user_id", userId)
      .select("profile_id")
      .maybeSingle();

    if (pErr) throw mapDatabaseError(pErr, "Failed to update customer profile.");
    if (!updated) {
      const { error: insErr } = await supabase.from("user_profile").insert({
        user_id: userId,
        ...profileFields,
      });
      if (insErr) throw mapDatabaseError(insErr, "Failed to create customer profile.");
    }
  }

  return getCustomerProfile(supabase, userId);
}

// ── Favorites & Saved Collections ────────────────────────────────────────────
export async function listCustomerFavorites(
  supabase: SupabaseClient<Database>,
  userId: string,
  pagination?: { page?: number; limit?: number; collectionId?: number }
) {
  const { page, limit, from, to } = normalizePagination(pagination);
  let query = supabase
    .from("favorites")
    .select(
      "favorite_id, user_id, venue_id, vendor_id, inspiration_id, blog_id, collection_id, created_at",
      { count: "exact" }
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (pagination?.collectionId) {
    query = query.eq("collection_id", pagination.collectionId);
  }

  const { data, error, count } = await query;
  if (error) throw mapDatabaseError(error, "Failed to list favorites.");

  return {
    items: data ?? [],
    meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0),
  };
}

export async function addCustomerFavorite(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: {
    venueId?: number;
    vendorId?: number;
    inspirationId?: number;
    blogId?: number;
    collectionId?: number;
  }
) {
  if (input.collectionId) {
    const { data: col, error: colErr } = await supabase
      .from("collections")
      .select("collection_id")
      .eq("collection_id", input.collectionId)
      .eq("user_id", userId)
      .maybeSingle();
    if (colErr) throw mapDatabaseError(colErr, "Failed to verify collection ownership.");
    if (!col) {
      throw new AppError("FORBIDDEN", 403, "Target collection does not belong to user.");
    }
  }

  let dupQuery = supabase
    .from("favorites")
    .select("favorite_id, venue_id, vendor_id, inspiration_id, blog_id, collection_id, created_at")
    .eq("user_id", userId);

  if (input.venueId) dupQuery = dupQuery.eq("venue_id", input.venueId);
  if (input.vendorId) dupQuery = dupQuery.eq("vendor_id", input.vendorId);
  if (input.inspirationId) dupQuery = dupQuery.eq("inspiration_id", input.inspirationId);
  if (input.blogId) dupQuery = dupQuery.eq("blog_id", input.blogId);

  const { data: existing, error: dupErr } = await dupQuery.maybeSingle();
  if (dupErr) throw mapDatabaseError(dupErr, "Failed to check existing favorite.");
  if (existing) {
    return { created: false, favorite: existing };
  }

  const { data, error } = await supabase
    .from("favorites")
    .insert({
      user_id: userId,
      venue_id: input.venueId ?? null,
      vendor_id: input.vendorId ?? null,
      inspiration_id: input.inspirationId ?? null,
      blog_id: input.blogId ?? null,
      collection_id: input.collectionId ?? null,
    })
    .select("favorite_id, venue_id, vendor_id, inspiration_id, blog_id, collection_id, created_at")
    .single();

  if (error || !data) throw mapDatabaseError(error, "Failed to save favorite.");
  return { created: true, favorite: data };
}

export async function removeCustomerFavorite(
  supabase: SupabaseClient<Database>,
  userId: string,
  favoriteId: number
) {
  const { data, error } = await supabase
    .from("favorites")
    .delete()
    .eq("favorite_id", favoriteId)
    .eq("user_id", userId)
    .select("favorite_id")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to delete favorite.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Favorite entry not found.");
  return { deleted: true, favoriteId: data.favorite_id };
}

export async function listCustomerCollections(
  supabase: SupabaseClient<Database>,
  userId: string,
  pagination?: { page?: number; limit?: number }
) {
  const { page, limit, from, to } = normalizePagination(pagination);
  const { data, error, count } = await supabase
    .from("collections")
    .select("collection_id, collection_name, description, created_at, updated_at", {
      count: "exact",
    })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) throw mapDatabaseError(error, "Failed to list collections.");
  return {
    items: data ?? [],
    meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0),
  };
}

export async function createCustomerCollection(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: { collectionName: string; description?: string }
) {
  const { data, error } = await supabase
    .from("collections")
    .insert({
      user_id: userId,
      collection_name: input.collectionName,
      description: input.description ?? null,
    })
    .select("collection_id, collection_name, description, created_at, updated_at")
    .single();

  if (error || !data) throw mapDatabaseError(error, "Failed to create collection.");
  return data;
}

export async function updateCustomerCollection(
  supabase: SupabaseClient<Database>,
  userId: string,
  collectionId: number,
  input: { collectionName?: string; description?: string }
) {
  const updatePayload: Database["public"]["Tables"]["collections"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  if (input.collectionName !== undefined) updatePayload.collection_name = input.collectionName;
  if (input.description !== undefined) updatePayload.description = input.description;

  const { data, error } = await supabase
    .from("collections")
    .update(updatePayload)
    .eq("collection_id", collectionId)
    .eq("user_id", userId)
    .select("collection_id, collection_name, description, updated_at")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to update collection.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Collection not found.");
  return data;
}

export async function deleteCustomerCollection(
  supabase: SupabaseClient<Database>,
  userId: string,
  collectionId: number
) {
  const { data, error } = await supabase
    .from("collections")
    .delete()
    .eq("collection_id", collectionId)
    .eq("user_id", userId)
    .select("collection_id")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to delete collection.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Collection not found.");
  return { deleted: true, collectionId: data.collection_id };
}

// ── Recent Searches & Saved Search Filters ───────────────────────────────────
export async function listRecentSearches(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 20
) {
  const safeLimit = Math.min(50, Math.max(1, limit));
  const { data, error } = await supabase
    .from("recent_searches")
    .select("search_id, search_query, search_type, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) throw mapDatabaseError(error, "Failed to fetch recent searches.");
  return data ?? [];
}

export async function recordRecentSearch(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: { searchQuery: string; searchType: string }
) {
  const { data, error } = await supabase
    .from("recent_searches")
    .insert({
      user_id: userId,
      search_query: input.searchQuery,
      search_type: input.searchType,
    })
    .select("search_id, search_query, search_type, created_at")
    .single();

  if (error || !data) throw mapDatabaseError(error, "Failed to save recent search.");
  return data;
}

export async function clearRecentSearches(
  supabase: SupabaseClient<Database>,
  userId: string,
  searchId?: number
) {
  let query = supabase.from("recent_searches").delete().eq("user_id", userId);
  if (searchId) {
    query = query.eq("search_id", searchId);
  }
  const { error } = await query;
  if (error) throw mapDatabaseError(error, "Failed to clear recent searches.");
  return { cleared: true };
}

export async function listSavedFilters(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from("search_filters")
    .select("filter_id, filter_name, filter_data, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw mapDatabaseError(error, "Failed to load saved search filters.");
  return data ?? [];
}

export async function saveSearchFilter(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: { filterName: string; filterData: Record<string, unknown> }
) {
  const { data, error } = await supabase
    .from("search_filters")
    .insert({
      user_id: userId,
      filter_name: input.filterName,
      filter_data: input.filterData as Json,
    })
    .select("filter_id, filter_name, filter_data, created_at, updated_at")
    .single();

  if (error || !data) throw mapDatabaseError(error, "Failed to save search filter.");
  return data;
}

export async function deleteSavedFilter(
  supabase: SupabaseClient<Database>,
  userId: string,
  filterId: number
) {
  const { data, error } = await supabase
    .from("search_filters")
    .delete()
    .eq("filter_id", filterId)
    .eq("user_id", userId)
    .select("filter_id")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to delete saved filter.");
  if (!data) throw new AppError("NOT_FOUND", 404, "Saved filter not found.");
  return { deleted: true, filterId: data.filter_id };
}
