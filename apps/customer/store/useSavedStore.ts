import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiClient } from "@we-arrange/api-client";

interface FavoriteRecord {
  favorite_id: number;
  venue_id: number | null;
  vendor_id: number | null;
}

export interface SavedStore {
  savedVenueIds: string[];
  savedVendorIds: string[];
  favoriteIdsByTarget: Record<string, number>;
  isSynced: boolean;
  syncWithServer: () => Promise<void>;
  toggleSaveVenue: (venueId: string) => void;
  toggleSaveVendor: (vendorId: string) => void;
  removeSavedVenue: (venueId: string) => void;
  removeSavedVendor: (vendorId: string) => void;
  isVenueSaved: (venueId: string) => boolean;
  isVendorSaved: (vendorId: string) => boolean;
  clearAll: () => void;
}

function parseNumericId(id: string): number | null {
  const num = Number(id);
  return Number.isInteger(num) && num > 0 ? num : null;
}

export const useSavedStore = create<SavedStore>()(
  persist(
    (set, get) => ({
      savedVenueIds: [],
      savedVendorIds: [],
      favoriteIdsByTarget: {},
      isSynced: false,

      syncWithServer: async () => {
        const res = await apiClient.get<FavoriteRecord[]>("/api/favorites", {
          query: { limit: 50 },
          retryOn401: false,
        });
        if (!res.ok || !Array.isArray(res.data)) return;

        const serverVenueIds: string[] = [];
        const serverVendorIds: string[] = [];
        const mapEntries: Record<string, number> = { ...get().favoriteIdsByTarget };

        for (const item of res.data) {
          if (item.venue_id) {
            const k = String(item.venue_id);
            serverVenueIds.push(k);
            mapEntries[`venue:${k}`] = item.favorite_id;
          }
          if (item.vendor_id) {
            const k = String(item.vendor_id);
            serverVendorIds.push(k);
            mapEntries[`vendor:${k}`] = item.favorite_id;
          }
        }

        set((state) => ({
          savedVenueIds: Array.from(new Set([...state.savedVenueIds, ...serverVenueIds])),
          savedVendorIds: Array.from(new Set([...state.savedVendorIds, ...serverVendorIds])),
          favoriteIdsByTarget: mapEntries,
          isSynced: true,
        }));
      },

      toggleSaveVenue: (venueId: string) => {
        const exists = get().savedVenueIds.includes(venueId);
        set((state) => ({
          savedVenueIds: exists
            ? state.savedVenueIds.filter((id) => id !== venueId)
            : [...state.savedVenueIds, venueId],
        }));
        const numId = parseNumericId(venueId);
        if (!numId) return;

        if (exists) {
          const favId = get().favoriteIdsByTarget[`venue:${venueId}`];
          if (favId) void apiClient.delete(`/api/favorites/${favId}`);
        } else {
          void apiClient
            .post<{ favorite?: FavoriteRecord; favorite_id?: number }>("/api/favorites", {
              venueId: numId,
            })
            .then((res) => {
              const favId = res.data?.favorite?.favorite_id ?? res.data?.favorite_id;
              if (favId) {
                set((s) => ({
                  favoriteIdsByTarget: {
                    ...s.favoriteIdsByTarget,
                    [`venue:${venueId}`]: favId,
                  },
                }));
              }
            });
        }
      },

      toggleSaveVendor: (vendorId: string) => {
        const exists = get().savedVendorIds.includes(vendorId);
        set((state) => ({
          savedVendorIds: exists
            ? state.savedVendorIds.filter((id) => id !== vendorId)
            : [...state.savedVendorIds, vendorId],
        }));
        const numId = parseNumericId(vendorId);
        if (!numId) return;

        if (exists) {
          const favId = get().favoriteIdsByTarget[`vendor:${vendorId}`];
          if (favId) void apiClient.delete(`/api/favorites/${favId}`);
        } else {
          void apiClient
            .post<{ favorite?: FavoriteRecord; favorite_id?: number }>("/api/favorites", {
              vendorId: numId,
            })
            .then((res) => {
              const favId = res.data?.favorite?.favorite_id ?? res.data?.favorite_id;
              if (favId) {
                set((s) => ({
                  favoriteIdsByTarget: {
                    ...s.favoriteIdsByTarget,
                    [`vendor:${vendorId}`]: favId,
                  },
                }));
              }
            });
        }
      },

      removeSavedVenue: (venueId: string) => {
        const favId = get().favoriteIdsByTarget[`venue:${venueId}`];
        set((state) => ({
          savedVenueIds: state.savedVenueIds.filter((id) => id !== venueId),
        }));
        if (favId) void apiClient.delete(`/api/favorites/${favId}`);
      },

      removeSavedVendor: (vendorId: string) => {
        const favId = get().favoriteIdsByTarget[`vendor:${vendorId}`];
        set((state) => ({
          savedVendorIds: state.savedVendorIds.filter((id) => id !== vendorId),
        }));
        if (favId) void apiClient.delete(`/api/favorites/${favId}`);
      },

      isVenueSaved: (venueId: string) => get().savedVenueIds.includes(venueId),
      isVendorSaved: (vendorId: string) => get().savedVendorIds.includes(vendorId),
      clearAll: () =>
        set({ savedVenueIds: [], savedVendorIds: [], favoriteIdsByTarget: {}, isSynced: false }),
    }),
    {
      name: "youmarriage-saved-items",
    }
  )
);
