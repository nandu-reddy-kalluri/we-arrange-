"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Star,
  MapPin,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { adminDataService } from "@/services/admin/adminDataService";
import { Vendor, vendorCategories } from "@/mock-data/vendors";

const CATEGORY_TABS = [
  { label: "All", slug: "all" },
  { label: "Photography", slug: "photography" },
  { label: "Decor", slug: "decor" },
  { label: "Makeup", slug: "makeup" },
  { label: "Catering", slug: "catering" },
  { label: "Mehendi", slug: "mehendi" },
];

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Drawer & Modal States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    const data = await adminDataService.getVendors();
    setVendors(data);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingVendor({
      id: `vendor_${Date.now()}`,
      name: "",
      category: activeTab !== "all" ? activeTab : "photography",
      location: "Banjara Hills",
      city: "Hyderabad",
      priceStart: 1.5,
      rating: 4.9,
      reviewsCount: 1,
      imageUrl: "/images/editorial/vendor_photography.png",
      slug: "",
      experience: 5,
      availability: "Available",
      tier: "Luxury",
      isVerified: true,
      isFeatured: false,
      tags: ["Verified Partner"],
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (vendor: Vendor) => {
    setEditingVendor(JSON.parse(JSON.stringify(vendor)));
    setIsDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor || !editingVendor.name) return;

    if (!editingVendor.slug) {
      editingVendor.slug = editingVendor.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    const res = await adminDataService.saveVendor(editingVendor);
    await loadVendors();
    setIsDrawerOpen(false);
    showToast(res.message);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    const res = await adminDataService.deleteVendor(deleteTargetId);
    await loadVendors();
    setDeleteTargetId(null);
    showToast(res.message);
  };

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchTab = activeTab === "all" || v.category.toLowerCase() === activeTab.toLowerCase();
      const matchSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [vendors, activeTab, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#8B263E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#C8A165]/50 text-xs font-bold flex items-center gap-2.5 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-[#C8A165]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-neutral-900">
                Delete Vendor
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete this item? This action will remove the professional profile from active vendor listings.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A165]">
            Artist &amp; Vendor Network
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight mt-0.5">
            Vendors Admin Manager
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Maintain wedding photographers, decorators, makeup stylists, caterers, and artists.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B263E] hover:bg-[#721f33] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Vendor</span>
        </button>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#E5E0D8] rounded-2xl p-3 shadow-sm">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.slug}
              type="button"
              onClick={() => setActiveTab(tab.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab.slug
                  ? "bg-[#8B263E] text-white shadow-sm"
                  : "text-neutral-600 hover:bg-[#FAF9F6] hover:text-neutral-900"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor name or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
          />
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                <th className="pb-3 font-semibold">Vendor Name</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Starting Price</th>
                <th className="pb-3 font-semibold">Rating</th>
                <th className="pb-3 font-semibold">Tier</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {vendor.imageUrl && (
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-[#E5E0D8]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={vendor.imageUrl}
                            alt={vendor.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900 text-sm">
                          {vendor.name}
                        </span>
                        <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#C8A165]" />
                          <span>{vendor.location}</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <span className="capitalize font-semibold text-neutral-700 bg-[#FAF9F6] px-2.5 py-1 rounded-lg border border-[#E5E0D8]">
                      {vendor.category}
                    </span>
                  </td>

                  <td className="py-4">
                    <span className="font-bold text-[#8B263E]">
                      ₹ {vendor.priceStart} Lakhs onwards
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-1 font-semibold text-neutral-800">
                      <Star className="w-3.5 h-3.5 fill-[#C8A165] text-[#C8A165]" />
                      <span>{vendor.rating}</span>
                      <span className="text-neutral-400 font-normal">
                        ({vendor.reviewsCount})
                      </span>
                    </div>
                  </td>

                  <td className="py-4">
                    <span className="px-2 py-0.5 rounded-md bg-[#FAF5ED] text-[#8B263E] border border-[#C8A165]/30 font-bold text-[10px]">
                      {vendor.tier || "Luxury"}
                    </span>
                  </td>

                  <td className="py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Active</span>
                    </span>
                  </td>

                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(vendor)}
                        className="p-2 text-neutral-600 hover:text-[#8B263E] hover:bg-[#FAF5ED] rounded-xl transition-colors"
                        title="Edit Vendor"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(vendor.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Vendor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Add/Edit Drawer */}
      {isDrawerOpen && editingVendor && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft">
            <div className="p-6 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A165]">
                  Vendor Profile
                </span>
                <h2 className="font-serif font-bold text-xl text-neutral-900">
                  {editingVendor.name ? `Edit: ${editingVendor.name}` : "Add New Vendor"}
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

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Vendor Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingVendor.name}
                  onChange={(e) =>
                    setEditingVendor({ ...editingVendor, name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                    Category
                  </label>
                  <select
                    value={editingVendor.category}
                    onChange={(e) =>
                      setEditingVendor({ ...editingVendor, category: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-semibold"
                  >
                    {vendorCategories.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                    Starting Price (Lakhs ₹)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingVendor.priceStart}
                    onChange={(e) =>
                      setEditingVendor({
                        ...editingVendor,
                        priceStart: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={editingVendor.experience || 0}
                    onChange={(e) =>
                      setEditingVendor({
                        ...editingVendor,
                        experience: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                    City / Area
                  </label>
                  <input
                    type="text"
                    value={editingVendor.location}
                    onChange={(e) =>
                      setEditingVendor({
                        ...editingVendor,
                        location: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                  Profile Image URL
                </label>
                <input
                  type="text"
                  value={editingVendor.imageUrl}
                  onChange={(e) =>
                    setEditingVendor({ ...editingVendor, imageUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-mono"
                />
              </div>

              <div className="pt-2 grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E5E0D8] bg-[#FAF9F6] text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingVendor.isVerified}
                    onChange={(e) =>
                      setEditingVendor({
                        ...editingVendor,
                        isVerified: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#8B263E] rounded"
                  />
                  <span>Verified Badge</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-[#E5E0D8] bg-[#FAF9F6] text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingVendor.isFeatured}
                    onChange={(e) =>
                      setEditingVendor({
                        ...editingVendor,
                        isFeatured: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-[#8B263E] rounded"
                  />
                  <span>Featured Badge</span>
                </label>
              </div>

              <div className="pt-6 border-t border-[#E5E0D8] flex items-center justify-end gap-3 safe-area-bottom">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold text-neutral-600 bg-neutral-100 hover:bg-neutral-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-[#8B263E] hover:bg-[#721f33] shadow-md"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
