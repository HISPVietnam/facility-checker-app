import { create } from "zustand";
import { produce } from "immer";
import { DATA_ELEMENTS } from "@/const";
import useMetadataStore from "./metadata";
import useFacilityCheckModuleStore from "./facilityCheckModule";
import _ from "lodash";
import { format } from "date-fns";
import { generateUid } from "@/utils";
const { UID, APPROVAL_STATUS, APPROVED_BY, APPROVED_AT, PATH, ACTIVE_STATUS, IS_NEW_FACILITY } = DATA_ELEMENTS;

const useDataStore = create((set) => ({
  teis: [],
  facilities: [],
  actions: {
    setFacilities: (facilities) =>
      set(
        produce((state) => {
          state.facilities = facilities;
        })
      ),
    setTeis: (teis) =>
      set(
        produce((state) => {
          state.teis = teis;
        })
      ),
    initNewFacility: () =>
      set(
        produce((state) => {
          const actions = useFacilityCheckModuleStore.getState().actions;
          const { me, orgUnits } = useMetadataStore.getState();
          const foundOrgUnit = orgUnits.find((ou) => ou.id === me.organisationUnits[0].id);
          const meOrgUnitPath = foundOrgUnit.path;
          const { selectFacility } = actions;
          const newFacilityUid = generateUid();
          const newTeiId = generateUid();
          const newEnrollmentId = generateUid();
          const newEventId = generateUid();
          const newFacility = {
            latitude: "",
            longitude: "",
            [UID]: newFacilityUid,
            [PATH]: meOrgUnitPath + "/" + newFacilityUid,
            [ACTIVE_STATUS]: "open",
            [IS_NEW_FACILITY]: "true",
            status: "ACTIVE",
            event: newEventId,
            hidden: false,
            tei: newTeiId,
            enr: newEnrollmentId,
            events: [],
            previousValues: {}
          };
          selectFacility(newFacility);
        })
      ),
    addNewFacilityToList: (facility) =>
      set(
        produce((state) => {
          const newFacilities = [...state.facilities, facility];
          state.facilities = newFacilities;
        })
      ),
    addNewTeiToList: (tei) =>
      set(
        produce((state) => {
          const newTeis = [...state.teis, tei];
          state.teis = newTeis;
        })
      ),
    save: (event) =>
      set(
        produce((state) => {
          const actions = useFacilityCheckModuleStore.getState().actions;
          const { selectFacility } = actions;
          const program = useMetadataStore.getState().program;
          const me = useMetadataStore.getState().me;
          const foundFacilityIndex = state.facilities.findIndex((facility) => facility[UID] === event.id);
          // const currentFacility = state.facilities[foundFacilityIndex];
          // state.facilities[foundFacilityIndex] = { ...currentFacility, ...event };
          if (foundFacilityIndex !== -1) {
            const foundActiveEventIndex = state.facilities[foundFacilityIndex].events.findIndex((event) => event.status === "ACTIVE");
            program.dataElements.forEach((de) => {
              // if (event[de.id]) {
              state.facilities[foundFacilityIndex][de.id] = event[de.id] ? event[de.id] : "";
              // }
            });
            if (event.latitude) {
              state.facilities[foundFacilityIndex].latitude = event.latitude;
              state.facilities[foundFacilityIndex].longitude = event.longitude;
            }
            if (event.status && event.status === "COMPLETED") {
              state.facilities[foundFacilityIndex][APPROVAL_STATUS] = event[APPROVAL_STATUS];
              state.facilities[foundFacilityIndex].status = "COMPLETED";
              state.facilities[foundFacilityIndex].isPending = true;
              state.facilities[foundFacilityIndex].completedAt = event.completedAt;
              state.facilities[foundFacilityIndex].updatedBy = {
                firstName: me.firstName,
                surname: me.surname
              };
            }
            if (foundActiveEventIndex !== -1) {
              program.dataElements.forEach((de) => {
                // if (event[de.id]) {
                state.facilities[foundFacilityIndex].events[foundActiveEventIndex][de.id] = event[de.id] ? event[de.id] : "";
                // }
              });
              if (event.latitude) {
                state.facilities[foundFacilityIndex].events[foundActiveEventIndex].latitude = event.latitude;
                state.facilities[foundFacilityIndex].events[foundActiveEventIndex].longitude = event.longitude;
              }
              if (event.status && event.status === "COMPLETED") {
                state.facilities[foundFacilityIndex].events[foundActiveEventIndex][APPROVAL_STATUS] = event[APPROVAL_STATUS];
                state.facilities[foundFacilityIndex].events[foundActiveEventIndex].status = "COMPLETED";
                state.facilities[foundFacilityIndex].events[foundActiveEventIndex].isPending = true;
                state.facilities[foundFacilityIndex].events[foundActiveEventIndex].completedAt = event.completedAt;
                state.facilities[foundFacilityIndex].events[foundActiveEventIndex].updatedBy = {
                  firstName: me.firstName,
                  surname: me.surname
                };
              }
            } else {
              state.facilities[foundFacilityIndex].events.unshift(event);
            }
            const newSelectedFacility = _.cloneDeep(state.facilities[foundFacilityIndex]);
            newSelectedFacility.lastUpdated = new Date().toISOString();
            selectFacility(newSelectedFacility);
          }
        })
      ),
    approve: (facility) =>
      set(
        produce((state) => {
          const me = useMetadataStore.getState().me;
          const { username } = me;
          const now = format(new Date(), "yyyy-MM-dd");
          const foundFacilityIndex = state.facilities.findIndex((f) => f[UID] === facility[UID]);
          if (foundFacilityIndex !== -1) {
            const foundPendingEventIndex = state.facilities[foundFacilityIndex].events.findIndex((event) => event[APPROVAL_STATUS] === "pending");
            state.facilities[foundFacilityIndex].events[foundPendingEventIndex][APPROVAL_STATUS] = "approved";
            state.facilities[foundFacilityIndex].events[foundPendingEventIndex][APPROVED_BY] = username;
            state.facilities[foundFacilityIndex].events[foundPendingEventIndex][APPROVED_AT] = now;
            state.facilities[foundFacilityIndex][APPROVAL_STATUS] = "approved";
            state.facilities[foundFacilityIndex][APPROVED_BY] = username;
            state.facilities[foundFacilityIndex][APPROVED_AT] = now;
          }
        })
      )
  }
}));

export default useDataStore;
