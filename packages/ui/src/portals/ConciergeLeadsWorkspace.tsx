"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Loader2,
  MessageSquare,
  Phone,
  Plus,
  Search,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  conciergeApi,
  extractArray,
  type BackendEnquiryStatus,
  type ConciergeEnquiryDetailDTO,
  type ConciergeLeadRow,
  type QuoteStatus,
  type SiteVisitStatus,
} from "@we-arrange/api-client";

const ENQUIRY_STATUSES: BackendEnquiryStatus[] = ["Pending", "Active", "Approved", "Rejected"];
const SITE_VISIT_STATUSES: SiteVisitStatus[] = ["Requested", "Scheduled", "Completed", "Cancelled"];

export function ConciergeLeadsWorkspace() {
  const [leads, setLeads] = useState<ConciergeLeadRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [assignedToMe, setAssignedToMe] = useState(false);

  const [selectedLeadId, setSelectedLeadId] = useState<number | null>(null);
  const [detail, setDetail] = useState<ConciergeEnquiryDetailDTO | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Status + Site Visit
  const [statusDraft, setStatusDraft] = useState<BackendEnquiryStatus>("Active");
  const [statusRemarks, setStatusRemarks] = useState("");
  const [visitStatus, setVisitStatus] = useState<SiteVisitStatus>("Scheduled");
  const [visitAtLocal, setVisitAtLocal] = useState("");
  const [visitNotes, setVisitNotes] = useState("");

  // Messaging
  const [newMessage, setNewMessage] = useState("");

  // Create Quote (mutually exclusive Venue OR Vendor)
  const [quoteTargetType, setQuoteTargetType] = useState<"venue" | "vendor">("venue");
  const [quoteTargetId, setQuoteTargetId] = useState("");
  const [quotePkgName, setQuotePkgName] = useState("");
  const [quoteCostInr, setQuoteCostInr] = useState("");
  const [quoteCatering, setQuoteCatering] = useState(true);
  const [quoteInclusions, setQuoteInclusions] = useState("");
  const [quoteExclusions, setQuoteExclusions] = useState("");
  const [quoteValidUntil, setQuoteValidUntil] = useState("");
  const [quoteNotes, setQuoteNotes] = useState("");
  const [quoteStatus, setQuoteStatus] = useState<"Draft" | "Published">("Published");

  // Comparison Sheet
  const [sheetTitle, setSheetTitle] = useState("");
  const [sheetSummary, setSheetSummary] = useState("");
  const [sheetQuoteIds, setSheetQuoteIds] = useState<number[]>([]);
  const [sheetStatus, setSheetStatus] = useState<"Draft" | "Published">("Published");

  // Booking conversion
  const [bookingQuoteId, setBookingQuoteId] = useState<number | null>(null);
  const [bookingEventDate, setBookingEventDate] = useState("");
  const [bookingGuests, setBookingGuests] = useState("300");
  const [bookingNotes, setBookingNotes] = useState("");

  // Private partner contacts & venue availability
  const [partnerContacts, setPartnerContacts] = useState<string | null>(null);
  const [availFrom, setAvailFrom] = useState("");
  const [availTo, setAvailTo] = useState("");
  const [availBooked, setAvailBooked] = useState(true);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const loadLeads = useCallback(async () => {
    setLoading(true);
    const res = await conciergeApi.listLeads({
      limit: 50,
      status: statusFilter === "All" ? undefined : (statusFilter as BackendEnquiryStatus),
      assignedToMe,
    });
    if (res.ok) {
      setLeads(extractArray<ConciergeLeadRow>(res.data));
    } else {
      setError(res.error || "Failed to load leads.");
    }
    setLoading(false);
  }, [statusFilter, assignedToMe]);

  useEffect(() => {
    void loadLeads();
  }, [loadLeads]);

  const openLeadDetail = useCallback(async (enquiryId: number) => {
    setSelectedLeadId(enquiryId);
    setLoadingDetail(true);
    setError(null);
    setPartnerContacts(null);
    const res = await conciergeApi.getEnquiryDetail(enquiryId);
    if (res.ok && res.data) {
      setDetail(res.data);
      const enq = res.data.enquiry;
      setStatusDraft((enq.status as BackendEnquiryStatus) || "Pending");
      setVisitStatus((enq.site_visit_status as SiteVisitStatus) || "Scheduled");
      setVisitNotes(enq.site_visit_notes || "");
      setVisitAtLocal(
        enq.site_visit_at ? new Date(enq.site_visit_at).toISOString().slice(0, 16) : ""
      );
      if (enq.venue_id) {
        setQuoteTargetType("venue");
        setQuoteTargetId(String(enq.venue_id));
      } else if (enq.vendor_id) {
        setQuoteTargetType("vendor");
        setQuoteTargetId(String(enq.vendor_id));
      } else {
        setQuoteTargetId("");
      }
      setSheetQuoteIds(res.data.quotes.map((q) => q.quote_id));
    } else {
      setError(res.error || "Failed to load enquiry details.");
    }
    setLoadingDetail(false);
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) return;
    const res = await conciergeApi.updateEnquiryStatus(selectedLeadId, {
      status: statusDraft,
      ...(statusRemarks.trim() ? { remarks: statusRemarks.trim() } : {}),
    });
    if (!res.ok) {
      setError(res.error || "Status update failed.");
      return;
    }
    setStatusRemarks("");
    showToast(`Enquiry #${selectedLeadId} status updated to ${statusDraft}.`);
    await Promise.all([loadLeads(), openLeadDetail(selectedLeadId)]);
  };

  const handleSaveSiteVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) return;
    const res = await conciergeApi.scheduleSiteVisit(selectedLeadId, {
      siteVisitStatus: visitStatus,
      ...(visitAtLocal ? { siteVisitAt: new Date(visitAtLocal).toISOString() } : {}),
      ...(visitNotes.trim() ? { siteVisitNotes: visitNotes.trim() } : {}),
    });
    if (!res.ok) {
      setError(res.error || "Failed to update site visit.");
      return;
    }
    showToast("Site visit details saved.");
    await Promise.all([loadLeads(), openLeadDetail(selectedLeadId)]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !newMessage.trim()) return;
    const res = await conciergeApi.sendEnquiryMessage(selectedLeadId, newMessage.trim());
    if (!res.ok) {
      setError(res.error || "Failed to send message.");
      return;
    }
    setNewMessage("");
    showToast("Message delivered to customer.");
    await openLeadDetail(selectedLeadId);
  };

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) return;
    const targetNum = Number(quoteTargetId);
    const costNum = Number(quoteCostInr);
    if (!targetNum || !quotePkgName.trim() || !costNum) {
      setError("Enter a valid target ID, package name, and base cost (INR).");
      return;
    }

    const res = await conciergeApi.createQuote(selectedLeadId, {
      ...(quoteTargetType === "venue" ? { venueId: targetNum } : { vendorId: targetNum }),
      packageName: quotePkgName.trim(),
      baseCostInr: costNum,
      cateringIncluded: quoteCatering,
      inclusions: quoteInclusions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      exclusions: quoteExclusions
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      ...(quoteNotes.trim() ? { notes: quoteNotes.trim() } : {}),
      ...(quoteValidUntil ? { validUntil: quoteValidUntil } : {}),
      status: quoteStatus,
    });

    if (!res.ok) {
      setError(res.error || "Failed to create quote.");
      return;
    }
    setQuotePkgName("");
    setQuoteCostInr("");
    setQuoteInclusions("");
    setQuoteExclusions("");
    setQuoteNotes("");
    showToast("Quote created successfully.");
    await openLeadDetail(selectedLeadId);
  };

  const handleQuoteStatusChange = async (quoteId: number, status: QuoteStatus) => {
    if (!selectedLeadId) return;
    const res = await conciergeApi.updateQuote(quoteId, { status });
    if (!res.ok) {
      setError(res.error || "Failed to update quote status.");
      return;
    }
    showToast(`Quote #${quoteId} marked ${status}.`);
    await openLeadDetail(selectedLeadId);
  };

  const handleCreateComparisonSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || sheetQuoteIds.length === 0 || !sheetTitle.trim()) {
      setError("Select at least one quote and provide a comparison sheet title.");
      return;
    }
    const res = await conciergeApi.createComparisonSheet(selectedLeadId, {
      title: sheetTitle.trim(),
      quoteIds: sheetQuoteIds,
      ...(sheetSummary.trim() ? { summaryNotes: sheetSummary.trim() } : {}),
      status: sheetStatus,
    });
    if (!res.ok) {
      setError(res.error || "Failed to publish comparison sheet.");
      return;
    }
    setSheetTitle("");
    setSheetSummary("");
    showToast("Comparison sheet saved.");
    await openLeadDetail(selectedLeadId);
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingQuoteId || !bookingEventDate) return;
    const res = await conciergeApi.createBooking({
      quoteId: bookingQuoteId,
      eventDate: bookingEventDate,
      ...(bookingGuests ? { guestCount: Number(bookingGuests) } : {}),
      ...(bookingNotes.trim() ? { notes: bookingNotes.trim() } : {}),
    });
    if (!res.ok) {
      setError(res.error || "Failed to create booking.");
      return;
    }
    setBookingQuoteId(null);
    setBookingEventDate("");
    setBookingNotes("");
    showToast("Booking created from approved quote!");
  };

  const handleFetchPartnerContacts = async () => {
    if (!detail) return;
    if (detail.enquiry.venue_id) {
      const res = await conciergeApi.getVenueContacts(detail.enquiry.venue_id);
      if (!res.ok || !res.data) {
        setError(res.error || "Unable to fetch venue contacts.");
        return;
      }
      setPartnerContacts(
        `${res.data.venueName} • Phone: ${res.data.primaryPhone || "—"} • ${
          res.data.contacts.length
        } direct contacts`
      );
    } else if (detail.enquiry.vendor_id) {
      const res = await conciergeApi.getVendorContacts(detail.enquiry.vendor_id);
      if (!res.ok || !res.data) {
        setError(res.error || "Unable to fetch vendor contacts.");
        return;
      }
      setPartnerContacts(
        `${res.data.vendorName} • ${res.data.contacts.length} direct contacts`
      );
    }
  };

  const handleBlockAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail?.enquiry.venue_id || !availFrom || !availTo) return;
    const res = await conciergeApi.addVenueAvailability(detail.enquiry.venue_id, {
      availableFrom: availFrom,
      availableTo: availTo,
      isBooked: availBooked,
    });
    if (!res.ok) {
      setError(res.error || "Failed to update venue availability.");
      return;
    }
    setAvailFrom("");
    setAvailTo("");
    showToast(`Venue #${detail.enquiry.venue_id} availability slot saved.`);
  };

  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) =>
        String(l.enquiry_id).includes(q) ||
        (l.subject || "").toLowerCase().includes(q) ||
        (l.customer?.full_name || "").toLowerCase().includes(q) ||
        (l.customer?.email || "").toLowerCase().includes(q)
    );
  }, [leads, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#8B263E] text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#C8A165]" />
          <span>{toast}</span>
        </div>
      )}

      <div className="border-b border-[#E5E0D8] pb-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A165]">
          CRM &amp; Concierge Operations
        </span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight mt-0.5">
          Leads, Quotes &amp; Site Visits Desk
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Respond to client enquiries, schedule site visits, issue itemized quotes, publish comparison
          sheets, and convert bookings.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center justify-between">
          <span>{error}</span>
          <button type="button" onClick={() => setError(null)} className="text-red-500">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-[#E5E0D8] rounded-2xl p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          {["All", ...ENQUIRY_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === st
                  ? "bg-[#8B263E] text-white"
                  : "bg-[#FAF9F6] text-neutral-600 hover:text-[#8B263E]"
              }`}
            >
              {st}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAssignedToMe((prev) => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              assignedToMe
                ? "bg-[#FAF5ED] border-[#C8A165] text-[#8B263E]"
                : "bg-white border-[#E5E0D8] text-neutral-600"
            }`}
          >
            Assigned To Me
          </button>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID, client, subject..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Leads List */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-8 text-center text-neutral-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#8B263E]" />
              Loading enquiries...
            </div>
          ) : filteredLeads.length === 0 ? (
            <div className="bg-white border border-[#E5E0D8] rounded-2xl p-8 text-center text-neutral-500 text-xs">
              No leads match the current filters.
            </div>
          ) : (
            filteredLeads.map((lead) => (
              <button
                key={lead.enquiry_id}
                type="button"
                onClick={() => void openLeadDetail(lead.enquiry_id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all ${
                  selectedLeadId === lead.enquiry_id
                    ? "bg-[#FAF5ED] border-[#8B263E] shadow-sm"
                    : "bg-white border-[#E5E0D8] hover:border-[#C8A165]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#8B263E]">
                    Enquiry #{lead.enquiry_id}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white border border-[#E5E0D8] text-neutral-700">
                    {lead.status || "Pending"}
                  </span>
                </div>
                <div className="font-bold text-sm text-neutral-900 mt-1">
                  {lead.subject || "Concierge Wedding Request"}
                </div>
                <div className="text-xs text-neutral-600 mt-0.5">
                  {lead.customer?.full_name || lead.customer?.email || "Customer"}
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2">
                  <span>Visit: {lead.site_visit_status || "None"}</span>
                  <span>
                    {lead.venue_id
                      ? `Venue #${lead.venue_id}`
                      : lead.vendor_id
                        ? `Vendor #${lead.vendor_id}`
                        : "General"}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Workspace Detail Column */}
        <div className="lg:col-span-7">
          {!selectedLeadId ? (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-10 text-center text-neutral-500 text-xs">
              Select an enquiry on the left to manage conversation, site visit, quotes, and bookings.
            </div>
          ) : loadingDetail || !detail ? (
            <div className="bg-white border border-[#E5E0D8] rounded-3xl p-10 text-center text-neutral-500 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-[#8B263E]" />
              Loading enquiry #{selectedLeadId}...
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header & Partner Contacts */}
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-serif font-bold text-xl text-neutral-900">
                      #{detail.enquiry.enquiry_id} — {detail.enquiry.subject || "Wedding Enquiry"}
                    </h2>
                    <p className="text-xs text-neutral-600 mt-1">{detail.enquiry.message}</p>
                  </div>
                  {(detail.enquiry.venue_id || detail.enquiry.vendor_id) && (
                    <button
                      type="button"
                      onClick={() => void handleFetchPartnerContacts()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF5ED] border border-[#C8A165]/40 text-xs font-bold text-[#8B263E]"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Private Contacts</span>
                    </button>
                  )}
                </div>
                {partnerContacts && (
                  <div className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8] text-xs font-medium text-neutral-700">
                    {partnerContacts}
                  </div>
                )}

                {/* Status Update */}
                <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                  <select
                    value={statusDraft}
                    onChange={(e) => setStatusDraft(e.target.value as BackendEnquiryStatus)}
                    className="text-xs border border-[#E5E0D8] rounded-xl px-3 py-2 bg-[#FAF9F6] font-semibold"
                  >
                    {ENQUIRY_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                    placeholder="Status remarks (optional)"
                    className="text-xs border border-[#E5E0D8] rounded-xl px-3 py-2 bg-[#FAF9F6]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#8B263E] text-white text-xs font-bold hover:bg-[#721f33]"
                  >
                    Update Status
                  </button>
                </form>
              </div>

              {/* Site Visit & Venue Availability */}
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                  <CalendarClock className="w-4 h-4 text-[#8B263E]" />
                  <span>Site Visit Scheduling</span>
                </div>
                <form onSubmit={handleSaveSiteVisit} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <select
                    value={visitStatus}
                    onChange={(e) => setVisitStatus(e.target.value as SiteVisitStatus)}
                    className="text-xs border border-[#E5E0D8] rounded-xl px-3 py-2 bg-[#FAF9F6]"
                  >
                    {SITE_VISIT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <input
                    type="datetime-local"
                    value={visitAtLocal}
                    onChange={(e) => setVisitAtLocal(e.target.value)}
                    className="text-xs border border-[#E5E0D8] rounded-xl px-3 py-2 bg-[#FAF9F6]"
                  />
                  <input
                    type="text"
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    placeholder="Site visit notes..."
                    className="sm:col-span-2 text-xs border border-[#E5E0D8] rounded-xl px-3 py-2 bg-[#FAF9F6]"
                  />
                  <button
                    type="submit"
                    className="sm:col-span-2 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold hover:bg-neutral-800"
                  >
                    Save Site Visit
                  </button>
                </form>

                {detail.enquiry.venue_id && (
                  <form
                    onSubmit={handleBlockAvailability}
                    className="pt-3 border-t border-[#E5E0D8] grid grid-cols-1 sm:grid-cols-4 gap-2 items-center"
                  >
                    <input
                      type="date"
                      value={availFrom}
                      onChange={(e) => setAvailFrom(e.target.value)}
                      className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-1.5 bg-[#FAF9F6]"
                      required
                    />
                    <input
                      type="date"
                      value={availTo}
                      onChange={(e) => setAvailTo(e.target.value)}
                      className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-1.5 bg-[#FAF9F6]"
                      required
                    />
                    <label className="flex items-center gap-1.5 text-xs text-neutral-700">
                      <input
                        type="checkbox"
                        checked={availBooked}
                        onChange={(e) => setAvailBooked(e.target.checked)}
                      />
                      <span>Mark Booked</span>
                    </label>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-xl bg-[#FAF5ED] border border-[#C8A165]/50 text-[#8B263E] text-xs font-bold"
                    >
                      Save Venue Slot
                    </button>
                  </form>
                )}
              </div>

              {/* Messages */}
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                  <MessageSquare className="w-4 h-4 text-[#8B263E]" />
                  <span>Conversation ({detail.messages.length})</span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {detail.messages.map((m) => (
                    <div
                      key={m.message_id}
                      className="p-2.5 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8] text-xs"
                    >
                      <div className="text-neutral-800">{m.message}</div>
                      <div className="text-[10px] text-neutral-400 mt-1">
                        {m.created_at ? new Date(m.created_at).toLocaleString("en-IN") : ""}
                      </div>
                    </div>
                  ))}
                  {detail.messages.length === 0 && (
                    <p className="text-xs text-neutral-400">No messages yet.</p>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Reply to customer..."
                    className="flex-1 text-xs border border-[#E5E0D8] rounded-xl px-3 py-2 bg-[#FAF9F6]"
                  />
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#8B263E] text-white text-xs font-bold"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>

              {/* Create Quote & Existing Quotes */}
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                  <ClipboardList className="w-4 h-4 text-[#8B263E]" />
                  <span>Itemized Quotes ({detail.quotes.length})</span>
                </div>

                <div className="space-y-2.5">
                  {detail.quotes.map((q) => (
                    <div
                      key={q.quote_id}
                      className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#E5E0D8] space-y-2"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-neutral-900">
                            Quote #{q.quote_id}: {q.package_name}
                          </span>
                          <span className="ml-2 text-xs font-bold text-[#8B263E]">
                            ₹{Number(q.base_cost_inr).toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <select
                            value={(q.status as QuoteStatus) || "Draft"}
                            onChange={(e) =>
                              void handleQuoteStatusChange(q.quote_id, e.target.value as QuoteStatus)
                            }
                            className="text-[11px] border border-[#E5E0D8] rounded-lg px-2 py-1 bg-white font-semibold"
                          >
                            <option value="Draft">Draft</option>
                            <option value="Published">Published</option>
                            <option value="Approved" disabled>Approved (Customer/Admin)</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          <button
                            type="button"
                            disabled={q.status !== "Approved"}
                            title={q.status !== "Approved" ? "Customer must approve quote before booking" : "Convert approved quote to booking"}
                            onClick={() => setBookingQuoteId(q.quote_id)}
                            className="px-2.5 py-1 rounded-lg bg-[#8B263E] text-white text-[11px] font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          >
                            Book
                          </button>
                        </div>
                      </div>
                      {q.notes && <p className="text-[11px] text-neutral-600">{q.notes}</p>}
                    </div>
                  ))}
                </div>

                {bookingQuoteId && (
                  <form
                    onSubmit={handleCreateBooking}
                    className="p-3.5 rounded-2xl bg-[#FAF5ED] border border-[#C8A165]/50 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#8B263E]">
                      <span>Convert Quote #{bookingQuoteId} to Booking</span>
                      <button type="button" onClick={() => setBookingQuoteId(null)}>
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="date"
                        value={bookingEventDate}
                        onChange={(e) => setBookingEventDate(e.target.value)}
                        required
                        className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-1.5 bg-white"
                      />
                      <input
                        type="number"
                        value={bookingGuests}
                        onChange={(e) => setBookingGuests(e.target.value)}
                        placeholder="Guests"
                        className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-1.5 bg-white"
                      />
                      <input
                        type="text"
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        placeholder="Booking notes"
                        className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-1.5 bg-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-[#8B263E] text-white text-xs font-bold"
                    >
                      Confirm Booking Creation
                    </button>
                  </form>
                )}

                {/* New Quote Form */}
                <form
                  onSubmit={handleCreateQuote}
                  className="pt-3 border-t border-[#E5E0D8] space-y-2.5"
                >
                  <div className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-[#8B263E]" />
                    <span>Issue New Quote</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                      value={quoteTargetType}
                      onChange={(e) => setQuoteTargetType(e.target.value as "venue" | "vendor")}
                      className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-2 bg-[#FAF9F6]"
                    >
                      <option value="venue">Venue ID</option>
                      <option value="vendor">Vendor ID</option>
                    </select>
                    <input
                      type="number"
                      value={quoteTargetId}
                      onChange={(e) => setQuoteTargetId(e.target.value)}
                      placeholder={quoteTargetType === "venue" ? "Venue ID" : "Vendor ID"}
                      required
                      className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-2 bg-[#FAF9F6]"
                    />
                    <input
                      type="number"
                      value={quoteCostInr}
                      onChange={(e) => setQuoteCostInr(e.target.value)}
                      placeholder="Base Cost (INR)"
                      required
                      className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-2 bg-[#FAF9F6]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={quotePkgName}
                      onChange={(e) => setQuotePkgName(e.target.value)}
                      placeholder="Package name"
                      required
                      className="sm:col-span-2 text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-2 bg-[#FAF9F6]"
                    />
                    <input
                      type="date"
                      value={quoteValidUntil}
                      onChange={(e) => setQuoteValidUntil(e.target.value)}
                      className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-2 bg-[#FAF9F6]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={quoteInclusions}
                      onChange={(e) => setQuoteInclusions(e.target.value)}
                      placeholder="Inclusions (comma separated)"
                      className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-2 bg-[#FAF9F6]"
                    />
                    <input
                      type="text"
                      value={quoteExclusions}
                      onChange={(e) => setQuoteExclusions(e.target.value)}
                      placeholder="Exclusions (comma separated)"
                      className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-2 bg-[#FAF9F6]"
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-neutral-700">
                      <input
                        type="checkbox"
                        checked={quoteCatering}
                        onChange={(e) => setQuoteCatering(e.target.checked)}
                      />
                      <span>Catering Included</span>
                    </label>
                    <select
                      value={quoteStatus}
                      onChange={(e) => setQuoteStatus(e.target.value as "Draft" | "Published")}
                      className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-1.5 bg-[#FAF9F6]"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#8B263E] text-white text-xs font-bold"
                    >
                      Create Quote
                    </button>
                  </div>
                </form>
              </div>

              {/* Comparison Sheets */}
              <div className="bg-white border border-[#E5E0D8] rounded-3xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-700">
                  <Sparkles className="w-4 h-4 text-[#C8A165]" />
                  <span>Comparison Sheets ({detail.comparisonSheets.length})</span>
                </div>
                {detail.comparisonSheets.map((cs) => (
                  <div
                    key={cs.comparison_sheet_id ?? cs.sheet_id}
                    className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8] text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-neutral-900">{cs.title}</span>
                      <span className="ml-2 text-neutral-500">
                        ({(cs.quote_ids ?? []).length} quotes)
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-[#E5E0D8] text-[10px] font-bold">
                      {cs.status || "Draft"}
                    </span>
                  </div>
                ))}

                <form onSubmit={handleCreateComparisonSheet} className="space-y-2 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={sheetTitle}
                      onChange={(e) => setSheetTitle(e.target.value)}
                      placeholder="Comparison sheet title"
                      className="sm:col-span-2 text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-2 bg-[#FAF9F6]"
                    />
                    <select
                      value={sheetStatus}
                      onChange={(e) => setSheetStatus(e.target.value as "Draft" | "Published")}
                      className="text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-2 bg-[#FAF9F6]"
                    >
                      <option value="Published">Published</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {detail.quotes.map((q) => {
                      const checked = sheetQuoteIds.includes(q.quote_id);
                      return (
                        <label
                          key={q.quote_id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#E5E0D8] text-[11px]"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) =>
                              setSheetQuoteIds((prev) =>
                                e.target.checked
                                  ? [...prev, q.quote_id]
                                  : prev.filter((id) => id !== q.quote_id)
                              )
                            }
                          />
                          <span>Quote #{q.quote_id}</span>
                        </label>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={sheetSummary}
                    onChange={(e) => setSheetSummary(e.target.value)}
                    placeholder="Concierge summary recommendation..."
                    className="w-full text-xs border border-[#E5E0D8] rounded-xl px-2.5 py-2 bg-[#FAF9F6]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-bold"
                  >
                    Publish Comparison Sheet
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
