"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  MessageSquareQuote,
  Search,
  CheckCircle2,
  Calendar,
  Users,
  IndianRupee,
  MapPin,
  Phone,
  Mail,
  Edit,
  Save,
  X,
  Clock,
  Sparkles,
  Building2,
  UserCheck,
} from "lucide-react";
import { adminDataService, AdminLead } from "@/services/admin/adminDataService";

const STATUSES: AdminLead["status"][] = [
  "New",
  "Contacted",
  "Negotiating",
  "Quote Sent",
  "Won / Closed",
  "Lost",
];

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Lead Detail Drawer State
  const [selectedLead, setSelectedLead] = useState<AdminLead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<AdminLead["status"]>("New");
  const [editNotes, setEditNotes] = useState("");
  const [editAssigned, setEditAssigned] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadLeads();
  }, []);

  const loadLeads = async () => {
    const data = await adminDataService.getLeads();
    setLeads(data);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenLead = (lead: AdminLead) => {
    setSelectedLead(lead);
    setEditStatus(lead.status);
    setEditNotes(lead.internalNotes || "");
    setEditAssigned(lead.assignedTo || "");
    setIsDrawerOpen(true);
  };

  const handleSaveDrawer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    setIsSaving(true);
    const res = await adminDataService.updateLeadStatus(
      selectedLead.id,
      editStatus,
      editNotes,
      editAssigned
    );
    setIsSaving(false);
    await loadLeads();
    setIsDrawerOpen(false);
    showToast(res.message);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchSearch =
        lead.coupleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.ceremony.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.venueInquired.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === "All" || lead.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, searchQuery, statusFilter]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#8B263E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C8A165]/50 text-xs font-bold flex items-center gap-2.5 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-[#C8A165]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-[#E5E0D8] pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A165]">
          Client Inquiries &amp; Quotations
        </span>
        <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight mt-0.5">
          Concierge Leads Manager
        </h1>
        <p className="text-xs sm:text-sm text-neutral-500 mt-1">
          Review couple ceremony inquiries, guest capacity needs, budgets, specialist assignments, and quotation statuses.
        </p>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by couple name, ceremony, or venue..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("All")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              statusFilter === "All"
                ? "bg-[#8B263E] text-white shadow-sm"
                : "text-neutral-600 bg-[#FAF9F6] hover:bg-[#FAF5ED]"
            }`}
          >
            All Leads ({leads.length})
          </button>
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === status
                  ? "bg-[#8B263E] text-white shadow-sm"
                  : "text-neutral-600 bg-[#FAF9F6] hover:bg-[#FAF5ED]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Leads Management Table */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                <th className="pb-3 font-semibold">Couple / Lead</th>
                <th className="pb-3 font-semibold">Ceremony</th>
                <th className="pb-3 font-semibold">Guests &amp; Budget</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Assigned Specialist</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => handleOpenLead(lead)}
                  className="hover:bg-[#FAF9F6] cursor-pointer transition-colors"
                >
                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-neutral-900 text-sm">
                        {lead.coupleName}
                      </span>
                      <span className="text-[11px] text-neutral-400 font-mono">
                        {lead.phone}
                      </span>
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-800">
                        {lead.ceremony}
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        {lead.city} • {lead.preferredDates}
                      </span>
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-800">
                        {lead.guests}
                      </span>
                      <span className="font-bold text-[#8B263E]">
                        {lead.budget}
                      </span>
                    </div>
                  </td>

                  <td className="py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === "New"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : lead.status === "Contacted"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : lead.status === "Negotiating"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : lead.status === "Quote Sent"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : lead.status === "Won / Closed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-1.5 font-medium text-neutral-700">
                      <UserCheck className="w-3.5 h-3.5 text-[#C8A165]" />
                      <span>{lead.assignedTo || "Unassigned"}</span>
                    </div>
                  </td>

                  <td className="py-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenLead(lead);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF5ED] text-[#8B263E] hover:bg-[#8B263E] hover:text-white font-bold text-xs transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Slide-over Drawer */}
      {isDrawerOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft">
            <div className="p-6 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A165]">
                  Concierge Case File
                </span>
                <h2 className="font-serif font-bold text-xl text-neutral-900">
                  {selectedLead.coupleName}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDrawer} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 1. Couple Requirements */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b pb-1">
                  1. Couple Requirements
                </h3>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8]">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      Ceremony Type
                    </span>
                    <span className="font-bold text-neutral-900">
                      {selectedLead.ceremony}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8]">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      Guest Count
                    </span>
                    <span className="font-bold text-neutral-900">
                      {selectedLead.guests}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8]">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      Budget Envelope
                    </span>
                    <span className="font-bold text-[#8B263E]">
                      {selectedLead.budget}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8]">
                    <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                      Preferred Dates
                    </span>
                    <span className="font-semibold text-neutral-800">
                      {selectedLead.preferredDates}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8] text-xs">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block mb-1">
                    Venue Inquired / Target Space
                  </span>
                  <div className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-[#C8A165]" />
                    <span>{selectedLead.venueInquired}</span>
                  </div>
                </div>
              </div>

              {/* 2. Contact Information */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b pb-1">
                  2. Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8]">
                    <Phone className="w-4 h-4 text-[#8B263E] shrink-0" />
                    <span className="font-mono font-bold text-neutral-900">
                      {selectedLead.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#FAF9F6] border border-[#E5E0D8]">
                    <Mail className="w-4 h-4 text-[#C8A165] shrink-0" />
                    <span className="font-mono text-neutral-900 truncate">
                      {selectedLead.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Concierge Workflow & Notes */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b pb-1">
                  3. Concierge Workflow &amp; Notes
                </h3>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                    Lead Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as AdminLead["status"])
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-bold text-neutral-900"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                    Assigned Concierge Specialist
                  </label>
                  <input
                    type="text"
                    value={editAssigned}
                    onChange={(e) => setEditAssigned(e.target.value)}
                    placeholder="e.g. Pooja Reddy"
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-semibold text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                    Internal Concierge Notes &amp; Bids
                  </label>
                  <textarea
                    rows={4}
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Record quote bids, decorator permits, special requests..."
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium text-neutral-800"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-[#E5E0D8] flex items-center justify-end gap-3 safe-area-bottom">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-[#8B263E] hover:bg-[#721f33] shadow-md disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : "Save Note & Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
