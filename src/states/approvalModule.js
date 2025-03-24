import { create } from "zustand";
import { produce } from "immer";

const useApprovalModuleStore = create((set) => ({
  selectedFacility: null,
  actions: {
    selectFacility: (facility) =>
      set(
        produce((state) => {
          state.selectedFacility = facility;
        })
      )
  }
}));

export default useApprovalModuleStore;
