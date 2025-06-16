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
import useMetadataStore from "@/states/metadata";

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
  const {
    selectedOrgUnit,
    currentFilters,
    actions,
    selectedFacilities,
    isReadOnly,
  } = useSynchronizationModuleStore(
    useShallow((state) => ({
      selectedOrgUnit: state.selectedOrgUnit,
      currentFilters: state.filters,
      actions: state.actions,
      selectedFacilities: state.selectedFacilities,
      isReadOnly: state.isReadOnly,
    }))
  );
  const me = useMetadataStore((state) => state.me);
  const { resetFilters, toggleFilter, selectFacilities, setIsReadOnly } =
    actions;
  const facilityEvents = facilities.map((f) => f.events).flat();

  const filteredSyncFacilityEvents = facilities
    .map((f) => f.events)
    .flat()
    .filter((event) => event[APPROVAL_STATUS] === "approved");

  const handleCheckFacility = (event) => {
    if (isReadOnly) return;

    const isSelected = selectedFacilities.includes(event.event);
    const isSelectAll =
      !isSelected &&
      [...selectedFacilities, event.event].length ===
        filteredSyncFacilityEvents.length;
    if (isSelected) {
      selectFacilities(
        selectedFacilities.filter(
          (item) => item !== event.event && item !== "all"
        )
      );
      return;
    }
    if (isSelectAll) {
      selectFacilities([...selectedFacilities, event.event, "all"]);
      return;
    }
    selectFacilities([...selectedFacilities, event.event]);
  };

  useEffect(() => {
    resetFilters();
    if (!me.authorities.includes("SYNCHRONIZATION")) {
      setIsReadOnly(true);
    }
  }, []);
  return (
    <div className="w-full h-full p-1">
      <DataTable scrollHeight="100%">
        <DataTableHead>
          <DataTableRow>
            <DataTableColumnHeader fixed top="0">
              <Checkbox
                disabled={filteredSyncFacilityEvents.length === 0 || isReadOnly}
                checked={selectedFacilities.includes("all")}
                value={"all"}
                onChange={() => {
                  selectFacilities(
                    selectedFacilities.includes("all")
                      ? []
                      : [
                          "all",
                          ...filteredSyncFacilityEvents.map(
                            (event) => event.event
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
          {filteredSyncFacilityEvents.map((event) => {
            return (
              <DataTableRow
                className="cursor-pointer"
                onClick={() => handleCheckFacility(event)}
              >
                <DataTableCell>
                  <Checkbox
                    disabled={isReadOnly}
                    checked={selectedFacilities.includes(event.event)}
                    value={event.event}
                    onChange={() => handleCheckFacility(event)}
                  />
                </DataTableCell>
                {columns.map((column) => {
                  if (column === "dateOfRequest") {
                    return (
                      <DataTableCell>
                        <DataValueText
                          dataElement="completedAt"
                          value={format(
                            new Date(event.completedAt),
                            "yyyy-MM-dd"
                          )}
                        />
                      </DataTableCell>
                    );
                  } else {
                    let children = null;
                    if (column === APPROVAL_STATUS) {
                      children = [];
                      if (event[column] === "pending") {
                        children.push(<Pending>{t("pending")}</Pending>);
                      } else if (event[column] === "approved") {
                        children.push(<Approved>{t("approved")}</Approved>);
                      }
                      if (event[IS_NEW_FACILITY] === "true") {
                        children.push(
                          ...[<>&nbsp;</>, <New>{t("newFacility")}</New>]
                        );
                      }
                    } else if (column === SYNCED) {
                      if (!event[SYNCED]) {
                        children = (
                          <NotYetSynced>{t("notYetSynced")}</NotYetSynced>
                        );
                      }
                    } else {
                      children = (
                        <DataValueText
                          dataElement={column}
                          value={event[column]}
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
