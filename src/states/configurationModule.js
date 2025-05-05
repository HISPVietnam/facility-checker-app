import { create } from "zustand";
import { produce } from "immer";

const useConfigurationModuleStore = create((set) => ({
  selectedFunction: "orgUnitGroupSets",
  actions: {
    selectFunction: (f) =>
      set(
        produce((state) => {
          state.selectedFunction = f;
        })
      )
  }
}));

export default useConfigurationModuleStore;
