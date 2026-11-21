"use client";

import React, { Suspense, useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@we-arrange/api-client";
import { supabase } from "@we-arrange/auth";
import {
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  Layers,
  Loader2,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  RefreshCw,
  Star,
  Trash2,
  UserCheck,
} from "lucide-react";

type VendorTab = "overview" | "profile" | "catalog" | "bookings";
type VendorResource =
  | "services"
  | "pricing"
  | "packages"
  | "availability"
  | "gallery"
  | "videos"
  | "faq"
  | "social-links"
  | "team";

interface AuthMeDTO {
  id: string;
  email: string;
  fullName: string | null;
  role: string | null;
  vendorId: number | null;
  isActiveAdmin?: boolean;
}

interface VendorCategoryDTO {
  category_id?: number;
  category_name: string;
  slug: string;
}

interface VendorAnalyticsDTO {
  vendorId: number;
  enquiriesCount: number;
  bookingsCount: number;
  totalBookingValueInr: number;
  approvedReviewsCount: number;
  averageRating: number;
  currency: string;
}

interface VendorProfileBundle {
  vendor: {
    vendor_id: number;
    vendor_name: string;
    slug: string | null;
    description: string | null;
    logo: string | null;
    cover_image: string | null;
    category_id: number | null;
    is_verified: boolean | null;
    status: string | null;
    rating: number | null;
  };
  contacts: Array<{
    contact_id: number;
    contact_person: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  }>;
  services: Array<Record<string, unknown>>;
  pricing: Array<Record<string, unknown>>;
  packages: Array<Record<string, unknown>>;
  availability: Array<Record<string, unknown>>;
  gallery: Array<Record<string, unknown>>;
  videos: Array<Record<string, unknown>>;
  faqs: Array<Record<string, unknown>>;
  socialLinks: Array<Record<string, unknown>>;
  team: Array<Record<string, unknown>>;
}

const FALLBACK_CATEGORIES: VendorCategoryDTO[] = [
  { slug: "photographers", category_name: "Photographers" },
  { slug: "bridal-makeup", category_name: "Bridal Makeup" },
  { slug: "decorators", category_name: "Decorators & Florists" },
  { slug: "catering", category_name: "Catering" },
  { slug: "mehendi", category_name: "Mehendi" },
];

const RESOURCE_META: Array<{ key: VendorResource; label: string; pk: string }> = [
  { key: "services", label: "Services", pk: "service_id" },
  { key: "pricing", label: "Pricing", pk: "pricing_id" },
  { key: "packages", label: "Packages", pk: "package_id" },
  { key: "availability", label: "Availability", pk: "availability_id" },
  { key: "gallery", label: "Gallery", pk: "gallery_id" },
  { key: "videos", label: "Videos", pk: "video_id" },
  { key: "faq", label: "FAQ", pk: "faq_id" },
  { key: "social-links", label: "Social Links", pk: "social_id" },
  { key: "team", label: "Team", pk: "team_id" },
];

function sanitizeRedirect(raw: string | null): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/vendor";
  }
  return raw === "/login" || raw === "/register" || raw.startsWith("/vendor/login") || raw.startsWith("/vendor/register")
    ? "/vendor"
    : raw;
}

function formatInr(val: number | null | undefined): string {
  if (val === null || val === undefined || Number.isNaN(Number(val))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(val));
}

