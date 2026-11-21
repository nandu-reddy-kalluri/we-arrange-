"use client";

import React, { useCallback, useEffect, useState } from "react";
import { apiClient } from "@we-arrange/api-client";
import { FolderHeart, Pencil, Plus, Send, Trash2 } from "lucide-react";

interface CollectionRow {
  collection_id: number;
  collection_name: string;
  description: string | null;
  created_at?: string | null;
}

export function ShortlistQuoteBanner({
  savedVenueIds,
  savedVendorIds,
}: {
  savedVenueIds: string[];
  savedVendorIds: string[];
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("Concierge Quote Request for My Saved Shortlist");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentId, setSentId] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSentId(null);

    const firstVenueId = savedVenueIds.map(Number).find((n) => Number.isInteger(n) && n > 0);
    const firstVendorId = savedVendorIds.map(Number).find((n) => Number.isInteger(n) && n > 0);
    const shortlistSummary = `Saved Venue IDs: ${savedVenueIds.join(", ") || "None"} | Saved Vendor IDs: ${savedVendorIds.join(", ") || "None"}`;
    const combinedMessage = `${message.trim() || "Please prepare availability and pricing quotes for my shortlisted venues and vendors."}\n\n[${shortlistSummary}]`;

    const res = await apiClient.post<{ enquiry_id: number }>("/api/enquiries", {
      subject: subject.trim(),
      message: combinedMessage,
      ...(firstVenueId ? { venueId: firstVenueId } : {}),
      ...(!firstVenueId && firstVendorId ? { vendorId: firstVendorId } : {}),
    });

    setSubmitting(false);
    if (!res.ok) {
      setError(res.error || "Please sign in to submit a shortlist quote request.");
      return;
    }

    setSentId(res.data?.enquiry_id ?? 1);
    setOpen(false);
    setMessage("");
  };

  return (
    <div className="bg-[#FAF7F3] rounded-2xl border border-[#8B263E]/15 p-5 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="font-serif text-base font-bold text-[#2D2D2D]">
            Request Concierge Quotation for Shortlist
          </h4>
          <p className="text-xs text-neutral-600">
            Send all {savedVenueIds.length} venue(s) and {savedVendorIds.length} vendor(s) to our concierge desk in one enquiry.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="px-4 py-2 rounded-full bg-[#8B263E] hover:bg-[#701E31] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{open ? "Close Form" : "Request Quote"}</span>
        </button>
      </div>

      {sentId && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium">
          Enquiry #{sentId} created! View replies & quotations in My Bookings & Quotes.
        </div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      {open && (
        <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-[#8B263E]/10">
          <input
            type="text"
            required
            minLength={3}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-neutral-200 bg-white text-xs"
          />
          <textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Optional event dates, guest estimate, or package preferences..."
            className="w-full p-3 rounded-xl border border-neutral-200 bg-white text-xs"
          />
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2 rounded-full bg-[#8B263E] text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Send Concierge Enquiry"}
          </button>
        </form>
      )}
    </div>
  );
}

export function CustomerCollectionsPanel() {
  const [collections, setCollections] = useState<CollectionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const loadCollections = useCallback(async () => {
    setLoading(true);
    const res = await apiClient.get<CollectionRow[]>("/api/favorites/collections", {
      query: { limit: 30 },
      retryOn401: false,
    });
    if (res.ok && Array.isArray(res.data)) {
      setCollections(res.data);
      setError(null);
    } else if (res.status !== 401 && res.error) {
      setError(res.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadCollections();
  }, [loadCollections]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setError(null);
    const res = await apiClient.post<CollectionRow>("/api/favorites/collections", {
      collectionName: newName.trim(),
      ...(newDesc.trim() ? { description: newDesc.trim() } : {}),
    });
    if (!res.ok) {
      setError(res.error || "Failed to create collection.");
      return;
    }
    setNewName("");
    setNewDesc("");
    await loadCollections();
  };

  const handleRename = async (id: number) => {
    if (!editName.trim()) return;
    const res = await apiClient.patch<CollectionRow>(`/api/favorites/collections/${id}`, {
      collectionName: editName.trim(),
    });
    if (!res.ok) {
      setError(res.error || "Failed to rename collection.");
      return;
    }
    setEditingId(null);
    await loadCollections();
  };

  const handleDelete = async (id: number) => {
    const res = await apiClient.delete(`/api/favorites/collections/${id}`);
    if (!res.ok) {
      setError(res.error || "Failed to delete collection.");
      return;
    }
    setCollections((prev) => prev.filter((c) => c.collection_id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-[#8B263E]/10 p-6 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FolderHeart className="w-4 h-4 text-[#8B263E]" />
          <h3 className="font-serif text-lg font-bold text-[#2D2D2D]">
            Curated Collections
          </h3>
        </div>
        <span className="text-xs font-bold text-neutral-500">
          {collections.length} collection{collections.length === 1 ? "" : "s"}
        </span>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="flex flex-wrap gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New collection (e.g., Sangeet Venues)"
          className="flex-1 min-w-[200px] h-10 px-3 rounded-xl border border-neutral-200 text-xs"
        />
        <input
          type="text"
          value={newDesc}
          onChange={(e) => setNewDesc(e.target.value)}
          placeholder="Optional note"
          className="flex-1 min-w-[160px] h-10 px-3 rounded-xl border border-neutral-200 text-xs"
        />
        <button
          type="submit"
          className="px-4 h-10 rounded-xl bg-[#8B263E] text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create</span>
        </button>
      </form>

      {loading ? (
        <p className="text-xs text-neutral-400">Loading collections...</p>
      ) : collections.length === 0 ? (
        <p className="text-xs text-neutral-500">
          Group saved venues and vendors into themed wedding event boards.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collections.map((c) => (
            <div
              key={c.collection_id}
              className="p-3.5 rounded-xl bg-[#FAF7F3] border border-[#8B263E]/10 flex items-start justify-between gap-2"
            >
              {editingId === c.collection_id ? (
                <div className="flex-1 flex gap-1.5">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 h-8 px-2 rounded border border-neutral-300 text-xs bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => void handleRename(c.collection_id)}
                    className="px-2.5 h-8 rounded bg-[#8B263E] text-white text-[11px] font-semibold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-serif font-bold text-[#2D2D2D]">
                    {c.collection_name}
                  </p>
                  {c.description && (
                    <p className="text-[11px] text-neutral-500 mt-0.5">{c.description}</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(c.collection_id);
                    setEditName(c.collection_name);
                  }}
                  title="Rename"
                  className="p-1 text-neutral-400 hover:text-[#8B263E] cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(c.collection_id)}
                  title="Delete"
                  className="p-1 text-neutral-400 hover:text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
