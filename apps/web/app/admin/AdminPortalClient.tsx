"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@we-arrange/api-client";
import { supabase, useAuth } from "@we-arrange/auth";
import { Dialog, Skeleton } from "@we-arrange/ui";
import {
  Activity,
  AlertTriangle,
  Building2,
  CalendarCheck,
  Eye,
  EyeOff,
  IndianRupee,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  Shield,
  Store,
  Users,
  X,
} from "lucide-react";

type AdminTab = "analytics" | "users" | "catalog" | "moderation" | "settings";

function statusTone(status: string): string {
  const s = status.trim().toLowerCase();
  if (
    s === "active" ||
    s === "approved" ||
    s === "published" ||
    s === "confirmed" ||
    s === "completed" ||
    s === "verified"
  ) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (s === "pending" || s === "in progress" || s === "draft") {
    return "bg-amber-50 text-amber-800 border-amber-200";
  }
  if (s === "rejected" || s === "cancelled" || s === "inactive" || s === "refunded") {
    return "bg-red-50 text-red-700 border-red-200";
  }
  return "bg-neutral-100 text-neutral-600 border-neutral-200";
}

function AdminEmptyRow({ message }: { message: string }) {
  return (
    <div className="py-8 px-4 rounded-xl bg-[#FAF7F3] border border-dashed border-[#8B263E]/15 text-center text-xs text-neutral-500">
      {message}
    </div>
  );
}

interface AdminMeDTO {
  userId: string;
  email: string;
  roleName: string | null;
  isActiveAdmin: boolean;
}

interface AdminAnalyticsDTO {
  totalUsers: number;
  activeVenues: number;
  activeVendors: number;
  totalEnquiries: number;
  totalBookings: number;
  pendingReports: number;
  capturedRevenueInr: number;
  refundedInr: number;
  currency: string;
}

function formatInr(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(val));
}