function VendorPortalContent({
  initialAuthMode = "login",
}: {
  initialAuthMode?: "login" | "register";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const paramMode = searchParams.get("mode");
  const resolvedInitialMode =
    paramMode === "register" || paramMode === "signup" ? "register" : initialAuthMode;
  const redirectTarget = sanitizeRedirect(searchParams.get("redirect"));
  const urlError = searchParams.get("error");

  const [authUser, setAuthUser] = useState<AuthMeDTO | null>(null);
  const [authMode, setAuthMode] = useState<"login" | "register">(resolvedInitialMode);
  const [checkingSession, setCheckingSession] = useState(true);
  const [categories, setCategories] = useState<VendorCategoryDTO[]>(FALLBACK_CATEGORIES);

  // Auth form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regBusinessName, setRegBusinessName] = useState("");
  const [regCategorySlug, setRegCategorySlug] = useState("photographers");
  const [regCity, setRegCity] = useState("Hyderabad");
  const [regDescription, setRegDescription] = useState("");
  const [regWebsite, setRegWebsite] = useState("");
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Dashboard states
  const [activeTab, setActiveTab] = useState<VendorTab>("overview");
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [analytics, setAnalytics] = useState<VendorAnalyticsDTO | null>(null);
  const [bundle, setBundle] = useState<VendorProfileBundle | null>(null);
  const [bookings, setBookings] = useState<Array<Record<string, unknown>>>([]);
  const [enquiries, setEnquiries] = useState<Array<Record<string, unknown>>>([]);
  const [quotes, setQuotes] = useState<Array<Record<string, unknown>>>([]);

  // Profile & contacts form states
  const [vendorName, setVendorName] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactAddress, setContactAddress] = useState("");

  // Catalog sub-resource states
  const [activeResource, setActiveResource] = useState<VendorResource>("services");
  const [resourceItems, setResourceItems] = useState<Array<Record<string, unknown>>>([]);
  const [loadingResource, setLoadingResource] = useState(false);

  // Generic sub-resource create inputs
  const [f1, setF1] = useState("");
  const [f2, setF2] = useState("");
  const [f3, setF3] = useState("");
  const [fBool, setFBool] = useState(false);

  // Vendor quote creation states
  const [quoteEnquiryId, setQuoteEnquiryId] = useState<number | null>(null);
  const [quotePackageName, setQuotePackageName] = useState("");
  const [quoteBaseCost, setQuoteBaseCost] = useState("");
  const [quoteCateringIncluded, setQuoteCateringIncluded] = useState(false);
  const [quoteInclusions, setQuoteInclusions] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteStatus, setQuoteStatus] = useState<"Published" | "Draft">("Published");
  const [submittingQuote, setSubmittingQuote] = useState(false);

  useEffect(() => {
    setAuthMode(resolvedInitialMode);
  }, [resolvedInitialMode]);

  useEffect(() => {
    if (urlError === "unauthorized_role") {
      setError("Access denied: A vendor account is required to access the Vendor Portal.");
    }
  }, [urlError]);

  useEffect(() => {
    let active = true;
    void apiClient
      .get<VendorCategoryDTO[]>("/api/vendors/categories", { retryOn401: false })
      .then((res) => {
        if (active && res.ok && Array.isArray(res.data) && res.data.length > 0) {
          setCategories(res.data);
          setRegCategorySlug((prev) =>
            res.data!.some((cat) => cat.slug === prev) ? prev : res.data![0]!.slug
          );
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const loadResource = useCallback(async (resource: VendorResource) => {
    setLoadingResource(true);
    const res = await apiClient.get<Array<Record<string, unknown>>>(
      `/api/vendor/me/${resource}`
    );
    if (res.ok && Array.isArray(res.data)) {
      setResourceItems(res.data);
    } else if (res.error) {
      setError(res.error);
    }
    setLoadingResource(false);
  }, []);

  const loadVendorDashboard = useCallback(async () => {
    setLoadingData(true);
    setError(null);

    const [analyticsRes, profileRes, bookingsRes, enquiriesRes, quotesRes] = await Promise.all([
      apiClient.get<VendorAnalyticsDTO>("/api/analytics/vendor", { retryOn401: false }),
      apiClient.get<VendorProfileBundle>("/api/vendor/me", { retryOn401: false }),
      apiClient.get<Array<Record<string, unknown>>>("/api/bookings", {
        query: { limit: 30 },
        retryOn401: false,
      }),
      apiClient.get<Array<Record<string, unknown>>>("/api/enquiries", {
        query: { limit: 30 },
        retryOn401: false,
      }),
      apiClient.get<Array<Record<string, unknown>>>("/api/vendor/me/quotes", {
        retryOn401: false,
      }),
    ]);

    if (analyticsRes.ok && analyticsRes.data) setAnalytics(analyticsRes.data);
    if (bookingsRes.ok && Array.isArray(bookingsRes.data)) setBookings(bookingsRes.data);
    if (enquiriesRes.ok && Array.isArray(enquiriesRes.data)) setEnquiries(enquiriesRes.data);
    if (quotesRes.ok && Array.isArray(quotesRes.data)) setQuotes(quotesRes.data);

    if (profileRes.ok && profileRes.data) {
      const p = profileRes.data;
      setBundle(p);
      setVendorName(p.vendor.vendor_name || "");
      setDescription(p.vendor.description || "");
      setLogo(p.vendor.logo || "");
      setCoverImage(p.vendor.cover_image || "");

      const c = p.contacts?.[0];
      setContactPerson(c?.contact_person || "");
      setContactPhone(c?.phone || "");
      setContactEmail(c?.email || "");
      setContactAddress(c?.address || "");
    } else if (profileRes.error) {
      setError(profileRes.error);
    }

    setLoadingData(false);
  }, []);

  const bootstrapSession = useCallback(async () => {
    setCheckingSession(true);
    const meRes = await apiClient.get<AuthMeDTO>("/api/auth/me", { retryOn401: false });
    if (meRes.ok && meRes.data) {
      if (meRes.data.role !== "vendor" && !meRes.data.isActiveAdmin) {
        await apiClient.logout(false).catch(() => undefined);
        await supabase.auth.signOut().catch(() => undefined);
        setAuthUser(null);
        setError("Access denied: A vendor account is required to access the Vendor Portal.");
        setCheckingSession(false);
        return;
      }

      setAuthUser(meRes.data);
      if (pathname === "/login" || pathname === "/register" || pathname?.startsWith("/vendor/login") || pathname?.startsWith("/vendor/register")) {
        router.replace("/vendor");
        router.refresh();
        return;
      }

      await loadVendorDashboard();
      if (meRes.data.vendorId) {
        await loadResource("services");
      }
    } else {
      setAuthUser(null);
    }
    setCheckingSession(false);
  }, [loadVendorDashboard, loadResource, pathname, redirectTarget, router]);

  useEffect(() => {
    void bootstrapSession();
  }, [bootstrapSession]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAuth(true);
    setError(null);
    setSuccess(null);

    const normalizedEmail = loginEmail.trim().toLowerCase();
    const res = await apiClient.post<{ user: AuthMeDTO }>("/api/vendor/auth/login", {
      email: normalizedEmail,
      password: loginPassword,
      portal: "vendor",
    });

    if (!res.ok) {
      setSubmittingAuth(false);
      setError(res.error || "Sign in failed.");
      return;
    }

    await supabase.auth
      .signInWithPassword({
        email: normalizedEmail,
        password: loginPassword,
      })
      .catch(() => undefined);

    setSubmittingAuth(false);
    if (pathname === "/login" || pathname === "/register" || pathname?.startsWith("/vendor/login") || pathname?.startsWith("/vendor/register")) {
      router.replace("/vendor");
      router.refresh();
      return;
    }
    await bootstrapSession();
  };

  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingAuth(true);
    setError(null);
    setSuccess(null);

    const normalizedEmail = regEmail.trim().toLowerCase();
    const res = await apiClient.post<{
      userId: string;
      requiresEmailConfirmation?: boolean;
    }>("/api/vendor/auth/register", {
      accountType: "vendor",
      fullName: regFullName.trim(),
      email: normalizedEmail,
      password: regPassword,
      ...(regPhone.trim() ? { phone: regPhone.trim() } : {}),
      businessName: regBusinessName.trim(),
      categorySlug: regCategorySlug.trim(),
      ...(regCity.trim() ? { city: regCity.trim() } : {}),
      ...(regDescription.trim() ? { description: regDescription.trim() } : {}),
      ...(regWebsite.trim() ? { website: regWebsite.trim() } : {}),
    });

    if (!res.ok) {
      setSubmittingAuth(false);
      setError(res.error || "Vendor registration failed.");
      return;
    }

    if (res.data?.requiresEmailConfirmation === false) {
      await apiClient
        .post("/api/vendor/auth/login", {
          email: normalizedEmail,
          password: regPassword,
          portal: "vendor",
        })
        .catch(() => undefined);
      await supabase.auth
        .signInWithPassword({
          email: normalizedEmail,
          password: regPassword,
        })
        .catch(() => undefined);

      setSubmittingAuth(false);
      router.replace(redirectTarget);
      router.refresh();
      return;
    }

    setSubmittingAuth(false);
    setSuccess("Vendor registration submitted! You can now sign in.");
    setAuthMode("login");
    setLoginEmail(normalizedEmail);
  };

  const handleLogout = async () => {
    await apiClient.logout(false);
    await supabase.auth.signOut().catch(() => undefined);
    setAuthUser(null);
    setBundle(null);
    setAnalytics(null);
    setBookings([]);
    setEnquiries([]);
    setQuotes([]);
    router.replace("/vendor/login");
    router.refresh();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const res = await apiClient.patch("/api/vendor/me", {
      vendorName: vendorName.trim(),
      description: description.trim(),
      logo: logo.trim() || null,
      coverImage: coverImage.trim() || null,
    });
    if (!res.ok) {
      setError(res.error || "Failed to update vendor profile.");
      return;
    }
    setSuccess("Vendor profile updated.");
    await loadVendorDashboard();
  };

  const handleSaveContacts = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const res = await apiClient.put("/api/vendor/me/contacts", {
      ...(contactPerson.trim() ? { contactPerson: contactPerson.trim() } : {}),
      ...(contactPhone.trim() ? { phone: contactPhone.trim() } : {}),
      ...(contactEmail.trim() ? { email: contactEmail.trim() } : {}),
      ...(contactAddress.trim() ? { address: contactAddress.trim() } : {}),
    });
    if (!res.ok) {
      setError(res.error || "Failed to save contact information.");
      return;
    }
    setSuccess("Business contacts saved.");
    await loadVendorDashboard();
  };

  const handleSwitchResource = (resKey: VendorResource) => {
    setActiveResource(resKey);
    setF1("");
    setF2("");
    setF3("");
    setFBool(false);
    void loadResource(resKey);
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    let payload: Record<string, unknown> = {};
    switch (activeResource) {
      case "services":
        payload = { serviceName: f1.trim(), ...(f2.trim() ? { description: f2.trim() } : {}) };
        break;
      case "pricing":
        payload = {
          serviceName: f1.trim(),
          price: Number(f2),
          ...(f3.trim() ? { priceUnit: f3.trim() } : {}),
        };
        break;
      case "packages":
        payload = {
          packageName: f1.trim(),
          price: Number(f2),
          ...(f3.trim() ? { description: f3.trim() } : {}),
        };
        break;
      case "availability":
        payload = { availableFrom: f1, availableTo: f2, isBooked: fBool };
        break;
      case "gallery":
        payload = { mediaUrl: f1.trim(), isCover: fBool, sortOrder: Number(f2 || 0) };
        break;
      case "videos":
        payload = {
          mediaUrl: f1.trim(),
          ...(f2.trim() ? { title: f2.trim() } : {}),
          sortOrder: Number(f3 || 0),
        };
        break;
      case "faq":
        payload = { question: f1.trim(), answer: f2.trim(), sortOrder: Number(f3 || 0) };
        break;
      case "social-links":
        payload = { platform: f1.trim(), url: f2.trim() };
        break;
      case "team":
        payload = { name: f1.trim(), role: f2.trim(), ...(f3.trim() ? { photo: f3.trim() } : {}) };
        break;
    }

    const res = await apiClient.post(`/api/vendor/me/${activeResource}`, payload);
    if (!res.ok) {
      setError(res.error || `Failed to add ${activeResource} item.`);
      return;
    }

    setF1("");
    setF2("");
    setF3("");
    setFBool(false);
    setSuccess(`Added ${activeResource} record.`);
    await loadResource(activeResource);
  };

  const handleDeleteResource = async (id: number) => {
    setError(null);
    const res = await apiClient.delete(`/api/vendor/me/${activeResource}`, {
      query: { id },
    });
    if (!res.ok) {
      setError(res.error || "Failed to delete item.");
      return;
    }
    await loadResource(activeResource);
  };

  const handleCreateQuote = async (e: React.FormEvent, enquiryId: number) => {
    e.preventDefault();
    setSubmittingQuote(true);
    setError(null);
    setSuccess(null);

    const inclusionsList = quoteInclusions
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await apiClient.post("/api/vendor/me/quotes", {
      enquiryId,
      packageName: quotePackageName.trim(),
      baseCostInr: Number(quoteBaseCost),
      cateringIncluded: quoteCateringIncluded,
      inclusions: inclusionsList,
      ...(quoteNotes.trim() ? { notes: quoteNotes.trim() } : {}),
      status: quoteStatus,
    });

    setSubmittingQuote(false);
    if (!res.ok) {
      setError(res.error || "Failed to create quote.");
      return;
    }

    setQuoteEnquiryId(null);
    setQuotePackageName("");
    setQuoteBaseCost("");
    setQuoteCateringIncluded(false);
    setQuoteInclusions("");
    setQuoteNotes("");
    setQuoteStatus("Published");
    setSuccess(`Quote submitted for enquiry ENQ #${enquiryId}.`);
    await loadVendorDashboard();
  };

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-[#FAF7F3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-7 h-7 animate-spin text-[#8B263E]" />
          <p className="text-xs uppercase tracking-widest text-[#8B263E] font-semibold">
            Loading Vendor Workspace...
          </p>
        </div>
      </main>
    );
  }

  if (!authUser) {
    return (
      <main className="min-h-screen bg-[#FAF7F3] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl border border-[#8B263E]/15 p-8 shadow-sm space-y-6">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#C6934A]">
              YouMarriageWeArrange Partners
            </p>
            <h1 className="mt-1 font-serif text-3xl font-bold text-[#2D2D2D]">
              Vendor Portal
            </h1>
            <p className="mt-1 text-xs text-neutral-500">
              Sign in or register your wedding business to manage services, packages, and bookings.
            </p>
          </div>

          <div className="flex rounded-full bg-[#F5EEE7] p-1">
            <button
              type="button"
              onClick={() => setAuthMode("login")}
              className={`flex-1 py-2 rounded-full text-xs font-bold cursor-pointer ${
                authMode === "login" ? "bg-[#8B263E] text-white" : "text-neutral-600"
              }`}
            >
              Partner Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthMode("register")}
              className={`flex-1 py-2 rounded-full text-xs font-bold cursor-pointer ${
                authMode === "register" ? "bg-[#8B263E] text-white" : "text-neutral-600"
              }`}
            >
              Register Business
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
              {success}
            </div>
          )}

          {authMode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Partner email"
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 text-sm"
              />
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full h-11 px-4 rounded-xl border border-neutral-200 text-sm"
              />
              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full h-11 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {submittingAuth ? "Signing In..." : "Sign In to Vendor Portal"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterVendor} className="space-y-3">
              <input
                type="text"
                required
                minLength={2}
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Owner Full Name *"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs"
              />
              <input
                type="text"
                required
                minLength={2}
                value={regBusinessName}
                onChange={(e) => setRegBusinessName(e.target.value)}
                placeholder="Business Name *"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={regCategorySlug}
                  onChange={(e) => setRegCategorySlug(e.target.value)}
                  className="h-10 px-2 rounded-xl border border-neutral-200 text-xs bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat.slug} value={cat.slug}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={regCity}
                  onChange={(e) => setRegCity(e.target.value)}
                  placeholder="City"
                  className="h-10 px-3 rounded-xl border border-neutral-200 text-xs"
                />
              </div>
              <input
                type="email"
                required
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Business Email *"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs"
              />
              <input
                type="password"
                required
                minLength={8}
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Password (min 8 chars) *"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs"
              />
              <input
                type="text"
                value={regPhone}
                onChange={(e) => setRegPhone(e.target.value)}
                placeholder="Phone (optional)"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs"
              />
              <input
                type="url"
                value={regWebsite}
                onChange={(e) => setRegWebsite(e.target.value)}
                placeholder="Website https://... (optional)"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs"
              />
              <textarea
                rows={2}
                value={regDescription}
                onChange={(e) => setRegDescription(e.target.value)}
                placeholder="Business summary (optional)"
                className="w-full p-2.5 rounded-xl border border-neutral-200 text-xs"
              />
              <button
                type="submit"
                disabled={submittingAuth}
                className="w-full h-11 rounded-full bg-[#8B263E] text-white text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                {submittingAuth ? "Submitting..." : "Create Vendor Account"}
              </button>
            </form>
          )}
        </div>
      </main>
    );
  }

  const activeMeta = RESOURCE_META.find((r) => r.key === activeResource)!;

  return (
    <main className="min-h-screen bg-[#FAF7F3]">
      {/* TOP BAR */}
      <header className="bg-white border-b border-[#8B263E]/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C6934A]">
              YouMarriageWeArrange Vendor Partner Desk
            </p>
            <h1 className="font-serif text-2xl font-bold text-[#2D2D2D]">
              {bundle?.vendor.vendor_name || authUser.fullName || authUser.email}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {bundle?.vendor.is_verified ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Partner</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
                Status: {bundle?.vendor.status || "Pending Verification"}
              </span>
            )}
            <button
              type="button"
              onClick={() => void loadVendorDashboard()}
              className="px-3.5 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-600 hover:text-[#8B263E] inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="px-4 py-2 rounded-full bg-[#F5EEE7] text-[#8B263E] text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {!authUser.vendorId && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            Authenticated as <strong>{authUser.email}</strong> (role: {authUser.role || "user"}).
            Your account does not yet have a linked vendor listing; contact Admin support to link your business profile.
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
            {success}
          </div>
        )}

        {/* NAV TABS */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview" as const, label: "Overview & KPIs", icon: Star },
            { id: "profile" as const, label: "Profile & Contacts", icon: Briefcase },
            { id: "catalog" as const, label: "Portfolio & Catalog", icon: Layers },
            { id: "bookings" as const, label: "Bookings & Enquiries", icon: CalendarCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#8B263E] text-white shadow-sm"
                    : "bg-white text-neutral-700 border border-neutral-200 hover:border-[#8B263E]/40"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5">
              <p className="text-[11px] font-bold uppercase text-neutral-500">Enquiries</p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#2D2D2D]">
                {analytics?.enquiriesCount ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5">
              <p className="text-[11px] font-bold uppercase text-neutral-500">Bookings</p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#2D2D2D]">
                {analytics?.bookingsCount ?? 0}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5">
              <p className="text-[11px] font-bold uppercase text-neutral-500">Booking Value</p>
              <p className="mt-2 font-serif text-2xl font-bold text-[#8B263E]">
                {formatInr(analytics?.totalBookingValueInr ?? 0)}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-5">
              <p className="text-[11px] font-bold uppercase text-neutral-500">Approved Rating</p>
              <p className="mt-2 font-serif text-3xl font-bold text-[#2D2D2D]">
                {analytics?.averageRating ? `${analytics.averageRating} ★` : "—"}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {analytics?.approvedReviewsCount ?? 0} verified review(s)
              </p>
            </div>
          </div>
        )}

        {/* TAB: PROFILE & CONTACTS */}
        {activeTab === "profile" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <form
              onSubmit={handleSaveProfile}
              className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-4"
            >
              <h2 className="font-serif text-lg font-bold text-[#2D2D2D] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#8B263E]" />
                <span>Business Profile</span>
              </h2>
              <input
                type="text"
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                placeholder="Vendor Business Name"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
              />
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Business overview, style & specialties..."
                className="w-full p-3 rounded-xl border border-neutral-200 text-sm"
              />
              <input
                type="url"
                value={logo}
                onChange={(e) => setLogo(e.target.value)}
                placeholder="Logo image URL (https://...)"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs"
              />
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Cover image URL (https://...)"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-xs"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-[#8B263E] text-white text-xs font-semibold cursor-pointer"
              >
                Save Vendor Profile
              </button>
            </form>

            <form
              onSubmit={handleSaveContacts}
              className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-4"
            >
              <h2 className="font-serif text-lg font-bold text-[#2D2D2D] flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#8B263E]" />
                <span>Primary Business Contacts</span>
              </h2>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Contact Person Name"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
              />
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="Contact Phone"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
              />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="Contact Email"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
              />
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                placeholder="Studio / Office Address"
                className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-[#8B263E] text-white text-xs font-semibold cursor-pointer"
              >
                Save Contacts
              </button>
            </form>
          </div>
        )}

        {/* TAB: CATALOG SUB-RESOURCES */}
        {activeTab === "catalog" && (
          <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-5">
            <p className="text-xs text-neutral-500">
              Manage your vendor services, pricing tiers, packages, availability, gallery, FAQs, social links, and team here. Platform wedding venues are curated separately by YMWA Concierge & Admin.
            </p>

            <div className="flex flex-wrap gap-2">
              {RESOURCE_META.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleSwitchResource(item.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                    activeResource === item.key
                      ? "bg-[#8B263E] text-white"
                      : "bg-[#FAF7F3] text-neutral-700 hover:bg-[#F5EEE7]"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Dynamic Create Form per sub-resource */}
            <form onSubmit={handleCreateResource} className="p-4 rounded-xl bg-[#FAF7F3] space-y-3">
              <p className="text-xs font-bold uppercase text-[#8B263E]">
                Add {activeMeta.label} Entry
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {activeResource === "services" && (
                  <>
                    <input required value={f1} onChange={(e) => setF1(e.target.value)} placeholder="Service name *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                    <input value={f2} onChange={(e) => setF2(e.target.value)} placeholder="Description" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:col-span-2" />
                  </>
                )}
                {activeResource === "pricing" && (
                  <>
                    <input required value={f1} onChange={(e) => setF1(e.target.value)} placeholder="Service name *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                    <input required type="number" min={0} value={f2} onChange={(e) => setF2(e.target.value)} placeholder="Price (INR) *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                    <input value={f3} onChange={(e) => setF3(e.target.value)} placeholder="Unit (e.g., per day)" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                  </>
                )}
                {activeResource === "packages" && (
                  <>
                    <input required value={f1} onChange={(e) => setF1(e.target.value)} placeholder="Package name *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                    <input required type="number" min={0} value={f2} onChange={(e) => setF2(e.target.value)} placeholder="Price (INR) *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                    <input value={f3} onChange={(e) => setF3(e.target.value)} placeholder="Inclusions summary" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                  </>
                )}
                {activeResource === "availability" && (
                  <>
                    <input required type="date" value={f1} onChange={(e) => setF1(e.target.value)} className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                    <input required type="date" value={f2} onChange={(e) => setF2(e.target.value)} className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                    <label className="flex items-center gap-2 text-xs font-medium px-2">
                      <input type="checkbox" checked={fBool} onChange={(e) => setFBool(e.target.checked)} />
                      <span>Mark as Booked / Unavailable</span>
                    </label>
                  </>
                )}
                {activeResource === "gallery" && (
                  <>
                    <input required type="url" value={f1} onChange={(e) => setF1(e.target.value)} placeholder="Image URL (https://...) *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:col-span-2" />
                    <label className="flex items-center gap-2 text-xs font-medium px-2">
                      <input type="checkbox" checked={fBool} onChange={(e) => setFBool(e.target.checked)} />
                      <span>Set as Cover</span>
                    </label>
                  </>
                )}
                {activeResource === "videos" && (
                  <>
                    <input required type="url" value={f1} onChange={(e) => setF1(e.target.value)} placeholder="Video URL (https://...) *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:col-span-2" />
                    <input value={f2} onChange={(e) => setF2(e.target.value)} placeholder="Video title" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                  </>
                )}
                {activeResource === "faq" && (
                  <>
                    <input required value={f1} onChange={(e) => setF1(e.target.value)} placeholder="Question *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                    <input required value={f2} onChange={(e) => setF2(e.target.value)} placeholder="Answer *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:col-span-2" />
                  </>
                )}
                {activeResource === "social-links" && (
                  <>
                    <input required value={f1} onChange={(e) => setF1(e.target.value)} placeholder="Platform (instagram, youtube...) *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                    <input required type="url" value={f2} onChange={(e) => setF2(e.target.value)} placeholder="Profile URL (https://...) *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs sm:col-span-2" />
                  </>
                )}
                {activeResource === "team" && (
                  <>
                    <input required value={f1} onChange={(e) => setF1(e.target.value)} placeholder="Member Name *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                    <input required value={f2} onChange={(e) => setF2(e.target.value)} placeholder="Role *" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                    <input type="url" value={f3} onChange={(e) => setF3(e.target.value)} placeholder="Photo URL (optional)" className="h-9 px-3 rounded-lg border border-neutral-200 bg-white text-xs" />
                  </>
                )}
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-full bg-[#8B263E] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add {activeMeta.label}</span>
              </button>
            </form>

            {loadingResource ? (
              <p className="text-xs text-neutral-400">Loading {activeMeta.label}...</p>
            ) : resourceItems.length === 0 ? (
              <p className="text-xs text-neutral-500">
                No {activeMeta.label.toLowerCase()} records added yet.
              </p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {resourceItems.map((row) => {
                  const idVal = Number(row[activeMeta.pk]);
                  return (
                    <div
                      key={idVal || JSON.stringify(row)}
                      className="py-3 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-semibold text-[#2D2D2D] truncate">
                          {String(
                            row.service_name ||
                              row.package_name ||
                              row.question ||
                              row.name ||
                              row.platform ||
                              row.title ||
                              row.media_url ||
                              row.video_url ||
                              `${row.available_from} → ${row.available_to}`
                          )}
                        </p>
                        <p className="text-neutral-500 truncate">
                          {row.price !== undefined
                            ? `${formatInr(Number(row.price))} ${row.price_unit || ""}`
                            : String(
                                row.description ||
                                  row.answer ||
                                  row.role ||
                                  row.url ||
                                  (row.is_booked !== undefined
                                    ? row.is_booked
                                      ? "Booked"
                                      : "Available"
                                    : row.media_url || "")
                              )}
                        </p>
                      </div>
                      {Number.isInteger(idVal) && idVal > 0 && (
                        <button
                          type="button"
                          onClick={() => void handleDeleteResource(idVal)}
                          className="p-1.5 text-neutral-400 hover:text-red-600 cursor-pointer shrink-0"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB: BOOKINGS & ENQUIRIES */}
        {activeTab === "bookings" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-3">
              <h2 className="font-serif text-lg font-bold text-[#2D2D2D] flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-[#8B263E]" />
                <span>Linked Bookings ({bookings.length})</span>
              </h2>
              {bookings.length === 0 ? (
                <p className="text-xs text-neutral-500">No bookings assigned to your business yet.</p>
              ) : (
                <div className="space-y-2">
                  {bookings.map((b) => (
                    <div
                      key={String(b.booking_id)}
                      className="p-3 rounded-xl bg-[#FAF7F3] flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#2D2D2D]">
                            Booking #{String(b.booking_id)}
                          </p>
                          <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-bold text-[#8B263E]">
                            {String(b.status_name || "Pending")}
                          </span>
                        </div>
                        <p className="text-neutral-500">
                          Event: {String(b.event_date || "TBD")} • Guests:{" "}
                          {String(b.guest_count ?? "TBD")}
                        </p>
                      </div>
                      <span className="font-bold text-[#8B263E]">
                        {formatInr(Number(b.total_amount))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-3">
              <h2 className="font-serif text-lg font-bold text-[#2D2D2D] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#8B263E]" />
                <span>Enquiries & Quotes ({enquiries.length})</span>
              </h2>
              {enquiries.length === 0 ? (
                <p className="text-xs text-neutral-500">No enquiries available in your scope.</p>
              ) : (
                <div className="space-y-3">
                  {enquiries.map((eq) => {
                    const enqId = Number(eq.enquiry_id);
                    const enqQuotes = quotes.filter((q) => Number(q.enquiry_id) === enqId);
                    const isFormOpen = quoteEnquiryId === enqId;

                    return (
                      <div
                        key={String(eq.enquiry_id)}
                        className="p-3.5 rounded-xl bg-[#FAF7F3] text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#2D2D2D]">
                            ENQ #{String(eq.enquiry_id)} — {String(eq.subject || "Enquiry")}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white text-[10px] font-bold">
                            {String(eq.status || "Pending")}
                          </span>
                        </div>
                        <p className="text-neutral-500 line-clamp-2">{String(eq.message || "")}</p>

                        {enqQuotes.length > 0 && (
                          <div className="space-y-1 pt-1 border-t border-[#8B263E]/10">
                            {enqQuotes.map((q) => (
                              <div
                                key={String(q.quote_id)}
                                className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg"
                              >
                                <span className="font-semibold text-[#2D2D2D]">
                                  {String(q.package_name || "Quote")}
                                </span>
                                <span className="text-[#8B263E] font-bold">
                                  {formatInr(Number(q.base_cost_inr))} • {String(q.status || "Draft")}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div>
                          <button
                            type="button"
                            onClick={() =>
                              setQuoteEnquiryId(isFormOpen ? null : enqId)
                            }
                            className="px-3 py-1.5 rounded-full bg-white border border-[#8B263E]/20 text-[#8B263E] text-[11px] font-bold cursor-pointer hover:bg-[#F5EEE7]"
                          >
                            {isFormOpen ? "Cancel Quote" : "Submit Quote"}
                          </button>
                        </div>

                        {isFormOpen && (
                          <form
                            onSubmit={(e) => void handleCreateQuote(e, enqId)}
                            className="p-3 rounded-lg bg-white border border-[#8B263E]/15 space-y-2"
                          >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <input
                                required
                                minLength={2}
                                value={quotePackageName}
                                onChange={(e) => setQuotePackageName(e.target.value)}
                                placeholder="Package name *"
                                className="h-8 px-2.5 rounded-lg border border-neutral-200 text-xs"
                              />
                              <input
                                required
                                type="number"
                                min={0}
                                value={quoteBaseCost}
                                onChange={(e) => setQuoteBaseCost(e.target.value)}
                                placeholder="Base cost (INR) *"
                                className="h-8 px-2.5 rounded-lg border border-neutral-200 text-xs"
                              />
                            </div>
                            <input
                              value={quoteInclusions}
                              onChange={(e) => setQuoteInclusions(e.target.value)}
                              placeholder="Inclusions (comma separated)"
                              className="w-full h-8 px-2.5 rounded-lg border border-neutral-200 text-xs"
                            />
                            <input
                              value={quoteNotes}
                              onChange={(e) => setQuoteNotes(e.target.value)}
                              placeholder="Notes (optional)"
                              className="w-full h-8 px-2.5 rounded-lg border border-neutral-200 text-xs"
                            />
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <label className="flex items-center gap-1.5 text-[11px]">
                                <input
                                  type="checkbox"
                                  checked={quoteCateringIncluded}
                                  onChange={(e) => setQuoteCateringIncluded(e.target.checked)}
                                />
                                <span>Catering included</span>
                              </label>
                              <select
                                value={quoteStatus}
                                onChange={(e) =>
                                  setQuoteStatus(e.target.value as "Published" | "Draft")
                                }
                                className="h-8 px-2 rounded-lg border border-neutral-200 text-[11px] bg-white"
                              >
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                              </select>
                              <button
                                type="submit"
                                disabled={submittingQuote}
                                className="px-3.5 py-1.5 rounded-full bg-[#8B263E] text-white text-[11px] font-bold cursor-pointer disabled:opacity-50"
                              >
                                {submittingQuote ? "Saving..." : "Create Quote"}
                              </button>
                            </div>
                          </form>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export function VendorPortalClient({
  initialAuthMode = "login",
}: {
  initialAuthMode?: "login" | "register";
}) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FAF7F3] flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin text-[#8B263E]" />
        </main>
      }
    >
      <VendorPortalContent initialAuthMode={initialAuthMode} />
    </Suspense>
  );
}
