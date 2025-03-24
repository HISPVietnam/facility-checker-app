import { useState } from "react";
import { DataTable, DataTableHead, DataTableRow, DataTableBody, DataTableCell, DataTableColumnHeader } from "@dhis2/ui";
import { DATA_ELEMENTS } from "@/const";
import DataValueLabel from "@/ui/common/DataValueLabel";
import useDataStore from "@/states/data";
import DataValueText from "@/ui/common/DataValueText";
import PendingFacilityDialog from "./PendingFacilityDialog";
import useApprovalModuleStore from "@/states/approvalModule";
import { format } from "date-fns";
const { UID, NAME, APPROVAL_STATUS, SYNCED } = DATA_ELEMENTS;
const columns = [UID, NAME, "latitude", "longitude", APPROVAL_STATUS, SYNCED, "dateOfRequest"];
const Approval = () => {
  const [pendingFacilityDialog, setPendingFacilityDialog] = useState(false);
  const facilities = useDataStore((state) => state.facilities);
  const actions = useApprovalModuleStore((state) => state.actions);
  const { selectFacility } = actions;
  const filtered = facilities.filter((f) => f[APPROVAL_STATUS] === "pending");

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
                        <DataValueText dataElement="completedAt" value={format(new Date(foundPendingEvent.completedAt), "yyyy-MM-dd")} />
                      </DataTableCell>
                    );
                  } else {
                    return (
                      <DataTableCell>
                        <DataValueText dataElement={column} value={facility[column]} />
                      </DataTableCell>
                    );
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
