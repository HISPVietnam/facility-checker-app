import { create } from "zustand";
import { produce } from "immer";

const useApprovalModuleStore = create((set) => ({
  selectedFacility: null,
  selectedOrgUnit: null,
  isReadOnly: false,
  filters: [],
  actions: {
    selectFacility: (facility) =>
      set(
        produce((state) => {
          state.selectedFacility = facility;
        })
      ),
    selectOrgUnit: (orgUnit) =>
      set(
        produce((state) => {
          state.selectedOrgUnit = orgUnit;
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
        })
      )
  }
}));

export default useApprovalModuleStore;
