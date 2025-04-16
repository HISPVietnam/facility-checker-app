import {
  MenuItem,
  InputField,
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableCell,
  DataTableBody,
  DataTableColumnHeader,
  Pagination
} from "@dhis2/ui";
import { Pending, Edited, New } from "@/ui/common/Labels";
import DataValueText from "@/ui/common/DataValueText";
import useMetadataStore from "@/states/metadata";
import { useShallow } from "zustand/react/shallow";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { pickTranslation } from "@/utils";
import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import { useEffect, useState } from "react";
import useDataStore from "@/states/data";
import FacilityProfileDialog from "./FacilityProfileDialog";
import { PROFILE_LOGS_PROGRAM_STAGE_ID, CUSTOM_COLUMNS_LIST_VIEW, DATA_ELEMENTS } from "@/const";
const { IS_NEW_FACILITY } = DATA_ELEMENTS;
const FacilitiesList = () => {
  const { t } = useTranslation();
  const [paging, setPaging] = useState({
    page: 1,
    pageSize: 50,
    pageCount: 1,
    pageTotal: 0
  });
  const [filter, setFilter] = useState("");
  const [sorting, setSorting] = useState(null);

  const { filters, selectedFacility, actions, selectedOrgUnit } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      filters: state.filters,
      selectedFacility: state.selectedFacility,
      actions: state.actions,
      selectedOrgUnit: state.selectedOrgUnit
    }))
  );
  const { selectFacility, toggleDialog } = actions;
  const { program } = useMetadataStore(
    useShallow((state) => ({
      program: state.program
    }))
  );

  const facilities = useDataStore((state) => state.facilities);

  const filterFacilities = facilities
    .map((tei) => {
      return {
        ...tei,
        status: tei.events.find((event) => event.status === "ACTIVE")
          ? "edited"
          : tei.events.find((event) => event.status === "COMPLETED" && event.p4m3y1jLgpv === "pending")
          ? "pending"
          : ""
      };
    })
    .filter((e) => !e.hidden);

  const sortedFacilities =
    sorting && sorting.direction !== "default"
      ? _.orderBy(filterFacilities, [sorting.name], [sorting.direction === "asc" ? "asc" : "desc"])
      : filterFacilities;

  const [list, setList] = useState(null);

  useEffect(() => {
    generateFacilityList();
  }, [selectedOrgUnit ? selectedOrgUnit.id : "", filters.length, sortedFacilities.length, paging.page, paging.pageSize, filter, sorting]);

  // useEffect(() => {
  //   if (profileDialog === false) {
  //     selectFacility(null);
  //   }
  // }, [profileDialog]);

  const generateTableColumns = () => {
    const columns = [];
    const foundProgramStage = program.programStages.find((e) => e.id === PROFILE_LOGS_PROGRAM_STAGE_ID);
    if (foundProgramStage) {
      foundProgramStage.programStageDataElements.forEach((psde) => {
        if (psde.displayInReports) {
          const foundDataElement = program.dataElements.find((e) => e.id === psde.dataElement.id);
          if (foundDataElement) {
            columns.push({
              id: foundDataElement.id,
              name: pickTranslation(foundDataElement, "en", "formName"),
              optionSet: foundDataElement.optionSet?.id ?? null
            });
          }
        }
      });
    }
    CUSTOM_COLUMNS_LIST_VIEW.forEach((col) => {
      columns.splice(col.position, 0, {
        id: col.id,
        name: col.name,
        optionSet: col.optionSet
      });
    });
    return columns;
  };

  const onSortIconClick = (columnId) => {
    let direction = "asc";
    if (sorting && sorting.name === columnId) {
      if (sorting.direction === "asc") {
        direction = "desc";
      } else if (sorting.direction === "desc") {
        direction = "default";
      }
    }
    setSorting({ name: columnId, direction });
  };

  const generateFacilityList = () => {
    setList(null);
    const columns = generateTableColumns();
    let dataTable = sortedFacilities
      .map((tei) => {
        let row = {};
        columns.forEach((col) => {
          switch (col.id) {
            case "status":
              let element;
              if (tei.status === "edited") {
                element = (
                  <Edited>
                    <DataValueText dataElement={col.id} value={t(tei.status)} />
                  </Edited>
                );
              } else {
                if (tei.status === "pending") {
                  element = (
                    <Pending>
                      <DataValueText dataElement={col.id} value={t(tei.status)} />
                    </Pending>
                  );
                } else {
                  element = <DataValueText dataElement={col.id} value={""} />;
                }
              }
              let output;
              if (tei[IS_NEW_FACILITY] === "true") {
                output = (
                  <>
                    {element}&nbsp;<New>{t("newFacility")}</New>
                  </>
                );
              } else {
                output = element;
              }
              row[col.id] = output;
              break;
            case "coordinates":
              const val =
                tei.latitude || tei.longitude
                  ? `[ ${tei.latitude ? tei.latitude.toFixed(4) : ""} , ${tei.longitude ? tei.longitude.toFixed(4) : ""} ]`
                  : "";
              row[col.id] = <DataValueText dataElement={col.id} value={val} />;
              break;
            default:
              row[col.id] = <DataValueText dataElement={col.id} value={tei[col.id]} />;
              break;
          }
        });
        row["tei"] = tei.tei;
        return row;
      })
      .filter((row) => {
        let flag = false;
        columns.forEach((col) => {
          if (row[col.id] && row[col.id].toString().toLowerCase().includes(filter.toString().toLowerCase())) {
            flag = true;
          }
        });
        if (flag) {
          return row;
        }
      });

    const rows = dataTable.length > 0 ? _.chunk(dataTable, paging.pageSize)[paging.page - 1] : [];

    setPaging({
      ...paging,
      page: dataTable.length < paging.pageTotal ? 1 : paging.page,
      pageCount: _.chunk(dataTable, paging.pageSize).length,
      pageTotal: dataTable.length
    });
    setList({
      ready: true,
      columns,
      rows
    });
  };

  const { columns, rows, ready } = list || {};

  const onPageSizeChange = (pageSize) => {
    setPaging({
      ...paging,
      pageSize,
      page: 1
    });
  };

  const onPageChange = (page) => {
    setPaging({
      ...paging,
      page
    });
  };

  return (
    ready && (
      <div className="p-1 h-full w-full bg-white">
        <div className="w-full h-[calc(100%-50px)] overflow-auto">
          <DataTable>
            <DataTableHead>
              <DataTableRow>
                {columns.map((column, columnIndex) => {
                  return (
                    <DataTableColumnHeader
                      fixed
                      top="0"
                      className="z-0"
                      key={columnIndex}
                      sortDirection={column.id === "coordinates" ? null : sorting && sorting.name === column.id ? sorting.direction : "default"}
                      onSortIconClick={() => onSortIconClick(column.id)}
                      name={column.id}
                    >
                      {t(column.name)}
                    </DataTableColumnHeader>
                  );
                })}
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {rows &&
                rows.length > 0 &&
                rows.map((row, rowIndex) => {
                  const selected = selectedFacility && selectedFacility.tei === row.tei;
                  return (
                    <DataTableRow
                      className="cursor-pointer"
                      key={rowIndex}
                      selected={selected}
                      onClick={() => {
                        const foundTei = filterFacilities.find((e) => e.tei === row.tei);
                        if (foundTei) {
                          selectFacility(foundTei);
                          toggleDialog("facilityProfileDialog");
                        }
                      }}
                    >
                      {columns.map((column, columnIndex) => {
                        return <DataTableCell key={columnIndex}>{row[column.id]}</DataTableCell>;
                      })}
                    </DataTableRow>
                  );
                })}
            </DataTableBody>
          </DataTable>
        </div>
        <div className="h-[50px] w-full bg-white border-t-slate-300 border-t items-center p-2">
          <Pagination
            onPageChange={(page) => {
              onPageChange(page);
            }}
            onPageSizeChange={(pageSize) => {
              onPageSizeChange(pageSize);
            }}
            page={paging.page}
            pageCount={paging.pageCount}
            pageSize={paging.pageSize}
            total={paging.pageTotal}
            disabled={filterFacilities.length > 0 ? false : true}
          />
        </div>
      </div>
    )
  );
};

export default FacilitiesList;
