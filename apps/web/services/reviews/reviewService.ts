import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import { buildPaginationMeta, normalizePagination } from "@we-arrange/database/repository";
import type { Database } from "@we-arrange/database/types";

const PUBLIC_REVIEW_COLUMNS =
  "review_id, venue_id, vendor_id, rating, review_text, status, created_at, updated_at";
const PUBLIC_REVIEW_VOTE_COLUMNS = "vote_id, review_id, vote_type, created_at";

export async function listPublicReviews(
  supabase: SupabaseClient<Database>,
  options: { venueId?: number; vendorId?: number; page?: number; limit?: number }
) {
  const { page, limit, from, to } = normalizePagination(options);

  let query = supabase
    .from("reviews")
    // Exclude user_id to honor Migration 01 column-level PII protection
    .select(PUBLIC_REVIEW_COLUMNS, {
      count: "exact",
    })
    .in("status", ["Approved", "Published"])
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.venueId) query = query.eq("venue_id", options.venueId);
  if (options.vendorId) query = query.eq("vendor_id", options.vendorId);

  const { data: reviews, error, count } = await query;
  if (error) throw mapDatabaseError(error, "Failed to load reviews.");

  const reviewIds = (reviews ?? []).map((r) => r.review_id);
  const [imagesRes, votesRes] = await Promise.all([
    reviewIds.length > 0
      ? supabase
          .from("review_images")
          .select("image_id, review_id, image_url, created_at")
          .in("review_id", reviewIds)
      : Promise.resolve({ data: [] }),
    reviewIds.length > 0
      ? supabase
          .from("review_votes")
          .select("review_id, vote_type")
          .in("review_id", reviewIds)
      : Promise.resolve({ data: [] }),
  ]);

  const imagesByReview = new Map<number, string[]>();
  for (const img of imagesRes.data ?? []) {
    const arr = imagesByReview.get(img.review_id) ?? [];
    arr.push(img.image_url);
    imagesByReview.set(img.review_id, arr);
  }

  const votesByReview = new Map<number, { helpful: number; unhelpful: number }>();
  for (const v of votesRes.data ?? []) {
    const bucket = votesByReview.get(v.review_id) ?? { helpful: 0, unhelpful: 0 };
    if (v.vote_type === "helpful") bucket.helpful += 1;
    if (v.vote_type === "unhelpful") bucket.unhelpful += 1;
    votesByReview.set(v.review_id, bucket);
  }

  return {
    items: (reviews ?? []).map((r) => ({
      ...r,
      images: imagesByReview.get(r.review_id) ?? [],
      votes: votesByReview.get(r.review_id) ?? { helpful: 0, unhelpful: 0 },
    })),
    meta: buildPaginationMeta(page, limit, count ?? reviews?.length ?? 0),
  };
}

export async function createReview(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: {
    venueId?: number;
    vendorId?: number;
    rating: number;
    reviewText: string;
    imageUrls: string[];
  }
) {
  const { data: review, error } = await supabase
    .from("reviews")
    .insert({
      user_id: userId,
      venue_id: input.venueId ?? null,
      vendor_id: input.vendorId ?? null,
      rating: input.rating,
      review_text: input.reviewText,
      status: "Pending",
    })
    .select(PUBLIC_REVIEW_COLUMNS)
    .single();

  if (error || !review) throw mapDatabaseError(error, "Failed to submit review.");

  if (input.imageUrls.length > 0) {
    const { error: imgErr } = await supabase.from("review_images").insert(
      input.imageUrls.map((url) => ({
        review_id: review.review_id,
        image_url: url,
      }))
    );
    if (imgErr) throw mapDatabaseError(imgErr, "Failed to attach review images.");
  }

  return review;
}

