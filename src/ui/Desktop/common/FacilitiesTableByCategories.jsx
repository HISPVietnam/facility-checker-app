import { DATA_ELEMENTS } from "@/const";
import useDataStore from "@/states/data";
import useMetadataStore from "@/states/metadata";
import DataValueLabel from "@/ui/common/DataValueLabel";
import DataValueText from "@/ui/common/DataValueText";
import { Approved, Pending, Rejected } from "@/ui/common/Labels";
import {
  DataTable,
  DataTableBody,
  DataTableCell,
  DataTableHead,
  DataTableRow,
  TableCellHead,
} from "@dhis2/ui";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { format } from "date-fns";
import React from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
const {
  NAME,
  APPROVAL_STATUS,
  IS_NEW_FACILITY,
  PATH,
  URL,
  ACTIVE_STATUS,
  ADDRESS,
  CLOSED_DATE,
  CODE,
  CONTACT_PERSON,
  DESCRIPTION,
  EMAIL,
  OPENING_DATE,
  PHONE_NUMBER,
  SHORT_NAME,
} = DATA_ELEMENTS;
const columns = [
  {
    value: "dateOfRequest",
    rowSpan: 2,
  },
  {
    value: NAME,
    rowSpan: 2,
  },
  {
    value: PATH,
    rowSpan: 2,
  },
  {
    value: "categories",
    children: [
      { value: "coordinates" },
      { value: "ouGroups" },
      { value: "hierarchy" },
      { value: "info" },
    ],
  },
  {
    value: IS_NEW_FACILITY,
    rowSpan: 2,
    className: "text-center",
  },
  {
    value: APPROVAL_STATUS,
    rowSpan: 2,
  },
];

const FacilitiesTableByCategories = ({
  onRowClick,
  filter = (events) => events,
  isSyncModule = false,
}) => {
  const { t } = useTranslation();
  const { program } = useMetadataStore(
    useShallow((state) => ({ program: state.program }))
  );
  const { facilities } = useDataStore(
    useShallow((state) => ({
      facilities: state.facilities,
    }))
  );
  const checkChangDataValue = (fields, currentValues) => {
    const { previousValues } = currentValues;
    return fields.some(
      (field) =>
        currentValues[field] && previousValues[field] !== currentValues[field]
    );
  };

  const filteredFacility = facilities
    .map((facility) => {
      return {
        ...facility,
        events: filter(facility.events),
      };
    })
    .filter((item) => item.events.length > 0)
    .map((facility) => {
      const row = facility.events[0];

      const isChangeCoordinates = checkChangDataValue(
        ["longitude", "latitude"],
        row
      );
      const isChangeOuGroups = checkChangDataValue(
        program.dataElements
          .filter((de) => de.description && de.description.includes("FCGS"))
          .map((de) => de.id),
        row
      );

      const isChangeHierarchy = checkChangDataValue([PATH], row);
      const isChangeInfo =
        !isChangeCoordinates &&
        !isChangeOuGroups &&
        !isChangeHierarchy &&
        checkChangDataValue(
          [
            ACTIVE_STATUS,
            ADDRESS,
            CLOSED_DATE,
            CODE,
            CONTACT_PERSON,
            DESCRIPTION,
            EMAIL,
            NAME,
            OPENING_DATE,
            PHONE_NUMBER,
            SHORT_NAME,
            URL,
          ],
          row
        );
      const isNewFacility = row[IS_NEW_FACILITY];

      return {
        ...facility,
        categories: {
          isChangeCoordinates,
          isChangeOuGroups,
          isChangeHierarchy,
          isChangeInfo,
          isNewFacility,
        },
      };
    });
  const renderHeaders = (headers, level = 0) => {
    if (!headers || headers.length === 0) {
      return null; // Base case: stop recursion
    }
    const subHeaders = [];
    return (
      <>
        <DataTableRow>
          {headers.map((header) => {
            if (header.value === APPROVAL_STATUS && isSyncModule) return;
            subHeaders.push(...(header.children || []));
            return (
              <TableCellHead
                className={`!h-fit ${
                  (header.children || level > 0) && "text-center"
                }  text-left  bg-[#d1d5dc] ${header?.className}`}
                colSpan={header.children?.length || 1}
                rowSpan={header.rowSpan || 1}
              >
                <DataValueLabel dataElement={header.value} />
              </TableCellHead>
            );
          })}
        </DataTableRow>
        {renderHeaders(subHeaders, level + 1)}
      </>
    );
  };

  return (
    <DataTable
      className=" flex-1 !border-collapse  [&_th]:!py-2 [&_td]:!py-2 [&_td]:border [&_td]:!border-[#c0c4cb] [&_th]:border [&_th]:!border-[#c0c4cb]"
      scrollHeight="100%"
    >
      <DataTableHead className="sticky -top-[1px] z-10">
        {renderHeaders(columns)}
      </DataTableHead>
      <DataTableBody>
        {filteredFacility.map((facility) => {
          return facility.events.map((row) => {
            return (
              <DataTableRow
                key={row.event}
                className="cursor-pointer"
                onClick={() => onRowClick && onRowClick(facility, row)}
              >
                <DataTableCell>
                  <DataValueText
                    dataElement="completedAt"
                    value={format(new Date(row.completedAt), "yyyy-MM-dd")}
                  />
                </DataTableCell>
                <DataTableCell>
                  <DataValueText
                    dataElement={NAME}
                    value={row[NAME] || row.previousValues[NAME]}
                  />
                </DataTableCell>
                <DataTableCell>
                  <DataValueText
                    dataElement={PATH}
                    value={row[PATH] || row.previousValues[PATH]}
                  />
                </DataTableCell>
                <DataTableCell align="center">
                  {facility.categories.isChangeCoordinates && (
                    <FontAwesomeIcon icon={faCheck} fontSize={15} />
                  )}
                </DataTableCell>
                <DataTableCell align="center">
                  {facility.categories.isChangeOuGroups && (
                    <FontAwesomeIcon icon={faCheck} fontSize={15} />
                  )}
                </DataTableCell>
                <DataTableCell align="center">
                  {facility.categories.isChangeHierarchy && (
                    <FontAwesomeIcon icon={faCheck} fontSize={15} />
                  )}
                </DataTableCell>
                <DataTableCell align="center">
                  {facility.categories.isChangeInfo && (
                    <FontAwesomeIcon icon={faCheck} fontSize={15} />
                  )}
                </DataTableCell>
                <DataTableCell align="center">
                  {facility.categories.isNewFacility && (
                    <FontAwesomeIcon icon={faCheck} fontSize={15} />
                  )}
                </DataTableCell>
                {!isSyncModule && (
                  <DataTableCell>
                    {row[APPROVAL_STATUS] === "pending" && (
                      <Pending>{t("pending")}</Pending>
                    )}

                    {row[APPROVAL_STATUS] === "approved" && (
                      <Approved>{t("approved")}</Approved>
                    )}
                    {row[APPROVAL_STATUS] === "rejected" && (
                      <Rejected>{t("rejected")}</Rejected>
                    )}
                  </DataTableCell>
                )}
              </DataTableRow>
            );
          });
        })}
      </DataTableBody>
    </DataTable>
  );
};

export default FacilitiesTableByCategories;
