import { create } from 'zustand';

/**
 * Application state store using Zustand
 */
const useAppStore = create((set) => ({
  // Selection state
  selectedArea: null,
  selectedProfile: null,
  selectedProfile2: null,  // For comparison mode

  // Data state
  wiData: null,
  wiData2: null,  // For comparison mode
  profiles: [],
  areas: [],

  // UI state
  showAmenities: false,
  selectedPoint: null,
  isLoading: false,
  comparisonMode: false,  // Toggle between single and comparison view
  comparisonDisplayMode: 'sideBySide',  // 'sideBySide' | 'difference'
  editorMode: false,  // Toggle for profile editor
  darkMode: false,  // Dark mode toggle
  wiScoreFilter: { min: 0, max: 100 },  // WI score filter range
  customAreaBounds: null,  // Custom area bounds for spatial filter

  // Actions
  setArea: (area) => set({ selectedArea: area }),
  setProfile: (profile) => set({ selectedProfile: profile }),
  setProfile2: (profile) => set({ selectedProfile2: profile }),
  setWIData: (data) => set({ wiData: data }),
  setWIData2: (data) => set({ wiData2: data }),
  setProfiles: (profiles) => set({ profiles }),
  setAreas: (areas) => set({ areas }),
  toggleAmenities: () => set((state) => ({ showAmenities: !state.showAmenities })),
  toggleComparisonMode: () => set((state) => ({ comparisonMode: !state.comparisonMode })),
  setComparisonDisplayMode: (mode) => set({ comparisonDisplayMode: mode }),
  toggleEditorMode: () => set((state) => ({ editorMode: !state.editorMode })),
  setSelectedPoint: (point) => set({ selectedPoint: point }),
  setLoading: (isLoading) => set({ isLoading }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setDarkMode: (val) => set({ darkMode: val }),
  setWIScoreFilter: (filter) => set({ wiScoreFilter: filter }),
  setCustomAreaBounds: (bounds) => set({ customAreaBounds: bounds }),

  // Reset
  reset: () => set({
    selectedArea: null,
    selectedProfile: null,
    selectedProfile2: null,
    wiData: null,
    wiData2: null,
    selectedPoint: null,
    showAmenities: false,
    comparisonMode: false,
    comparisonDisplayMode: 'sideBySide',
    editorMode: false,
    wiScoreFilter: { min: 0, max: 100 },
    customAreaBounds: null,
  }),
}));

export default useAppStore;
