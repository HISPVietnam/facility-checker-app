import { useEffect } from "react";
import { ButtonStrip, CheckboxField, SingleSelectField, SingleSelectOption, TabBar, Tab, Chip, Checkbox, elevations, Tooltip } from "@dhis2/ui";
import { Popover } from "@mui/material";
import CustomizedButton from "@/ui/common/Button";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSitemap, faFilter, faList, faMap, faPlus } from "@fortawesome/free-solid-svg-icons";
import { useRef, useState } from "react";
import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import useMetadataStore from "@/states/metadata";
import { useShallow } from "zustand/react/shallow";
import FacilityHierarchy from "./FacilitiesHierarchy";
import NewFacilityDialog from "./NewFacilityDialog";
import useDataStore from "@/states/data";

const FilterSection = ({ children }) => {
  return (
    <div className={`ml-1 mr-1 p-1 rounded-md border border-slate-300 w-[300px] h-[450px]`}>
      <div className="h-[calc(100%-30px)] overflow-auto">{children}</div>
    </div>
  );
};
const FilterSubSection = ({ title, children }) => {
  return (
    <div className="mb-1">
      <div className="h-[30px] font-bold">{title}</div>
      <div className="h-[calc(100%-30px)] overflow-auto">{children}</div>
    </div>
  );
};

const FacilitiesManagementToolbar = () => {
  const { t } = useTranslation();
  const dataActions = useDataStore((state) => state.actions);
  const { initNewFacility } = dataActions;
  const { selectedFacility, view, allFilters, currentFilters, editing, actions } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      selectedFacility: state.selectedFacility,
      allFilters: state.allFilters,
      currentFilters: state.filters,
      actions: state.actions,
      view: state.view,
      editing: state.editing
    }))
  );
  const { selectOrgUnit, setView, toggleFilter, toggleDialog } = actions;

  const { me, orgUnits, program } = useMetadataStore(
    useShallow((state) => ({
      me: state.me,
      orgUnits: state.orgUnits,
      program: state.program
    }))
  );
  const [filtersPopover, setFiltersPopover] = useState(false);
  const filterButtonRef = useRef();
  const foundMeOrgUnits = me.organisationUnits.map((ou) => {
    const foundOu = orgUnits.find((orgUnit) => orgUnit.id === ou.id);
    return foundOu;
  });

  useEffect(() => {
    selectOrgUnit(foundMeOrgUnits[0]);
  }, []);

  return (
    <div className="flex items-center justify-center">
      <div ref={filterButtonRef}>
        <CustomizedButton
          disabled={editing}
          icon={<FontAwesomeIcon icon={faFilter} />}
          onClick={(e) => {
            setFiltersPopover(true);
          }}
        >
          {t("filters")}
        </CustomizedButton>
      </div>
      &nbsp;
      <div>
        <CustomizedButton
          primary
          disabled={editing}
          icon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => {
            initNewFacility();
            toggleDialog("newFacilityDialog");
          }}
        >
          {t("newFacility")}
        </CustomizedButton>
      </div>
      <div>
        <Chip
          selected={view === "mapView"}
          onClick={() => {
            setView("mapView");
          }}
        >
          {t("mapView")}
        </Chip>
        <Chip
          selected={view === "listView"}
          onClick={() => {
            setView("listView");
          }}
        >
          {t("listView")}
        </Chip>
      </div>
      {/* <div ref={mapControlRef}>
          <CustomizedButton
            onClick={() => {
              setMapControlPopover(true);
            }}
            icon={<FontAwesomeIcon icon={faMap} />}
          >
            {t("mapControl")}
          </CustomizedButton>
        </div> */}
      {filtersPopover && (
        <Popover
          open={filtersPopover}
          anchorEl={filterButtonRef.current}
          onClose={() => {
            setFiltersPopover(false);
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left"
          }}
        >
          <div className="flex p-2">
            <FilterSection title={t("hierarchy")}>
              <FacilityHierarchy />
            </FilterSection>
            <FilterSection title={t("filterForFacility")}>
              {allFilters.map((filter) => {
                const { type, filters } = filter;
                return (
                  <FilterSubSection title={t(type)}>
                    {filters.map((f) => {
                      const { id, label, tooltip } = f;
                      return (
                        <Tooltip content={tooltip ? tooltip : t(id + "Tooltip")} placement="left">
                          <div>
                            <Checkbox
                              checked={currentFilters.includes(id)}
                              label={label}
                              value={id}
                              onChange={() => {
                                toggleFilter(id);
                              }}
                            />
                          </div>
                        </Tooltip>
                      );
                    })}
                  </FilterSubSection>
                );
              })}
              {/* {filters.map((filter) => {
                return (
                  <Tooltip content={t(filter + "Tooltip")} placement="left">
                    <div>
                      <Checkbox
                        checked={defaultFilters.includes(filter)}
                        label={t(filter)}
                        value={filter}
                        onChange={() => {
                          toggleFilter(filter);
                        }}
                      />
                    </div>
                  </Tooltip>
                );
              })}
              {program.dataElements
                .filter((de) => {
                  return de.description && de.description.includes("FCGS");
                })
                .map((de) => {
                  const groupSet = de.description.split(":")[1];
                  const filter = de.id;
                  return (
                    <Tooltip content={t("notInGroupTooltip", { group: de.formName })} placement="left">
                      <div>
                        <Checkbox
                          checked={defaultFilters.includes(filter)}
                          label={t("notInGroup", { group: de.formName })}
                          value={filter}
                          onChange={() => {
                            toggleFilter(filter);
                          }}
                        />
                      </div>
                    </Tooltip>
                  );
                })} */}
            </FilterSection>
          </div>
        </Popover>
      )}
    </div>
  );
};

export default FacilitiesManagementToolbar;
