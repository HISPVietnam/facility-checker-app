import { create } from "zustand";
import { produce } from "immer";

const useApprovalModuleStore = create((set) => ({
  selectedFacility: null,
  selectedOrgUnit: null,
  selectedEventId: null,
  isReadOnly: false,
  filters: ["pending", "approved", "rejected"],
  actions: {
    selectFacility: (facility, eventId) =>
      set(
        produce((state) => {
          state.selectedFacility = facility;
          state.selectedEventId = eventId;
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
          state.filters = ["pending", "approved", "rejected"];
          state.selectedOrgUnit = null;
        })
      ),
  },
}));

export default useApprovalModuleStore;
