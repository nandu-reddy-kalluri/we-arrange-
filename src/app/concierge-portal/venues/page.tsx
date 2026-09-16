"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
  MapPin,
  Users,
  IndianRupee,
  Check,
  AlertTriangle,
} from "lucide-react";
import { adminDataService } from "@/services/admin/adminDataService";
import { Venue } from "@/mock-data/venues";

const VENUE_TYPES = ["Banquet", "Resort", "Farmhouse", "Hotel", "Palace", "Convention", "Destination"];
const SPACES = ["Indoor", "Outdoor", "Poolside", "Rooftop", "Garden"];

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [spaceFilter, setSpaceFilter] = useState("All");
  const [badgeFilter, setBadgeFilter] = useState("All");

  // Drawer / Modal State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delete Confirmation State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    const data = await adminDataService.getVenues();
    setVenues(data);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAdd = () => {
    setEditingVenue({
      id: `venue_${Date.now()}`,
      name: "",
      slug: "",
      location: "",
      city: "Hyderabad",
      type: "Banquet",
      space: "Indoor",
      maxCapacity: 500,
      capacityRange: "200 - 500 Guests",
      pricePerPlate: 1200,
      priceOnwards: "₹ 1,200 per plate",
      rating: 5.0,
      reviewCount: 0,
      savedCount: 0,
      imageUrl: "https://image.wedmegood.com/resized/800X/uploads/member/25515947/1738996801_ASH09457.JPG",
      gallery: [
        "https://image.wedmegood.com/resized/800X/uploads/member/25515947/1738996801_ASH09457.JPG",
      ],
      isVerified: true,
      isPopular: false,
      isPremium: true,
      amenities: ["Valet Parking", "Air Conditioning"],
      policies: {
        outsideCatering: false,
        outsideDecor: true,
        alcohol: false,
        dj: true,
        petFriendly: false,
      },
      rooms: 2,
      parking: 100,
      moodTags: ["Premium", "Banquet"],
      venueHighlights: ["✔ Banquet Hall & Lawn"],
    });
    setIsDrawerOpen(true);
  };

  const handleOpenEdit = (venue: Venue) => {
    setEditingVenue(JSON.parse(JSON.stringify(venue)));
    setIsDrawerOpen(true);
  };

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue || !editingVenue.name) return;

    // auto generate slug if empty
    if (!editingVenue.slug) {
      editingVenue.slug = editingVenue.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    const res = await adminDataService.saveVenue(editingVenue);
    await loadVenues();
    setIsDrawerOpen(false);
    showToast(res.message);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    const res = await adminDataService.deleteVenue(deleteTargetId);
    await loadVenues();
    setDeleteTargetId(null);
    showToast(res.message);
  };

  // Filtered List
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const matchSearch =
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchType = typeFilter === "All" || v.type === typeFilter;
      const matchSpace = spaceFilter === "All" || v.space === spaceFilter;
      const matchBadge =
        badgeFilter === "All" ||
        (badgeFilter === "Verified" && v.isVerified) ||
        (badgeFilter === "Premium" && v.isPremium) ||
        (badgeFilter === "Popular" && v.isPopular);

      return matchSearch && matchType && matchSpace && matchBadge;
    });
  }, [venues, searchQuery, typeFilter, spaceFilter, badgeFilter]);

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
                Delete Venue
              </h3>
              <p className="text-xs text-neutral-500 mt-1">
                Are you sure you want to delete this item? This action will remove the venue from the active registry.
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

      {/* Header with Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E0D8] pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#C8A165]">
            Inventory Management
          </span>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-neutral-900 tracking-tight mt-0.5">
            Venues Directory Manager
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Publish, edit, inspect capacity tiers, per-plate pricing, and policies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B263E] hover:bg-[#721f33] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Venue</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E5E0D8] rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search venue name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium focus:outline-none focus:ring-1 focus:ring-[#8B263E]"
          />
        </div>

        {/* Type Filter */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl px-3 py-2 font-semibold text-neutral-700 focus:outline-none"
        >
          <option value="All">All Types</option>
          {VENUE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Space Filter */}
        <select
          value={spaceFilter}
          onChange={(e) => setSpaceFilter(e.target.value)}
          className="text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl px-3 py-2 font-semibold text-neutral-700 focus:outline-none"
        >
          <option value="All">All Spaces</option>
          {SPACES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* Badge Filter */}
        <select
          value={badgeFilter}
          onChange={(e) => setBadgeFilter(e.target.value)}
          className="text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl px-3 py-2 font-semibold text-neutral-700 focus:outline-none"
        >
          <option value="All">All Badges</option>
          <option value="Verified">Verified Only</option>
          <option value="Premium">Premium Only</option>
          <option value="Popular">Popular Only</option>
        </select>
      </div>

      {/* Venues Management Table */}
      <div className="bg-white border border-[#E5E0D8] rounded-3xl p-6 shadow-sm overflow-hidden">
        <div className="overflow-x-auto -mx-6 px-6">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="border-b border-[#E5E0D8] text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                <th className="pb-3 font-semibold">Venue Details</th>
                <th className="pb-3 font-semibold">Type &amp; Space</th>
                <th className="pb-3 font-semibold">Max Capacity</th>
                <th className="pb-3 font-semibold">Price / Plate</th>
                <th className="pb-3 font-semibold">Badges</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-xs">
              {filteredVenues.map((venue) => (
                <tr key={venue.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      {venue.imageUrl && (
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-[#E5E0D8]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={venue.imageUrl}
                            alt={venue.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="font-bold text-neutral-900 text-sm">
                          {venue.name}
                        </span>
                        <span className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#C8A165]" />
                          <span>{venue.location}, {venue.city}</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-800">
                        {venue.type}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {venue.space}
                      </span>
                    </div>
                  </td>

                  <td className="py-4">
                    <div className="flex items-center gap-1 font-semibold text-neutral-800">
                      <Users className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{venue.maxCapacity} Guests</span>
                    </div>
                  </td>

                  <td className="py-4">
                    <span className="font-bold text-[#8B263E]">
                      {venue.pricePerPlate
                        ? `₹ ${venue.pricePerPlate} / plate`
                        : venue.priceOnwards}
                    </span>
                  </td>

                  <td className="py-4">
                    <div className="flex flex-wrap gap-1">
                      {venue.isVerified && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[9px]">
                          Verified
                        </span>
                      )}
                      {venue.isPremium && (
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF5ED] text-[#8B263E] border border-[#C8A165]/30 font-bold text-[9px]">
                          Premium
                        </span>
                      )}
                    </div>
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
                        onClick={() => handleOpenEdit(venue)}
                        className="p-2 text-neutral-600 hover:text-[#8B263E] hover:bg-[#FAF5ED] rounded-xl transition-colors"
                        title="Edit Venue"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(venue.id)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete Venue"
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

      {/* Slide-over Add / Edit Drawer */}
      {isDrawerOpen && editingVenue && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-slideLeft">
            {/* Drawer Header */}
            <div className="p-6 border-b border-[#E5E0D8] flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#C8A165]">
                  Venue Editor
                </span>
                <h2 className="font-serif font-bold text-xl text-neutral-900">
                  {editingVenue.name ? `Edit: ${editingVenue.name}` : "Create New Venue"}
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

            {/* Drawer Form Body */}
            <form onSubmit={handleSaveVenue} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* 1. Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b pb-1">
                  1. Basic Information
                </h3>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                    Venue Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingVenue.name}
                    onChange={(e) =>
                      setEditingVenue({ ...editingVenue, name: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                      Location / Area *
                    </label>
                    <input
                      type="text"
                      required
                      value={editingVenue.location}
                      onChange={(e) =>
                        setEditingVenue({ ...editingVenue, location: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={editingVenue.city}
                      onChange={(e) =>
                        setEditingVenue({ ...editingVenue, city: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                      Venue Type
                    </label>
                    <select
                      value={editingVenue.type}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          type: e.target.value as Venue["type"],
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-semibold"
                    >
                      {VENUE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                      Space Type
                    </label>
                    <select
                      value={editingVenue.space}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          space: e.target.value as Venue["space"],
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-semibold"
                    >
                      {SPACES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Capacity & Pricing */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b pb-1">
                  2. Capacity &amp; Pricing
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                      Maximum Capacity (Guests)
                    </label>
                    <input
                      type="number"
                      value={editingVenue.maxCapacity}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          maxCapacity: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                      Price Per Plate (₹)
                    </label>
                    <input
                      type="number"
                      value={editingVenue.pricePerPlate || ""}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          pricePerPlate: parseInt(e.target.value) || undefined,
                        })
                      }
                      placeholder="e.g. 1500"
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                    Price Onwards Label
                  </label>
                  <input
                    type="text"
                    value={editingVenue.priceOnwards}
                    onChange={(e) =>
                      setEditingVenue({ ...editingVenue, priceOnwards: e.target.value })
                    }
                    placeholder="e.g. ₹ 1,500 per plate or Price on Request"
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium"
                  />
                </div>
              </div>

              {/* 3. Amenities & Policies */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b pb-1">
                  3. Amenities &amp; Policies
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                      Guest Rooms
                    </label>
                    <input
                      type="number"
                      value={editingVenue.rooms}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          rooms: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                      Parking Capacity (Cars)
                    </label>
                    <input
                      type="number"
                      value={editingVenue.parking}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          parking: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E0D8] bg-[#FAF9F6] text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingVenue.policies.outsideCatering}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          policies: {
                            ...editingVenue.policies,
                            outsideCatering: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-[#8B263E] rounded"
                    />
                    <span>Outside Catering Allowed</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E0D8] bg-[#FAF9F6] text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingVenue.policies.outsideDecor}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          policies: {
                            ...editingVenue.policies,
                            outsideDecor: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-[#8B263E] rounded"
                    />
                    <span>Outside Decor Allowed</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E0D8] bg-[#FAF9F6] text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingVenue.policies.dj}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          policies: {
                            ...editingVenue.policies,
                            dj: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-[#8B263E] rounded"
                    />
                    <span>DJ Permitted</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-[#E5E0D8] bg-[#FAF9F6] text-xs font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingVenue.policies.alcohol}
                      onChange={(e) =>
                        setEditingVenue({
                          ...editingVenue,
                          policies: {
                            ...editingVenue.policies,
                            alcohol: e.target.checked,
                          },
                        })
                      }
                      className="w-4 h-4 text-[#8B263E] rounded"
                    />
                    <span>Alcohol Allowed</span>
                  </label>
                </div>
              </div>

              {/* 4. Images */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 border-b pb-1">
                  4. Primary &amp; Gallery Images
                </h3>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-neutral-600 mb-1">
                    Primary Hero Image URL
                  </label>
                  <input
                    type="text"
                    value={editingVenue.imageUrl}
                    onChange={(e) =>
                      setEditingVenue({ ...editingVenue, imageUrl: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E0D8] rounded-xl font-mono"
                  />
                  {editingVenue.imageUrl && (
                    <div className="mt-2 w-32 h-20 rounded-xl overflow-hidden border border-[#E5E0D8] bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={editingVenue.imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons inside drawer */}
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
                  className="py-2.5 px-6 rounded-xl text-xs font-bold text-white bg-[#8B263E] hover:bg-[#721f33] shadow-md"
                >
                  Save Venue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
