import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface SavedStore {
  savedVenueIds: string[];
  savedVendorIds: string[];

  toggleSaveVenue: (venueId: string) => void;
  toggleSaveVendor: (vendorId: string) => void;
  removeSavedVenue: (venueId: string) => void;
  removeSavedVendor: (vendorId: string) => void;
  isVenueSaved: (venueId: string) => boolean;
  isVendorSaved: (vendorId: string) => boolean;
  clearAll: () => void;
}

export const useSavedStore = create<SavedStore>()(
  persist(
    (set, get) => ({
      savedVenueIds: [],
      savedVendorIds: [],

      toggleSaveVenue: (venueId: string) =>
        set((state) => ({
          savedVenueIds: state.savedVenueIds.includes(venueId)
            ? state.savedVenueIds.filter((id) => id !== venueId)
            : [...state.savedVenueIds, venueId],
        })),

      toggleSaveVendor: (vendorId: string) =>
        set((state) => ({
          savedVendorIds: state.savedVendorIds.includes(vendorId)
            ? state.savedVendorIds.filter((id) => id !== vendorId)
            : [...state.savedVendorIds, vendorId],
        })),

      removeSavedVenue: (venueId: string) =>
        set((state) => ({
          savedVenueIds: state.savedVenueIds.filter((id) => id !== venueId),
        })),

      removeSavedVendor: (vendorId: string) =>
        set((state) => ({
          savedVendorIds: state.savedVendorIds.filter((id) => id !== vendorId),
        })),

      isVenueSaved: (venueId: string) => get().savedVenueIds.includes(venueId),

      isVendorSaved: (vendorId: string) => get().savedVendorIds.includes(vendorId),

      clearAll: () => set({ savedVenueIds: [], savedVendorIds: [] }),
    }),
    {
      name: "youmarriage-saved-items",
    }
  )
);
