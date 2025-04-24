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
  summary: {
    metadataPackage: null,
    data: null
  },
  install: {
    loading: {
      importMetadata: false,
      importFacilities: false
    }
  },
  status: "pending",
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
      ),
    setStatus: (status) =>
      set(
        produce((state) => {
          state.status = status;
        })
      )
  }
}));

export default useInstallationModuleStore;
