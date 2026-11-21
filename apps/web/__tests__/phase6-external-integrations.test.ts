import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  avatarUploadUrlSchema,
  venueMediaUploadSignSchema,
} from "@we-arrange/validation";
import {
  createGatewayPaymentIntent,
  verifyPaymentWebhookSignature,
} from "@/services/payments/adapter";
import {
  createR2PresignedPutUrl,
  createSignedMediaUploadUrl,
  sanitizeUploadFileName,
  type R2EnvConfig,
} from "@/services/storage/mediaAdapter";
import {
  defaultEmailAdapter,
  defaultSmsAdapter,
  dispatchChannelNotification,
  recordNotificationDeliveryCallback,
  verifyNotificationWebhookSignature,
} from "@/services/notifications/notificationService";
import {
  createAdminRefund,
  createOrReusePaymentIntent,
  processVerifiedPaymentWebhook,
} from "@we-arrange/service-booking";
import { createMockSupabaseClient } from "./helpers/mockSupabase";

const mockR2Config: R2EnvConfig = {
  accountId: "acc-cf-12345",
  accessKeyId: "r2-key-abc",
  secretAccessKey: "r2-secret-xyz-987654321",
  bucket: "ymwa-media-dev",
  publicBaseUrl: "https://media-dev.we-arrange.com",
};