export async function updateOwnReview(
  supabase: SupabaseClient<Database>,
  userId: string,
  reviewId: number,
  input: { rating?: number; reviewText?: string }
) {
  if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Authentication required.");

  const { data: existing, error: selectErr } = await supabase
    .from("reviews")
    .select("review_id, status")
    .eq("review_id", reviewId)
    .maybeSingle();

  if (selectErr) throw mapDatabaseError(selectErr, "Failed to load review.");
  if (!existing) throw new AppError("NOT_FOUND", 404, "Review not found.");
  if (existing.status !== "Pending") {
    throw new AppError("FORBIDDEN", 403, "Only your own pending reviews can be edited.");
  }

  const updateData: Database["public"]["Tables"]["reviews"]["Update"] = {
    updated_at: new Date().toISOString(),
  };
  if (input.rating !== undefined) updateData.rating = input.rating;
  if (input.reviewText !== undefined) updateData.review_text = input.reviewText;

  // Defense-in-depth: enforce user_id alongside RLS private.is_review_owner(review_id)
  let updateQuery = supabase
    .from("reviews")
    .update(updateData)
    .eq("review_id", reviewId)
    .eq("status", "Pending");

  if (userId) {
    updateQuery = updateQuery.eq("user_id", userId);
  }

  const { data, error } = await updateQuery
    .select(PUBLIC_REVIEW_COLUMNS)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to update review.");
  if (!data) throw new AppError("FORBIDDEN", 403, "Cannot edit another user's review.");
  return data;
}

export async function deleteOwnReview(
  supabase: SupabaseClient<Database>,
  userId: string,
  reviewId: number,
  isAdmin = false,
  ratingClient?: SupabaseClient<Database>
) {
  if (!isAdmin && !userId) {
    throw new AppError("UNAUTHENTICATED", 401, "Authentication required.");
  }

  const { data: existing, error: selectErr } = await supabase
    .from("reviews")
    .select("review_id, venue_id, vendor_id")
    .eq("review_id", reviewId)
    .maybeSingle();

  if (selectErr) throw mapDatabaseError(selectErr, "Failed to load review.");
  if (!existing) throw new AppError("NOT_FOUND", 404, "Review not found.");

  // Defense-in-depth: enforce user_id on non-admin alongside RLS private.is_review_owner(review_id)
  let deleteQuery = supabase.from("reviews").delete().eq("review_id", reviewId);
  if (!isAdmin && userId) {
    deleteQuery = deleteQuery.eq("user_id", userId);
  }
  const { data: deleted, error } = await deleteQuery
    .select("review_id")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to delete review.");
  if (!deleted) {
    throw new AppError("FORBIDDEN", 403, "Cannot delete another user's review.");
  }

  if (ratingClient) {
    await recalculateTargetRating(ratingClient, {
      venueId: existing.venue_id,
      vendorId: existing.vendor_id,
    });
  }

  return { deleted: true, reviewId };
}

export async function voteOnReview(
  supabase: SupabaseClient<Database>,
  userId: string,
  reviewId: number,
  voteType: "helpful" | "unhelpful"
) {
  if (!userId) throw new AppError("UNAUTHENTICATED", 401, "Authentication required.");

  const { data: review, error: reviewErr } = await supabase
    .from("reviews")
    .select("review_id, status")
    .eq("review_id", reviewId)
    .maybeSingle();

  if (reviewErr) throw mapDatabaseError(reviewErr, "Failed to load review.");
  if (!review || !["Approved", "Published"].includes(review.status ?? "")) {
    throw new AppError("NOT_FOUND", 404, "Approved review not found.");
  }

  const { data: existing, error: voteErr } = await supabase
    .from("review_votes")
    .select("vote_id, vote_type")
    .eq("review_id", reviewId)
    .eq("user_id", userId)
    .maybeSingle();
  if (voteErr) throw mapDatabaseError(voteErr, "Failed to check existing vote.");

  if (existing) {
    if (existing.vote_type === voteType) {
      const { error: delErr } = await supabase
        .from("review_votes")
        .delete()
        .eq("vote_id", existing.vote_id)
        .eq("user_id", userId);
      if (delErr) throw mapDatabaseError(delErr, "Failed to remove vote.");
      return { action: "removed", voteType };
    }
    const { data, error } = await supabase
      .from("review_votes")
      .update({ vote_type: voteType })
      .eq("vote_id", existing.vote_id)
      .eq("user_id", userId)
      .select(PUBLIC_REVIEW_VOTE_COLUMNS)
      .single();
    if (error || !data) throw mapDatabaseError(error, "Failed to update vote.");
    return { action: "updated", vote: data };
  }

  const { data, error } = await supabase
    .from("review_votes")
    .insert({ review_id: reviewId, user_id: userId, vote_type: voteType })
    .select(PUBLIC_REVIEW_VOTE_COLUMNS)
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to record vote.");
  return { action: "added", vote: data };
}

