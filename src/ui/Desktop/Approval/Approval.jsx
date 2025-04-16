import { useState } from "react";
import { DataTable, DataTableHead, DataTableRow, DataTableBody, DataTableCell, DataTableColumnHeader } from "@dhis2/ui";
import { Pending, New, Approved, NotYetSynced } from "@/ui/common/Labels";
import { DATA_ELEMENTS } from "@/const";
import DataValueLabel from "@/ui/common/DataValueLabel";
import useDataStore from "@/states/data";
import DataValueText from "@/ui/common/DataValueText";
import PendingFacilityDialog from "./PendingFacilityDialog";
import useApprovalModuleStore from "@/states/approvalModule";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
const { UID, NAME, APPROVAL_STATUS, SYNCED, IS_NEW_FACILITY } = DATA_ELEMENTS;
const columns = [UID, NAME, "latitude", "longitude", APPROVAL_STATUS, SYNCED, "dateOfRequest"];
const Approval = () => {
  const { t } = useTranslation();
  const [pendingFacilityDialog, setPendingFacilityDialog] = useState(false);
  const facilities = useDataStore((state) => state.facilities);
  const actions = useApprovalModuleStore((state) => state.actions);
  const { selectFacility } = actions;
  const filtered = facilities.filter((f) => f[APPROVAL_STATUS] === "pending" || f[APPROVAL_STATUS] === "approved");

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
          {filtered.map((facility) => {
            const foundPendingEvent = facility.events.find((event) => event[APPROVAL_STATUS] === "pending");
            const foundApprovedEvent = facility.events.find((event) => event[APPROVAL_STATUS] === "approved");
            const finalEvent = foundPendingEvent ? foundPendingEvent : foundApprovedEvent;
            return (
              <DataTableRow
                className="cursor-pointer"
                onClick={() => {
                  setPendingFacilityDialog(true);
                  selectFacility(facility);
                }}
              >
                {columns.map((column) => {
                  if (column === "dateOfRequest") {
                    return (
                      <DataTableCell>
                        <DataValueText dataElement="completedAt" value={format(new Date(finalEvent.completedAt), "yyyy-MM-dd")} />
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
                        children.push(...[<>&nbsp;</>, <New>{t("newFacility")}</New>]);
                      }
                    } else if (column === SYNCED) {
                      if (!facility[SYNCED]) {
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
          })}
        </DataTableBody>
      </DataTable>
    </div>
  );
};
export default Approval;
