import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface VenueFilters {
  location: string | null;
  guests: string | null;
  budget: string | null;
  venueType: string | null;
  date: string | null;
}

export interface VenueStore {
  // Discovery State
  searchQuery: string;
  activeFilters: VenueFilters;
  
  // Selection State
  weddingShortlist: string[];
  compareList: string[];
  recentlyViewed: string[];
  
  // Actions
  setSearchQuery: (query: string) => void;
  setFilter: (key: keyof VenueFilters, value: any) => void;
  resetFilters: () => void;
  
  toggleShortlist: (venueId: string) => void;
  toggleCompare: (venueId: string) => void;
  addRecentlyViewed: (venueId: string) => void;
}

export const useVenueStore = create<VenueStore>()(
  persist(
    (set) => ({
      searchQuery: "",
      activeFilters: {
        location: null,
        guests: null,
        budget: null,
        venueType: null,
        date: null,
      },
      weddingShortlist: [],
      compareList: [],
      recentlyViewed: [],

      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setFilter: (key, value) => 
        set((state) => ({
          activeFilters: { ...state.activeFilters, [key]: value }
        })),
        
      resetFilters: () => set({ 
        activeFilters: {
          location: null,
          guests: null,
          budget: null,
          venueType: null,
          date: null,
        } 
      }),

      toggleShortlist: (venueId) =>
        set((state) => ({
          weddingShortlist: state.weddingShortlist.includes(venueId)
            ? state.weddingShortlist.filter((id) => id !== venueId)
            : [...state.weddingShortlist, venueId],
        })),

      toggleCompare: (venueId) =>
        set((state) => ({
          compareList: state.compareList.includes(venueId)
            ? state.compareList.filter((id) => id !== venueId)
            : state.compareList.length < 3 
              ? [...state.compareList, venueId]
              : state.compareList,
        })),

      addRecentlyViewed: (venueId) =>
        set((state) => ({
          recentlyViewed: [
            venueId,
            ...state.recentlyViewed.filter((id) => id !== venueId)
          ].slice(0, 10),
        })),
    }),
    {
      name: 'venue-storage',
    }
  )
);
