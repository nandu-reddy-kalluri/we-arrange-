import crypto from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { AppError, mapDatabaseError } from "@we-arrange/database/errors";
import { buildPaginationMeta, normalizePagination } from "@we-arrange/database/repository";
import type { Database, Json } from "@we-arrange/database/types";

export interface EmailChannelAdapter {
  provider: string;
  isConfigured: () => boolean;
  sendEmail: (msg: { to: string; subject: string; body: string }) => Promise<{
    delivered: boolean;
    status: string;
    detail: string;
  }>;
}

export interface SmsChannelAdapter {
  provider: string;
  isConfigured: () => boolean;
  sendSms: (msg: { to: string; message: string }) => Promise<{
    delivered: boolean;
    status: string;
    detail: string;
  }>;
}

export const defaultEmailAdapter: EmailChannelAdapter = {
  provider: process.env.EMAIL_PROVIDER?.trim() || "unconfigured",
  isConfigured: () => Boolean(process.env.EMAIL_PROVIDER_API_KEY?.trim()),
  async sendEmail() {
    if (!this.isConfigured()) {
      return {
        delivered: false,
        status: "queued_unconfigured",
        detail: "Email provider API key is not configured.",
      };
    }
    return {
      delivered: false,
      status: "queued",
      detail: "External email dispatch queued for configured provider.",
    };
  },
};

export const defaultSmsAdapter: SmsChannelAdapter = {
  provider: process.env.SMS_PROVIDER?.trim() || "unconfigured",
  isConfigured: () => Boolean(process.env.SMS_PROVIDER_API_KEY?.trim()),
  async sendSms() {
    if (!this.isConfigured()) {
      return {
        delivered: false,
        status: "queued_unconfigured",
        detail: "SMS provider API key is not configured.",
      };
    }
    return {
      delivered: false,
      status: "queued",
      detail: "External SMS dispatch queued for configured provider.",
    };
  },
};

export async function listUserNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
  options: { page?: number; limit?: number; unreadOnly?: boolean }
) {
  const { page, limit, from, to } = normalizePagination(options);
  let query = supabase
    .from("notifications")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (options.unreadOnly) query = query.eq("is_read", false);

  const { data, error, count } = await query;
  if (error) throw mapDatabaseError(error, "Failed to list notifications.");
  return {
    items: data ?? [],
    meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0),
  };
}

