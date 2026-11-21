"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "@we-arrange/api-client";
import { Skeleton } from "../Skeleton";
import {
  CalendarCheck,
  CheckCircle2,
  CreditCard,
  FileText,
  GitCompare,
  Loader2,
  MessageSquare,
  Plus,
  Receipt,
  RefreshCw,
  Send,
  Tag,
  XCircle,
} from "lucide-react";

function statusPillTone(status: string | null | undefined): string {
  const s = (status || "").trim().toLowerCase();
  if (s === "confirmed" || s === "completed" || s === "approved" || s === "paid" || s === "captured") {
    return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  }
  if (s === "pending" || s === "in progress" || s === "scheduled" || s === "sent") {
    return "bg-amber-50 text-amber-800 border border-amber-200";
  }
  if (s === "cancelled" || s === "rejected" || s === "refunded") {
    return "bg-red-50 text-red-700 border border-red-200";
  }
  return "bg-[#F5EEE7] text-[#8B263E] border border-[#8B263E]/15";
}

interface EnquiryRow {
  enquiry_id: number;
  subject: string | null;
  message: string | null;
  status: string | null;
  venue_id: number | null;
  vendor_id: number | null;
  assigned_specialist_id: string | null;
  site_visit_at: string | null;
  site_visit_status: string | null;
  site_visit_notes: string | null;
  created_at: string | null;
}

interface EnquiryMessageRow {
  message_id: number;
  sender_id: string | null;
  message: string;
  created_at: string | null;
}

interface EnquiryStatusHistoryRow {
  history_id: number;
  status: string;
  remarks: string | null;
  created_at: string | null;
}

interface QuoteRow {
  quote_id: number;
  enquiry_id: number;
  venue_id: number | null;
  vendor_id: number | null;
  package_name: string;
  base_cost_inr: number;
  currency: string;
  catering_included: boolean;
  inclusions: unknown;
  exclusions: unknown;
  notes: string | null;
  valid_until: string | null;
  status: string;
  created_at: string;
}

interface ComparisonSheetRow {
  comparison_sheet_id: number;
  enquiry_id: number;
  title: string;
  quote_ids: number[];
  summary_notes: string | null;
  status: string;
  created_at: string;
}

interface BookingRow {
  booking_id: number;
  enquiry_id: number | null;
  quote_id: number | null;
  venue_id: number | null;
  vendor_id: number | null;
  event_date: string | null;
  guest_count: number | null;
  total_amount: number | null;
  currency: string | null;
  notes: string | null;
  status_id: number | null;
  status_name?: string | null;
  created_at: string | null;
}

interface BookingDocumentRow {
  document_id: number;
  document_name: string | null;
  document_url: string;
  document_type: string | null;
  created_at: string | null;
}

interface PaymentRow {
  payment_id: number;
  booking_id: number | null;
  amount: number;
  currency: string | null;
  payment_method: string | null;
  payment_status: string | null;
  idempotency_key: string | null;
  created_at: string | null;
}

interface InvoiceRow {
  invoice_id: number;
  payment_id: number | null;
  invoice_number: string;
  amount: number;
  tax_amount: number | null;
  total_amount: number;
  currency: string | null;
  invoice_url: string | null;
  issued_at: string | null;
}

interface EnquiryDetailPayload {
  enquiry: EnquiryRow;
  messages: EnquiryMessageRow[];
  statusHistory: EnquiryStatusHistoryRow[];
  quotes: QuoteRow[];
  comparisonSheets: ComparisonSheetRow[];
}

interface BookingDetailPayload {
  booking: BookingRow;
  status: { status_id: number; status_name: string } | null;
  documents: BookingDocumentRow[];
  payments: PaymentRow[];
}

export interface CustomerBookingsWorkspaceProps {
  catalogHref?: string;
  savedVenueIds?: string[];
  savedVendorIds?: string[];
}

type WorkspaceTab = "enquiries" | "quotes" | "bookings";

