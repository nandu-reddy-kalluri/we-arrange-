import crypto from "node:crypto";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppError } from "@we-arrange/database/errors";
import {
  createReview,
  deleteOwnReview,
  listPublicReviews,
  moderateReview,
  resolveReport,
  updateOwnReview,
  voteOnReview,
} from "@/services/reviews/reviewService";
import {
  assignOrUpdateAdmin,
  updateUserRoleAndStatus,
  upsertAppSetting,
} from "@/services/admin/adminPortalService";
import {
  createBlogComment,
  getOwnedInvite,
  getPublicInviteBySlug,
  listPublicCmsResource,
  submitPublicInviteRsvp,
  toggleBlogLike,
} from "@/services/cms/cmsService";
import {
  dispatchChannelNotification,
  sendConversationMessage,
} from "@/services/notifications/notificationService";
import {
  getAdminAnalytics,
  getCustomerAnalytics,
  getVendorAnalytics,
} from "@/services/analytics/analyticsService";
import { createMockSupabaseClient } from "./helpers/mockSupabase";

const authMock = vi.hoisted(() => ({
  requireActiveAdmin: vi.fn(),
}));

const dbClientsMock = vi.hoisted(() => ({
  createServiceRoleClient: vi.fn(),
}));

vi.mock("@/services/auth", () => authMock);
vi.mock("@we-arrange/database/clients", () => dbClientsMock);

import { GET as adminMeGet } from "@/app/api/admin/me/route";
import { GET as adminAnalyticsGet } from "@/app/api/analytics/admin/route";
import { POST as notifWebhookPost } from "@/app/api/webhooks/notifications/route";

