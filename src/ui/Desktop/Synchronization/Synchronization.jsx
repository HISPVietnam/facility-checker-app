import { useEffect, useState } from "react";
import {
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableBody,
  DataTableCell,
  DataTableColumnHeader,
  Checkbox,
} from "@dhis2/ui";

import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { DATA_ELEMENTS } from "@/const";

import { Pending, New, Approved, NotYetSynced } from "@/ui/common/Labels";
import DataValueLabel from "@/ui/common/DataValueLabel";
import DataValueText from "@/ui/common/DataValueText";

import useDataStore from "@/states/data";
import useSynchronizationModuleStore from "@/states/synchronizationModule";

const { UID, NAME, APPROVAL_STATUS, SYNCED, IS_NEW_FACILITY, PATH } =
  DATA_ELEMENTS;
const columns = [
  UID,
  NAME,
  "latitude",
  "longitude",
  APPROVAL_STATUS,
  SYNCED,
  "dateOfRequest",
];

const Synchronization = () => {
  const { t } = useTranslation();
  //store
  const facilities = useDataStore((state) => state.facilities);
  const { selectedOrgUnit, currentFilters, actions, selectedFacilities } =
    useSynchronizationModuleStore(
      useShallow((state) => ({
        selectedOrgUnit: state.selectedOrgUnit,
        currentFilters: state.filters,
        actions: state.actions,
        selectedFacilities: state.selectedFacilities,
      }))
    );
  const { resetFilters, toggleFilter, selectFacilities } = actions;

  const filterApprovalFacilities = (facilities) => {
    const filterByIsNewFacility = (facility) => {
      const isNewFacility =
        facility[IS_NEW_FACILITY] === "true" ? "isNewFacility" : "";
      return currentFilters.includes(isNewFacility);
    };
    const filterBySyncStatus = (facility) => {
      const syncStatus =
        facility[SYNCED] === "true" ? "synced" : "notYetSynced";
      return currentFilters.includes(syncStatus);
    };
    const filterByOrgUnit = (facility) => {
      if (!selectedOrgUnit) {
        return true;
      }
      const facilityPath = facility[PATH];
      return facilityPath.includes(selectedOrgUnit.id);
    };
    return facilities.filter(
      (facility) => facility[APPROVAL_STATUS] === "approved"
    );
    //   .filter((facility) => {
    //     return (
    //       (filterBySyncStatus(facility) || filterByIsNewFacility(facility)) &&
    //       filterByOrgUnit(facility)
    //     );
    //   });
  };

  const handleCheckFacility = (facility) => {
    const isSelected = selectedFacilities.includes(facility.tei);
    const isSelectAll =
      !isSelected &&
      [...selectedFacilities, facility.tei].length ===
        filterApprovalFacilities(facilities).length;
    if (isSelected) {
      selectFacilities(
        selectedFacilities.filter(
          (item) => item !== facility.tei && item !== "all"
        )
      );
      return;
    }
    if (isSelectAll) {
      selectFacilities([...selectedFacilities, facility.tei, "all"]);
      return;
    }
    selectFacilities([...selectedFacilities, facility.tei]);
  };

  useEffect(() => {
    resetFilters();
  }, []);
  return (
    <div className="w-full h-full p-1">
      <DataTable scrollHeight="100%">
        <DataTableHead>
          <DataTableRow>
            <DataTableColumnHeader fixed top="0">
              <Checkbox
                checked={selectedFacilities.includes("all")}
                value={"all"}
                onChange={() => {
                  selectFacilities(
                    selectedFacilities.includes("all")
                      ? []
                      : [
                          "all",
                          ...filterApprovalFacilities(facilities).map(
                            (facility) => facility.tei
                          ),
                        ]
                  );
                }}
              />
            </DataTableColumnHeader>
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
            const foundPendingEvent = facility.events.find(
              (event) => event[APPROVAL_STATUS] === "pending"
            );
            const foundApprovedEvent = facility.events.find(
              (event) => event[APPROVAL_STATUS] === "approved"
            );
            const finalEvent = foundPendingEvent
              ? foundPendingEvent
              : foundApprovedEvent;
            return (
              <DataTableRow
                className="cursor-pointer"
                onClick={() => handleCheckFacility(facility)}
              >
                <DataTableCell>
                  <Checkbox
                    checked={selectedFacilities.includes(facility.tei)}
                    value={facility.tei}
                    onChange={() => handleCheckFacility(facility)}
                  />
                </DataTableCell>
                {columns.map((column) => {
                  if (column === "dateOfRequest") {
                    return (
                      <DataTableCell>
                        <DataValueText
                          dataElement="completedAt"
                          value={format(
                            new Date(finalEvent.completedAt),
                            "yyyy-MM-dd"
                          )}
                        />
                      </DataTableCell>
                    );
                  } else {
                    let children = null;
                    if (column === APPROVAL_STATUS) {
                      children = [];
                      if (facility[column] === "pending") {
                        children.push(<Pending>{t("pending")}</Pending>);
                      } else if (facility[column] === "approved") {
                        children.push(<Approved>{t("approved")}</Approved>);
                      }
                      if (facility[IS_NEW_FACILITY] === "true") {
                        children.push(
                          ...[<>&nbsp;</>, <New>{t("newFacility")}</New>]
                        );
                      }
                    } else if (column === SYNCED) {
                      if (!facility[SYNCED]) {
                        children = (
                          <NotYetSynced>{t("notYetSynced")}</NotYetSynced>
                        );
                      }
                    } else {
                      children = (
                        <DataValueText
                          dataElement={column}
                          value={facility[column]}
                        />
                      );
                    }
                    return <DataTableCell>{children}</DataTableCell>;
                  }
                })}
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>
    </div>
  );
};
export default Synchronization;
