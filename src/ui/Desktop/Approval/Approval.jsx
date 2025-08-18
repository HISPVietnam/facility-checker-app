import { useEffect, useState } from "react";
import { NoticeBox } from "@dhis2/ui";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { DATA_ELEMENTS } from "@/const";
import useDataStore from "@/states/data";
import useApprovalModuleStore from "@/states/approvalModule";
import PendingFacilityDialog from "./PendingFacilityDialog";
import useMetadataStore from "@/states/metadata";
import FacilitiesTableByCategories from "../common/FacilitiesTableByCategories";
const { APPROVAL_STATUS, PATH } = DATA_ELEMENTS;

const Approval = () => {
  const { t } = useTranslation();
  //store
  const facilities = useDataStore((state) => state.facilities);
  const me = useMetadataStore((state) => state.me);
  const { selectedOrgUnit, currentFilters, actions } = useApprovalModuleStore(
    useShallow((state) => ({
      selectedOrgUnit: state.selectedOrgUnit,
      currentFilters: state.filters,
      actions: state.actions,
    }))
  );
  const { selectFacility, resetFilters, setIsReadOnly } = actions;
  //local state
  const [pendingFacilityDialog, setPendingFacilityDialog] = useState(false);
  const filterApprovalFacilityEvents = (facilityEvents) => {
    const filterByApprovalStatus = (event) => {
      if (currentFilters.length === 0) return true;
      const approvalStatus = event[APPROVAL_STATUS];
      return currentFilters.includes(approvalStatus);
    };
    const filterByOrgUnit = (event) => {
      if (!selectedOrgUnit) {
        return true;
      }
      const facilityPath = event[PATH] || event.previousValues[PATH];
      if (!facilityPath) return false;
      return facilityPath.includes(selectedOrgUnit.id);
    };
    return facilityEvents.filter((event) => {
      return filterByApprovalStatus(event) && filterByOrgUnit(event);
    });
  };

  const filteredFacilityEvents = facilities
    .filter(
      (facility) => filterApprovalFacilityEvents(facility.events).length > 0
    )
    .map((facility) => filterApprovalFacilityEvents(facility.events))
    .flat();

  useEffect(() => {
    resetFilters();
    if (!me.authorities.includes("APPROVAL")) {
      setIsReadOnly(true);
    }
  }, []);

  return (
    <div className="w-full h-full p-1 flex flex-col gap-1">
      <NoticeBox
        title={t("facilityCountApprovalTotal", {
          total: facilities.filter(
            (facility) =>
              filterApprovalFacilityEvents(facility.events).length > 0
          ).length,
        })}
      >
        {t("facilityCountApprovalSeparate", {
          approved: filteredFacilityEvents.filter(
            (event) => event[APPROVAL_STATUS] === "approved"
          ).length,
          rejected: filteredFacilityEvents.filter(
            (event) => event[APPROVAL_STATUS] === "rejected"
          ).length,
          pending: filteredFacilityEvents.filter(
            (event) => event[APPROVAL_STATUS] === "pending"
          ).length,
        })}
      </NoticeBox>
      <PendingFacilityDialog
        open={pendingFacilityDialog}
        setPendingFacilityDialog={setPendingFacilityDialog}
      />
      <FacilitiesTableByCategories
        onRowClick={(facility, facilityEventChange) => {
          setPendingFacilityDialog(true);
          selectFacility(facility, facilityEventChange.event);
        }}
        filter={filterApprovalFacilityEvents}
      />
    </div>
  );
};
export default Approval;
