import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import { buildPaginationMeta, normalizePagination } from "@we-arrange/database/repository";
import type { Database, Json } from "@we-arrange/database/types";

export async function createBookingFromAcceptedQuote(
  adminClient: SupabaseClient<Database>,
  actor: { userId: string; isStaff: boolean; isActiveAdmin?: boolean },
  input: {
    quoteId: number;
    eventDate: string;
    guestCount?: number;
    notes?: string;
  }
) {
  const { data: quote, error: qErr } = await adminClient
    .from("quotes")
    .select("*")
    .eq("quote_id", input.quoteId)
    .maybeSingle();

  if (qErr) throw mapDatabaseError(qErr, "Failed to verify quote.");
  if (!quote) throw new AppError("NOT_FOUND", 404, "Quote not found.");

  if (quote.status !== "Approved") {
    throw new AppError(
      "UNPROCESSABLE_ENTITY",
      422,
      "Booking can only be created from an Approved quote."
    );
  }

  const { data: enquiry } = await adminClient
    .from("enquiries")
    .select("enquiry_id, user_id, assigned_specialist_id")
    .eq("enquiry_id", quote.enquiry_id)
    .maybeSingle();

  if (!enquiry || !enquiry.user_id) {
    throw new AppError("NOT_FOUND", 404, "Parent enquiry or customer user not found.");
  }

  if (!actor.isStaff && enquiry.user_id !== actor.userId) {
    throw new AppError("FORBIDDEN", 403, "Cannot create booking for another customer's quote.");
  }

  if (
    actor.isStaff &&
    !actor.isActiveAdmin &&
    enquiry.assigned_specialist_id &&
    enquiry.assigned_specialist_id !== actor.userId
  ) {
    throw new AppError(
      "FORBIDDEN",
      403,
      "Cannot create booking for an enquiry assigned to another concierge specialist."
    );
  }

  const { data: existingBooking } = await adminClient
    .from("bookings")
    .select("booking_id")
    .eq("quote_id", input.quoteId)
    .maybeSingle();

  if (existingBooking) {
    throw new AppError("CONFLICT", 409, "A booking already exists for this quote.");
  }

  const { data: pendingStatus } = await adminClient
    .from("booking_status")
    .select("status_id")
    .ilike("status_name", "Pending")
    .maybeSingle();

  const { data: booking, error: bErr } = await adminClient
    .from("bookings")
    .insert({
      user_id: enquiry.user_id,
      venue_id: quote.venue_id,
      vendor_id: quote.vendor_id,
      enquiry_id: quote.enquiry_id,
      quote_id: quote.quote_id,
      status_id: pendingStatus?.status_id ?? null,
      booking_date: new Date().toISOString().slice(0, 10),
      event_date: input.eventDate,
      guest_count: input.guestCount ?? null,
      total_amount: quote.base_cost_inr,
      currency: "INR",
      notes: input.notes ?? quote.notes ?? null,
    })
    .select("*")
    .single();

  if (bErr || !booking) throw mapDatabaseError(bErr, "Failed to create booking.");
  return booking;
}

export async function listBookingsForActor(
  client: SupabaseClient<Database>,
  actor: { userId: string; isStaff: boolean; vendorId: number | null },
  pagination?: { page?: number; limit?: number }
) {
  const { page, limit, from, to } = normalizePagination(pagination);
  let query = client
    .from("bookings")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (!actor.isStaff) {
    if (actor.vendorId) {
      query = query.or(`user_id.eq.${actor.userId},vendor_id.eq.${actor.vendorId}`);
    } else {
      query = query.eq("user_id", actor.userId);
    }
  }

  const { data, error, count } = await query;
  if (error) throw mapDatabaseError(error, "Failed to list bookings.");
  const rows = data ?? [];

  const statusIds = Array.from(
    new Set(
      rows
        .map((row) => row.status_id)
        .filter((id): id is number => typeof id === "number" && Number.isFinite(id))
    )
  );

  const statusMap = new Map<number, string>();
  if (statusIds.length > 0) {
    const { data: statuses } = await client
      .from("booking_status")
      .select("status_id, status_name")
      .in("status_id", statusIds);
    for (const s of statuses ?? []) {
      statusMap.set(s.status_id, s.status_name);
    }
  }

  return {
    items: rows.map((row) => ({
      ...row,
      status_name: row.status_id ? statusMap.get(row.status_id) ?? null : null,
    })),
    meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0),
  };
}

