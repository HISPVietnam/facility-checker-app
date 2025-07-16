import { useEffect } from "react";
import { NoticeBox } from "@dhis2/ui";

import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { DATA_ELEMENTS } from "@/const";

import useDataStore from "@/states/data";
import useSynchronizationModuleStore from "@/states/synchronizationModule";

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
      (event) => event[APPROVAL_STATUS] === "approved" && event[SYNC_NUMBER]
    );

  useEffect(() => {
    resetFilters();
  }, []);
  return (
    <div className="w-full h-full p-1">
      <NoticeBox
        warning={Boolean(filteredSyncFacilityEvents.length)}
        title={
          Boolean(filteredSyncFacilityEvents.length)
            ? t("syncNotEmpty", { total: filteredSyncFacilityEvents.length })
            : t("syncEmpty")
        }
      />
    </div>
  );
};
export default Synchronization;
