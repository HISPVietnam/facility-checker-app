import { useEffect, useState } from "react";
import { DataTable, DataTableHead, DataTableRow, DataTableBody, DataTableCell, DataTableColumnHeader } from "@dhis2/ui";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { DATA_ELEMENTS } from "@/const";
import { Pending, New, Approved, NotYetSynced, Rejected } from "@/ui/common/Labels";
import DataValueLabel from "@/ui/common/DataValueLabel";
import DataValueText from "@/ui/common/DataValueText";
import useDataStore from "@/states/data";
import useApprovalModuleStore from "@/states/approvalModule";
import PendingFacilityDialog from "./PendingFacilityDialog";
import useMetadataStore from "@/states/metadata";
const { UID, NAME, APPROVAL_STATUS, SYNCED, IS_NEW_FACILITY, PATH } = DATA_ELEMENTS;
const columns = [UID, NAME, "latitude", "longitude", APPROVAL_STATUS, SYNCED, "dateOfRequest"];

const Approval = () => {
  const { t } = useTranslation();
  //store
  const facilities = useDataStore((state) => state.facilities);
  const me = useMetadataStore((state) => state.me);
  const { selectedOrgUnit, currentFilters, actions } = useApprovalModuleStore(
    useShallow((state) => ({
      selectedOrgUnit: state.selectedOrgUnit,
      currentFilters: state.filters,
      actions: state.actions
    }))
  );
  const { selectFacility, resetFilters, setIsReadOnly } = actions;
  //local state
  const [pendingFacilityDialog, setPendingFacilityDialog] = useState(false);

  const filterApprovalFacilities = (facilities) => {
    const filterByIsNewFacility = (facility) => {
      if (currentFilters.length === 0) {
        return facility[APPROVAL_STATUS] === "pending" || facility[APPROVAL_STATUS] === "approved" || facility[APPROVAL_STATUS] === "rejected";
      }
      const isNewFacility = facility[IS_NEW_FACILITY] === "true" ? "isNewFacility" : "";
      return currentFilters.includes(isNewFacility);
    };
    const filterByApprovalStatus = (facility) => {
      if (currentFilters.length === 0) {
        return facility[APPROVAL_STATUS] === "pending" || facility[APPROVAL_STATUS] === "approved" || facility[APPROVAL_STATUS] === "rejected";
      }
      const approvalStatus = facility[APPROVAL_STATUS];
      return currentFilters.includes(approvalStatus);
    };
    const filterByOrgUnit = (facility) => {
      if (!selectedOrgUnit) {
        return true;
      }
      const facilityPath = facility[PATH];
      return facilityPath.includes(selectedOrgUnit.id);
    };
    return facilities.filter((facility) => {
      return (filterByApprovalStatus(facility) || filterByIsNewFacility(facility)) && filterByOrgUnit(facility);
    });
  };

  useEffect(() => {
    resetFilters();
    if (!me.authorities.includes("APPROVAL")) {
      setIsReadOnly(true);
    }
  }, []);

  return (
    <div className="w-full h-full p-1">
      <PendingFacilityDialog open={pendingFacilityDialog} setPendingFacilityDialog={setPendingFacilityDialog} />
      <DataTable scrollHeight="100%">
        <DataTableHead>
          <DataTableRow>
            {columns.map((column) => {
              return (
                <DataTableColumnHeader fixed top="0">
                  <DataValueLabel dataElement={column} />
                </DataTableColumnHeader>
              );
            })}
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {filterApprovalFacilities(facilities).map((facility) => {
            // const foundPendingEvent = facility.events.find((event) => event[APPROVAL_STATUS] === "pending");
            // const foundApprovedEvent = facility.events.find((event) => event[APPROVAL_STATUS] === "approved");
            // const finalEvent = foundPendingEvent ? foundPendingEvent : foundApprovedEvent;
            const filtered = facility.events.filter(
              (event) => event[APPROVAL_STATUS] === "approved" || event[APPROVAL_STATUS] === "pending" || event[APPROVAL_STATUS] === "rejected"
            );
            return filtered.map((row) => {
              return (
                <DataTableRow
                  className="cursor-pointer"
                  onClick={() => {
                    setPendingFacilityDialog(true);
                    selectFacility(facility, row.event);
                  }}
                >
                  {columns.map((column) => {
                    if (column === "dateOfRequest") {
                      return (
                        <DataTableCell>
                          <DataValueText dataElement="completedAt" value={format(new Date(row.completedAt), "yyyy-MM-dd")} />
                        </DataTableCell>
                      );
                    } else {
                      let children = null;
                      if (column === APPROVAL_STATUS) {
                        children = [];
                        if (row[column] === "pending") {
                          children.push(<Pending>{t("pending")}</Pending>);
                        } else if (row[column] === "approved") {
                          children.push(<Approved>{t("approved")}</Approved>);
                        } else if (row[column] === "rejected") {
                          children.push(<Rejected>{t("rejected")}</Rejected>);
                        }
                        if (row[IS_NEW_FACILITY] === "true") {
                          children.push(...[<>&nbsp;</>, <New>{t("newFacility")}</New>]);
                        }
                      } else if (column === SYNCED) {
                        if (row[APPROVAL_STATUS] === "rejected") {
                          children = null;
                        } else if (!row[SYNCED]) {
                          children = <NotYetSynced>{t("notYetSynced")}</NotYetSynced>;
                        }
                      } else {
                        children = <DataValueText dataElement={column} value={facility[column]} />;
                      }
                      return <DataTableCell>{children}</DataTableCell>;
                    }
                  })}
                </DataTableRow>
              );
            });
          })}
        </DataTableBody>
      </DataTable>
    </div>
  );
};
export default Approval;
