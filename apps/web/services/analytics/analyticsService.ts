import type { SupabaseClient } from "@supabase/supabase-js";
import { mapDatabaseError } from "@we-arrange/database/errors";
import type { Database } from "@we-arrange/database/types";

export async function getCustomerAnalytics(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const [favRes, enqRes, bookRes, payRes] = await Promise.all([
    supabase
      .from("favorites")
      .select("favorite_id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("enquiries")
      .select("enquiry_id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("bookings")
      .select("booking_id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("payments")
      .select("amount, payment_status")
      .eq("user_id", userId),
  ]);

  if (favRes.error) throw mapDatabaseError(favRes.error, "Failed to aggregate favorites.");

  const paidInr = (payRes.data ?? [])
    .filter((p) => p.payment_status === "Paid")
    .reduce((sum, p) => sum + Number(p.amount || 0), 0);

  return {
    favoritesCount: favRes.count ?? 0,
    enquiriesCount: enqRes.count ?? 0,
    bookingsCount: bookRes.count ?? 0,
    totalPaidInr: Math.round(paidInr * 100) / 100,
    currency: "INR",
  };
}

export async function getVendorAnalytics(
  adminClient: SupabaseClient<Database>,
  vendorId: number
) {
  const [enqRes, bookRes, revRes] = await Promise.all([
    adminClient
      .from("enquiries")
      .select("enquiry_id", { count: "exact", head: true })
      .eq("vendor_id", vendorId),
    adminClient
      .from("bookings")
      .select("booking_id, total_amount")
      .eq("vendor_id", vendorId),
    adminClient
      .from("reviews")
      .select("rating")
      .eq("vendor_id", vendorId)
      .in("status", ["Approved", "Published"]),
  ]);

  if (enqRes.error) throw mapDatabaseError(enqRes.error, "Failed to aggregate vendor metrics.");

  const bookings = bookRes.data ?? [];
  const bookingValueInr = bookings.reduce((s, b) => s + Number(b.total_amount || 0), 0);
  const reviews = revRes.data ?? [];
  const avgRating =
    reviews.length > 0
      ? Math.round((reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length) * 100) /
        100
      : 0;

  return {
    vendorId,
    enquiriesCount: enqRes.count ?? 0,
    bookingsCount: bookings.length,
    totalBookingValueInr: Math.round(bookingValueInr * 100) / 100,
    approvedReviewsCount: reviews.length,
    averageRating: avgRating,
    currency: "INR",
  };
}

export async function getConciergeAnalytics(
  adminClient: SupabaseClient<Database>,
  specialistUserId: string
) {
  const [assignedRes, pendingRes, siteVisitsRes, quotesRes, bookingsRes] = await Promise.all([
    adminClient
      .from("enquiries")
      .select("enquiry_id", { count: "exact", head: true })
      .eq("assigned_specialist_id", specialistUserId),
    adminClient
      .from("enquiries")
      .select("enquiry_id", { count: "exact", head: true })
      .eq("status", "Pending"),
    adminClient
      .from("enquiries")
      .select("enquiry_id", { count: "exact", head: true })
      .in("site_visit_status", ["Requested", "Scheduled"]),
    adminClient
      .from("quotes")
      .select("quote_id, status")
      .eq("collected_by", specialistUserId),
    adminClient.from("bookings").select("booking_id", { count: "exact", head: true }),
  ]);

  if (assignedRes.error) {
    throw mapDatabaseError(assignedRes.error, "Failed to compute concierge analytics.");
  }

  const quotes = quotesRes.data ?? [];
  const approvedQuotes = quotes.filter((q) => q.status === "Approved").length;

  return {
    assignedEnquiriesCount: assignedRes.count ?? 0,
    unassignedOrPendingCount: pendingRes.count ?? 0,
    scheduledSiteVisitsCount: siteVisitsRes.count ?? 0,
    quotesCollectedCount: quotes.length,
    quotesApprovedCount: approvedQuotes,
    platformBookingsCount: bookingsRes.count ?? 0,
  };
}

export async function getAdminAnalytics(adminClient: SupabaseClient<Database>) {
  const [
    usersRes,
    venuesRes,
    vendorsRes,
    enquiriesRes,
    bookingsRes,
    reportsRes,
    paymentsRes,
    refundsRes,
  ] = await Promise.all([
    adminClient.from("users").select("user_id", { count: "exact", head: true }),
    adminClient
      .from("venues")
      .select("venue_id", { count: "exact", head: true })
      .eq("status", "Active"),
    adminClient
      .from("vendors")
      .select("vendor_id", { count: "exact", head: true })
      .eq("status", "Active"),
    adminClient.from("enquiries").select("enquiry_id", { count: "exact", head: true }),
    adminClient.from("bookings").select("booking_id", { count: "exact", head: true }),
    adminClient
      .from("reports")
      .select("report_id", { count: "exact", head: true })
      .eq("status", "pending"),
    adminClient.from("payments").select("amount").eq("payment_status", "Paid"),
    adminClient.from("refunds").select("amount").eq("refund_status", "Paid"),
  ]);

  if (usersRes.error) throw mapDatabaseError(usersRes.error, "Failed to load admin analytics.");

  const capturedRevenueInr = (paymentsRes.data ?? []).reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );
  const refundedInr = (refundsRes.data ?? []).reduce(
    (sum, r) => sum + Number(r.amount || 0),
    0
  );

  return {
    totalUsers: usersRes.count ?? 0,
    activeVenues: venuesRes.count ?? 0,
    activeVendors: vendorsRes.count ?? 0,
    totalEnquiries: enquiriesRes.count ?? 0,
    totalBookings: bookingsRes.count ?? 0,
    pendingReports: reportsRes.count ?? 0,
    capturedRevenueInr: Math.round(capturedRevenueInr * 100) / 100,
    refundedInr: Math.round(refundedInr * 100) / 100,
    currency: "INR",
  };
}

