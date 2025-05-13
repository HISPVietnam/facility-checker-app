import { create } from "zustand";
import { produce } from "immer";
import { USER_GROUPS } from "@/const";

const useConfigurationModuleStore = create((set) => ({
  selectedFunction: "translations",
  translations: {
    selectedLanguages: [],
    searchTranslation: ""
  },
  authorities: {
    selectedUsersByUserGroup: {
      [USER_GROUPS.CAPTURE]: null,
      [USER_GROUPS.APPROVAL]: null,
      [USER_GROUPS.SYNCHRONIZATION]: null,
      [USER_GROUPS.ADMIN]: null
    }
  },
  actions: {
    selectUsersByUserGroup: (users, userGroup) =>
      set(
        produce((state) => {
          const { selectedUsersByUserGroup } = state.authorities;
          selectedUsersByUserGroup[userGroup] = users;
        })
      ),
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
            state.translations.selectedLanguages = selectedLanguages.filter((l) => l !== lang);
          } else {
            state.translations.selectedLanguages.push(lang);
          }
        })
      ),
    setSearchTranslation: (translation) =>
      set(
        produce((state) => {
          state.translations.searchTranslation = translation;
        })
      )
  }
}));

export default useConfigurationModuleStore;