describe("Phase 6: External Integrations Comprehensive Audit & Verification", () => {
  // ── 1. Cloudflare R2 File & Media Storage ────────────────────────────────
  describe("Cloudflare R2 Storage Adapter", () => {
    it("sanitizes file names to prevent directory traversal and injection", () => {
      expect(sanitizeUploadFileName("../../etc/shadow")).toBe("shadow");
      expect(sanitizeUploadFileName("..\\..\\windows\\system32\\cmd.exe")).toBe("cmd.exe");
      expect(sanitizeUploadFileName("my wedding photo (1) #final!.png")).toBe("my-wedding-photo-1-final-.png");
      expect(sanitizeUploadFileName("")).toBe("upload.bin");
      expect(sanitizeUploadFileName("   ")).toBe("upload.bin");
    });

    it("generates valid AWS S3 SigV4 presigned PUT URLs with expiration", () => {
      const fixedDate = new Date("2026-11-19T12:00:00.000Z");
      const urlStr = createR2PresignedPutUrl(
        mockR2Config,
        "avatars/user-99/profile.png",
        300,
        fixedDate
      );
      const url = new URL(urlStr);

      expect(url.origin).toBe("https://acc-cf-12345.r2.cloudflarestorage.com");
      expect(url.pathname).toBe("/ymwa-media-dev/avatars/user-99/profile.png");
      expect(url.searchParams.get("X-Amz-Algorithm")).toBe("AWS4-HMAC-SHA256");
      expect(url.searchParams.get("X-Amz-Credential")).toContain("r2-key-abc/20261119/auto/s3/aws4_request");
      expect(url.searchParams.get("X-Amz-Date")).toBe("20261119T120000Z");
      expect(url.searchParams.get("X-Amz-Expires")).toBe("300");
      expect(url.searchParams.get("X-Amz-SignedHeaders")).toBe("host");
      expect(url.searchParams.get("X-Amz-Signature")).toMatch(/^[a-f0-9]{64}$/);
    });

    it("fails closed with 503 when R2 credentials are unconfigured", () => {
      expect(() =>
        createSignedMediaUploadUrl(
          {
            scope: "avatars",
            ownerId: "user-123",
            fileName: "pic.png",
            contentType: "image/png",
            fileSizeBytes: 1024,
          },
          null
        )
      ).toThrowError(/not configured/i);
    });

    it("creates isolated scoped object keys and headers when configured", () => {
      const res = createSignedMediaUploadUrl(
        {
          scope: "vendors",
          ownerId: 42,
          fileName: "portfolio.webp",
          contentType: "image/webp",
          fileSizeBytes: 2048,
        },
        mockR2Config
      );

      expect(res.provider).toBe("cloudflare_r2");
      expect(res.method).toBe("PUT");
      expect(res.expiresInSeconds).toBe(300);
      expect(res.objectKey).toMatch(/^vendors\/42\/[a-z0-9]+-[a-f0-9]+-portfolio\.webp$/);
      expect(res.publicUrl).toBe(`https://media-dev.we-arrange.com/${res.objectKey}`);
      expect(res.requiredHeaders["Content-Type"]).toBe("image/webp");
    });

    it("enforces strict MIME types and size limits on upload sign schemas", () => {
      // Avatar schema: max 5MB, images only
      expect(
        avatarUploadUrlSchema.safeParse({
          fileName: "avatar.jpg",
          contentType: "image/jpeg",
          fileSizeBytes: 5 * 1024 * 1024,
        }).success
      ).toBe(true);

      // Avatar rejects > 5MB
      expect(
        avatarUploadUrlSchema.safeParse({
          fileName: "avatar.jpg",
          contentType: "image/jpeg",
          fileSizeBytes: 5 * 1024 * 1024 + 1,
        }).success
      ).toBe(false);

      // Avatar rejects video or executable MIME
      expect(
        avatarUploadUrlSchema.safeParse({
          fileName: "video.mp4",
          contentType: "video/mp4",
          fileSizeBytes: 1024,
        }).success
      ).toBe(false);

      // Venue media schema: max 25MB, supports video/mp4 and images
      expect(
        venueMediaUploadSignSchema.safeParse({
          fileName: "tour.mp4",
          contentType: "video/mp4",
          fileSizeBytes: 24 * 1024 * 1024,
        }).success
      ).toBe(true);

      // Venue media rejects > 25MB
      expect(
        venueMediaUploadSignSchema.safeParse({
          fileName: "tour.mp4",
          contentType: "video/mp4",
          fileSizeBytes: 26 * 1024 * 1024,
        }).success
      ).toBe(false);
    });
  });

  // ── 2. Payment Gateway Integration ───────────────────────────────────────
  describe("Payment Gateway Adapter & Booking Payment Flow", () => {
    it("initializes gateway payment intent with deterministic order ID and Pending status", () => {
      const intent = createGatewayPaymentIntent({
        paymentId: 105,
        bookingId: 301,
        amountInr: 50000,
        currency: "INR",
        paymentMethod: "upi",
        idempotencyKey: "idemp_test_key_abc",
      });

      expect(intent.status).toBe("Pending");
      expect(intent.amountInr).toBe(50000);
      expect(intent.currency).toBe("INR");
      expect(intent.providerOrderId).toMatch(/^gw_ord_105_[a-f0-9]{16}$/);
    });

    it("verifies webhook signature using timingSafeEqual and HMAC-SHA256", () => {
      const payload = JSON.stringify({ event: "payment.captured", paymentId: 105 });
      const secret = "secret_payment_webhook_test";
      const validSig = crypto.createHmac("sha256", secret).update(payload).digest("hex");

      // Valid raw hex signature
      expect(verifyPaymentWebhookSignature(payload, validSig, secret)).toBe(true);
      // Valid signature with sha256= prefix
      expect(verifyPaymentWebhookSignature(payload, `sha256=${validSig}`, secret)).toBe(true);
      // Tampered signature
      expect(verifyPaymentWebhookSignature(payload, "bad_signature_hex", secret)).toBe(false);
      // Tampered payload
      expect(verifyPaymentWebhookSignature(payload + " ", validSig, secret)).toBe(false);
      // Null signature
      expect(verifyPaymentWebhookSignature(payload, null, secret)).toBe(false);

      // Missing secret throws 503
      expect(() => verifyPaymentWebhookSignature(payload, validSig, "")).toThrowError(
        /not configured/i
      );
    });

    it("prevents amount manipulation and double-capture on webhooks", async () => {
      let paymentStatus = "Pending";
      const client = createMockSupabaseClient({
        onQuery: (table, op) => {
          if (table === "transactions" && op === "select") {
            return { data: null, error: null };
          }
          if (table === "payments" && op === "select") {
            return {
              data: {
                payment_id: 105,
                user_id: "user-1",
                booking_id: 301,
                amount: 50000,
                payment_method: "card",
                payment_status: paymentStatus,
              },
              error: null,
            };
          }
          if (table === "transactions" && op === "insert") {
            return { data: { transaction_id: 777 }, error: null };
          }
          if (table === "payments" && op === "update") {
            paymentStatus = "Paid";
            return { data: [{ payment_id: 105 }], error: null };
          }
          if (table === "booking_payments" && op === "insert") {
            return { data: { booking_payment_id: 888 }, error: null };
          }
          if (table === "invoices" && op === "insert") {
            return { data: { invoice_id: 999 }, error: null };
          }
          return { data: [], error: null };
        },
      });

      // Amount mismatch (payload says 20000 instead of 50000) throws 422
      await expect(
        processVerifiedPaymentWebhook(client, {
          paymentId: 105,
          transactionReference: "tx_ref_001",
          eventType: "payment.captured",
          gateway: "razorpay",
          amountInr: 20000,
          rawPayload: {},
        })
      ).rejects.toMatchObject({ status: 422 });

      // Valid webhook captures payment successfully
      const result = await processVerifiedPaymentWebhook(client, {
        paymentId: 105,
        transactionReference: "tx_ref_001",
        eventType: "payment.captured",
        gateway: "razorpay",
        amountInr: 50000,
        rawPayload: { gatewayRef: "tx_ref_001" },
      });
      expect(result.duplicate).toBe(false);
      expect(result.paymentStatus).toBe("Paid");

      // Double-capture attempt on already Paid payment throws 409 Conflict
      await expect(
        processVerifiedPaymentWebhook(client, {
          paymentId: 105,
          transactionReference: "tx_ref_new",
          eventType: "payment.captured",
          gateway: "razorpay",
          amountInr: 50000,
          rawPayload: {},
        })
      ).rejects.toMatchObject({ status: 409 });
    });

    it("enforces refund boundaries (amount cannot exceed captured balance)", async () => {
      const client = createMockSupabaseClient({
        onQuery: (table, op) => {
          if (table === "payments" && op === "select") {
            return {
              data: {
                payment_id: 105,
                amount: 50000,
                payment_status: "Paid",
              },
              error: null,
            };
          }
          if (table === "refunds" && op === "select") {
            // Already refunded 35000, remaining is 15000
            return {
              data: [{ amount: 35000, refund_status: "Completed" }],
              error: null,
            };
          }
          if (table === "refunds" && op === "insert") {
            return {
              data: { refund_id: 1, amount: 15000, refund_status: "Pending" },
              error: null,
            };
          }
          return { data: [], error: null };
        },
      });

      // Refunding 20000 when remaining is 15000 throws 422
      await expect(
        createAdminRefund(client, 105, {
          amountInr: 20000,
          reason: "Cancellation",
        })
      ).rejects.toMatchObject({ status: 422 });

      // Refunding 15000 succeeds
      const refund = await createAdminRefund(client, 105, {
        amountInr: 15000,
        reason: "Partial refund",
      });
      expect(refund.amount).toBe(15000);
      expect(refund.refund_status).toBe("Pending");
    });
  });

  // ── 3. Email & SMS Notification Channels ─────────────────────────────────
  describe("Email & SMS Adapters and Notification Service", () => {
    it("reports queued_unconfigured when provider keys are not present", async () => {
      const emailRes = await defaultEmailAdapter.sendEmail({
        to: "bride@example.com",
        subject: "Welcome",
        body: "Welcome to We Arrange",
      });
      expect(emailRes.delivered).toBe(false);
      expect(emailRes.status).toBe("queued_unconfigured");

      const smsRes = await defaultSmsAdapter.sendSms({
        to: "+919876543210",
        message: "Your OTP is 123456",
      });
      expect(smsRes.delivered).toBe(false);
      expect(smsRes.status).toBe("queued_unconfigured");
    });

    it("persists notifications and delivery logs in database", async () => {
      let loggedNotification = false;
      const client = createMockSupabaseClient({
        onQuery: (table, op) => {
          if (table === "notifications" && op === "insert") {
            return {
              data: {
                notification_id: 501,
                user_id: "user-1",
                title: "Booking Confirmed",
                message: "Your venue booking is confirmed.",
                notification_type: "booking",
                is_read: false,
              },
              error: null,
            };
          }
          if (table === "notification_logs" && op === "insert") {
            loggedNotification = true;
            return { data: { log_id: 601 }, error: null };
          }
          return { data: [], error: null };
        },
      });

      const res = await dispatchChannelNotification(client, {
        userId: "user-1",
        title: "Booking Confirmed",
        message: "Your venue booking is confirmed.",
        channel: "email",
        recipientAddress: "user@example.com",
      });

      expect(res.notification.notification_id).toBe(501);
      expect(res.deliveryStatus).toBe("queued_unconfigured");
      expect(loggedNotification).toBe(true);
    });

    it("verifies notification webhook callbacks securely", () => {
      const body = JSON.stringify({ notificationId: 501, deliveryStatus: "delivered" });
      const secret = "notif_secret_key";
      const sig = crypto.createHmac("sha256", secret).update(body).digest("hex");

      expect(verifyNotificationWebhookSignature(body, sig, secret)).toBe(true);
      expect(verifyNotificationWebhookSignature(body, "invalidsig", secret)).toBe(false);
      expect(verifyNotificationWebhookSignature(body, null, secret)).toBe(false);
      expect(() => verifyNotificationWebhookSignature(body, sig, "")).toThrowError(
        /not configured/i
      );
    });
  });

  // ── 4. Cross-Application Authorization & Security ────────────────────────
  describe("Cross-Application Security Boundaries", () => {
    it("prevents customer from initiating payment for another user's booking", async () => {
      const client = createMockSupabaseClient({
        onQuery: (table, op) => {
          if (table === "payments" && op === "select") {
            return { data: null, error: null };
          }
          if (table === "bookings" && op === "select") {
            // Booking belongs to victim-user
            return {
              data: { booking_id: 999, user_id: "victim-user", total_amount: 100000 },
              error: null,
            };
          }
          return { data: [], error: null };
        },
      });

      // Attacker cust-attacker tries to pay for victim-user's booking
      await expect(
        createOrReusePaymentIntent(client, "cust-attacker", {
          bookingId: 999,
          amountInr: 50000,
          paymentMethod: "upi",
          idempotencyKey: "attacker_idemp_key",
        })
      ).rejects.toMatchObject({ status: 403 });
    });

    it("rejects payment intent exceeding booking total amount", async () => {
      const client = createMockSupabaseClient({
        onQuery: (table, op) => {
          if (table === "payments" && op === "select") {
            return { data: null, error: null };
          }
          if (table === "bookings" && op === "select") {
            return {
              data: { booking_id: 888, user_id: "cust-1", total_amount: 50000 },
              error: null,
            };
          }
          return { data: [], error: null };
        },
      });

      // Attempting to pay 75000 when booking is 50000
      await expect(
        createOrReusePaymentIntent(client, "cust-1", {
          bookingId: 888,
          amountInr: 75000,
          paymentMethod: "upi",
          idempotencyKey: "overpay_key",
        })
      ).rejects.toMatchObject({ status: 422 });
    });
  });
});
