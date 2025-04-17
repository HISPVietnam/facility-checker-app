import { create } from "zustand";
import { produce } from "immer";

const useMetadataStore = create((set) => ({
  orgUnits: null,
  orgUnitGroups: null,
  orgUnitGroupSets: null,
  orgUnitGeoJson: null,
  customAttributes: null,
  locale: "en",
  actions: {
    setMetadata: (type, values) =>
      set(
        produce((state) => {
          state[type] = values;
        })
      )
  }
}));

export default useMetadataStore;
