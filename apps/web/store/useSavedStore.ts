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

async function persistFavoriteAdd(
  kind: "venue" | "vendor",
  rawId: string,
  setMapEntry: (key: string, favoriteId: number) => void
) {
  const numId = parseNumericId(rawId);
  if (!numId) return;

  const res = await apiClient.post<{
    favorite?: FavoriteRecord;
    favorite_id?: number;
  }>("/api/favorites", kind === "venue" ? { venueId: numId } : { vendorId: numId });

  if (res.ok && res.data) {
    const favId = res.data.favorite?.favorite_id ?? res.data.favorite_id;
    if (favId) {
      setMapEntry(`${kind}:${rawId}`, favId);
    }
  }
}

async function persistFavoriteRemove(
  key: string,
  favoriteIdsByTarget: Record<string, number>,
  removeMapEntry: (key: string) => void
) {
  const favId = favoriteIdsByTarget[key];
  if (!favId) return;
  const res = await apiClient.delete(`/api/favorites/${favId}`);
  if (res.ok) {
    removeMapEntry(key);
  }
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
        if (!res.ok || !Array.isArray(res.data)) {
          return;
        }

        const serverVenueIds: string[] = [];
        const serverVendorIds: string[] = [];
        const mapEntries: Record<string, number> = { ...get().favoriteIdsByTarget };

        for (const item of res.data) {
          if (item.venue_id) {
            const vKey = String(item.venue_id);
            serverVenueIds.push(vKey);
            mapEntries[`venue:${vKey}`] = item.favorite_id;
          }
          if (item.vendor_id) {
            const sKey = String(item.vendor_id);
            serverVendorIds.push(sKey);
            mapEntries[`vendor:${sKey}`] = item.favorite_id;
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

        if (exists) {
          void persistFavoriteRemove(
            `venue:${venueId}`,
            get().favoriteIdsByTarget,
            (key) =>
              set((s) => {
                const next = { ...s.favoriteIdsByTarget };
                delete next[key];
                return { favoriteIdsByTarget: next };
              })
          );
        } else {
          void persistFavoriteAdd("venue", venueId, (key, favId) =>
            set((s) => ({
              favoriteIdsByTarget: { ...s.favoriteIdsByTarget, [key]: favId },
            }))
          );
        }
      },

      toggleSaveVendor: (vendorId: string) => {
        const exists = get().savedVendorIds.includes(vendorId);
        set((state) => ({
          savedVendorIds: exists
            ? state.savedVendorIds.filter((id) => id !== vendorId)
            : [...state.savedVendorIds, vendorId],
        }));

        if (exists) {
          void persistFavoriteRemove(
            `vendor:${vendorId}`,
            get().favoriteIdsByTarget,
            (key) =>
              set((s) => {
                const next = { ...s.favoriteIdsByTarget };
                delete next[key];
                return { favoriteIdsByTarget: next };
              })
          );
        } else {
          void persistFavoriteAdd("vendor", vendorId, (key, favId) =>
            set((s) => ({
              favoriteIdsByTarget: { ...s.favoriteIdsByTarget, [key]: favId },
            }))
          );
        }
      },

      removeSavedVenue: (venueId: string) => {
        set((state) => ({
          savedVenueIds: state.savedVenueIds.filter((id) => id !== venueId),
        }));
        void persistFavoriteRemove(
          `venue:${venueId}`,
          get().favoriteIdsByTarget,
          (key) =>
            set((s) => {
              const next = { ...s.favoriteIdsByTarget };
              delete next[key];
              return { favoriteIdsByTarget: next };
            })
        );
      },

      removeSavedVendor: (vendorId: string) => {
        set((state) => ({
          savedVendorIds: state.savedVendorIds.filter((id) => id !== vendorId),
        }));
        void persistFavoriteRemove(
          `vendor:${vendorId}`,
          get().favoriteIdsByTarget,
          (key) =>
            set((s) => {
              const next = { ...s.favoriteIdsByTarget };
              delete next[key];
              return { favoriteIdsByTarget: next };
            })
        );
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