function formatInr(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

function renderJsonList(val: unknown): string[] {
  if (Array.isArray(val)) return val.map((item) => String(item));
  if (val && typeof val === "object") {
    return Object.entries(val as Record<string, unknown>).map(([k, v]) => `${k}: ${String(v)}`);
  }
  return [];
}

function createIdempotencyKey(bookingId: number): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `ymwa-b${bookingId}-${crypto.randomUUID()}`;
  }
  return `ymwa-b${bookingId}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function CustomerBookingsWorkspace({
  catalogHref = "/venues",
  savedVenueIds = [],
  savedVendorIds = [],
}: CustomerBookingsWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("enquiries");
  const [loading, setLoading] = useState(true);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [bannerSuccess, setBannerSuccess] = useState<string | null>(null);

  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<number | null>(null);
  const [enquiryDetail, setEnquiryDetail] = useState<EnquiryDetailPayload | null>(null);
  const [loadingEnquiryDetail, setLoadingEnquiryDetail] = useState(false);

  const [quotes, setQuotes] = useState<QuoteRow[]>([]);
  const [quoteNotesById, setQuoteNotesById] = useState<Record<number, string>>({});
  const [quoteActionId, setQuoteActionId] = useState<number | null>(null);
  const [convertQuoteId, setConvertQuoteId] = useState<number | null>(null);
  const [convertEventDate, setConvertEventDate] = useState("");
  const [convertGuestCount, setConvertGuestCount] = useState("250");
  const [convertNotes, setConvertNotes] = useState("");

  const [comparisonSheets, setComparisonSheets] = useState<ComparisonSheetRow[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<{
    sheet: ComparisonSheetRow;
    quotes: QuoteRow[];
  } | null>(null);
  const [previewMatrix, setPreviewMatrix] = useState<{
    venues: Array<Record<string, unknown>>;
    vendors: Array<Record<string, unknown>>;
  } | null>(null);

  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [bookingDetail, setBookingDetail] = useState<BookingDetailPayload | null>(null);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  // New enquiry form
  const [showNewEnquiry, setShowNewEnquiry] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newGuestCount, setNewGuestCount] = useState("");
  const [newPreferredCity, setNewPreferredCity] = useState("Hyderabad");
  const [newBudgetRange, setNewBudgetRange] = useState("");
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  // Enquiry message reply
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Booking document attachment
  const [docName, setDocName] = useState("");
  const [docUrl, setDocUrl] = useState("");
  const [docType, setDocType] = useState<"contract" | "invoice" | "receipt" | "floorplan" | "other">(
    "contract"
  );
  const [attachingDoc, setAttachingDoc] = useState(false);

  // Coupon & Payment Intent
  const [paymentAmountInr, setPaymentAmountInr] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking" | "bank_transfer">(
    "upi"
  );
  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] = useState<{
    couponCode: string;
    originalAmountInr: number;
    discountInr: number;
    finalAmountInr: number;
  } | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const [paymentIntentResult, setPaymentIntentResult] = useState<{
    reused: boolean;
    payment: PaymentRow;
    gatewayIntent: {
      provider: string;
      providerOrderId: string;
      amountInr: number;
      status: string;
      configured: boolean;
    };
  } | null>(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Invoice viewer
  const [invoiceIdInput, setInvoiceIdInput] = useState("");
  const [loadedInvoice, setLoadedInvoice] = useState<InvoiceRow | null>(null);

  const loadEnquiryDetail = useCallback(async (enquiryId: number) => {
    setLoadingEnquiryDetail(true);
    const res = await apiClient.get<EnquiryDetailPayload>(`/api/enquiries/${enquiryId}`);
    if (res.ok && res.data) {
      setEnquiryDetail(res.data);
    } else if (res.error) {
      setBannerError(res.error);
    }
    setLoadingEnquiryDetail(false);
  }, []);

  const loadBookingDetail = useCallback(async (bookingId: number) => {
    const res = await apiClient.get<BookingDetailPayload>(`/api/bookings/${bookingId}`);
    if (res.ok && res.data) {
      setBookingDetail(res.data);
      const amt = res.data.booking.total_amount;
      setPaymentAmountInr(amt ? String(amt) : "10000");
      setIdempotencyKey(createIdempotencyKey(bookingId));
      setCouponPreview(null);
      setPaymentIntentResult(null);
    } else if (res.error) {
      setBannerError(res.error);
    }
  }, []);

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setBannerError(null);

    const [enqRes, cmpRes, bookRes, payRes] = await Promise.all([
      apiClient.get<EnquiryRow[]>("/api/enquiries", { query: { limit: 30 }, retryOn401: false }),
      apiClient.get<ComparisonSheetRow[]>("/api/comparisons", {
        query: { limit: 25 },
        retryOn401: false,
      }),
      apiClient.get<BookingRow[]>("/api/bookings", { query: { limit: 30 }, retryOn401: false }),
      apiClient.get<PaymentRow[]>("/api/payments", { query: { limit: 30 }, retryOn401: false }),
    ]);

    if (enqRes.status === 401) {
      setBannerError("Please sign in to access your enquiries, quotations, and bookings.");
      setLoading(false);
      return;
    }

    const enquiryList = Array.isArray(enqRes.data) ? enqRes.data : [];
    const bookingList = Array.isArray(bookRes.data) ? bookRes.data : [];
    const compList = Array.isArray(cmpRes.data) ? cmpRes.data : [];
    const paymentList = Array.isArray(payRes.data) ? payRes.data : [];

    setEnquiries(enquiryList);
    setComparisonSheets(compList);
    setBookings(bookingList);
    setPayments(paymentList);

    if (enquiryList.length > 0) {
      const targetEnqId = enquiryList[0].enquiry_id;
      setSelectedEnquiryId((prev) => prev ?? targetEnqId);

      // Load quotes aggregated across recent enquiries so Quotations tab is populated right away
      const detailResults = await Promise.all(
        enquiryList
          .slice(0, 10)
          .map((e) => apiClient.get<EnquiryDetailPayload>(`/api/enquiries/${e.enquiry_id}`))
      );
      const collectedQuotes: QuoteRow[] = [];
      for (const dr of detailResults) {
        if (dr.ok && dr.data) {
          if (dr.data.enquiry.enquiry_id === targetEnqId) {
            setEnquiryDetail(dr.data);
          }
          collectedQuotes.push(...dr.data.quotes);
        }
      }
      setQuotes(collectedQuotes);
    } else {
      setQuotes([]);
      setEnquiryDetail(null);
    }

    if (bookingList.length > 0) {
      const targetBookingId = bookingList[0].booking_id;
      setSelectedBookingId(targetBookingId);
      await loadBookingDetail(targetBookingId);
    } else {
      setBookingDetail(null);
    }

    setLoading(false);
  }, [loadBookingDetail]);

  useEffect(() => {
    void loadWorkspace();
  }, [loadWorkspace]);

  const handleSelectEnquiry = (enquiryId: number) => {
    setSelectedEnquiryId(enquiryId);
    void loadEnquiryDetail(enquiryId);
  };

  const handleSelectBooking = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    void loadBookingDetail(bookingId);
  };

  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setBannerError(null);
    setBannerSuccess(null);
    setSubmittingEnquiry(true);

    const guestNum = Number(newGuestCount);
    const res = await apiClient.post<EnquiryRow>("/api/enquiries", {
      subject: newSubject.trim(),
      message: newMessage.trim(),
      ...(newEventDate ? { eventDate: newEventDate } : {}),
      ...(Number.isInteger(guestNum) && guestNum > 0 ? { guestCount: guestNum } : {}),
      ...(newBudgetRange.trim() ? { budgetRange: newBudgetRange.trim() } : {}),
      ...(newPreferredCity.trim() ? { preferredCity: newPreferredCity.trim() } : {}),
    });

    setSubmittingEnquiry(false);
    if (!res.ok) {
      setBannerError(res.error || "Failed to submit concierge enquiry.");
      return;
    }

    setBannerSuccess("Concierge enquiry submitted.");
    setNewSubject("");
    setNewMessage("");
    setNewEventDate("");
    setNewGuestCount("");
    setNewBudgetRange("");
    setShowNewEnquiry(false);
    await loadWorkspace();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiryId || !replyText.trim()) return;
    setSendingReply(true);
    setBannerError(null);

    const res = await apiClient.post<EnquiryMessageRow>(
      `/api/enquiries/${selectedEnquiryId}/messages`,
      { message: replyText.trim() }
    );

    setSendingReply(false);
    if (!res.ok) {
      setBannerError(res.error || "Failed to send message.");
      return;
    }
    setReplyText("");
    await loadEnquiryDetail(selectedEnquiryId);
  };

  const handleRespondQuote = async (quoteId: number, decision: "Approved" | "Rejected") => {
    setQuoteActionId(quoteId);
    setBannerError(null);
    setBannerSuccess(null);

    const notes = quoteNotesById[quoteId]?.trim();
    const res = await apiClient.post<QuoteRow>(`/api/quotes/${quoteId}/respond`, {
      decision,
      ...(notes ? { notes } : {}),
    });

    setQuoteActionId(null);
    if (!res.ok) {
      setBannerError(res.error || "Failed to respond to quotation.");
      return;
    }

    setBannerSuccess(`Quotation #${quoteId} ${decision.toLowerCase()}.`);
    await loadWorkspace();
  };

  const handleConvertQuoteToBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertQuoteId || !convertEventDate) return;
    setBannerError(null);
    setBannerSuccess(null);

    const guests = Number(convertGuestCount);
    const res = await apiClient.post<BookingRow>("/api/bookings", {
      quoteId: convertQuoteId,
      eventDate: convertEventDate,
      ...(Number.isInteger(guests) && guests > 0 ? { guestCount: guests } : {}),
      ...(convertNotes.trim() ? { notes: convertNotes.trim() } : {}),
    });

    if (!res.ok) {
      setBannerError(res.error || "Failed to create booking from quote.");
      return;
    }

    setConvertQuoteId(null);
    setConvertNotes("");
    setBannerSuccess("Booking created from your approved quotation.");
    setActiveTab("bookings");
    await loadWorkspace();
  };

  const handleViewComparisonSheet = async (sheetId: number) => {
    setBannerError(null);
    const res = await apiClient.get<{ sheet: ComparisonSheetRow; quotes: QuoteRow[] }>(
      `/api/comparisons/${sheetId}`
    );
    if (res.ok && res.data) {
      setSelectedComparison(res.data);
    } else if (res.error) {
      setBannerError(res.error);
    }
  };

  const handlePreviewShortlist = async () => {
    const venueIds = savedVenueIds
      .map((id) => Number(id))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 6);
    const vendorIds = savedVendorIds
      .map((id) => Number(id))
      .filter((n) => Number.isInteger(n) && n > 0)
      .slice(0, 6);

    if (venueIds.length === 0 && vendorIds.length === 0) {
      setBannerError("Save numeric venues or vendors first to preview a side-by-side comparison.");
      return;
    }

    setBannerError(null);
    const res = await apiClient.post<{
      venues: Array<Record<string, unknown>>;
      vendors: Array<Record<string, unknown>>;
    }>("/api/comparisons/preview", { venueIds, vendorIds });

    if (res.ok && res.data) {
      setPreviewMatrix(res.data);
    } else if (res.error) {
      setBannerError(res.error);
    }
  };

  const handleAttachDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;
    setAttachingDoc(true);
    setBannerError(null);

    const res = await apiClient.post<BookingDocumentRow>(
      `/api/bookings/${selectedBookingId}/documents`,
      {
        documentName: docName.trim(),
        documentUrl: docUrl.trim(),
        documentType: docType,
      }
    );

    setAttachingDoc(false);
    if (!res.ok) {
      setBannerError(res.error || "Failed to attach booking document.");
      return;
    }

    setDocName("");
    setDocUrl("");
    setBannerSuccess("Document attached to booking.");
    await loadBookingDetail(selectedBookingId);
  };

  const handleValidateCoupon = async () => {
    const amt = Number(paymentAmountInr);
    if (!couponCode.trim() || !Number.isFinite(amt) || amt <= 0) {
      setBannerError("Enter a valid positive amount and coupon code.");
      return;
    }
    setBannerError(null);
    const res = await apiClient.post<{
      couponCode: string;
      originalAmountInr: number;
      discountInr: number;
      finalAmountInr: number;
    }>("/api/payments/validate-coupon", {
      couponCode: couponCode.trim(),
      amountInr: amt,
    });

    if (res.ok && res.data) {
      setCouponPreview(res.data);
      setBannerSuccess(`Coupon ${res.data.couponCode} applied.`);
    } else {
      setCouponPreview(null);
      setBannerError(res.error || "Invalid or inapplicable coupon.");
    }
  };

  const handleCreatePaymentIntent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;
    const amt = Number(paymentAmountInr);
    if (!Number.isFinite(amt) || amt <= 0) {
      setBannerError("Enter a valid positive INR amount.");
      return;
    }

    setSubmittingPayment(true);
    setBannerError(null);
    setBannerSuccess(null);

    const key = idempotencyKey || createIdempotencyKey(selectedBookingId);
    const res = await apiClient.post<{
      reused: boolean;
      payment: PaymentRow;
      gatewayIntent: {
        provider: string;
        providerOrderId: string;
        amountInr: number;
        status: string;
        configured: boolean;
      };
    }>("/api/payments/intent", {
      bookingId: selectedBookingId,
      amountInr: amt,
      paymentMethod,
      ...(couponCode.trim() ? { couponCode: couponCode.trim() } : {}),
      idempotencyKey: key,
    });

    setSubmittingPayment(false);
    if (!res.ok || !res.data) {
      setBannerError(res.error || "Failed to initialize payment intent.");
      return;
    }

    setPaymentIntentResult(res.data);
    setBannerSuccess(
      res.data.reused
        ? `Idempotent payment intent #${res.data.payment.payment_id} reused.`
        : `Payment intent #${res.data.payment.payment_id} created with Pending status.`
    );
    await loadBookingDetail(selectedBookingId);
    const payRes = await apiClient.get<PaymentRow[]>("/api/payments", { query: { limit: 30 } });
    if (payRes.ok && Array.isArray(payRes.data)) setPayments(payRes.data);
  };

  const handleLoadInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const idNum = Number(invoiceIdInput);
    if (!Number.isInteger(idNum) || idNum <= 0) {
      setBannerError("Enter a positive numeric invoice ID.");
      return;
    }
    setBannerError(null);
    const res = await apiClient.get<InvoiceRow>(`/api/invoices/${idNum}`);
    if (res.ok && res.data) {
      setLoadedInvoice(res.data);
    } else {
      setLoadedInvoice(null);
      setBannerError(res.error || "Invoice not found.");
    }
  };

  return (
    <div className="space-y-6">
      {/* TABS + REFRESH */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("enquiries")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all inline-flex items-center gap-2 ${
              activeTab === "enquiries"
                ? "bg-[#8B263E] text-white shadow-sm"
                : "bg-white text-neutral-700 border border-neutral-200 hover:border-[#8B263E]/40"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Enquiries & Visits ({enquiries.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quotes")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all inline-flex items-center gap-2 ${
              activeTab === "quotes"
                ? "bg-[#8B263E] text-white shadow-sm"
                : "bg-white text-neutral-700 border border-neutral-200 hover:border-[#8B263E]/40"
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Quotes & Comparisons ({quotes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-pointer transition-all inline-flex items-center gap-2 ${
              activeTab === "bookings"
                ? "bg-[#8B263E] text-white shadow-sm"
                : "bg-white text-neutral-700 border border-neutral-200 hover:border-[#8B263E]/40"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5" />
            <span>Bookings & Payments ({bookings.length})</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => void loadWorkspace()}
          disabled={loading}
          className="px-3.5 py-2 rounded-full bg-white border border-neutral-200 text-xs font-semibold text-neutral-600 hover:text-[#8B263E] inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync</span>
        </button>
      </div>

      {bannerError && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {bannerError}
        </div>
      )}
      {bannerSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium">
          {bannerSuccess}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" aria-label="Loading concierge workspace">
          <div className="lg:col-span-5 space-y-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-[#8B263E]/10 p-4 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-3.5 w-full" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-10 w-40 rounded-full" />
          </div>
        </div>
      ) : (
        <>
          {/* ── ENQUIRIES & SITE VISITS TAB ── */}
          {activeTab === "enquiries" && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-neutral-500">
                  Submit concierge requests, track status milestones, inspect scheduled site visits, and message your specialist.
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={catalogHref}
                    className="px-4 py-2 rounded-full border border-[#8B263E]/30 text-[#8B263E] text-xs font-semibold hover:bg-[#F5EEE7]"
                  >
                    Browse Catalog
                  </a>
                  <button
                    type="button"
                    onClick={() => setShowNewEnquiry((v) => !v)}
                    className="px-4 py-2 rounded-full bg-[#8B263E] text-white text-xs font-semibold hover:bg-[#701E31] inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>New Enquiry</span>
                  </button>
                </div>
              </div>

              {showNewEnquiry && (
                <form
                  onSubmit={handleCreateEnquiry}
                  className="bg-white rounded-2xl border border-[#8B263E]/20 p-6 space-y-4"
                >
                  <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">
                    Request Concierge Planning Assistance
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        minLength={3}
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        placeholder="e.g., 500-Guest Royal Sangeet Venue Options"
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                        Preferred City
                      </label>
                      <input
                        type="text"
                        value={newPreferredCity}
                        onChange={(e) => setNewPreferredCity(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                        Event Date (YYYY-MM-DD)
                      </label>
                      <input
                        type="date"
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                          Guest Count
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={newGuestCount}
                          onChange={(e) => setNewGuestCount(e.target.value)}
                          placeholder="350"
                          className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                          Budget Range
                        </label>
                        <input
                          type="text"
                          value={newBudgetRange}
                          onChange={(e) => setNewBudgetRange(e.target.value)}
                          placeholder="₹15L - ₹25L"
                          className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                      Requirements & Notes *
                    </label>
                    <textarea
                      required
                      minLength={10}
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Describe preferred dates, catering preferences, stay rooms, or vendor categories..."
                      className="w-full p-3 rounded-xl border border-neutral-200 text-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewEnquiry(false)}
                      className="px-4 py-2 rounded-full border border-neutral-200 text-xs font-semibold text-neutral-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingEnquiry}
                      className="px-5 py-2 rounded-full bg-[#8B263E] text-white text-xs font-semibold hover:bg-[#701E31] cursor-pointer disabled:opacity-50"
                    >
                      {submittingEnquiry ? "Submitting..." : "Submit Enquiry"}
                    </button>
                  </div>
                </form>
              )}

              {enquiries.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-10 text-center text-xs text-neutral-500">
                  No enquiries yet. Click &ldquo;New Enquiry&rdquo; or request a quote from any venue or vendor page.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* List */}
                  <div className="lg:col-span-5 space-y-3">
                    {enquiries.map((enq) => {
                      const active = selectedEnquiryId === enq.enquiry_id;
                      return (
                        <button
                          key={enq.enquiry_id}
                          type="button"
                          onClick={() => handleSelectEnquiry(enq.enquiry_id)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                            active
                              ? "bg-[#F5EEE7] border-[#8B263E]"
                              : "bg-white border-neutral-200 hover:border-[#8B263E]/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold text-[#8B263E]">
                              ENQ #{enq.enquiry_id}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white border border-neutral-200 text-[10px] font-bold uppercase text-neutral-700">
                              {enq.status || "Pending"}
                            </span>
                          </div>
                          <p className="mt-1 font-serif font-bold text-sm text-[#2D2D2D] line-clamp-1">
                            {enq.subject || "Wedding Enquiry"}
                          </p>
                          <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                            {enq.message}
                          </p>
                          {enq.site_visit_status && (
                            <p className="mt-2 text-[11px] font-semibold text-amber-700">
                              Site Visit: {enq.site_visit_status}
                              {enq.site_visit_at
                                ? ` (${new Date(enq.site_visit_at).toLocaleDateString()})`
                                : ""}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detail & Thread */}
                  <div className="lg:col-span-7 bg-white rounded-2xl border border-[#8B263E]/10 p-6">
                    {loadingEnquiryDetail ? (
                      <div className="py-10 text-center text-xs text-neutral-500">
                        Loading conversation & quotes...
                      </div>
                    ) : enquiryDetail ? (
                      <div className="space-y-6">
                        <div className="border-b border-neutral-100 pb-4">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-serif text-xl font-bold text-[#2D2D2D]">
                              {enquiryDetail.enquiry.subject || `Enquiry #${enquiryDetail.enquiry.enquiry_id}`}
                            </h3>
                            <span className="px-3 py-1 rounded-full bg-[#F5EEE7] text-[#8B263E] text-xs font-bold">
                              {enquiryDetail.enquiry.status || "Pending"}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-neutral-600 whitespace-pre-wrap">
                            {enquiryDetail.enquiry.message}
                          </p>
                        </div>

                        {(enquiryDetail.enquiry.site_visit_status || enquiryDetail.enquiry.site_visit_at) && (
                          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                            <p className="font-bold text-amber-900">
                              Site Visit Status: {enquiryDetail.enquiry.site_visit_status || "Scheduled"}
                            </p>
                            {enquiryDetail.enquiry.site_visit_at && (
                              <p className="text-amber-800">
                                Scheduled At: {new Date(enquiryDetail.enquiry.site_visit_at).toLocaleString()}
                              </p>
                            )}
                            {enquiryDetail.enquiry.site_visit_notes && (
                              <p className="text-amber-800">
                                Notes: {enquiryDetail.enquiry.site_visit_notes}
                              </p>
                            )}
                          </div>
                        )}

                        {enquiryDetail.quotes.length > 0 && (
                          <div className="p-4 rounded-xl bg-[#F5EEE7] border border-[#8B263E]/15 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-xs font-bold text-[#8B263E]">
                                {enquiryDetail.quotes.length} Quotation(s) Ready
                              </p>
                              <p className="text-[11px] text-neutral-600">
                                Review pricing, approve a quote, or convert it to a booking.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveTab("quotes")}
                              className="px-4 py-2 rounded-full bg-[#8B263E] text-white text-xs font-semibold cursor-pointer"
                            >
                              View Quotations →
                            </button>
                          </div>
                        )}

                        {/* Messages Thread */}
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3">
                            Concierge Messages
                          </h4>
                          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 mb-3">
                            {enquiryDetail.messages.length === 0 ? (
                              <p className="text-xs text-neutral-400 italic">
                                No messages in this thread yet. Send a note below.
                              </p>
                            ) : (
                              enquiryDetail.messages.map((m) => (
                                <div
                                  key={m.message_id}
                                  className="p-3 rounded-xl bg-[#FAF7F3] border border-neutral-100 text-xs"
                                >
                                  <p className="text-[#2D2D2D] whitespace-pre-wrap">{m.message}</p>
                                  {m.created_at && (
                                    <p className="text-[10px] text-neutral-400 mt-1">
                                      {new Date(m.created_at).toLocaleString()}
                                    </p>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                          <form onSubmit={handleSendMessage} className="flex gap-2">
                            <input
                              type="text"
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="Send a follow-up question to your concierge..."
                              className="flex-1 h-10 px-3.5 rounded-xl border border-neutral-200 text-xs"
                            />
                            <button
                              type="submit"
                              disabled={sendingReply || !replyText.trim()}
                              className="px-4 h-10 rounded-xl bg-[#8B263E] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>{sendingReply ? "Sending..." : "Send"}</span>
                            </button>
                          </form>
                        </div>

                        {/* Audit History */}
                        {enquiryDetail.statusHistory.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">
                              Status History
                            </h4>
                            <div className="space-y-1.5">
                              {enquiryDetail.statusHistory.map((h) => (
                                <div
                                  key={h.history_id}
                                  className="text-xs text-neutral-600 flex items-center justify-between gap-2"
                                >
                                  <span>
                                    <strong className="text-[#2D2D2D]">{h.status}</strong>
                                    {h.remarks ? ` — ${h.remarks}` : ""}
                                  </span>
                                  {h.created_at && (
                                    <span className="text-[10px] text-neutral-400 shrink-0">
                                      {new Date(h.created_at).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-500 py-8 text-center">
                        Select an enquiry to view messages and status history.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── QUOTES & COMPARISONS TAB ── */}
          {activeTab === "quotes" && (
            <div className="space-y-8">
              {/* Quotes */}
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-serif text-xl font-bold text-[#2D2D2D]">
                    Concierge Quotations
                  </h3>
                  <button
                    type="button"
                    onClick={() => void handlePreviewShortlist()}
                    className="px-4 py-2 rounded-full border border-[#8B263E] text-[#8B263E] text-xs font-semibold hover:bg-[#F5EEE7] cursor-pointer"
                  >
                    Compare Saved Shortlist
                  </button>
                </div>

                {quotes.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-8 text-center text-xs text-neutral-500">
                    No quotations received yet. Once a concierge prepares quotes for your enquiries, they will appear here for approval.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {quotes.map((q) => {
                      const inclusions = renderJsonList(q.inclusions);
                      const exclusions = renderJsonList(q.exclusions);
                      const isDecided = q.status === "Approved" || q.status === "Rejected";

                      return (
                        <div
                          key={q.quote_id}
                          className="bg-white rounded-2xl border border-[#8B263E]/15 p-5 flex flex-col justify-between space-y-4"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="text-[11px] font-bold uppercase text-[#C6934A]">
                                  Quote #{q.quote_id} • Enquiry #{q.enquiry_id}
                                </p>
                                <h4 className="font-serif text-lg font-bold text-[#2D2D2D]">
                                  {q.package_name}
                                </h4>
                              </div>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                  q.status === "Approved"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : q.status === "Rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-amber-100 text-amber-800"
                                }`}
                              >
                                {q.status}
                              </span>
                            </div>

                            <p className="mt-3 text-2xl font-serif font-bold text-[#8B263E]">
                              {formatInr(q.base_cost_inr)}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              {q.catering_included ? "Catering Included" : "Catering Excluded"}
                              {q.valid_until ? ` • Valid until ${q.valid_until}` : ""}
                            </p>

                            {q.notes && (
                              <p className="mt-2 text-xs text-neutral-600">{q.notes}</p>
                            )}

                            {inclusions.length > 0 && (
                              <div className="mt-3">
                                <p className="text-[10px] font-bold uppercase text-neutral-400">
                                  Inclusions
                                </p>
                                <ul className="mt-1 space-y-0.5 text-xs text-neutral-700 list-disc pl-4">
                                  {inclusions.map((inc, i) => (
                                    <li key={i}>{inc}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {exclusions.length > 0 && (
                              <div className="mt-2">
                                <p className="text-[10px] font-bold uppercase text-neutral-400">
                                  Exclusions
                                </p>
                                <ul className="mt-1 space-y-0.5 text-xs text-neutral-500 list-disc pl-4">
                                  {exclusions.map((exc, i) => (
                                    <li key={i}>{exc}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {!isDecided ? (
                            <div className="pt-3 border-t border-neutral-100 space-y-2.5">
                              <input
                                type="text"
                                value={quoteNotesById[q.quote_id] ?? ""}
                                onChange={(e) =>
                                  setQuoteNotesById((prev) => ({
                                    ...prev,
                                    [q.quote_id]: e.target.value,
                                  }))
                                }
                                placeholder="Optional notes on approval or decline..."
                                className="w-full h-9 px-3 rounded-lg border border-neutral-200 text-xs"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  disabled={quoteActionId === q.quote_id}
                                  onClick={() => void handleRespondQuote(q.quote_id, "Approved")}
                                  className="flex-1 py-2 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Approve</span>
                                </button>
                                <button
                                  type="button"
                                  disabled={quoteActionId === q.quote_id}
                                  onClick={() => void handleRespondQuote(q.quote_id, "Rejected")}
                                  className="flex-1 py-2 rounded-full border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold inline-flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                                >
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Decline</span>
                                </button>
                              </div>
                            </div>
                          ) : q.status === "Approved" ? (
                            <div className="pt-3 border-t border-neutral-100">
                              {(() => {
                                const existingBooking = bookings.find((b) => b.quote_id === q.quote_id);
                                if (existingBooking) {
                                  return (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        handleSelectBooking(existingBooking.booking_id);
                                        setActiveTab("bookings");
                                      }}
                                      className="w-full py-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold cursor-pointer hover:bg-emerald-100"
                                    >
                                      Booking #{existingBooking.booking_id} Created ({existingBooking.status_name || "Pending"}) →
                                    </button>
                                  );
                                }
                                return convertQuoteId === q.quote_id ? (
                                <form onSubmit={handleConvertQuoteToBooking} className="space-y-2">
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="date"
                                      required
                                      value={convertEventDate}
                                      onChange={(e) => setConvertEventDate(e.target.value)}
                                      className="h-9 px-2.5 rounded-lg border border-neutral-200 text-xs"
                                    />
                                    <input
                                      type="number"
                                      min={1}
                                      value={convertGuestCount}
                                      onChange={(e) => setConvertGuestCount(e.target.value)}
                                      placeholder="Guests"
                                      className="h-9 px-2.5 rounded-lg border border-neutral-200 text-xs"
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    value={convertNotes}
                                    onChange={(e) => setConvertNotes(e.target.value)}
                                    placeholder="Booking notes..."
                                    className="w-full h-9 px-2.5 rounded-lg border border-neutral-200 text-xs"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      type="submit"
                                      className="flex-1 py-2 rounded-full bg-[#8B263E] text-white text-xs font-semibold cursor-pointer"
                                    >
                                      Confirm Booking
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConvertQuoteId(null)}
                                      className="px-3 py-2 rounded-full border border-neutral-200 text-xs text-neutral-600 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConvertQuoteId(q.quote_id)}
                                  className="w-full py-2.5 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold cursor-pointer"
                                >
                                  Convert Approved Quote to Booking →
                                </button>
                              );
                              })()}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}

                {quotes.length >= 2 && (
                  <div className="bg-white rounded-2xl border border-[#8B263E]/15 p-5 overflow-x-auto">
                    <h4 className="font-serif font-bold text-base text-[#2D2D2D] mb-3">
                      Side-by-Side Quote Comparison ({quotes.length})
                    </h4>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 text-neutral-500">
                          <th className="py-2 pr-4">Quote</th>
                          <th className="py-2 pr-4">Package</th>
                          <th className="py-2 pr-4">Base Cost</th>
                          <th className="py-2 pr-4">Catering</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2">Valid Until</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {quotes.map((sq) => (
                          <tr key={sq.quote_id}>
                            <td className="py-2 pr-4 text-neutral-500">
                              #{sq.quote_id} (ENQ #{sq.enquiry_id})
                            </td>
                            <td className="py-2 pr-4 font-semibold text-[#2D2D2D]">
                              {sq.package_name}
                            </td>
                            <td className="py-2 pr-4 font-bold text-[#8B263E]">
                              {formatInr(sq.base_cost_inr)}
                            </td>
                            <td className="py-2 pr-4">{sq.catering_included ? "Yes" : "No"}</td>
                            <td className="py-2 pr-4 font-semibold">{sq.status}</td>
                            <td className="py-2 text-neutral-500">{sq.valid_until || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              {/* Comparison Sheets */}
              <section className="space-y-4">
                <h3 className="font-serif text-xl font-bold text-[#2D2D2D]">
                  Concierge Comparison Sheets ({comparisonSheets.length})
                </h3>

                {comparisonSheets.length === 0 ? (
                  <p className="text-xs text-neutral-500">
                    No published comparison sheets yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {comparisonSheets.map((s) => (
                      <div
                        key={s.comparison_sheet_id}
                        className="bg-white rounded-2xl border border-[#8B263E]/10 p-4 flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-[11px] font-bold text-[#C6934A]">
                            Sheet #{s.comparison_sheet_id} • Enquiry #{s.enquiry_id}
                          </p>
                          <h4 className="font-serif font-bold text-sm text-[#2D2D2D]">{s.title}</h4>
                          {s.summary_notes && (
                            <p className="text-xs text-neutral-500 mt-1">{s.summary_notes}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => void handleViewComparisonSheet(s.comparison_sheet_id)}
                          className="px-3.5 py-2 rounded-full bg-[#F5EEE7] text-[#8B263E] text-xs font-bold shrink-0 cursor-pointer"
                        >
                          Compare ({s.quote_ids.length})
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {selectedComparison && (
                  <div className="bg-white rounded-2xl border border-[#8B263E]/20 p-5 overflow-x-auto">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-serif font-bold text-base text-[#2D2D2D]">
                        {selectedComparison.sheet.title}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setSelectedComparison(null)}
                        className="text-xs text-neutral-500 hover:text-[#8B263E] cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 text-neutral-500">
                          <th className="py-2 pr-4">Package</th>
                          <th className="py-2 pr-4">Base Cost</th>
                          <th className="py-2 pr-4">Catering</th>
                          <th className="py-2 pr-4">Status</th>
                          <th className="py-2">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {selectedComparison.quotes.map((sq) => (
                          <tr key={sq.quote_id}>
                            <td className="py-2 pr-4 font-semibold text-[#2D2D2D]">
                              {sq.package_name}
                            </td>
                            <td className="py-2 pr-4 font-bold text-[#8B263E]">
                              {formatInr(sq.base_cost_inr)}
                            </td>
                            <td className="py-2 pr-4">{sq.catering_included ? "Yes" : "No"}</td>
                            <td className="py-2 pr-4">{sq.status}</td>
                            <td className="py-2 text-neutral-500">{sq.notes || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {previewMatrix && (
                  <div className="bg-white rounded-2xl border border-[#C6934A]/30 p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif font-bold text-base text-[#2D2D2D]">
                        Saved Shortlist Live Comparison Preview
                      </h4>
                      <button
                        type="button"
                        onClick={() => setPreviewMatrix(null)}
                        className="text-xs text-neutral-500 cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Venues compared: {previewMatrix.venues.length} • Vendors compared:{" "}
                      {previewMatrix.vendors.length}
                    </p>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* ── BOOKINGS, DOCUMENTS & PAYMENTS TAB ── */}
          {activeTab === "bookings" && (
            <div className="space-y-6">
              {bookings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-10 text-center text-xs text-neutral-500">
                  No bookings yet. Approve a concierge quotation to create your first booking.
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Booking Selector */}
                  <div className="lg:col-span-4 space-y-3">
                    {bookings.map((b) => {
                      const active = selectedBookingId === b.booking_id;
                      return (
                        <button
                          key={b.booking_id}
                          type="button"
                          onClick={() => handleSelectBooking(b.booking_id)}
                          className={`w-full text-left p-4 rounded-2xl border cursor-pointer transition-all ${
                            active
                              ? "bg-[#F5EEE7] border-[#8B263E]"
                              : "bg-white border-neutral-200 hover:border-[#8B263E]/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-[#8B263E]">
                              Booking #{b.booking_id}
                            </span>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusPillTone(b.status_name || "Pending")}`}
                              >
                                {b.status_name || "Pending"}
                              </span>
                              <span className="text-xs font-bold text-[#2D2D2D]">
                                {formatInr(b.total_amount)}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-600 mt-1">
                            Event: {b.event_date || "TBD"} • Guests: {b.guest_count ?? "TBD"}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Selected Booking Detail + Docs + Payment */}
                  <div className="lg:col-span-8 space-y-6">
                    {bookingDetail ? (
                      <>
                        {/* Booking Summary */}
                        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6">
                          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-neutral-100">
                            <div>
                              <h3 className="font-serif text-xl font-bold text-[#2D2D2D]">
                                Booking #{bookingDetail.booking.booking_id}
                              </h3>
                              <p className="text-xs text-neutral-500">
                                Event Date: {bookingDetail.booking.event_date || "TBD"} • Guests:{" "}
                                {bookingDetail.booking.guest_count ?? "TBD"}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${statusPillTone(bookingDetail.status?.status_name || "Pending")}`}
                            >
                              {bookingDetail.status?.status_name || "Pending"}
                            </span>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm">
                            <span className="text-neutral-600">Total Agreed Value</span>
                            <span className="font-serif text-xl font-bold text-[#2D2D2D]">
                              {formatInr(bookingDetail.booking.total_amount)}
                            </span>
                          </div>
                          {bookingDetail.booking.notes && (
                            <p className="mt-2 text-xs text-neutral-500">
                              Notes: {bookingDetail.booking.notes}
                            </p>
                          )}
                        </div>

                        {/* Payment Intent & Coupon Card */}
                        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-4">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-[#8B263E]" />
                            <h4 className="font-serif text-base font-bold text-[#2D2D2D]">
                              Payment Initialization & Coupon Check
                            </h4>
                          </div>

                          <form onSubmit={handleCreatePaymentIntent} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                                  Amount (INR)
                                </label>
                                <input
                                  type="number"
                                  min={1}
                                  step="0.01"
                                  required
                                  value={paymentAmountInr}
                                  onChange={(e) => setPaymentAmountInr(e.target.value)}
                                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-bold uppercase text-neutral-500 mb-1">
                                  Method
                                </label>
                                <select
                                  value={paymentMethod}
                                  onChange={(e) =>
                                    setPaymentMethod(
                                      e.target.value as "upi" | "card" | "netbanking" | "bank_transfer"
                                    )
                                  }
                                  className="w-full h-10 px-3 rounded-xl border border-neutral-200 text-sm bg-white"
                                >
                                  <option value="upi">UPI</option>
                                  <option value="card">Card</option>
                                  <option value="netbanking">NetBanking</option>
                                  <option value="bank_transfer">Bank Transfer</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value)}
                                placeholder="Coupon code (optional)"
                                className="flex-1 min-w-[180px] h-10 px-3 rounded-xl border border-neutral-200 text-xs"
                              />
                              <button
                                type="button"
                                onClick={() => void handleValidateCoupon()}
                                className="px-4 h-10 rounded-xl border border-[#8B263E] text-[#8B263E] text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#F5EEE7]"
                              >
                                <Tag className="w-3.5 h-3.5" />
                                <span>Validate Coupon</span>
                              </button>
                            </div>

                            {couponPreview && (
                              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                                Discount: <strong>{formatInr(couponPreview.discountInr)}</strong> •
                                Payable Total:{" "}
                                <strong>{formatInr(couponPreview.finalAmountInr)}</strong>
                              </div>
                            )}

                            <button
                              type="submit"
                              disabled={submittingPayment}
                              className="px-5 py-2.5 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                            >
                              {submittingPayment
                                ? "Creating Payment Intent..."
                                : "Initialize Payment Intent (Pending)"}
                            </button>
                          </form>

                          {paymentIntentResult && (
                            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                              <p className="font-bold text-amber-900">
                                Payment #{paymentIntentResult.payment.payment_id} —{" "}
                                {paymentIntentResult.payment.payment_status}
                              </p>
                              <p className="text-amber-800">
                                Order Ref: {paymentIntentResult.gatewayIntent.providerOrderId} (
                                {paymentIntentResult.gatewayIntent.provider})
                              </p>
                              {!paymentIntentResult.gatewayIntent.configured && (
                                <p className="text-amber-900 font-medium">
                                  Gateway keys are not configured in this environment. Status stays Pending until verified webhook or offline concierge confirmation.
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Booking Documents */}
                        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-4">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#8B263E]" />
                            <h4 className="font-serif text-base font-bold text-[#2D2D2D]">
                              Booking Documents ({bookingDetail.documents.length})
                            </h4>
                          </div>

                          {bookingDetail.documents.length > 0 && (
                            <div className="space-y-2">
                              {bookingDetail.documents.map((doc) => (
                                <div
                                  key={doc.document_id}
                                  className="p-3 rounded-xl bg-[#FAF7F3] border border-neutral-100 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <p className="font-semibold text-[#2D2D2D]">
                                      {doc.document_name || `Document #${doc.document_id}`}
                                    </p>
                                    <p className="text-[11px] text-neutral-500">
                                      {doc.document_type || "other"}
                                    </p>
                                  </div>
                                  <a
                                    href={doc.document_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[#8B263E] font-semibold hover:underline"
                                  >
                                    Open →
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}

                          <form onSubmit={handleAttachDocument} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <input
                              type="text"
                              required
                              minLength={2}
                              value={docName}
                              onChange={(e) => setDocName(e.target.value)}
                              placeholder="Document name"
                              className="h-9 px-3 rounded-lg border border-neutral-200 text-xs"
                            />
                            <input
                              type="url"
                              required
                              value={docUrl}
                              onChange={(e) => setDocUrl(e.target.value)}
                              placeholder="https://... document URL"
                              className="h-9 px-3 rounded-lg border border-neutral-200 text-xs"
                            />
                            <div className="flex gap-2">
                              <select
                                value={docType}
                                onChange={(e) =>
                                  setDocType(
                                    e.target.value as
                                      | "contract"
                                      | "invoice"
                                      | "receipt"
                                      | "floorplan"
                                      | "other"
                                  )
                                }
                                className="h-9 px-2 rounded-lg border border-neutral-200 text-xs bg-white flex-1"
                              >
                                <option value="contract">Contract</option>
                                <option value="invoice">Invoice</option>
                                <option value="receipt">Receipt</option>
                                <option value="floorplan">Floorplan</option>
                                <option value="other">Other</option>
                              </select>
                              <button
                                type="submit"
                                disabled={attachingDoc}
                                className="px-3.5 h-9 rounded-lg bg-[#8B263E] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
                              >
                                {attachingDoc ? "..." : "Attach"}
                              </button>
                            </div>
                          </form>
                        </div>

                        {/* Payment Ledger & Invoice Viewer */}
                        <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-4">
                          <div className="flex items-center gap-2">
                            <Receipt className="w-4 h-4 text-[#8B263E]" />
                            <h4 className="font-serif text-base font-bold text-[#2D2D2D]">
                              Payment History & Invoices
                            </h4>
                          </div>

                          {payments.length === 0 ? (
                            <p className="text-xs text-neutral-500">No payments recorded yet.</p>
                          ) : (
                            <div className="space-y-2">
                              {payments.map((p) => (
                                <div
                                  key={p.payment_id}
                                  className="p-3 rounded-xl bg-[#FAF7F3] border border-neutral-100 flex items-center justify-between text-xs"
                                >
                                  <div>
                                    <p className="font-semibold text-[#2D2D2D]">
                                      Payment #{p.payment_id} • {formatInr(p.amount)}
                                    </p>
                                    <p className="text-[11px] text-neutral-500">
                                      Method: {p.payment_method || "—"} • Booking #{p.booking_id ?? "—"}
                                    </p>
                                  </div>
                                  <span className="px-2.5 py-0.5 rounded-full bg-white border border-neutral-200 font-bold text-[10px]">
                                    {p.payment_status || "Pending"}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <form onSubmit={handleLoadInvoice} className="pt-2 border-t border-neutral-100 flex gap-2">
                            <input
                              type="number"
                              min={1}
                              value={invoiceIdInput}
                              onChange={(e) => setInvoiceIdInput(e.target.value)}
                              placeholder="Enter Invoice ID to inspect"
                              className="flex-1 h-9 px-3 rounded-lg border border-neutral-200 text-xs"
                            />
                            <button
                              type="submit"
                              className="px-4 h-9 rounded-lg border border-[#8B263E] text-[#8B263E] text-xs font-semibold cursor-pointer"
                            >
                              Fetch Invoice
                            </button>
                          </form>

                          {loadedInvoice && (
                            <div className="p-4 rounded-xl bg-[#F5EEE7] text-xs space-y-1">
                              <p className="font-bold text-[#2D2D2D]">
                                Invoice {loadedInvoice.invoice_number} (#{loadedInvoice.invoice_id})
                              </p>
                              <p>
                                Base: {formatInr(loadedInvoice.amount)} • Tax:{" "}
                                {formatInr(loadedInvoice.tax_amount)} • Total:{" "}
                                <strong>{formatInr(loadedInvoice.total_amount)}</strong>
                              </p>
                              {loadedInvoice.invoice_url && (
                                <a
                                  href={loadedInvoice.invoice_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[#8B263E] font-semibold underline inline-block mt-1"
                                >
                                  Download Invoice PDF →
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
