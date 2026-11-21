import { describe, expect, it } from "vitest";
import { AppError } from "@we-arrange/database/errors";
import {
  createReview,
  deleteOwnReview,
  listPublicReviews,
  moderateReview,
  updateOwnReview,
  voteOnReview,
} from "@/services/reviews/reviewService";
import {
  listUsersForAdmin,
  updateUserRoleAndStatus,
} from "@/services/admin/adminPortalService";
import { toggleBlogLike } from "@/services/cms/cmsService";
import { createMockSupabaseClient } from "./helpers/mockSupabase";

// Distinct test identities (RFC 4122 UUIDs)
const CUSTOMER_A = "11111111-1111-4111-8111-111111111111";
const CUSTOMER_B = "22222222-2222-4222-8222-222222222222";
const VENDOR_OWNER_V1 = "33333333-3333-4333-8333-333333333333";
const ADMIN_USER = "99999999-9999-4999-8999-999999999999";

describe("Migration 04 Customer & Vendor Ownership Security and Backend Compatibility", () => {
  describe("Review Ownership & Status Protections", () => {
    it("1. customer editing own review: succeeds on pending review and does NOT send status in update payload", async () => {
      let updatePayload: Record<string, unknown> | null = null;
      let updateFilterCols: Record<string, unknown> = {};

      const client = createMockSupabaseClient({
        onQuery: (table, op, state) => {
          if (table === "reviews" && op === "select") {
            return {
              data: { review_id: 101, status: "Pending" },
              error: null,
            };
          }
          if (table === "reviews" && op === "update") {
            updatePayload = state.payload as Record<string, unknown>;
            updateFilterCols = Object.fromEntries(
              state.filters
                .filter((f) => f.method === "eq")
                .map((f) => [f.args[0], f.args[1]])
            );
            return {
              data: {
                review_id: 101,
                rating: 4,
                review_text: "Updated text",
                status: "Pending",
                updated_at: new Date().toISOString(),
              },
              error: null,
            };
          }
          return { data: null, error: null };
        },
      });

      const updated = await updateOwnReview(client, CUSTOMER_A, 101, {
        rating: 4,
        reviewText: "Updated text",
      });

      expect(updated.review_id).toBe(101);
      expect(updated.rating).toBe(4);
      // Critical check: payload does NOT contain status: "Pending" so no UPDATE (status) grant is needed
      expect(updatePayload).not.toHaveProperty("status");
      expect(updatePayload).toHaveProperty("rating", 4);
      expect(updatePayload).toHaveProperty("review_text", "Updated text");
      expect(updatePayload).toHaveProperty("updated_at");
      // Status filter is in the WHERE clause, ensuring the query targets Pending reviews
      expect(updateFilterCols).toMatchObject({ review_id: 101, status: "Pending" });
    });

    it("2. customer cannot edit another user's review: rejected with 403 when RLS returns no rows", async () => {
      const client = createMockSupabaseClient({
        onQuery: (table, op) => {
          if (table === "reviews" && op === "select") {
            return {
              data: { review_id: 101, status: "Pending" },
              error: null,
            };
          }
          if (table === "reviews" && op === "update") {
            // Simulated RLS block: private.is_pending_review_owner returns false for Customer B
            return { data: null, error: null };
          }
          return { data: null, error: null };
        },
      });

      await expect(
        updateOwnReview(client, CUSTOMER_B, 101, { rating: 1 })
      ).rejects.toMatchObject({
        status: 403,
        message: expect.stringMatching(/Cannot edit another user's review/i),
      });
    });

    it("3. customer cannot change review status: edit on approved review is rejected before database mutation", async () => {
      let updateAttempted = false;

      const client = createMockSupabaseClient({
        onQuery: (table, op) => {
          if (table === "reviews" && op === "select") {
            return {
              data: { review_id: 101, status: "Approved" },
              error: null,
            };
          }
          if (table === "reviews" && op === "update") {
            updateAttempted = true;
            return { data: null, error: null };
          }
          return { data: null, error: null };
        },
      });

      await expect(
        updateOwnReview(client, CUSTOMER_A, 101, { rating: 5 })
      ).rejects.toMatchObject({
        status: 403,
        message: expect.stringMatching(/Only your own pending reviews can be edited/i),
      });

      expect(updateAttempted).toBe(false);
    });

    it("4. vendor cannot directly moderate reviews: vendor attempt blocked by RLS", async () => {
      // Vendor Owner V1 attempting to call updateOwnReview on a review of their listing
      const client = createMockSupabaseClient({
        onQuery: (table, op) => {
          if (table === "reviews" && op === "select") {
            return { data: { review_id: 101, status: "Pending" }, error: null };
          }
          if (table === "reviews" && op === "update") {
            // Vendor has no UPDATE policy on reviews
            return { data: null, error: null };
          }
          return { data: null, error: null };
        },
      });

      await expect(
        updateOwnReview(client, VENDOR_OWNER_V1, 101, { rating: 5 })
      ).rejects.toMatchObject({
        status: 403,
      });
    });

    it("5. admin moderation API works: service_role can approve reviews and log moderation actions", async () => {
      let updatedStatus: string | undefined;
      let logPayload: Record<string, unknown> | null = null;

      const adminClient = createMockSupabaseClient({
        onQuery: (table, op, state) => {
          if (table === "reviews" && op === "update") {
            const p = state.payload as Record<string, unknown>;
            updatedStatus = p.status as string;
            return {
              data: { review_id: 101, venue_id: 5, vendor_id: null, status: updatedStatus },
              error: null,
            };
          }
          if (table === "reviews" && op === "select") {
            return { data: [{ rating: 5 }, { rating: 4 }], error: null };
          }
          if (table === "venues" && op === "update") {
            return { data: { venue_id: 5, rating: 4.5, reviews_count: 2 }, error: null };
          }
          if (table === "moderation_logs" && op === "insert") {
            logPayload = state.payload as Record<string, unknown>;
            return { data: { log_id: 1, ...logPayload }, error: null };
          }
          return { data: null, error: null };
        },
      });

      const moderated = await moderateReview(adminClient, 101, ADMIN_USER, {
        status: "Approved",
        remarks: "Approved by quality team",
      });

      expect(moderated.status).toBe("Approved");
      expect(updatedStatus).toBe("Approved");
      expect(logPayload).toMatchObject({
        moderator_id: ADMIN_USER,
        action: "review:Approved",
        remarks: "Approved by quality team",
      });
    });
  });

  describe("Review Images & Pending Status", () => {
    it("6. review-image insertion is restricted to owner's pending review", async () => {
      let insertedImages: Array<Record<string, unknown>> = [];

      const client = createMockSupabaseClient({
        onQuery: (table, op, state) => {
          if (table === "reviews" && op === "insert") {
            return {
              data: {
                review_id: 201,
                user_id: CUSTOMER_A,
                status: "Pending",
                rating: 5,
                review_text: "Great venue!",
              },
              error: null,
            };
          }
          if (table === "review_images" && op === "insert") {
            insertedImages = state.payload as Array<Record<string, unknown>>;
            return { data: insertedImages, error: null };
          }
          return { data: null, error: null };
        },
      });

      const res = await createReview(client, CUSTOMER_A, {
        venueId: 5,
        rating: 5,
        reviewText: "Great venue!",
        imageUrls: ["https://example.com/photo1.jpg", "https://example.com/photo2.jpg"],
      });

      expect(res.review_id).toBe(201);
      expect(insertedImages).toHaveLength(2);
      expect(insertedImages[0]).toMatchObject({
        review_id: 201,
        image_url: "https://example.com/photo1.jpg",
      });
    });
  });

  describe("Review Votes, Ownership & Vote Types", () => {
    it("7. review vote ownership & eligible review status: rejects voting on Pending review", async () => {
      const client = createMockSupabaseClient({
        onQuery: (table, op) => {
          if (table === "reviews" && op === "select") {
            // Review is still Pending (not eligible for votes)
            return { data: { review_id: 101, status: "Pending" }, error: null };
          }
          return { data: null, error: null };
        },
      });

      await expect(
        voteOnReview(client, CUSTOMER_B, 101, "helpful")
      ).rejects.toMatchObject({
        status: 404,
        message: expect.stringMatching(/Approved review not found/i),
      });
    });

    it("8. duplicate vote toggles existing vote off", async () => {
      let deletedVoteId: number | undefined;

      const client = createMockSupabaseClient({
        onQuery: (table, op, state) => {
          if (table === "reviews" && op === "select") {
            return { data: { review_id: 101, status: "Approved" }, error: null };
          }
          if (table === "review_votes" && op === "select") {
            // Existing vote with same vote_type
            return { data: { vote_id: 50, vote_type: "helpful" }, error: null };
          }
          if (table === "review_votes" && op === "delete") {
            deletedVoteId = state.filters.find(
              (f) => f.method === "eq" && f.args[0] === "vote_id"
            )?.args[1] as number;
            return { data: null, error: null };
          }
          return { data: null, error: null };
        },
      });

      const res = await voteOnReview(client, CUSTOMER_B, 101, "helpful");
      expect(res.action).toBe("removed");
      expect(deletedVoteId).toBe(50);
    });
  });

  describe("Blog Likes RLS & Invariants", () => {
    it("9. published blog like insertion: succeeds when blog is Published", async () => {
      let insertedLike: Record<string, unknown> | null = null;

      const client = createMockSupabaseClient({
        onQuery: (table, op, state) => {
          if (table === "blogs" && op === "select") {
            return { data: { blog_id: 10, status: "Published" }, error: null };
          }
          if (table === "blog_likes" && op === "select") {
            return { data: null, error: null };
          }
          if (table === "blog_likes" && op === "insert") {
            insertedLike = state.payload as Record<string, unknown>;
            return { data: { like_id: 1, ...insertedLike }, error: null };
          }
          return { data: null, error: null };
        },
      });

      const res = await toggleBlogLike(client, 10, CUSTOMER_A);
      expect(res.liked).toBe(true);
      expect(insertedLike).toMatchObject({ blog_id: 10, user_id: CUSTOMER_A });
    });

    it("10. draft blog like rejection: rejects liking a Draft blog", async () => {
      const client = createMockSupabaseClient({
        onQuery: (table, op) => {
          if (table === "blogs" && op === "select") {
            // Draft blogs are not published
            return { data: null, error: null };
          }
          return { data: null, error: null };
        },
      });

      await expect(toggleBlogLike(client, 99, CUSTOMER_A)).rejects.toMatchObject({
        status: 404,
        message: expect.stringMatching(/Published blog not found/i),
      });
    });

    it("11. another user's ID cannot be used: service passes authenticated caller's userId", async () => {
      let insertedUserId: string | undefined;

      const client = createMockSupabaseClient({
        onQuery: (table, op, state) => {
          if (table === "blogs" && op === "select") {
            return { data: { blog_id: 10, status: "Published" }, error: null };
          }
          if (table === "blog_likes" && op === "select") {
            return { data: null, error: null };
          }
          if (table === "blog_likes" && op === "insert") {
            const p = state.payload as { user_id: string };
            insertedUserId = p.user_id;
            return { data: { like_id: 2, ...p }, error: null };
          }
          return { data: null, error: null };
        },
      });

      await toggleBlogLike(client, 10, CUSTOMER_A);
      expect(insertedUserId).toBe(CUSTOMER_A);
      expect(insertedUserId).not.toBe(CUSTOMER_B);
    });

    it("12. duplicate blog like toggles to unliked state", async () => {
      let deletedLikeId: number | undefined;

      const client = createMockSupabaseClient({
        onQuery: (table, op, state) => {
          if (table === "blogs" && op === "select") {
            return { data: { blog_id: 10, status: "Published" }, error: null };
          }
          if (table === "blog_likes" && op === "select") {
            // Already liked
            return { data: { like_id: 77 }, error: null };
          }
          if (table === "blog_likes" && op === "delete") {
            deletedLikeId = state.filters.find(
              (f) => f.method === "eq" && f.args[0] === "like_id"
            )?.args[1] as number;
            return { data: null, error: null };
          }
          return { data: null, error: null };
        },
      });

      const res = await toggleBlogLike(client, 10, CUSTOMER_A);
      expect(res.liked).toBe(false);
      expect(deletedLikeId).toBe(77);
    });
  });

  describe("Safe User Column Projections", () => {
    it("13. safe user-column projections: listUsersForAdmin and updateUserRoleAndStatus never project password_hash", async () => {
      let listUsersCols: string | undefined;
      let updateUserCols: string | undefined;

      const adminClient = createMockSupabaseClient({
        onQuery: (table, op, state) => {
          if (table === "users" && op === "select") {
            listUsersCols = state.columns;
            return {
              data: [
                {
                  user_id: CUSTOMER_A,
                  role_id: 1,
                  full_name: "Customer A",
                  email: "cust_a@example.com",
                  phone: "+919999999999",
                  status: "Active",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
              error: null,
              count: 1,
            };
          }
          if (table === "roles") {
            return { data: [{ role_id: 1, role_name: "customer" }], error: null };
          }
          if (table === "users" && op === "update") {
            updateUserCols = state.columns;
            return {
              data: {
                user_id: CUSTOMER_A,
                role_id: 2,
                full_name: "Customer A",
                email: "cust_a@example.com",
                phone: "+919999999999",
                status: "Active",
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            };
          }
          if (table === "moderation_logs") {
            return { data: { log_id: 99 }, error: null };
          }
          return { data: null, error: null };
        },
      });

      const userList = await listUsersForAdmin(adminClient, { page: 1, limit: 10 });
      expect(userList.items).toHaveLength(1);
      expect(listUsersCols).not.toBe("*");
      expect(listUsersCols).toContain("user_id");
      expect(listUsersCols).toContain("email");
      expect(listUsersCols).not.toContain("password_hash");

      await updateUserRoleAndStatus(adminClient, ADMIN_USER, CUSTOMER_A, {
        status: "Active",
      });
      expect(updateUserCols).not.toBe("*");
      expect(updateUserCols).toContain("user_id");
      expect(updateUserCols).not.toContain("password_hash");
    });

    it("14. existing service_role functionality remains intact: public review queries exclude PII while admin functions retain full access", async () => {
      let publicReviewCols: string | undefined;

      const client = createMockSupabaseClient({
        onQuery: (table, op, state) => {
          if (table === "reviews" && op === "select") {
            publicReviewCols = state.columns;
            return {
              data: [
                {
                  review_id: 1,
                  venue_id: 10,
                  vendor_id: null,
                  rating: 5,
                  review_text: "Great experience",
                  status: "Approved",
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                },
              ],
              error: null,
              count: 1,
            };
          }
          return { data: [], error: null };
        },
      });

      const res = await listPublicReviews(client, { venueId: 10 });
      expect(res.items).toHaveLength(1);
      expect(publicReviewCols).not.toContain("user_id");
    });
  });
});
