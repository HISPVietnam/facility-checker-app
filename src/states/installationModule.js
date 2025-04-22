import { create } from "zustand";
import { produce } from "immer";

const useInstallationModuleStore = create((set) => ({
  welcome: {},
  selectGroupSets: {
    selectedGroupSets: "[]",
    skippedOrgUnits: [],
    members: []
  },
  setupAuthorities: {
    captureRoleUsers: "[]",
    approvalRoleUsers: "[]",
    synchronizationRoleUsers: "[]",
    adminRoleUsers: "[]"
  },
  step: 0,
  valid: false,
  actions: {
    setStep: (step) =>
      set(
        produce((state) => {
          state.step = step;
        })
      ),
    setStepData: (step, property, value) =>
      set(
        produce((state) => {
          state[step][property] = value;
        })
      ),
    setValid: (valid) =>
      set(
        produce((state) => {
          state.valid = valid;
        })
      )
  }
}));

export default useInstallationModuleStore;
