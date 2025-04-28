import { create } from "zustand";
import { produce } from "immer";

const useSynchronizationModuleStore = create((set) => ({
  selectedOrgUnit: null,
  filters: [],
  selectedFacilities: [],
  isReadOnly: false,
  actions: {
    selectOrgUnit: (orgUnit) =>
      set(
        produce((state) => {
          state.selectedOrgUnit = orgUnit;
        })
      ),
    selectFacilities: (facilities) =>
      set(
        produce((state) => {
          state.selectedFacilities = facilities;
        })
      ),
    setIsReadOnly: (isReadOnly) =>
      set(
        produce((state) => {
          state.isReadOnly = isReadOnly;
        })
      ),
    toggleFilter: (filter) =>
      set(
        produce((state) => {
          if (state.filters.includes(filter)) {
            state.filters = state.filters.filter((f) => f !== filter);
          } else {
            state.filters.push(filter);
          }
        })
      ),
    resetFilters: () =>
      set(
        produce((state) => {
          state.filters = [];
          state.selectedOrgUnit = null;
          state.selectedFacilities = [];
        })
      )
  }
}));

export default useSynchronizationModuleStore;