export async function markNotificationsRead(
  supabase: SupabaseClient<Database>,
  userId: string,
  input: { notificationIds?: number[]; markAll?: boolean }
) {
  const nowIso = new Date().toISOString();
  let query = supabase
    .from("notifications")
    .update({ is_read: true, read_at: nowIso })
    .eq("user_id", userId);

  if (!input.markAll && input.notificationIds && input.notificationIds.length > 0) {
    query = query.in("notification_id", input.notificationIds);
  } else {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query.select("notification_id");
  if (error) throw mapDatabaseError(error, "Failed to mark notifications as read.");
  return { updatedCount: data?.length ?? 0 };
}

export async function listUserConversations(
  adminClient: SupabaseClient<Database>,
  actor: { userId: string; isStaff: boolean; vendorId: number | null },
  pagination?: { page?: number; limit?: number }
) {
  const { page, limit, from, to } = normalizePagination(pagination);
  let query = adminClient
    .from("conversations")
    .select("*", { count: "exact" })
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (!actor.isStaff) {
    if (actor.vendorId) {
      query = query.or(`user_id.eq.${actor.userId},vendor_id.eq.${actor.vendorId}`);
    } else {
      query = query.eq("user_id", actor.userId);
    }
  }

  const { data, error, count } = await query;
  if (error) throw mapDatabaseError(error, "Failed to list conversations.");
  return {
    items: data ?? [],
    meta: buildPaginationMeta(page, limit, count ?? data?.length ?? 0),
  };
}

export async function createConversation(
  adminClient: SupabaseClient<Database>,
  userId: string,
  input: {
    venueId?: number;
    vendorId?: number;
    subject: string;
    initialMessage?: string;
  }
) {
  const { data: conv, error } = await adminClient
    .from("conversations")
    .insert({
      user_id: userId,
      venue_id: input.venueId ?? null,
      vendor_id: input.vendorId ?? null,
      subject: input.subject,
      status: "Active",
    })
    .select("*")
    .single();

  if (error || !conv) throw mapDatabaseError(error, "Failed to create conversation.");

  if (input.initialMessage) {
    await adminClient.from("messages").insert({
      conversation_id: conv.conversation_id,
      sender_id: userId,
      message: input.initialMessage,
      message_type: "text",
      is_read: false,
    });
  }

  return conv;
}

async function assertConversationParticipant(
  adminClient: SupabaseClient<Database>,
  conversationId: number,
  actor: { userId: string; isStaff: boolean; vendorId: number | null }
) {
  const { data: conv, error } = await adminClient
    .from("conversations")
    .select("*")
    .eq("conversation_id", conversationId)
    .maybeSingle();

  if (error) throw mapDatabaseError(error, "Failed to load conversation.");
  if (!conv) throw new AppError("NOT_FOUND", 404, "Conversation not found.");

  const isOwner = conv.user_id === actor.userId;
  const isLinkedVendor = Boolean(actor.vendorId && conv.vendor_id === actor.vendorId);
  if (!actor.isStaff && !isOwner && !isLinkedVendor) {
    throw new AppError("FORBIDDEN", 403, "You are not a participant in this conversation.");
  }

  return conv;
}

export async function listConversationMessages(
  adminClient: SupabaseClient<Database>,
  conversationId: number,
  actor: { userId: string; isStaff: boolean; vendorId: number | null }
) {
  const conv = await assertConversationParticipant(adminClient, conversationId, actor);

  const { data: msgs, error } = await adminClient
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw mapDatabaseError(error, "Failed to load messages.");

  const messageIds = (msgs ?? []).map((m) => m.message_id);
  const { data: attachments } =
    messageIds.length > 0
      ? await adminClient
          .from("message_attachments")
          .select("*")
          .in("message_id", messageIds)
      : { data: [] };

  const attMap = new Map<number, typeof attachments>();
  for (const att of attachments ?? []) {
    const arr = attMap.get(att.message_id) ?? [];
    arr.push(att);
    attMap.set(att.message_id, arr);
  }

  return {
    conversation: conv,
    messages: (msgs ?? []).map((m) => ({
      ...m,
      attachments: attMap.get(m.message_id) ?? [],
    })),
  };
}

export async function sendConversationMessage(
  adminClient: SupabaseClient<Database>,
  conversationId: number,
  actor: { userId: string; isStaff: boolean; vendorId: number | null },
  input: {
    message: string;
    messageType: "text" | "image" | "file";
    attachments?: Array<{
      fileName: string;
      fileUrl: string;
      fileType?: string;
      fileSize?: number;
    }>;
  }
) {
  const conv = await assertConversationParticipant(adminClient, conversationId, actor);

  const { data: msg, error } = await adminClient
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_id: actor.userId,
      message: input.message,
      message_type: input.messageType,
      is_read: false,
    })
    .select("*")
    .single();

  if (error || !msg) throw mapDatabaseError(error, "Failed to send message.");

  if (input.attachments && input.attachments.length > 0) {
    await adminClient.from("message_attachments").insert(
      input.attachments.map((a) => ({
        message_id: msg.message_id,
        file_name: a.fileName,
        file_url: a.fileUrl,
        file_type: a.fileType ?? null,
        file_size: a.fileSize ?? null,
      }))
    );
  }

  await adminClient
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("conversation_id", conversationId);

  if (conv.user_id && conv.user_id !== actor.userId) {
    await adminClient.from("chat_notifications").insert({
      conversation_id: conversationId,
      message_id: msg.message_id,
      user_id: conv.user_id,
      is_read: false,
    });
  }

  return msg;
}

export async function dispatchChannelNotification(
  adminClient: SupabaseClient<Database>,
  input: {
    userId: string;
    title: string;
    message: string;
    channel: "in_app" | "email" | "sms";
    notificationType?: string;
    recipientAddress?: string;
  },
  adapters: { email?: EmailChannelAdapter; sms?: SmsChannelAdapter } = {}
) {
  const { data: notif, error } = await adminClient
    .from("notifications")
    .insert({
      user_id: input.userId,
      title: input.title,
      message: input.message,
      notification_type: input.notificationType ?? "system",
      is_read: false,
    })
    .select("*")
    .single();

  if (error || !notif) throw mapDatabaseError(error, "Failed to persist notification.");

  let deliveryStatus = "delivered";
  let providerResponse: Record<string, unknown> = { channel: "in_app" };

  if (input.channel === "email") {
    const adapter = adapters.email ?? defaultEmailAdapter;
    const res = await adapter.sendEmail({
      to: input.recipientAddress ?? "",
      subject: input.title,
      body: input.message,
    });
    deliveryStatus = res.status;
    providerResponse = { provider: adapter.provider, ...res };
  } else if (input.channel === "sms") {
    const adapter = adapters.sms ?? defaultSmsAdapter;
    const res = await adapter.sendSms({
      to: input.recipientAddress ?? "",
      message: input.message,
    });
    deliveryStatus = res.status;
    providerResponse = { provider: adapter.provider, ...res };
  }

  await adminClient.from("notification_logs").insert({
    notification_id: notif.notification_id,
    user_id: input.userId,
    channel: input.channel,
    delivery_status: deliveryStatus,
    provider_response: providerResponse as Json,
    sent_at: new Date().toISOString(),
  });

  return { notification: notif, deliveryStatus, providerResponse };
}