export async function recalculateTargetRating(
  adminClient: SupabaseClient<Database>,
  target: { venueId?: number | null; vendorId?: number | null }
) {
  if (target.venueId) {
    const { data } = await adminClient
      .from("reviews")
      .select("rating")
      .eq("venue_id", target.venueId)
      .in("status", ["Approved", "Published"]);

    const count = data?.length ?? 0;
    const avg =
      count > 0
        ? Math.round(
            ((data ?? []).reduce((s, r) => s + Number(r.rating), 0) / count) * 100
          ) / 100
        : 0;
    await adminClient
      .from("venues")
      .update({ rating: avg, reviews_count: count })
      .eq("venue_id", target.venueId);
  }

  if (target.vendorId) {
    const { data } = await adminClient
      .from("reviews")
      .select("rating")
      .eq("vendor_id", target.vendorId)
      .in("status", ["Approved", "Published"]);

    const count = data?.length ?? 0;
    const avg =
      count > 0
        ? Math.round(
            ((data ?? []).reduce((s, r) => s + Number(r.rating), 0) / count) * 100
          ) / 100
        : 0;
    await adminClient.from("vendors").update({ rating: avg }).eq("vendor_id", target.vendorId);
  }
}

export async function moderateReview(
  adminClient: SupabaseClient<Database>,
  reviewId: number,
  moderatorId: string,
  input: { status: "Approved" | "Rejected" | "Published" | "Inactive"; remarks?: string }
) {
  const { data: review, error } = await adminClient
    .from("reviews")
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("review_id", reviewId)
    .select(PUBLIC_REVIEW_COLUMNS)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to moderate review.");
  if (!review) throw new AppError("NOT_FOUND", 404, "Review not found.");

  await recalculateTargetRating(adminClient, {
    venueId: review.venue_id,
    vendorId: review.vendor_id,
  });

  await adminClient.from("moderation_logs").insert({
    moderator_id: moderatorId,
    action: `review:${input.status}`,
    remarks: input.remarks ?? `Review #${reviewId} marked ${input.status}`,
  });

  return review;
}

export async function listReportReasons(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("report_reasons")
    .select("*")
    .eq("status", "Active")
    .order("reason_id", { ascending: true });
  if (error) throw mapDatabaseError(error, "Failed to load report reasons.");
  return data ?? [];
}

export async function submitReport(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: {
    reasonId?: number;
    reportedUserId?: string;
    venueId?: number;
    vendorId?: number;
    reviewId?: number;
    blogId?: number;
    description: string;
  }
) {
  const { data, error } = await supabase
    .from("reports")
    .insert({
      reporter_id: userId,
      reason_id: input.reasonId ?? null,
      reported_user_id: input.reportedUserId ?? null,
      venue_id: input.venueId ?? null,
      vendor_id: input.vendorId ?? null,
      review_id: input.reviewId ?? null,
      blog_id: input.blogId ?? null,
      description: input.description,
      status: "pending",
    })
    .select("*")
    .single();

  if (error || !data) throw mapDatabaseError(error, "Failed to submit report.");
  return data;
}

export async function listReports(
  client: SupabaseClient<Database>,
  options: { reporterId?: string; status?: "active" | "inactive" | "pending"; page?: number; limit?: number }
) {
  const { page, limit, from, to } = normalizePagination(options);
  let query = client
    .from("reports")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.reporterId) query = query.eq("reporter_id", options.reporterId);
  if (options.status) query = query.eq("status", options.status);

  const { data, error, count } = await query;
  if (error) throw mapDatabaseError(error, "Failed to list reports.");
  return {
    items: data ?? [],
    meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0),
  };
}

export async function resolveReport(
  adminClient: SupabaseClient<Database>,
  reportId: number,
  moderatorId: string,
  input: { status: "active" | "inactive" | "pending"; action: string; remarks?: string }
) {
  const { data: report, error } = await adminClient
    .from("reports")
    .update({ status: input.status, updated_at: new Date().toISOString() })
    .eq("report_id", reportId)
    .select("*")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to update report.");
  if (!report) throw new AppError("NOT_FOUND", 404, "Report not found.");

  await adminClient.from("moderation_logs").insert({
    report_id: reportId,
    moderator_id: moderatorId,
    action: input.action,
    remarks: input.remarks ?? null,
  });

  return report;
}