export async function getBookingDetail(
  adminClient: SupabaseClient<Database>,
  bookingId: number,
  actor: { userId: string; isStaff: boolean; vendorId: number | null }
) {
  const { data: booking, error } = await adminClient
    .from("bookings")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to fetch booking.");
  if (!booking) throw new AppError("NOT_FOUND", 404, "Booking not found.");

  const isOwner = booking.user_id === actor.userId;
  const isLinkedVendor = Boolean(actor.vendorId && booking.vendor_id === actor.vendorId);
  if (!actor.isStaff && !isOwner && !isLinkedVendor) {
    throw new AppError("FORBIDDEN", 403, "Access denied to this booking.");
  }

  const [docsRes, paymentsRes, statusRes] = await Promise.all([
    adminClient.from("booking_documents").select("*").eq("booking_id", bookingId),
    adminClient.from("payments").select("*").eq("booking_id", bookingId),
    booking.status_id
      ? adminClient
          .from("booking_status")
          .select("*")
          .eq("status_id", booking.status_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    booking,
    status: statusRes.data ?? null,
    documents: docsRes.data ?? [],
    payments: paymentsRes.data ?? [],
  };
}

const ALLOWED_BOOKING_TRANSITIONS: Record<string, ReadonlySet<string>> = {
  Pending: new Set(["Confirmed", "In Progress", "Cancelled"]),
  Confirmed: new Set(["In Progress", "Completed", "Cancelled"]),
  "In Progress": new Set(["Completed", "Cancelled"]),
  Completed: new Set([]),
  Cancelled: new Set(["Refunded"]),
  Refunded: new Set([]),
};

export async function updateBookingStatus(
  adminClient: SupabaseClient<Database>,
  bookingId: number,
  input: { statusName: string; notes?: string },
  actor?: { userId: string; isActiveAdmin?: boolean }
) {
  const { data: existingBooking, error: bErr } = await adminClient
    .from("bookings")
    .select("booking_id, status_id, enquiry_id")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (bErr) throw mapDatabaseError(bErr, "Failed to verify booking.");
  if (!existingBooking) throw new AppError("NOT_FOUND", 404, "Booking not found.");

  if (actor && !actor.isActiveAdmin && existingBooking.enquiry_id) {
    const { data: enquiry } = await adminClient
      .from("enquiries")
      .select("assigned_specialist_id")
      .eq("enquiry_id", existingBooking.enquiry_id)
      .maybeSingle();

    if (enquiry?.assigned_specialist_id && enquiry.assigned_specialist_id !== actor.userId) {
      throw new AppError(
        "FORBIDDEN",
        403,
        "Cannot update booking assigned to another concierge specialist."
      );
    }
  }

  const [{ data: statusRow, error: sErr }, { data: currentStatusRow }] = await Promise.all([
    adminClient
      .from("booking_status")
      .select("status_id, status_name")
      .ilike("status_name", input.statusName)
      .maybeSingle(),
    existingBooking.status_id
      ? adminClient
          .from("booking_status")
          .select("status_name")
          .eq("status_id", existingBooking.status_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  if (sErr) throw mapDatabaseError(sErr, "Failed to verify booking status.");
  if (!statusRow) {
    throw new AppError(
      "VALIDATION_ERROR",
      400,
      `Booking status '${input.statusName}' is not seeded.`
    );
  }

  const currentStatus = currentStatusRow?.status_name ?? "Pending";
  if (currentStatus.toLowerCase() !== statusRow.status_name.toLowerCase()) {
    const allowedNext = ALLOWED_BOOKING_TRANSITIONS[currentStatus];
    if (allowedNext && !allowedNext.has(statusRow.status_name)) {
      throw new AppError(
        "UNPROCESSABLE_ENTITY",
        422,
        `Invalid booking status transition from '${currentStatus}' to '${statusRow.status_name}'.`
      );
    }
  }

  const updatePayload: Database["public"]["Tables"]["bookings"]["Update"] = {
    status_id: statusRow.status_id,
    updated_at: new Date().toISOString(),
  };
  if (input.notes !== undefined) updatePayload.notes = input.notes;

  const { data: updated, error } = await adminClient
    .from("bookings")
    .update(updatePayload)
    .eq("booking_id", bookingId)
    .select("*")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to update booking status.");
  if (!updated) throw new AppError("NOT_FOUND", 404, "Booking not found.");
  return { booking: updated, status: statusRow };
}

export async function addBookingDocument(
  adminClient: SupabaseClient<Database>,
  bookingId: number,
  actor: { userId: string; isStaff: boolean },
  input: { documentName: string; documentUrl: string; documentType: string }
) {
  const { data: booking } = await adminClient
    .from("bookings")
    .select("booking_id, user_id")
    .eq("booking_id", bookingId)
    .maybeSingle();

  if (!booking) throw new AppError("NOT_FOUND", 404, "Booking not found.");
  if (!actor.isStaff && booking.user_id !== actor.userId) {
    throw new AppError("FORBIDDEN", 403, "Cannot upload documents for this booking.");
  }

  const { data, error } = await adminClient
    .from("booking_documents")
    .insert({
      booking_id: bookingId,
      document_name: input.documentName,
      document_url: input.documentUrl,
      document_type: input.documentType,
    })
    .select("*")
    .single();

  if (error || !data) throw mapDatabaseError(error, "Failed to attach booking document.");
  return data;
}

// ── Coupons, Payment Intents, Webhooks, Invoices & Refunds ───────────────────
export async function validateAndCalculateCoupon(
  client: SupabaseClient<Database>,
  couponCode: string,
  amountInr: number
) {
  const { data: coupon, error } = await client
    .from("coupons")
    .select("*")
    .ilike("coupon_code", couponCode.trim())
    .eq("status", "Active")
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to validate coupon.");
  if (!coupon) throw new AppError("NOT_FOUND", 404, "Coupon code not found or inactive.");

  const now = Date.now();
  if (coupon.valid_from && Date.parse(coupon.valid_from) > now) {
    throw new AppError("UNPROCESSABLE_ENTITY", 422, "Coupon is not active yet.");
  }
  if (coupon.valid_until && Date.parse(coupon.valid_until) < now) {
    throw new AppError("UNPROCESSABLE_ENTITY", 422, "Coupon has expired.");
  }
  if (
    coupon.usage_limit !== null &&
    coupon.used_count !== null &&
    coupon.used_count >= coupon.usage_limit
  ) {
    throw new AppError("UNPROCESSABLE_ENTITY", 422, "Coupon usage limit has been reached.");
  }
  if (coupon.minimum_amount !== null && amountInr < coupon.minimum_amount) {
    throw new AppError(
      "UNPROCESSABLE_ENTITY",
      422,
      `Minimum INR ${coupon.minimum_amount} required for this coupon.`
    );
  }

  let discountInr =
    coupon.discount_type.toLowerCase() === "percentage"
      ? (amountInr * coupon.discount_value) / 100
      : coupon.discount_value;

  if (coupon.maximum_discount !== null) {
    discountInr = Math.min(discountInr, coupon.maximum_discount);
  }
  discountInr = Math.min(amountInr, Math.max(0, Math.round(discountInr * 100) / 100));

  return {
    couponId: coupon.coupon_id,
    couponCode: coupon.coupon_code,
    originalAmountInr: amountInr,
    discountInr,
    finalAmountInr: Math.round((amountInr - discountInr) * 100) / 100,
  };
}

export async function createOrReusePaymentIntent(
  adminClient: SupabaseClient<Database>,
  userId: string,
  input: {
    bookingId: number;
    amountInr: number;
    paymentMethod: string;
    couponCode?: string;
    idempotencyKey: string;
  }
) {
  // Check idempotency key first
  const { data: existing } = await adminClient
    .from("payments")
    .select("*")
    .eq("idempotency_key", input.idempotencyKey)
    .maybeSingle();

  if (existing) {
    if (existing.user_id !== userId || existing.booking_id !== input.bookingId) {
      throw new AppError(
        "CONFLICT",
        409,
        "Idempotency key already used for a different payment."
      );
    }
    return { reused: true, payment: existing };
  }

  const { data: booking } = await adminClient
    .from("bookings")
    .select("booking_id, user_id, total_amount")
    .eq("booking_id", input.bookingId)
    .maybeSingle();

  if (!booking) throw new AppError("NOT_FOUND", 404, "Booking not found.");
  if (booking.user_id !== userId) {
    throw new AppError("FORBIDDEN", 403, "Cannot initiate payment for another user's booking.");
  }
  if (booking.total_amount !== null && input.amountInr > Number(booking.total_amount)) {
    throw new AppError(
      "UNPROCESSABLE_ENTITY",
      422,
      "Payment amount cannot exceed booking total amount."
    );
  }

  let payableAmount = input.amountInr;
  let couponApplied: string | null = null;
  if (input.couponCode) {
    // shortcut: coupon used_count is validated here but not auto-incremented on capture until payments stores coupon_id
    const calc = await validateAndCalculateCoupon(adminClient, input.couponCode, input.amountInr);
    payableAmount = calc.finalAmountInr;
    couponApplied = calc.couponCode;
  }

  if (payableAmount <= 0) {
    throw new AppError("UNPROCESSABLE_ENTITY", 422, "Payable amount must remain positive.");
  }

  const { data: payment, error } = await adminClient
    .from("payments")
    .insert({
      user_id: userId,
      booking_id: input.bookingId,
      amount: payableAmount,
      currency: "INR",
      payment_method: input.paymentMethod,
      payment_status: "Pending",
      idempotency_key: input.idempotencyKey,
    })
    .select("*")
    .single();

  if (error || !payment) throw mapDatabaseError(error, "Failed to initialize payment record.");
  return { reused: false, payment, couponApplied };
}

export async function processVerifiedPaymentWebhook(
  adminClient: SupabaseClient<Database>,
  event: {
    paymentId: number;
    transactionReference: string;
    eventType: "payment.captured" | "payment.failed";
    gateway: string;
    amountInr: number;
    rawPayload: Record<string, unknown>;
  }
) {
  // Replay / idempotency protection
  const { data: existingTx } = await adminClient
    .from("transactions")
    .select("transaction_id, payment_id, transaction_status")
    .eq("transaction_reference", event.transactionReference)
    .maybeSingle();

  if (existingTx) {
    return { duplicate: true, transactionId: existingTx.transaction_id };
  }

  const { data: payment, error: pErr } = await adminClient
    .from("payments")
    .select("*")
    .eq("payment_id", event.paymentId)
    .maybeSingle();

  if (pErr) throw mapDatabaseError(pErr, "Failed to load payment.");
  if (!payment) throw new AppError("NOT_FOUND", 404, "Referenced payment not found.");

  if (payment.payment_status === "Paid") {
    throw new AppError("CONFLICT", 409, "Payment has already been captured.");
  }

  const nextStatus = event.eventType === "payment.captured" ? "Paid" : "Failed";
  if (
    nextStatus === "Paid" &&
    Math.abs(Number(event.amountInr) - Number(payment.amount)) > 0.01
  ) {
    throw new AppError(
      "UNPROCESSABLE_ENTITY",
      422,
      "Captured webhook amount does not match initialized payment amount."
    );
  }

  const nowIso = new Date().toISOString();

  const { data: tx, error: txErr } = await adminClient
    .from("transactions")
    .insert({
      payment_id: payment.payment_id,
      user_id: payment.user_id,
      transaction_reference: event.transactionReference,
      transaction_type: "charge",
      amount: event.amountInr,
      currency: "INR",
      transaction_status: nextStatus,
      gateway: event.gateway,
      gateway_response: event.rawPayload as Json,
    })
    .select("transaction_id")
    .single();

  if (txErr || !tx) throw mapDatabaseError(txErr, "Failed to record transaction.");

  const { error: payUpdateErr } = await adminClient
    .from("payments")
    .update({
      payment_status: nextStatus,
      transaction_id: event.transactionReference,
      paid_at: nextStatus === "Paid" ? nowIso : null,
    })
    .eq("payment_id", payment.payment_id);
  if (payUpdateErr) throw mapDatabaseError(payUpdateErr, "Failed to update payment status.");

  if (nextStatus === "Paid" && payment.booking_id) {
    const { error: bpErr } = await adminClient.from("booking_payments").insert({
      booking_id: payment.booking_id,
      amount: event.amountInr,
      payment_status: "Paid",
      payment_method: payment.payment_method,
      transaction_id: event.transactionReference,
      paid_at: nowIso,
    });
    if (bpErr) throw mapDatabaseError(bpErr, "Failed to record booking payment.");

    const { error: invErr } = await adminClient.from("invoices").insert({
      payment_id: payment.payment_id,
      user_id: payment.user_id,
      invoice_number: `YMWA-INV-${payment.payment_id}-${Date.now().toString().slice(-6)}`,
      amount: event.amountInr,
      tax_amount: 0,
      total_amount: event.amountInr,
      currency: "INR",
      issued_at: nowIso,
    });
    if (invErr) throw mapDatabaseError(invErr, "Failed to generate payment invoice.");
  }

  return { duplicate: false, transactionId: tx.transaction_id, paymentStatus: nextStatus };
}

export async function createAdminRefund(
  adminClient: SupabaseClient<Database>,
  paymentId: number,
  input: { amountInr: number; reason: string }
) {
  const { data: payment, error: pErr } = await adminClient
    .from("payments")
    .select("*")
    .eq("payment_id", paymentId)
    .maybeSingle();

  if (pErr) throw mapDatabaseError(pErr, "Failed to load payment for refund.");
  if (!payment) throw new AppError("NOT_FOUND", 404, "Payment not found.");
  if (payment.payment_status !== "Paid") {
    throw new AppError("UNPROCESSABLE_ENTITY", 422, "Only Paid payments can be refunded.");
  }

  const { data: existingRefunds } = await adminClient
    .from("refunds")
    .select("amount, refund_status")
    .eq("payment_id", paymentId);

  const alreadyRefunded = (existingRefunds ?? [])
    .filter((r) => r.refund_status !== "Failed")
    .reduce((sum, r) => sum + Number(r.amount || 0), 0);

  if (alreadyRefunded + input.amountInr > Number(payment.amount)) {
    throw new AppError(
      "UNPROCESSABLE_ENTITY",
      422,
      "Refund amount exceeds remaining captured payment balance."
    );
  }

  const { data: refund, error } = await adminClient
    .from("refunds")
    .insert({
      payment_id: paymentId,
      amount: input.amountInr,
      reason: input.reason,
      refund_status: "Pending",
    })
    .select("*")
    .single();

  if (error || !refund) throw mapDatabaseError(error, "Failed to initiate refund.");
  return refund;
}
