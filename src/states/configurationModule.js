import { create } from "zustand";
import { produce } from "immer";

const useConfigurationModuleStore = create((set) => ({
  selectedFunction: "orgUnitGroupSets",
  translations: {
    selectedLanguages: [],
    searchKey: "",
  },
  actions: {
    selectFunction: (f) =>
      set(
        produce((state) => {
          state.selectedFunction = f;
        })
      ),
    selectLanguage: (lang) =>
      set(
        produce((state) => {
          const { selectedLanguages } = state.translations;
          if (selectedLanguages.includes(lang)) {
            return;
          } else {
            state.translations.selectedLanguages.push(lang);
          }
        })
      ),
    toggleSelectedLanguages: (lang) =>
      set(
        produce((state) => {
          const { selectedLanguages } = state.translations;
          if (selectedLanguages.includes(lang)) {
            state.translations.selectedLanguages = selectedLanguages.filter(
              (l) => l !== lang
            );
          } else {
            state.translations.selectedLanguages.push(lang);
          }
        })
      ),
    setSearchKey: (key) =>
      set(
        produce((state) => {
          state.translations.searchKey = key;
        })
      ),
  },
}));

export default useConfigurationModuleStore;