describe("Reviews, Admin, CMS/Invites, Notifications & Analytics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reviews enforce Pending creation, omit public user_id, toggle votes & recalculate venue rating", async () => {
    let selectedReviewCols: string | undefined;
    let updatedVenue: Record<string, unknown> | null = null;
    let modLogInserted: Record<string, unknown> | null = null;

    const client = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "reviews" && op === "select") {
          selectedReviewCols = state.columns;
          return {
            data: [
              { review_id: 1, venue_id: 10, rating: 5, status: "Approved" },
              { review_id: 2, venue_id: 10, rating: 4, status: "Approved" },
            ],
            error: null,
            count: 2,
          };
        }
        if (table === "reviews" && op === "insert") {
          return { data: { review_id: 3, ...(state.payload as object) }, error: null };
        }
        if (table === "reviews" && op === "update") {
          return {
            data: { review_id: 3, venue_id: 10, vendor_id: null, status: "Approved" },
            error: null,
          };
        }
        if (table === "venues" && op === "update") {
          updatedVenue = state.payload as Record<string, unknown>;
          return { data: updatedVenue, error: null };
        }
        if (table === "moderation_logs" && op === "insert") {
          modLogInserted = state.payload as Record<string, unknown>;
          return { data: modLogInserted, error: null };
        }
        if (table === "review_votes" && op === "select") {
          return { data: [{ vote_id: 9, review_id: 1, vote_type: "helpful" }], error: null };
        }
        if (table === "review_votes" && op === "delete") {
          return { data: null, error: null };
        }
        if (table === "reports" && op === "update") {
          return { data: { report_id: 4, status: "inactive" }, error: null };
        }
        return { data: [], error: null };
      },
    });

    await listPublicReviews(client, { venueId: 10 });
    expect(selectedReviewCols).not.toContain("user_id");

    const created = await createReview(client, "u-1", {
      venueId: 10,
      rating: 5,
      reviewText: "Lovely heritage courtyard and attentive staff!",
      imageUrls: [],
    });
    expect(created.status).toBe("Pending");

    const voteRes = await voteOnReview(client, "u-1", 1, "helpful");
    expect(voteRes.action).toBe("removed");

    await moderateReview(client, 3, "admin-1", { status: "Approved", remarks: "Verified guest" });
    expect(updatedVenue).toMatchObject({ rating: 4.5, reviews_count: 2 });
    expect(modLogInserted).toMatchObject({ action: "review:Approved", moderator_id: "admin-1" });

    const resolved = await resolveReport(client, 4, "admin-1", {
      status: "inactive",
      action: "dismissed",
      remarks: "No violation",
    });
    expect(resolved.status).toBe("inactive");

    let reviewUpdateCols: string | undefined;
    let currentReviewStatus = "Pending";
    let allowDelete = false;
    const ownershipClient = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "reviews" && op === "select") {
          reviewUpdateCols = state.columns;
          return {
            data: { review_id: 3, venue_id: 10, vendor_id: null, status: currentReviewStatus },
            error: null,
          };
        }
        if (table === "reviews" && op === "update") {
          return {
            data: { review_id: 3, rating: 4, status: "Pending" },
            error: null,
          };
        }
        if (table === "reviews" && op === "delete") {
          return { data: allowDelete ? { review_id: 3 } : null, error: null };
        }
        return { data: [], error: null };
      },
    });

    const edited = await updateOwnReview(ownershipClient, "u-1", 3, { rating: 4 });
    expect(edited.status).toBe("Pending");
    expect(reviewUpdateCols).not.toContain("user_id");

    currentReviewStatus = "Approved";
    await expect(updateOwnReview(ownershipClient, "u-1", 3, { rating: 2 })).rejects.toMatchObject({
      status: 403,
    });

    await expect(deleteOwnReview(ownershipClient, "u-other", 3, false)).rejects.toMatchObject({
      status: 403,
    });
    allowDelete = true;
    expect(await deleteOwnReview(ownershipClient, "u-1", 3, false)).toEqual({
      deleted: true,
      reviewId: 3,
    });
  });

  it("admin services prevent self-lockout and admin routes enforce 403 for non-admins", async () => {
    authMock.requireActiveAdmin.mockRejectedValue(
      new AppError("FORBIDDEN", 403, "Admin role required.")
    );

    const resMe = await adminMeGet();
    expect(resMe.status).toBe(403);

    const resAnalytics = await adminAnalyticsGet();
    expect(resAnalytics.status).toBe(403);

    const client = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "roles") return { data: { role_id: 2, role_name: "concierge" }, error: null };
        if (table === "users" && op === "select") {
          return { data: { user_id: "u-target" }, error: null };
        }
        if (table === "users" && op === "update") {
          return { data: { user_id: "u-target", ...(state.payload as object) }, error: null };
        }
        if (table === "app_settings" && op === "select") return { data: null, error: null };
        if (table === "app_settings" && op === "insert") {
          return { data: { setting_id: 1, ...(state.payload as object) }, error: null };
        }
        return { data: [], error: null };
      },
    });

    await expect(
      updateUserRoleAndStatus(client, "admin-1", "admin-1", { status: "Inactive" })
    ).rejects.toMatchObject({ status: 422 });

    await expect(
      assignOrUpdateAdmin(client, "admin-1", {
        userId: "admin-1",
        adminName: "Self",
        status: "inactive",
      })
    ).rejects.toMatchObject({ status: 422 });

    const updatedUser = await updateUserRoleAndStatus(client, "admin-1", "u-target", {
      roleName: "concierge",
      status: "Active",
    });
    expect(updatedUser.role_id).toBe(2);

    const setting = await upsertAppSetting(client, {
      settingKey: "currency_default",
      settingValue: "INR",
      dataType: "text",
    });
    expect(setting.setting_key).toBe("currency_default");
  });

  it("CMS omits private author columns and E-Invites protect owner access while recording public RSVP", async () => {
    let selectedBlogCols: string | undefined;
    let rsvpInserted: Record<string, unknown> | null = null as Record<string, unknown> | null;

    const client = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "blogs" && op === "select") {
          selectedBlogCols = state.columns;
          return { data: [], error: null, count: 0 };
        }
        if (table === "invites" && op === "select") {
          return {
            data: {
              invite_id: 15,
              user_id: "owner-1",
              slug: "ananya-rohit",
              status: "Published",
            },
            error: null,
          };
        }
        if (table === "invite_media") return { data: [], error: null };
        if (table === "invite_guests" && op === "select") {
          return { data: { guest_id: 99, invite_id: 15 }, error: null };
        }
        if (table === "invite_guests" && op === "update") {
          return { data: { guest_id: 99, invitation_status: "Attending" }, error: null };
        }
        if (table === "invite_rsvp" && op === "insert") {
          rsvpInserted = state.payload as Record<string, unknown>;
          return {
            data: { rsvp_id: 500, response: "Attending", guest_count: 2, responded_at: "now" },
            error: null,
          };
        }
        return { data: [], error: null };
      },
    });

    await listPublicCmsResource(client, "blogs", {});
    expect(selectedBlogCols).not.toContain("author_id");

    await expect(getOwnedInvite(client, "stranger-2", 15)).rejects.toMatchObject({ status: 403 });

    const pub = await getPublicInviteBySlug(client, "ananya-rohit");
    expect(pub.invite.slug).toBe("ananya-rohit");

    const rsvp = await submitPublicInviteRsvp(client, "ananya-rohit", {
      guestId: 99,
      response: "Attending",
      guestCount: 2,
      message: "Excited to attend!",
    });
    expect(rsvp.response).toBe("Attending");
    expect(rsvpInserted?.guest_id).toBe(99);

    let blogPublished = false;
    let blogLiked = false;
    const blogClient = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "blogs" && op === "select") {
          return { data: blogPublished ? { blog_id: 7 } : null, error: null };
        }
        if (table === "blog_comments" && op === "insert") {
          return { data: { comment_id: 1, ...(state.payload as object) }, error: null };
        }
        if (table === "blog_likes" && op === "select") {
          return { data: blogLiked ? { like_id: 12 } : null, error: null };
        }
        if (table === "blog_likes" && op === "insert") {
          blogLiked = true;
          return { data: { like_id: 12 }, error: null };
        }
        if (table === "blog_likes" && op === "delete") {
          blogLiked = false;
          return { data: null, error: null };
        }
        return { data: [], error: null };
      },
    });

    await expect(toggleBlogLike(blogClient, 7, "u-1")).rejects.toMatchObject({ status: 404 });
    blogPublished = true;
    expect(await toggleBlogLike(blogClient, 7, "u-1")).toEqual({ liked: true });
    expect(await toggleBlogLike(blogClient, 7, "u-1")).toEqual({ liked: false });
    const comment = await createBlogComment(blogClient, 7, "u-1", "Great checklist!");
    expect(comment.status).toBe("Pending");
  });

  it("notifications handle unconfigured channels honestly, guard conversation IDOR, and verify webhooks", async () => {
    const client = createMockSupabaseClient({
      onQuery: (table, op, state) => {
        if (table === "notifications" && op === "insert") {
          return { data: { notification_id: 11, ...(state.payload as object) }, error: null };
        }
        if (table === "notification_logs" && op === "insert") {
          return { data: { log_id: 22, ...(state.payload as object) }, error: null };
        }
        if (table === "conversations" && op === "select") {
          return {
            data: { conversation_id: 8, user_id: "cust-owner", vendor_id: 3 },
            error: null,
          };
        }
        return { data: [], error: null };
      },
    });

    const dispatched = await dispatchChannelNotification(client, {
      userId: "cust-owner",
      title: "Quote Ready",
      message: "Your concierge shared a quote.",
      channel: "email",
      recipientAddress: "bride@example.com",
    });
    expect(dispatched.deliveryStatus).toBe("queued_unconfigured");

    await expect(
      sendConversationMessage(
        client,
        8,
        { userId: "other-cust", isStaff: false, vendorId: null },
        { message: "Hello?", messageType: "text" }
      )
    ).rejects.toMatchObject({ status: 403 });

    const body = JSON.stringify({
      notificationId: 11,
      channel: "email",
      deliveryStatus: "delivered",
    });
    const oldSecret = process.env.NOTIFICATION_WEBHOOK_SECRET;
    delete process.env.NOTIFICATION_WEBHOOK_SECRET;

    const r503 = await notifWebhookPost(
      new NextRequest("http://localhost/api/webhooks/notifications", { method: "POST", body })
    );
    expect(r503.status).toBe(503);

    process.env.NOTIFICATION_WEBHOOK_SECRET = "notif_wh_secret";
    dbClientsMock.createServiceRoleClient.mockReturnValue(client);
    const sig = crypto
      .createHmac("sha256", "notif_wh_secret")
      .update(body)
      .digest("hex");

    const r200 = await notifWebhookPost(
      new NextRequest("http://localhost/api/webhooks/notifications", {
        method: "POST",
        headers: { "x-ymwa-signature": sig },
        body,
      })
    );
    expect(r200.status).toBe(200);

    if (oldSecret !== undefined) process.env.NOTIFICATION_WEBHOOK_SECRET = oldSecret;
    else delete process.env.NOTIFICATION_WEBHOOK_SECRET;
  });

  it("role-scoped analytics aggregate safely without PII exposure", async () => {
    const client = createMockSupabaseClient({
      onQuery: (table) => {
        if (table === "favorites") return { data: null, error: null, count: 4 };
        if (table === "enquiries") return { data: null, error: null, count: 2 };
        if (table === "bookings") {
          return { data: [{ booking_id: 1, total_amount: 500000 }], error: null, count: 1 };
        }
        if (table === "payments") {
          return {
            data: [
              { amount: 100000, payment_status: "Paid" },
              { amount: 50000, payment_status: "Pending" },
            ],
            error: null,
          };
        }
        if (table === "reviews") return { data: [{ rating: 5 }, { rating: 4 }], error: null };
        if (table === "refunds") return { data: [{ amount: 10000 }], error: null };
        return { data: null, error: null, count: 7 };
      },
    });

    const cust = await getCustomerAnalytics(client, "u-1");
    expect(cust).toMatchObject({ favoritesCount: 4, enquiriesCount: 2, totalPaidInr: 100000 });

    const vendor = await getVendorAnalytics(client, 3);
    expect(vendor).toMatchObject({
      vendorId: 3,
      totalBookingValueInr: 500000,
      approvedReviewsCount: 2,
      averageRating: 4.5,
    });

    const admin = await getAdminAnalytics(client);
    expect(admin).toMatchObject({
      totalUsers: 7,
      capturedRevenueInr: 150000,
      refundedInr: 10000,
      currency: "INR",
    });
  });
});
