import { useRef, useState } from "react";
import { Checkbox } from "@dhis2/ui";
import { Popover } from "@mui/material";
import { faFilter, faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { SYNCHRONIZATION_FILTERS } from "@/const";
import CustomizedButton from "@/ui/common/Button";
import FacilityHierarchy from "@/ui/common/FacilitiesHierarchy";
import FilterSection from "@/ui/common/FilterSection";
import FilterSubSection from "@/ui/common/FilterSubSection";
import useSynchronizationModuleStore from "@/states/synchronizationModule";
import UserInfo from "@/ui/common/UserInfo";

const SynchronizationToolbar = () => {
  const { t } = useTranslation();
  //button ref
  const filterButtonRef = useRef();
  //store
  const { selectedOrgUnit, currentFilters, actions, selectedFacilities } = useSynchronizationModuleStore(
    useShallow((state) => ({
      selectedOrgUnit: state.selectedOrgUnit,
      currentFilters: state.filters,
      actions: state.actions,
      selectedFacilities: state.selectedFacilities
    }))
  );
  const { selectOrgUnit, toggleFilter } = actions;
  //local state
  const [filtersPopover, setFiltersPopover] = useState(false);

  return (
    <div className="flex items-center justify-center gap-2 w-full">
      {/* <div ref={filterButtonRef}>
        <CustomizedButton
          icon={<FontAwesomeIcon icon={faFilter} />}
          onClick={() => {
            setFiltersPopover(true);
          }}
        >
          {t("filters")}
        </CustomizedButton>
      </div> */}
      <CustomizedButton primary icon={<FontAwesomeIcon icon={faRotate} />} onClick={() => {}} disabled={selectedFacilities.length === 0}>
        {t("sync")}
      </CustomizedButton>
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
              <FacilityHierarchy selectedOrgUnit={selectedOrgUnit} selectOrgUnit={selectOrgUnit} />
            </FilterSection>
            <FilterSection title={t("filterForFacility")}>
              <FilterSubSection title={t("filterForFacility")}>
                {SYNCHRONIZATION_FILTERS.map((f) => {
                  const { id } = f;
                  return (
                    <Checkbox
                      checked={currentFilters.includes(id)}
                      label={t(id)}
                      value={id}
                      onChange={() => {
                        if (currentFilters.length === 1 && currentFilters[0] === id) return;
                        toggleFilter(id);
                      }}
                    />
                  );
                })}
              </FilterSubSection>
            </FilterSection>
          </div>
        </Popover>
      )}
      <div className="ml-auto">
        <UserInfo />
      </div>
    </div>
  );
};
export default SynchronizationToolbar;
