import { useRef, useState } from "react";
import { Checkbox } from "@dhis2/ui";
import { Popover } from "@mui/material";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { APPROVAL_FILTERS } from "@/const";
import CustomizedButton from "@/ui/common/Button";
import FacilityHierarchy from "@/ui/common/FacilitiesHierarchy";
import FilterSection from "@/ui/common/FilterSection";
import FilterSubSection from "@/ui/common/FilterSubSection";

import useApprovalModuleStore from "@/states/approvalModule";
import UserInfo from "@/ui/common/UserInfo";

const ApprovalToolbar = () => {
  const { t } = useTranslation();
  //button ref
  const filterButtonRef = useRef();
  //store
  const { selectedOrgUnit, currentFilters, actions } = useApprovalModuleStore(
    useShallow((state) => ({
      selectedOrgUnit: state.selectedOrgUnit,
      currentFilters: state.filters,
      actions: state.actions
    }))
  );
  const { selectOrgUnit, toggleFilter } = actions;
  //local state
  const [filtersPopover, setFiltersPopover] = useState(false);

  return (
    <div className="flex items-center justify-center w-full">
      <div ref={filterButtonRef}>
        <CustomizedButton
          icon={<FontAwesomeIcon icon={faFilter} />}
          onClick={() => {
            setFiltersPopover(true);
          }}
        >
          {t("filters")}
        </CustomizedButton>
      </div>
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
                {APPROVAL_FILTERS.map((f) => {
                  const { id } = f;
                  return (
                    <Checkbox
                      checked={currentFilters.includes(id)}
                      label={t(id)}
                      value={id}
                      onChange={() => {
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
export default ApprovalToolbar;