export default function AdminPortalClient({
  initialView = "dashboard",
}: {
  initialView?: "login" | "dashboard";
}) {
  const router = useRouter();
  const { loading: authLoading } = useAuth();

  const [adminMe, setAdminMe] = useState<AdminMeDTO | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [signingIn, setSigningIn] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>("analytics");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [moderationSearch, setModerationSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>("ALL");
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    confirmLabel: string;
    warning?: string;
    details?: Array<{ label: string; value: string }>;
    run: () => Promise<boolean | void>;
  } | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<AdminAnalyticsDTO | null>(null);

  // Users, Admins, Roles
  const [users, setUsers] = useState<Array<Record<string, unknown>>>([]);
  const [userSearch, setUserSearch] = useState("");
  const [admins, setAdmins] = useState<Array<Record<string, unknown>>>([]);
  const [roles, setRoles] = useState<Array<Record<string, unknown>>>([]);
  const [newAdminUserId, setNewAdminUserId] = useState("");
  const [newAdminName, setNewAdminName] = useState("");
  const [newAdminStatus, setNewAdminStatus] = useState<"active" | "inactive" | "pending">("active");
  const [newRoleName, setNewRoleName] = useState("");
  const [newRolePerms, setNewRolePerms] = useState("");

  // Venues & Vendors
  const [venues, setVenues] = useState<Array<Record<string, unknown>>>([]);
  const [vendors, setVendors] = useState<Array<Record<string, unknown>>>([]);
  const [venueName, setVenueName] = useState("");
  const [venueTypeId, setVenueTypeId] = useState("1");
  const [venueCity, setVenueCity] = useState("Hyderabad");
  const [venueLocality, setVenueLocality] = useState("");
  const [venueCapacity, setVenueCapacity] = useState("500");
  const [venuePriceRange, setVenuePriceRange] = useState("₹15L+");

  const [pricingVenueId, setPricingVenueId] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [vegPrice, setVegPrice] = useState("");
  const [nonVegPrice, setNonVegPrice] = useState("");
  const [rentalCost, setRentalCost] = useState("");

  const [mediaVenueId, setMediaVenueId] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [mediaCover, setMediaCover] = useState(false);

  const [linkVendorId, setLinkVendorId] = useState("");
  const [linkUserId, setLinkUserId] = useState("");

  // Enquiries, Reviews, Reports, Logs
  const [enquiries, setEnquiries] = useState<Array<Record<string, unknown>>>([]);
  const [assignSpecialistMap, setAssignSpecialistMap] = useState<Record<number, string>>({});
  const [reviews, setReviews] = useState<Array<Record<string, unknown>>>([]);
  const [modReviewId, setModReviewId] = useState("");
  const [modReviewStatus, setModReviewStatus] = useState<
    "Approved" | "Rejected" | "Published" | "Inactive"
  >("Approved");
  const [modReviewRemarks, setModReviewRemarks] = useState("");
  const [reports, setReports] = useState<Array<Record<string, unknown>>>([]);
  const [modLogs, setModLogs] = useState<Array<Record<string, unknown>>>([]);
  const [bookings, setBookings] = useState<Array<Record<string, unknown>>>([]);
  const [quotes, setQuotes] = useState<Array<Record<string, unknown>>>([]);

  // Settings & Notification templates
  const [settingsList, setSettingsList] = useState<Array<Record<string, unknown>>>([]);
  const [settingKey, setSettingKey] = useState("");
  const [settingValue, setSettingValue] = useState("");
  const [settingType, setSettingType] = useState<"text" | "number" | "boolean" | "json">("text");
  const [settingDesc, setSettingDesc] = useState("");

  const [templates, setTemplates] = useState<{
    inApp: Array<Record<string, unknown>>;
    email: Array<Record<string, unknown>>;
    sms: Array<Record<string, unknown>>;
  }>({ inApp: [], email: [], sms: [] });
  const [tplChannel, setTplChannel] = useState<"in_app" | "email" | "sms">("in_app");
  const [tplName, setTplName] = useState("");
  const [tplSubject, setTplSubject] = useState("");
  const [tplBody, setTplBody] = useState("");

  const loadAllAdminData = useCallback(async (search = "") => {
    setLoadingData(true);
    setError(null);

    const [
      analyticsRes,
      usersRes,
      adminsRes,
      rolesRes,
      venuesRes,
      vendorsRes,
      enquiriesRes,
      reviewsRes,
      reportsRes,
      logsRes,
      settingsRes,
      tplRes,
      bookingsRes,
      quotesRes,
    ] = await Promise.all([
      apiClient.get<AdminAnalyticsDTO>("/api/analytics/admin", { retryOn401: false }),
      apiClient.get<Array<Record<string, unknown>>>("/api/admin/users", {
        query: { limit: 30, ...(search ? { search } : {}) },
        retryOn401: false,
      }),
      apiClient.get<Array<Record<string, unknown>>>("/api/admin/admins", { retryOn401: false }),
      apiClient.get<{ roles: Array<Record<string, unknown>> }>("/api/admin/roles", {
        retryOn401: false,
      }),
      apiClient.get<Array<Record<string, unknown>>>("/api/admin/venues", {
        query: { limit: 30 },
        retryOn401: false,
      }),
      apiClient.get<Array<Record<string, unknown>>>("/api/admin/vendors", {
        query: { limit: 30 },
        retryOn401: false,
      }),
      apiClient.get<Array<Record<string, unknown>>>("/api/enquiries", {
        query: { limit: 30 },
        retryOn401: false,
      }),
      apiClient.get<Array<Record<string, unknown>>>("/api/admin/reviews", {
        query: { limit: 30 },
        retryOn401: false,
      }),
      apiClient.get<Array<Record<string, unknown>>>("/api/reports", {
        query: { limit: 30 },
        retryOn401: false,
      }),
      apiClient.get<Array<Record<string, unknown>>>("/api/admin/moderation-logs", {
        query: { limit: 25 },
        retryOn401: false,
      }),
      apiClient.get<{ settings: Array<Record<string, unknown>> }>("/api/admin/settings", {
        retryOn401: false,
      }),
      apiClient.get<{
        inApp: Array<Record<string, unknown>>;
        email: Array<Record<string, unknown>>;
        sms: Array<Record<string, unknown>>;
      }>("/api/admin/notification-templates", { retryOn401: false }),
      apiClient.get<Array<Record<string, unknown>>>("/api/bookings", {
        query: { limit: 30 },
        retryOn401: false,
      }),
      apiClient.get<Array<Record<string, unknown>>>("/api/admin/quotes", {
        query: { limit: 30 },
        retryOn401: false,
      }),
    ]);

    if (analyticsRes.ok && analyticsRes.data) setAnalytics(analyticsRes.data);
    if (usersRes.ok && Array.isArray(usersRes.data)) setUsers(usersRes.data);
    if (adminsRes.ok && Array.isArray(adminsRes.data)) setAdmins(adminsRes.data);
    if (rolesRes.ok && rolesRes.data?.roles) setRoles(rolesRes.data.roles);
    if (venuesRes.ok && Array.isArray(venuesRes.data)) setVenues(venuesRes.data);
    if (vendorsRes.ok && Array.isArray(vendorsRes.data)) setVendors(vendorsRes.data);
    if (enquiriesRes.ok && Array.isArray(enquiriesRes.data)) setEnquiries(enquiriesRes.data);
    if (reviewsRes.ok && Array.isArray(reviewsRes.data)) setReviews(reviewsRes.data);
    if (reportsRes.ok && Array.isArray(reportsRes.data)) setReports(reportsRes.data);
    if (logsRes.ok && Array.isArray(logsRes.data)) setModLogs(logsRes.data);
    if (settingsRes.ok && settingsRes.data?.settings) setSettingsList(settingsRes.data.settings);
    if (tplRes.ok && tplRes.data) setTemplates(tplRes.data);
    if (bookingsRes.ok && Array.isArray(bookingsRes.data)) setBookings(bookingsRes.data);
    if (quotesRes.ok && Array.isArray(quotesRes.data)) setQuotes(quotesRes.data);

    setLoadingData(false);
  }, []);

  const bootstrapAdmin = useCallback(async () => {
    setCheckingAuth(true);
    const meRes = await apiClient.get<AdminMeDTO>("/api/admin/me", { retryOn401: false });
    if (meRes.ok && meRes.data?.isActiveAdmin) {
      setAdminMe(meRes.data);
      await loadAllAdminData();
    } else {
      setAdminMe(null);
    }
    setCheckingAuth(false);
  }, [loadAllAdminData]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "unauthorized_role") {
      setError("Access denied: an active administrator account is required.");
    }
    void bootstrapAdmin();
  }, [bootstrapAdmin]);

  useEffect(() => {
    if (checkingAuth || authLoading) return;
    if (initialView === "login" && adminMe?.isActiveAdmin) {
      router.replace("/admin");
    } else if (initialView === "dashboard" && !adminMe) {
      router.replace("/admin/login");
    }
  }, [checkingAuth, authLoading, initialView, adminMe, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigningIn(true);
    setError(null);

    const normalizedEmail = loginEmail.trim().toLowerCase();
    const res = await apiClient.post("/api/admin/auth/login", {
      email: normalizedEmail,
      password: loginPassword,
    });

    if (!res.ok) {
      await supabase.auth.signOut().catch(() => undefined);
      setSigningIn(false);
      setError(res.error || "Administrator login failed.");
      return;
    }

    await supabase.auth
      .signInWithPassword({
        email: normalizedEmail,
        password: loginPassword,
      })
      .catch(() => undefined);

    setSigningIn(false);
    await bootstrapAdmin();
    router.replace("/admin");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut().catch(() => undefined);
    await apiClient.logout(true);
    setAdminMe(null);
    setAnalytics(null);
    setBookings([]);
    setQuotes([]);
    router.replace("/admin/login");
  };

  const handleUpdateUser = async (
    userId: string,
    payload: { roleName?: "customer" | "vendor" | "concierge" | "admin"; status?: "Active" | "Inactive" | "Pending" }
  ): Promise<{ ok: boolean; error?: string }> => {
    if (updatingUserId === userId) {
      return { ok: false, error: "Update already in progress for this user." };
    }
    setUpdatingUserId(userId);
    setError(null);
    setSuccess(null);
    const res = await apiClient.patch(`/api/admin/users/${userId}`, payload);
    setUpdatingUserId(null);
    if (!res.ok) {
      const msg = res.error || "Failed to update user.";
      setError(msg);
      return { ok: false, error: msg };
    }
    setSuccess(
      payload.status === "Inactive"
        ? `User ${userId} deactivated.`
        : payload.status === "Active"
          ? `User ${userId} activated.`
          : `Updated user ${userId}.`
    );
    await loadAllAdminData(userSearch);
    return { ok: true };
  };

  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const res = await apiClient.post("/api/admin/admins", {
      userId: newAdminUserId.trim(),
      adminName: newAdminName.trim(),
      status: newAdminStatus,
    });
    if (!res.ok) {
      setError(res.error || "Failed to update admin roster.");
      return;
    }
    setNewAdminUserId("");
    setNewAdminName("");
    setSuccess("Admin roster updated.");
    await loadAllAdminData(userSearch);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const perms = newRolePerms
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const res = await apiClient.post("/api/admin/roles", {
      roleName: newRoleName.trim(),
      ...(perms.length > 0 ? { permissionNames: perms } : {}),
    });
    if (!res.ok) {
      setError(res.error || "Failed to create role.");
      return;
    }
    setNewRoleName("");
    setNewRolePerms("");
    setSuccess("Role created.");
    await loadAllAdminData(userSearch);
  };

  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const res = await apiClient.post("/api/admin/venues", {
      typeId: Number(venueTypeId),
      venueName: venueName.trim(),
      baseCity: venueCity.trim() || undefined,
      localityName: venueLocality.trim() || undefined,
      capacity: venueCapacity ? Number(venueCapacity) : undefined,
      priceRange: venuePriceRange.trim() || undefined,
      status: "Active",
    });
    if (!res.ok) {
      setError(res.error || "Failed to create venue.");
      return;
    }
    setVenueName("");
    setVenueLocality("");
    setSuccess("Venue added to catalog.");
    await loadAllAdminData(userSearch);
  };

  const handleToggleVenueStatus = async (venueId: number, currentStatus: string | null) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";
    const res = await apiClient.patch(`/api/admin/venues/${venueId}`, { status: nextStatus });
    if (!res.ok) {
      setError(res.error || "Failed to update venue.");
      return;
    }
    setSuccess(`Venue #${venueId} status updated to ${nextStatus}.`);
    await loadAllAdminData(userSearch);
  };

  const handleDeactivateVenue = async (venueId: number) => {
    const res = await apiClient.delete(`/api/admin/venues/${venueId}`);
    if (!res.ok) {
      setError(res.error || "Failed to deactivate venue.");
      return;
    }
    setSuccess(`Venue #${venueId} deactivated.`);
    await loadAllAdminData(userSearch);
  };

  const handleUpsertVenuePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    const vid = Number(pricingVenueId);
    if (!vid) return;
    const res = await apiClient.put(`/api/admin/venues/${vid}/pricing`, {
      ...(startingPrice ? { startingPrice: Number(startingPrice) } : {}),
      ...(vegPrice ? { vegPrice: Number(vegPrice) } : {}),
      ...(nonVegPrice ? { nonVegPrice: Number(nonVegPrice) } : {}),
      ...(rentalCost ? { rentalCost: Number(rentalCost) } : {}),
    });
    if (!res.ok) {
      setError(res.error || "Failed to update venue pricing.");
      return;
    }
    setSuccess(`Updated pricing for Venue #${vid}.`);
  };

  const handleAddVenueMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    const vid = Number(mediaVenueId);
    if (!vid) return;
    const res = await apiClient.post(`/api/admin/venues/${vid}/media`, {
      mediaUrl: mediaUrl.trim(),
      mediaType,
      isCover: mediaCover,
      sortOrder: 0,
    });
    if (!res.ok) {
      setError(res.error || "Failed to attach venue media.");
      return;
    }
    setMediaUrl("");
    setSuccess(`Added media to Venue #${vid}.`);
  };

  const handleVerifyVendor = async (vendorId: number, nextVerified: boolean) => {
    const res = await apiClient.patch(`/api/admin/vendors/${vendorId}/verify`, {
      isVerified: nextVerified,
      status: "Active",
    });
    if (!res.ok) {
      setError(res.error || "Failed to verify vendor.");
      return;
    }
    setSuccess(`Vendor #${vendorId} verified=${String(nextVerified)}.`);
    await loadAllAdminData(userSearch);
  };

  const handleLinkVendorUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const vid = Number(linkVendorId);
    if (!vid || !linkUserId.trim()) return;
    const res = await apiClient.post(`/api/admin/vendors/${vid}/link-user`, {
      userId: linkUserId.trim(),
    });
    if (!res.ok) {
      setError(res.error || "Failed to link vendor owner.");
      return;
    }
    setLinkUserId("");
    setSuccess(`Vendor #${vid} linked to user.`);
    await loadAllAdminData(userSearch);
  };

  const handleAssignEnquiry = async (enquiryId: number) => {
    const specialistId = (assignSpecialistMap[enquiryId] || "").trim();
    if (!specialistId) return;
    const res = await apiClient.patch(`/api/admin/enquiries/${enquiryId}/assign`, {
      specialistId,
    });
    if (!res.ok) {
      setError(res.error || "Failed to assign specialist.");
      return;
    }
    setSuccess(`Enquiry #${enquiryId} assigned.`);
    await loadAllAdminData(userSearch);
  };

  const handleModerateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const rid = Number(modReviewId);
    if (!rid) return;
    const res = await apiClient.patch(`/api/admin/reviews/${rid}/moderate`, {
      status: modReviewStatus,
      ...(modReviewRemarks.trim() ? { remarks: modReviewRemarks.trim() } : {}),
    });
    if (!res.ok) {
      setError(res.error || "Failed to moderate review.");
      return;
    }
    setModReviewId("");
    setModReviewRemarks("");
    setSuccess(`Review #${rid} set to ${modReviewStatus}.`);
    await loadAllAdminData(userSearch);
  };

  const handleResolveReport = async (
    reportId: number,
    status: "active" | "inactive" | "pending",
    action: string
  ) => {
    const res = await apiClient.patch(`/api/admin/reports/${reportId}`, {
      status,
      action,
    });
    if (!res.ok) {
      setError(res.error || "Failed to update report.");
      return;
    }
    setSuccess(`Report #${reportId} marked ${status}.`);
    await loadAllAdminData(userSearch);
  };

  const handleQuickModerateReview = async (
    reviewId: number,
    status: "Approved" | "Rejected" | "Published" | "Inactive"
  ) => {
    setError(null);
    setSuccess(null);
    const res = await apiClient.patch(`/api/admin/reviews/${reviewId}/moderate`, { status });
    if (!res.ok) {
      setError(res.error || "Failed to moderate review.");
      return;
    }
    setSuccess(`Review #${reviewId} set to ${status}.`);
    await loadAllAdminData(userSearch);
  };

  const handleUpdateBookingStatus = async (
    bookingId: number,
    status: "Pending" | "Confirmed" | "In Progress" | "Completed" | "Cancelled" | "Refunded"
  ) => {
    setError(null);
    setSuccess(null);
    const res = await apiClient.patch(`/api/concierge/bookings/${bookingId}/status`, {
      statusName: status,
    });
    if (!res.ok) {
      setError(res.error || "Failed to update booking status.");
      return;
    }
    setSuccess(`Booking #${bookingId} marked ${status}.`);
    await loadAllAdminData(userSearch);
  };

  const handleUpdateQuoteStatus = async (
    quoteId: number,
    status: "Draft" | "Published" | "Approved" | "Rejected"
  ) => {
    setError(null);
    setSuccess(null);
    const res = await apiClient.patch(`/api/concierge/quotes/${quoteId}`, { status });
    if (!res.ok) {
      setError(res.error || "Failed to update quote status.");
      return;
    }
    setSuccess(`Quote #${quoteId} marked ${status}.`);
    await loadAllAdminData(userSearch);
  };

  const handleUpsertSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiClient.patch("/api/admin/settings", {
      settingKey: settingKey.trim(),
      settingValue: settingValue.trim(),
      dataType: settingType,
      ...(settingDesc.trim() ? { description: settingDesc.trim() } : {}),
    });
    if (!res.ok) {
      setError(res.error || "Failed to save setting.");
      return;
    }
    setSettingKey("");
    setSettingValue("");
    setSettingDesc("");
    setSuccess("Application setting saved.");
    await loadAllAdminData(userSearch);
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiClient.post("/api/admin/notification-templates", {
      channel: tplChannel,
      templateName: tplName.trim(),
      ...(tplSubject.trim() ? { titleOrSubject: tplSubject.trim() } : {}),
      body: tplBody.trim(),
      status: "Active",
    });
    if (!res.ok) {
      setError(res.error || "Failed to create template.");
      return;
    }
    setTplName("");
    setTplSubject("");
    setTplBody("");
    setSuccess("Notification template created.");
    await loadAllAdminData(userSearch);
  };

  if (checkingAuth) {
    return (
      <main
        className="min-h-screen bg-[#FAF7F3] flex items-center justify-center p-6"
        aria-label="Verifying administrator session"
      >
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#8B263E]/10 p-8 shadow-sm text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#8B263E]/10 text-[#8B263E] flex items-center justify-center mx-auto font-serif text-lg font-bold">
            YM
          </div>
          <Loader2 className="w-6 h-6 animate-spin text-[#8B263E] mx-auto" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Verifying Governance Session...
          </p>
        </div>
      </main>
    );
  }

  if (!adminMe) {
    return (
      <main className="min-h-screen bg-[#FAF7F3] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#8B263E]/15 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-full bg-[#8B263E]/10 text-[#8B263E] flex items-center justify-center mx-auto mb-3 font-serif text-lg font-bold border border-[#C5A880]/30">
              YM
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C5A880]">
              YouMarriageWeArrange Governance
            </p>
            <h1 className="mt-1.5 font-serif text-3xl font-bold text-[#2D2D2D]">
              Admin Portal
            </h1>
            <p className="mt-1.5 text-xs text-neutral-600 leading-relaxed">
              Sign in with an active administrator account to manage users, venues, vendors, moderation, and platform configuration.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium leading-relaxed"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="admin-login-email"
                className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5"
              >
                Administrator Email
              </label>
              <div className="relative">
                <Mail
                  className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="admin@youmarriagewearrange.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200 bg-white text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25 focus:border-[#8B263E]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-login-password"
                className="block text-[11px] font-bold uppercase tracking-wider text-neutral-600 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="admin-login-password"
                  type={showLoginPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Enter administrator password"
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-neutral-200 bg-white text-sm text-[#2D2D2D] focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25 focus:border-[#8B263E]"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  aria-label={showLoginPassword ? "Hide password" : "Show password"}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 rounded-lg text-neutral-400 hover:text-[#8B263E] focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25 cursor-pointer"
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={signingIn}
              className="w-full h-11 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {signingIn && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{signingIn ? "Verifying Admin Session..." : "Sign In"}</span>
            </button>
          </form>

          <p className="text-center text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
            Role-restricted workspace. Contact a super administrator if your credentials need renewal.
          </p>
        </div>
      </main>
    );
  }

  const navItems: Array<{
    id: AdminTab;
    label: string;
    subtitle: string;
    icon: typeof Activity;
    badge?: number;
  }> = [
    {
      id: "analytics",
      label: "KPIs & Overview",
      subtitle: "Live marketplace health, bookings, and revenue telemetry",
      icon: Activity,
    },
    {
      id: "users",
      label: "Users & RBAC",
      subtitle: "Manage member roles, account status, and administrator roster",
      icon: Users,
      badge: users.length,
    },
    {
      id: "catalog",
      label: "Venues & Vendors",
      subtitle: "Create venues, manage pricing/media, and verify partner vendors",
      icon: Building2,
      badge: venues.length + vendors.length,
    },
    {
      id: "moderation",
      label: "Enquiries & Moderation",
      subtitle: "Assign specialists, review moderation, reports, bookings, and quotes",
      icon: Shield,
      badge: reports.length,
    },
    {
      id: "settings",
      label: "Settings & Templates",
      subtitle: "Platform configuration keys and notification templates",
      icon: Settings,
    },
  ];

  const activeNav = navItems.find((item) => item.id === activeTab) ?? navItems[0];
  const catalogQuery = catalogSearch.trim().toLowerCase();
  const filteredVenues = catalogQuery
    ? venues.filter((v) =>
        `${String(v.venue_id)} ${String(v.venue_name || "")} ${String(v.base_city || "")}`
          .toLowerCase()
          .includes(catalogQuery)
      )
    : venues;
  const filteredVendors = catalogQuery
    ? vendors.filter((vd) =>
        `${String(vd.vendor_id)} ${String(vd.vendor_name || "")}`
          .toLowerCase()
          .includes(catalogQuery)
      )
    : vendors;

  const modQuery = moderationSearch.trim().toLowerCase();
  const filteredBookings = bookings.filter((b) => {
    const bStatus = String(b.status_name ?? b.booking_status ?? b.status ?? "Pending");
    if (bookingStatusFilter !== "ALL" && bStatus !== bookingStatusFilter) return false;
    if (!modQuery) return true;
    return `${String(b.booking_id)} ${bStatus} ${String(b.event_date || "")}`
      .toLowerCase()
      .includes(modQuery);
  });

  const renderNavButtons = (onAfterSelect?: () => void) => (
    <nav aria-label="Admin sections" className="space-y-1.5">
      {navItems.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            aria-current={isActive ? "page" : undefined}
            onClick={() => {
              setActiveTab(tab.id);
              onAfterSelect?.();
            }}
            className={`w-full flex items-center justify-between gap-2.5 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-colors text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25 ${
              isActive
                ? "bg-[#F5EEE7] text-[#8B263E] shadow-xs"
                : "text-neutral-600 hover:bg-[#FAF7F3] hover:text-[#8B263E]"
            }`}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{tab.label}</span>
            </span>
            {typeof tab.badge === "number" && tab.badge > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  isActive ? "bg-[#8B263E] text-white" : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F3] flex flex-col lg:flex-row">
      {/* DESKTOP SIDEBAR */}
      <aside
        aria-label="Admin portal sidebar"
        className="hidden lg:flex lg:w-64 lg:flex-col lg:sticky lg:top-0 lg:h-screen bg-white border-r border-[#8B263E]/10 px-5 py-6 shrink-0"
      >
        <div className="mb-7 pb-5 border-b border-neutral-100">
          <p className="font-serif text-base font-bold tracking-tight text-[#8B263E]">
            YOU MARRIAGE
          </p>
          <p className="text-[9px] font-black tracking-[0.25em] text-[#C5A880] uppercase">
            WE ARRANGE • ADMIN
          </p>
          <div className="mt-4 p-3 rounded-xl bg-[#FAF7F3] border border-[#8B263E]/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Signed In
            </p>
            <p className="mt-0.5 text-xs font-semibold text-[#2D2D2D] truncate">
              {adminMe.email}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8B263E] mt-1">
              {adminMe.roleName || "Administrator"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">{renderNavButtons()}</div>

        <div className="pt-5 mt-5 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-neutral-600 hover:text-[#8B263E] hover:bg-[#8B263E]/5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MOBILE DRAWER */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs"
            onClick={() => setMobileNavOpen(false)}
          />
          <aside
            aria-label="Mobile admin navigation"
            className="relative z-10 w-72 max-w-[85vw] h-full bg-white border-r border-[#8B263E]/15 p-5 flex flex-col shadow-2xl"
          >
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-neutral-100">
              <div>
                <p className="font-serif text-base font-bold text-[#8B263E]">YOU MARRIAGE</p>
                <p className="text-[9px] font-black tracking-[0.2em] text-[#C5A880] uppercase">
                  Governance Console
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close navigation menu"
                className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded-xl bg-[#FAF7F3] border border-[#8B263E]/10">
              <p className="text-xs font-semibold text-[#2D2D2D] truncate">{adminMe.email}</p>
              <p className="text-[10px] font-bold uppercase text-[#8B263E] mt-0.5">
                {adminMe.roleName || "Administrator"}
              </p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {renderNavButtons(() => setMobileNavOpen(false))}
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#8B263E] bg-[#F5EEE7] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* MAIN WORKSPACE */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#8B263E]/10 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                aria-label="Open navigation menu"
                className="lg:hidden p-2 rounded-xl border border-neutral-200 text-neutral-700 hover:border-[#8B263E]/40 hover:text-[#8B263E] cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C5A880] truncate">
                  Active Administrator • {adminMe.email}
                </p>
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2D2D] truncate">
                  WeArrange Governance Console
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void loadAllAdminData(userSearch)}
                disabled={loadingData}
                className="px-3.5 py-2 rounded-full border border-neutral-200 hover:border-[#8B263E]/35 text-xs font-semibold text-neutral-700 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
                <span>Sync All</span>
              </button>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="px-4 py-2 rounded-full bg-[#F5EEE7] hover:bg-[#EBDDCF] text-[#8B263E] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 pb-4 border-b border-[#8B263E]/10">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2D2D2D]">{activeNav.label}</h2>
              <p className="text-xs text-neutral-500 mt-0.5">{activeNav.subtitle}</p>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium flex items-center justify-between gap-3"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError(null)}
                aria-label="Dismiss error"
                className="text-red-500 hover:text-red-800 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {success && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium flex items-center justify-between gap-3"
            >
              <span>{success}</span>
              <button
                type="button"
                onClick={() => setSuccess(null)}
                aria-label="Dismiss notice"
                className="text-emerald-600 hover:text-emerald-900 cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {loadingData && !analytics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 space-y-3"
                    >
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : analytics ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      label: "Total Users",
                      value: analytics.totalUsers,
                      icon: Users,
                      target: "users" as AdminTab,
                    },
                    {
                      label: "Active Venues",
                      value: analytics.activeVenues,
                      icon: Building2,
                      target: "catalog" as AdminTab,
                    },
                    {
                      label: "Active Vendors",
                      value: analytics.activeVendors,
                      icon: Store,
                      target: "catalog" as AdminTab,
                    },
                    {
                      label: "Total Enquiries",
                      value: analytics.totalEnquiries,
                      icon: MessageSquare,
                      target: "moderation" as AdminTab,
                    },
                    {
                      label: "Total Bookings",
                      value: analytics.totalBookings,
                      icon: CalendarCheck,
                      target: "moderation" as AdminTab,
                    },
                    {
                      label: "Pending Reports",
                      value: analytics.pendingReports,
                      icon: AlertTriangle,
                      target: "moderation" as AdminTab,
                    },
                    {
                      label: "Captured Revenue",
                      value: formatInr(analytics.capturedRevenueInr),
                      icon: IndianRupee,
                      target: "moderation" as AdminTab,
                    },
                    {
                      label: "Refunded",
                      value: formatInr(analytics.refundedInr),
                      icon: RotateCcw,
                      target: "moderation" as AdminTab,
                    },
                  ].map((card) => {
                    const Icon = card.icon;
                    return (
                      <button
                        key={card.label}
                        type="button"
                        onClick={() => setActiveTab(card.target)}
                        className="text-left bg-white rounded-2xl border border-[#8B263E]/10 p-5 hover:border-[#8B263E]/30 hover:shadow-sm transition-all cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
                            {card.label}
                          </p>
                          <div className="w-8 h-8 rounded-lg bg-[#F5EEE7] text-[#8B263E] flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" aria-hidden="true" />
                          </div>
                        </div>
                        <p className="mt-3 font-serif text-2xl font-bold text-[#2D2D2D]">
                          {card.value}
                        </p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <AdminEmptyRow message="Analytics data is currently unavailable. Click Sync All to retry." />
              )}
            </div>
          )}

          {/* TAB: USERS & RBAC */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">
                    Users ({users.length})
                  </h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void loadAllAdminData(userSearch);
                    }}
                    className="flex flex-wrap gap-2 w-full sm:w-auto"
                  >
                    <div className="relative flex-1 sm:flex-initial">
                      <Search
                        className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        aria-label="Filter users by email or name"
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        placeholder="Filter by email or name..."
                        className="w-full sm:w-56 h-9 pl-8 pr-3 rounded-lg border border-neutral-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#8B263E]/25"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 h-9 rounded-lg bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold cursor-pointer"
                    >
                      Search
                    </button>
                  </form>
                </div>

                {loadingData && users.length === 0 ? (
                  <div className="space-y-2.5">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full rounded-xl" />
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <AdminEmptyRow message="No matching user accounts found." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs min-w-[640px]">
                      <thead>
                        <tr className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500">
                          <th className="py-2.5 pr-3">Name / Email</th>
                          <th className="py-2.5 pr-3">User UUID</th>
                          <th className="py-2.5 pr-3">Role</th>
                          <th className="py-2.5 pr-3">Status</th>
                          <th className="py-2.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {users.map((u) => {
                          const uid = String(u.user_id);
                          const status = String(u.status || "Active");
                          return (
                            <tr key={uid} className="hover:bg-[#FAF7F3]/60">
                              <td className="py-3 pr-3">
                                <p className="font-semibold text-[#2D2D2D]">
                                  {String(u.full_name || "—")}
                                </p>
                                <p className="text-[11px] text-neutral-500">{String(u.email)}</p>
                              </td>
                              <td className="py-3 pr-3 font-mono text-[10px] text-neutral-500">
                                {uid}
                              </td>
                              <td className="py-3 pr-3 font-medium capitalize">
                                {String(u.roleName || "customer")}
                              </td>
                              <td className="py-3 pr-3">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusTone(status)}`}
                                >
                                  {status}
                                </span>
                              </td>
                              <td className="py-3">
                                <div className="flex flex-wrap gap-1.5">
                                  <select
                                    aria-label={`Role for ${String(u.email || uid)}`}
                                    defaultValue={String(u.roleName || "customer")}
                                    onChange={(e) =>
                                      void handleUpdateUser(uid, {
                                        roleName: e.target.value as
                                          | "customer"
                                          | "vendor"
                                          | "concierge"
                                          | "admin",
                                      })
                                    }
                                    className="h-7 px-2 rounded border border-neutral-200 text-[11px] bg-white"
                                  >
                                    <option value="customer">customer</option>
                                    <option value="vendor">vendor</option>
                                    <option value="concierge">concierge</option>
                                    <option value="admin">admin</option>
                                  </select>
                                  <button
                                    type="button"
                                    disabled={updatingUserId === uid || confirmBusy}
                                    onClick={() => {
                                      if (status === "Active") {
                                        setConfirmError(null);
                                        setConfirmAction({
                                          title: "Confirm User Deactivation",
                                          message:
                                            "Review this user's details before revoking access.",
                                          warning:
                                            "Deactivating this account immediately blocks login and API access across all portals until reactivated by an administrator. Existing audit logs are preserved.",
                                          details: [
                                            {
                                              label: "Name",
                                              value: String(u.full_name || "—"),
                                            },
                                            {
                                              label: "Email",
                                              value: String(u.email || "—"),
                                            },
                                            {
                                              label: "Role",
                                              value: String(u.roleName || "customer"),
                                            },
                                            {
                                              label: "Status",
                                              value: status,
                                            },
                                            {
                                              label: "User UUID",
                                              value: uid,
                                            },
                                          ],
                                          confirmLabel: "Confirm Deactivation",
                                          run: async () => {
                                            const result = await handleUpdateUser(uid, {
                                              status: "Inactive",
                                            });
                                            if (!result.ok) {
                                              setConfirmError(
                                                result.error || "Failed to deactivate user."
                                              );
                                              return false;
                                            }
                                            return true;
                                          },
                                        });
                                      } else {
                                        void handleUpdateUser(uid, { status: "Active" });
                                      }
                                    }}
                                    className="px-2.5 h-7 rounded border border-neutral-200 bg-white text-[11px] font-semibold hover:border-[#8B263E] cursor-pointer disabled:opacity-50"
                                  >
                                    {updatingUserId === uid
                                      ? "Updating..."
                                      : status === "Active"
                                        ? "Deactivate"
                                        : "Activate"}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">
                    Admin Roster ({admins.length})
                  </h3>
                  <form onSubmit={handleAssignAdmin} className="space-y-2.5">
                    <input
                      required
                      aria-label="Target User UUID"
                      value={newAdminUserId}
                      onChange={(e) => setNewAdminUserId(e.target.value)}
                      placeholder="Target User UUID *"
                      className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs"
                    />
                    <div className="flex flex-wrap gap-2">
                      <input
                        required
                        minLength={2}
                        aria-label="Admin Display Name"
                        value={newAdminName}
                        onChange={(e) => setNewAdminName(e.target.value)}
                        placeholder="Admin Display Name *"
                        className="flex-1 min-w-[160px] h-9 px-3 rounded-lg border border-neutral-200 text-xs"
                      />
                      <select
                        aria-label="Admin Status"
                        value={newAdminStatus}
                        onChange={(e) =>
                          setNewAdminStatus(e.target.value as "active" | "inactive" | "pending")
                        }
                        className="h-9 px-2 rounded-lg border border-neutral-200 text-xs bg-white"
                      >
                        <option value="active">active</option>
                        <option value="inactive">inactive</option>
                        <option value="pending">pending</option>
                      </select>
                      <button
                        type="submit"
                        className="px-4 h-9 rounded-lg bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                  {admins.length === 0 ? (
                    <AdminEmptyRow message="No administrator roster entries loaded." />
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      {admins.map((a) => (
                        <div
                          key={String(a.admin_id)}
                          className="p-2.5 rounded-lg bg-[#FAF7F3] flex items-center justify-between gap-2"
                        >
                          <span className="truncate">
                            <strong>{String(a.admin_name)}</strong> ({String(a.user_id)})
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase shrink-0 ${statusTone(String(a.status || ""))}`}
                          >
                            {String(a.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-4">
                  <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">
                    Roles & Permissions ({roles.length})
                  </h3>
                  <form onSubmit={handleCreateRole} className="space-y-2">
                    <input
                      required
                      aria-label="New role name"
                      value={newRoleName}
                      onChange={(e) => setNewRoleName(e.target.value)}
                      placeholder="New role name *"
                      className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs"
                    />
                    <div className="flex flex-wrap gap-2">
                      <input
                        aria-label="Comma-separated permissions"
                        value={newRolePerms}
                        onChange={(e) => setNewRolePerms(e.target.value)}
                        placeholder="Comma-separated permissions (optional)"
                        className="flex-1 min-w-[160px] h-9 px-3 rounded-lg border border-neutral-200 text-xs"
                      />
                      <button
                        type="submit"
                        className="px-4 h-9 rounded-lg bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold cursor-pointer"
                      >
                        Create Role
                      </button>
                    </div>
                  </form>
                  {roles.length === 0 ? (
                    <AdminEmptyRow message="No roles found." />
                  ) : (
                    <div className="space-y-1.5 text-xs">
                      {roles.map((r) => (
                        <div
                          key={String(r.role_id)}
                          className="p-2.5 rounded-lg bg-[#FAF7F3] flex items-center justify-between"
                        >
                          <strong>{String(r.role_name)}</strong>
                          <span
                            className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusTone(String(r.status || "Active"))}`}
                          >
                            {String(r.status || "Active")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CATALOG */}
          {activeTab === "catalog" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                  onSubmit={handleCreateVenue}
                  className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 space-y-2.5"
                >
                  <h3 className="font-serif font-bold text-base text-[#2D2D2D]">Create Venue</h3>
                  <input required aria-label="Venue Name" value={venueName} onChange={(e) => setVenueName(e.target.value)} placeholder="Venue Name *" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  <div className="grid grid-cols-2 gap-2">
                    <input required aria-label="Venue Type ID" type="number" min={1} value={venueTypeId} onChange={(e) => setVenueTypeId(e.target.value)} placeholder="Type ID *" className="h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                    <input aria-label="Venue Capacity" type="number" min={1} value={venueCapacity} onChange={(e) => setVenueCapacity(e.target.value)} placeholder="Capacity" className="h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  </div>
                  <input aria-label="City" value={venueCity} onChange={(e) => setVenueCity(e.target.value)} placeholder="City" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  <input aria-label="Locality" value={venueLocality} onChange={(e) => setVenueLocality(e.target.value)} placeholder="Locality" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  <input aria-label="Price range" value={venuePriceRange} onChange={(e) => setVenuePriceRange(e.target.value)} placeholder="Price range" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  <button type="submit" className="px-4 py-2 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold cursor-pointer">
                    Add Venue
                  </button>
                </form>

                <form
                  onSubmit={handleUpsertVenuePricing}
                  className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 space-y-2.5"
                >
                  <h3 className="font-serif font-bold text-base text-[#2D2D2D]">Venue Pricing</h3>
                  <input required aria-label="Pricing Venue ID" type="number" min={1} value={pricingVenueId} onChange={(e) => setPricingVenueId(e.target.value)} placeholder="Venue ID *" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  <input aria-label="Starting Price INR" type="number" min={0} value={startingPrice} onChange={(e) => setStartingPrice(e.target.value)} placeholder="Starting Price (INR)" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  <div className="grid grid-cols-2 gap-2">
                    <input aria-label="Veg plate price" type="number" min={0} value={vegPrice} onChange={(e) => setVegPrice(e.target.value)} placeholder="Veg/plate" className="h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                    <input aria-label="Non-veg plate price" type="number" min={0} value={nonVegPrice} onChange={(e) => setNonVegPrice(e.target.value)} placeholder="NonVeg/plate" className="h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  </div>
                  <input aria-label="Rental Cost INR" type="number" min={0} value={rentalCost} onChange={(e) => setRentalCost(e.target.value)} placeholder="Rental Cost (INR)" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  <button type="submit" className="px-4 py-2 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold cursor-pointer">
                    Save Pricing
                  </button>
                </form>

                <form
                  onSubmit={handleAddVenueMedia}
                  className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 space-y-2.5"
                >
                  <h3 className="font-serif font-bold text-base text-[#2D2D2D]">Venue Media</h3>
                  <input required aria-label="Media Venue ID" type="number" min={1} value={mediaVenueId} onChange={(e) => setMediaVenueId(e.target.value)} placeholder="Venue ID *" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  <input required aria-label="Media URL" type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://... Media URL *" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  <div className="flex items-center gap-3 text-xs">
                    <select aria-label="Media Type" value={mediaType} onChange={(e) => setMediaType(e.target.value as "image" | "video")} className="h-9 px-2 rounded-lg border border-neutral-200 bg-white">
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                    <label className="flex items-center gap-1.5">
                      <input type="checkbox" checked={mediaCover} onChange={(e) => setMediaCover(e.target.checked)} />
                      <span>Cover</span>
                    </label>
                  </div>
                  <button type="submit" className="px-4 py-2 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold cursor-pointer">
                    Attach Media
                  </button>
                </form>
              </div>

              <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="relative flex-1 min-w-[220px]">
                  <Search
                    className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    aria-label="Filter venues and vendors"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Filter loaded venues & vendors by name, city, or ID..."
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-neutral-200 text-xs"
                  />
                </div>
                {catalogSearch && (
                  <button
                    type="button"
                    onClick={() => setCatalogSearch("")}
                    className="text-xs font-semibold text-[#8B263E] hover:underline cursor-pointer"
                  >
                    Clear filter
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-3">
                  <h3 className="font-serif font-bold text-base text-[#2D2D2D]">
                    Venues ({filteredVenues.length})
                  </h3>
                  {filteredVenues.length === 0 ? (
                    <AdminEmptyRow message="No venues match your current filter." />
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredVenues.map((v) => {
                        const vid = Number(v.venue_id);
                        const status = (v.status as string | null) ?? "Active";
                        return (
                          <div
                            key={vid}
                            className="p-3 rounded-xl bg-[#FAF7F3] flex flex-wrap items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-[#2D2D2D] truncate">
                                #{vid} {String(v.venue_name)}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-neutral-500">
                                  {String(v.base_city || "—")}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusTone(status)}`}
                                >
                                  {status}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => void handleToggleVenueStatus(vid, status)}
                                className="px-2.5 py-1 rounded border border-neutral-200 bg-white text-[11px] font-semibold cursor-pointer hover:border-[#8B263E]"
                              >
                                {status === "Active" ? "Set Inactive" : "Activate"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmAction({
                                    title: `Deactivate Venue #${vid}?`,
                                    message: `"${String(v.venue_name)}" will be deactivated in the public marketplace catalog.`,
                                    confirmLabel: "Deactivate Venue",
                                    run: () => handleDeactivateVenue(vid),
                                  })
                                }
                                className="px-2.5 py-1 rounded border border-red-200 bg-white text-red-700 text-[11px] font-semibold cursor-pointer hover:bg-red-50"
                              >
                                Deactivate
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-4">
                  <h3 className="font-serif font-bold text-base text-[#2D2D2D]">
                    Vendors & Owner Linking ({filteredVendors.length})
                  </h3>
                  <form onSubmit={handleLinkVendorUser} className="flex flex-wrap gap-2">
                    <input required aria-label="Vendor ID" type="number" min={1} value={linkVendorId} onChange={(e) => setLinkVendorId(e.target.value)} placeholder="Vendor ID" className="w-24 h-9 px-2.5 rounded-lg border border-neutral-200 text-xs" />
                    <input required aria-label="Owner User UUID" value={linkUserId} onChange={(e) => setLinkUserId(e.target.value)} placeholder="Owner User UUID" className="flex-1 min-w-[160px] h-9 px-2.5 rounded-lg border border-neutral-200 text-xs" />
                    <button type="submit" className="px-3.5 h-9 rounded-lg bg-[#8B263E] text-white text-xs font-semibold cursor-pointer">
                      Link User
                    </button>
                  </form>
                  {filteredVendors.length === 0 ? (
                    <AdminEmptyRow message="No vendors match your current filter." />
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {filteredVendors.map((vd) => {
                        const vid = Number(vd.vendor_id);
                        const verified = Boolean(vd.is_verified);
                        return (
                          <div
                            key={vid}
                            className="p-3 rounded-xl bg-[#FAF7F3] flex flex-wrap items-center justify-between gap-2 text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-[#2D2D2D] truncate">
                                #{vid} {String(vd.vendor_name)}
                              </p>
                              <span
                                className={`inline-flex mt-1 px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusTone(verified ? "Verified" : "Pending")}`}
                              >
                                {verified ? "Verified Partner" : "Pending Verification"}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                verified
                                  ? setConfirmAction({
                                      title: `Revoke verification for Vendor #${vid}?`,
                                      message: `Verification badge will be removed from "${String(vd.vendor_name)}".`,
                                      confirmLabel: "Revoke Verification",
                                      run: () => handleVerifyVendor(vid, false),
                                    })
                                  : void handleVerifyVendor(vid, true)
                              }
                              className={`px-3 py-1 rounded-full text-[11px] font-semibold cursor-pointer ${
                                verified
                                  ? "border border-neutral-300 bg-white text-neutral-700 hover:border-red-300 hover:text-red-700"
                                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
                              }`}
                            >
                              {verified ? "Revoke Verify" : "Verify Vendor"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: ENQUIRIES & MODERATION */}
          {activeTab === "moderation" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-3">
                <h3 className="font-serif font-bold text-base text-[#2D2D2D]">
                  Assign Enquiry Specialists ({enquiries.length})
                </h3>
                {enquiries.length === 0 ? (
                  <AdminEmptyRow message="No customer enquiries awaiting specialist assignment." />
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {enquiries.map((eq) => {
                      const eid = Number(eq.enquiry_id);
                      const eqStatus = String(eq.status || "Pending");
                      return (
                        <div
                          key={eid}
                          className="p-3 rounded-xl bg-[#FAF7F3] flex flex-wrap items-center justify-between gap-2 text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-[#2D2D2D]">
                              ENQ #{eid} — {String(eq.subject || "General Enquiry")}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusTone(eqStatus)}`}
                              >
                                {eqStatus}
                              </span>
                              <span className="text-neutral-500 font-mono text-[10px]">
                                Specialist: {String(eq.assigned_specialist_id || "Unassigned")}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                            <input
                              type="text"
                              aria-label={`Specialist UUID for enquiry ${eid}`}
                              value={assignSpecialistMap[eid] ?? ""}
                              onChange={(e) =>
                                setAssignSpecialistMap((m) => ({ ...m, [eid]: e.target.value }))
                              }
                              placeholder="Specialist User UUID"
                              className="h-8 px-2.5 rounded-lg border border-neutral-200 bg-white text-xs flex-1 sm:w-56"
                            />
                            <button
                              type="button"
                              onClick={() => void handleAssignEnquiry(eid)}
                              className="px-3 h-8 rounded-lg bg-[#8B263E] text-white text-xs font-semibold cursor-pointer"
                            >
                              Assign
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-4">
                  <h3 className="font-serif font-bold text-base text-[#2D2D2D]">
                    Review Moderation ({reviews.length} total)
                  </h3>
                  <form onSubmit={handleModerateReview} className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <input
                        required
                        aria-label="Review ID"
                        type="number"
                        min={1}
                        value={modReviewId}
                        onChange={(e) => setModReviewId(e.target.value)}
                        placeholder="Review ID *"
                        className="w-28 h-9 px-2.5 rounded-lg border border-neutral-200 text-xs"
                      />
                      <select
                        aria-label="Moderation status"
                        value={modReviewStatus}
                        onChange={(e) =>
                          setModReviewStatus(
                            e.target.value as "Approved" | "Rejected" | "Published" | "Inactive"
                          )
                        }
                        className="h-9 px-2 rounded-lg border border-neutral-200 text-xs bg-white"
                      >
                        <option value="Approved">Approved</option>
                        <option value="Published">Published</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                      <button
                        type="submit"
                        className="px-4 h-9 rounded-lg bg-[#8B263E] text-white text-xs font-semibold cursor-pointer"
                      >
                        Moderate
                      </button>
                    </div>
                    <input
                      aria-label="Moderation remarks"
                      value={modReviewRemarks}
                      onChange={(e) => setModReviewRemarks(e.target.value)}
                      placeholder="Moderation remarks (optional)"
                      className="w-full h-9 px-2.5 rounded-lg border border-neutral-200 text-xs"
                    />
                  </form>
                  {reviews.length === 0 ? (
                    <AdminEmptyRow message="No reviews pending moderation." />
                  ) : (
                    <div className="space-y-1.5 text-xs max-h-52 overflow-y-auto">
                      {reviews.map((r) => {
                        const rid = Number(r.review_id);
                        const rStatus = String(r.status || "Pending");
                        return (
                          <div
                            key={String(r.review_id)}
                            className="p-2.5 rounded-lg bg-[#FAF7F3] flex flex-wrap items-center justify-between gap-2"
                          >
                            <span className="min-w-0 flex-1">
                              #{String(r.review_id)} • {String(r.rating)}★ —{" "}
                              {String(r.review_text || "")}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusTone(rStatus)}`}
                              >
                                {rStatus}
                              </span>
                              <button
                                type="button"
                                onClick={() => void handleQuickModerateReview(rid, "Approved")}
                                className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[11px] cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmAction({
                                    title: `Reject Review #${rid}?`,
                                    message: "This review will be marked Rejected and hidden from public pages.",
                                    confirmLabel: "Reject Review",
                                    run: () => handleQuickModerateReview(rid, "Rejected"),
                                  })
                                }
                                className="px-2 py-0.5 rounded border border-red-300 bg-white text-red-700 text-[11px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-4">
                  <h3 className="font-serif font-bold text-base text-[#2D2D2D]">
                    User Reports ({reports.length})
                  </h3>
                  {reports.length === 0 ? (
                    <AdminEmptyRow message="No user reports submitted." />
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto text-xs">
                      {reports.map((rp) => {
                        const rid = Number(rp.report_id);
                        const rpStatus = String(rp.status || "Pending");
                        return (
                          <div key={rid} className="p-3 rounded-lg bg-[#FAF7F3] space-y-1.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold">Report #{rid}</span>
                              <span
                                className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusTone(rpStatus)}`}
                              >
                                {rpStatus}
                              </span>
                            </div>
                            <p className="text-neutral-600">{String(rp.description || "")}</p>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void handleResolveReport(rid, "active", "resolved_action_taken")
                                }
                                className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] cursor-pointer"
                              >
                                Mark Active/Resolved
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void handleResolveReport(rid, "inactive", "dismissed")
                                }
                                className="px-2.5 py-1 rounded border border-neutral-300 bg-white text-[11px] cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <h4 className="text-xs font-bold uppercase text-neutral-500 pt-2">
                    Recent Moderation Audit Logs
                  </h4>
                  {modLogs.length === 0 ? (
                    <p className="text-[11px] text-neutral-400">No moderation logs recorded yet.</p>
                  ) : (
                    <div className="space-y-1 text-[11px] max-h-36 overflow-y-auto">
                      {modLogs.map((l) => (
                        <div key={String(l.log_id)} className="text-neutral-600">
                          <strong>{String(l.action)}</strong> — {String(l.remarks || "")}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-serif font-bold text-base text-[#2D2D2D]">
                      Bookings Oversight ({filteredBookings.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="text"
                        aria-label="Filter bookings"
                        value={moderationSearch}
                        onChange={(e) => setModerationSearch(e.target.value)}
                        placeholder="Search booking..."
                        className="h-8 px-2.5 rounded-lg border border-neutral-200 text-xs w-36"
                      />
                      <select
                        aria-label="Filter bookings by status"
                        value={bookingStatusFilter}
                        onChange={(e) => setBookingStatusFilter(e.target.value)}
                        className="h-8 px-2 rounded-lg border border-neutral-200 text-xs bg-white"
                      >
                        <option value="ALL">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                        <option value="Refunded">Refunded</option>
                      </select>
                    </div>
                  </div>
                  {filteredBookings.length === 0 ? (
                    <AdminEmptyRow message="No bookings match the selected filters." />
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                      {filteredBookings.map((b) => {
                        const bid = Number(b.booking_id);
                        const bookingStatus = String(
                          b.status_name ?? b.booking_status ?? b.status ?? "Pending"
                        );
                        return (
                          <div
                            key={bid}
                            className="p-3 rounded-lg bg-[#FAF7F3] flex flex-wrap items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold">Booking #{bid}</span> •{" "}
                              {formatInr(Number(b.total_amount ?? 0))}
                              <p className="text-neutral-500">
                                Status: {bookingStatus} • Date: {String(b.event_date || "TBD")}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <select
                                aria-label={`Status for booking ${bid}`}
                                value={bookingStatus}
                                onChange={(e) =>
                                  void handleUpdateBookingStatus(
                                    bid,
                                    e.target.value as
                                      | "Pending"
                                      | "Confirmed"
                                      | "In Progress"
                                      | "Completed"
                                      | "Cancelled"
                                      | "Refunded"
                                  )
                                }
                                className="px-2 py-1 rounded border border-neutral-300 bg-white text-[11px] font-semibold cursor-pointer"
                              >
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                                <option value="Refunded">Refunded</option>
                              </select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-3">
                  <h3 className="font-serif font-bold text-base text-[#2D2D2D]">
                    Quotes Moderation ({quotes.length})
                  </h3>
                  {quotes.length === 0 ? (
                    <AdminEmptyRow message="No concierge quotes require moderation." />
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto text-xs">
                      {quotes.map((q) => {
                        const qid = Number(q.quote_id);
                        const qStatus = String(q.status || "Draft");
                        return (
                          <div
                            key={qid}
                            className="p-3 rounded-lg bg-[#FAF7F3] flex flex-wrap items-center justify-between gap-2"
                          >
                            <div>
                              <span className="font-bold">Quote #{qid}</span> —{" "}
                              {String(q.package_name || "")}
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-neutral-500">
                                  {formatInr(Number(q.base_cost_inr ?? 0))}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${statusTone(qStatus)}`}
                                >
                                  {qStatus}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => void handleUpdateQuoteStatus(qid, "Approved")}
                                className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setConfirmAction({
                                    title: `Reject Quote #${qid}?`,
                                    message: `Quote "${String(q.package_name || qid)}" will be marked Rejected.`,
                                    confirmLabel: "Reject Quote",
                                    run: () => handleUpdateQuoteStatus(qid, "Rejected"),
                                  })
                                }
                                className="px-2.5 py-1 rounded border border-red-300 bg-white text-red-700 text-[11px] cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS & TEMPLATES */}
          {activeTab === "settings" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-4">
                <h3 className="font-serif font-bold text-base text-[#2D2D2D]">
                  Platform App Settings
                </h3>
                <form onSubmit={handleUpsertSetting} className="space-y-2.5">
                  <input required aria-label="Setting Key" value={settingKey} onChange={(e) => setSettingKey(e.target.value)} placeholder="Setting Key *" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  <div className="flex gap-2">
                    <input required aria-label="Setting Value" value={settingValue} onChange={(e) => setSettingValue(e.target.value)} placeholder="Value *" className="flex-1 h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                    <select aria-label="Setting Data Type" value={settingType} onChange={(e) => setSettingType(e.target.value as "text" | "number" | "boolean" | "json")} className="h-9 px-2 rounded-lg border border-neutral-200 text-xs bg-white">
                      <option value="text">text</option>
                      <option value="number">number</option>
                      <option value="boolean">boolean</option>
                      <option value="json">json</option>
                    </select>
                  </div>
                  <input aria-label="Setting Description" value={settingDesc} onChange={(e) => setSettingDesc(e.target.value)} placeholder="Description (optional)" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  <button type="submit" className="px-4 py-2 rounded-full bg-[#8B263E] text-white text-xs font-semibold cursor-pointer">
                    Save Setting
                  </button>
                </form>
                {settingsList.length === 0 ? (
                  <AdminEmptyRow message="No application settings saved yet." />
                ) : (
                  <div className="space-y-1.5 text-xs max-h-60 overflow-y-auto">
                    {settingsList.map((s) => (
                      <div key={String(s.setting_id)} className="p-2.5 rounded-lg bg-[#FAF7F3] flex justify-between gap-2">
                        <span className="font-mono font-semibold truncate">{String(s.setting_key)}</span>
                        <span className="text-neutral-600 truncate">{String(s.setting_value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5 sm:p-6 space-y-4">
                <h3 className="font-serif font-bold text-base text-[#2D2D2D]">
                  Notification Templates
                </h3>
                <form onSubmit={handleCreateTemplate} className="space-y-2.5">
                  <div className="flex gap-2">
                    <select aria-label="Template Channel" value={tplChannel} onChange={(e) => setTplChannel(e.target.value as "in_app" | "email" | "sms")} className="h-9 px-2 rounded-lg border border-neutral-200 text-xs bg-white">
                      <option value="in_app">In-App</option>
                      <option value="email">Email</option>
                      <option value="sms">SMS</option>
                    </select>
                    <input required aria-label="Template Name" value={tplName} onChange={(e) => setTplName(e.target.value)} placeholder="Template Name *" className="flex-1 h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  </div>
                  {tplChannel !== "sms" && (
                    <input aria-label="Template Subject" value={tplSubject} onChange={(e) => setTplSubject(e.target.value)} placeholder="Title or Subject" className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs" />
                  )}
                  <textarea required aria-label="Template Body" rows={2} value={tplBody} onChange={(e) => setTplBody(e.target.value)} placeholder="Template body *" className="w-full p-2.5 rounded-lg border border-neutral-200 text-xs" />
                  <button type="submit" className="px-4 py-2 rounded-full bg-[#8B263E] text-white text-xs font-semibold cursor-pointer">
                    Save Template
                  </button>
                </form>
                <div className="space-y-1.5 text-xs max-h-56 overflow-y-auto">
                  <p className="font-bold text-neutral-500">
                    In-App ({templates.inApp.length}) • Email ({templates.email.length}) • SMS ({templates.sms.length})
                  </p>
                  {[...templates.inApp, ...templates.email, ...templates.sms].length === 0 ? (
                    <AdminEmptyRow message="No notification templates configured." />
                  ) : (
                    [...templates.inApp, ...templates.email, ...templates.sms].map((t, i) => (
                      <div key={i} className="p-2 rounded-lg bg-[#FAF7F3] flex justify-between gap-2">
                        <span className="font-semibold truncate">{String(t.template_name)}</span>
                        <span className="text-neutral-500 shrink-0">{String(t.status || "Active")}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* CONFIRMATION DIALOG */}
      <Dialog
        isOpen={Boolean(confirmAction)}
        onClose={() => {
          if (!confirmBusy) {
            setConfirmError(null);
            setConfirmAction(null);
          }
        }}
        title={confirmAction?.title}
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600 leading-relaxed">{confirmAction?.message}</p>

          {confirmAction?.details && confirmAction.details.length > 0 && (
            <dl className="rounded-2xl bg-[#FAF7F3] border border-[#8B263E]/10 p-3.5 space-y-1.5 text-xs">
              {confirmAction.details.map((row) => (
                <div key={row.label} className="flex items-start justify-between gap-3">
                  <dt className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px] shrink-0">
                    {row.label}
                  </dt>
                  <dd className="text-[#2D2D2D] font-medium text-right break-all">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}

          {confirmAction?.warning && (
            <div
              role="note"
              className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 flex items-start gap-2 leading-relaxed"
            >
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{confirmAction.warning}</span>
            </div>
          )}

          {confirmError && (
            <div
              role="alert"
              className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium"
            >
              {confirmError}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={confirmBusy}
            onClick={() => {
              setConfirmError(null);
              setConfirmAction(null);
            }}
            className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={confirmBusy}
            onClick={async () => {
              if (!confirmAction || confirmBusy) return;
              setConfirmBusy(true);
              setConfirmError(null);
              const result = await confirmAction.run();
              setConfirmBusy(false);
              if (result !== false) {
                setConfirmAction(null);
              }
            }}
            className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {confirmBusy && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmBusy ? "Processing..." : confirmAction?.confirmLabel}</span>
          </button>
        </div>
      </Dialog>
    </div>
  );
}
