import { create } from "zustand";
import { produce } from "immer";
const useFacilityCheckModuleStore = create((set) => ({
  selectedFacility: null,
  selectedOrgUnit: null,
  hierarchyExpanded: null,
  editing: false,
  draggingMode: false,
  isDirty: false,
  isReadOnly: false,
  view: "mapView",
  newFacilityDialog: false,
  facilityProfileDialog: false,
  facilityList: { ready: false, columns: [], rows: [] },
  filters: [],
  allFilters: [],
  coordinatesPickerMapControl: {
    baseLayerType: "satellite"
  },
  mapControl: {
    baseLayer: true,
    labelLayer: true,
    facilityLayer: true,
    boundaryLayer: true,
    baseLayerType: "satellite"
  },
  actions: {
    toggleDialog: (type) =>
      set(
        produce((state) => {
          state[type] = !state[type];
        })
      ),
    toggleDraggingMode: () =>
      set(
        produce((state) => {
          state.draggingMode = !state.draggingMode;
        })
      ),
    toggleEditing: () =>
      set(
        produce((state) => {
          state.editing = !state.editing;
        })
      ),
    setFacilityList: (facilityList) =>
      set(
        produce((state) => {
          state.facilityList = facilityList;
        })
      ),
    setHierarchyExpanded: (orgUnit) =>
      set(
        produce((state) => {
          state.hierarchyExpanded = orgUnit;
        })
      ),
    selectOrgUnit: (orgUnit) =>
      set(
        produce((state) => {
          state.selectedOrgUnit = orgUnit;
        })
      ),
    selectFacility: (facility) =>
      set(
        produce((state) => {
          state.selectedFacility = facility;
        })
      ),
    editSelectedFacility: (field, value) =>
      set(
        produce((state) => {
          state.selectedFacility[field] = value;
        })
      ),
    setMapControl: (type, value) =>
      set(
        produce((state) => {
          state.mapControl[type] = value;
        })
      ),
    setView: (value) =>
      set(
        produce((state) => {
          state.view = value;
        })
      ),
    setAllFilters: (filters) =>
      set(
        produce((state) => {
          state.allFilters = filters;
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
      )
  }
}));

export default useFacilityCheckModuleStore;