export function verifyNotificationWebhookSignature(
  rawBody: string,
  providedSignature: string | null,
  overrideSecret?: string
): boolean {
  const secret = (overrideSecret ?? process.env.NOTIFICATION_WEBHOOK_SECRET ?? "").trim();
  if (!secret) {
    throw new AppError(
      "SERVICE_UNAVAILABLE",
      503,
      "Notification webhook verification secret is not configured."
    );
  }
  if (!providedSignature) return false;

  const normalizedProvided = providedSignature.replace(/^sha256=/i, "").trim();
  const expectedHex = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  const a = Buffer.from(normalizedProvided, "hex");
  const b = Buffer.from(expectedHex, "hex");
  if (a.length === 0 || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function recordNotificationDeliveryCallback(
  adminClient: SupabaseClient<Database>,
  event: {
    notificationId?: number;
    userId?: string;
    channel: string;
    deliveryStatus: string;
    rawPayload: Record<string, unknown>;
  }
) {
  const { data, error } = await adminClient
    .from("notification_logs")
    .insert({
      notification_id: event.notificationId ?? null,
      user_id: event.userId ?? null,
      channel: event.channel,
      delivery_status: event.deliveryStatus,
      provider_response: event.rawPayload as Json,
      sent_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to log delivery callback.");
  return data;
}

export async function listNotificationTemplates(adminClient: SupabaseClient<Database>) {
  const [inAppRes, emailRes, smsRes] = await Promise.all([
    adminClient.from("notification_templates").select("*").order("template_id", { ascending: true }),
    adminClient.from("email_templates").select("*").order("template_id", { ascending: true }),
    adminClient.from("sms_templates").select("*").order("template_id", { ascending: true }),
  ]);

  if (inAppRes.error) throw mapDatabaseError(inAppRes.error, "Failed to load notification templates.");
  return {
    inApp: inAppRes.data ?? [],
    email: emailRes.data ?? [],
    sms: smsRes.data ?? [],
  };
}

export async function upsertNotificationTemplate(
  adminClient: SupabaseClient<Database>,
  input: {
    channel: "in_app" | "email" | "sms";
    templateName: string;
    titleOrSubject?: string;
    body: string;
    variables?: string[];
    status: "Active" | "Inactive";
  }
) {
  const nowIso = new Date().toISOString();

  if (input.channel === "in_app") {
    const { data, error } = await adminClient
      .from("notification_templates")
      .insert({
        template_name: input.templateName,
        title_template: input.titleOrSubject ?? null,
        message_template: input.body,
        status: input.status,
        updated_at: nowIso,
      })
      .select("*")
      .single();
    if (error || !data) throw mapDatabaseError(error, "Failed to save in-app template.");
    return data;
  }

  if (input.channel === "email") {
    const { data, error } = await adminClient
      .from("email_templates")
      .insert({
        template_name: input.templateName,
        subject: input.titleOrSubject ?? null,
        body: input.body,
        variables: (input.variables ?? []) as Json,
        status: input.status,
        updated_at: nowIso,
      })
      .select("*")
      .single();
    if (error || !data) throw mapDatabaseError(error, "Failed to save email template.");
    return data;
  }

  const { data, error } = await adminClient
    .from("sms_templates")
    .insert({
      template_name: input.templateName,
      message: input.body,
      variables: (input.variables ?? []) as Json,
      status: input.status,
      updated_at: nowIso,
    })
    .select("*")
    .single();
  if (error || !data) throw mapDatabaseError(error, "Failed to save SMS template.");
  return data;
}

