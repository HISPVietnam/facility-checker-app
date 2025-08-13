import { useEffect } from "react";
import { NoticeBox } from "@dhis2/ui";

import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { DATA_ELEMENTS } from "@/const";

import useDataStore from "@/states/data";
import useSynchronizationModuleStore from "@/states/synchronizationModule";
import FacilitiesTableByCategories from "../common/FacilitiesTableByCategories";

const { APPROVAL_STATUS, SYNC_NUMBER } = DATA_ELEMENTS;

const Synchronization = () => {
  const { t } = useTranslation();
  //store
  const facilities = useDataStore((state) => state.facilities);
  const { actions } = useSynchronizationModuleStore(
    useShallow((state) => ({
      actions: state.actions,
    }))
  );
  const { resetFilters } = actions;

  const filteredSyncFacilityEvents = facilities
    .map((f) => f.events)
    .flat()
    .filter(
      (event) => event[APPROVAL_STATUS] === "approved" && !event[SYNC_NUMBER]
    );

  useEffect(() => {
    resetFilters();
  }, []);
  return (
    <div className="w-full h-full p-1">
      <NoticeBox
        className="mb-2"
        warning
        title={t("facilityCountSyncTotal", {
          total: filteredSyncFacilityEvents.length,
        })}
      />

      <FacilitiesTableByCategories
        isSyncModule
        filter={(events) =>
          events.filter(
            (event) =>
              event[APPROVAL_STATUS] === "approved" && !event[SYNC_NUMBER]
          )
        }
      />
    </div>
  );
};
export default Synchronization;
