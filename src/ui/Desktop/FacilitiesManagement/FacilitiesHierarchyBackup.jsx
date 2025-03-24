import {
  MenuItem,
  InputField,
  DataTable,
  DataTableHead,
  DataTableRow,
  DataTableCell,
  DataTableBody,
  DataTableColumnHeader,
  Pagination,
  OrganisationUnitTree,
} from "@dhis2/ui";
import useMetadataStore from "@/states/metadata";
import { useShallow } from "zustand/react/shallow";
import { useTranslation } from "react-i18next";
import _ from "lodash";
import { pickTranslation } from "@/utils";
import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import { useEffect, useState } from "react";
import { data } from "react-router";

const FacilityHierarchy = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState("");
  const { selectedOrgUnit, actions } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      actions: state.actions,
      selectedOrgUnit: state.selectedOrgUnit,
    }))
  );
  const { selectOrgUnit } = actions;
  const { orgUnits, me } = useMetadataStore(
    useShallow((state) => ({
      orgUnits: state.orgUnits,
      me: state.me,
    }))
  );

  const foundMeOrgUnits = me.organisationUnits.map((ou) => {
    const foundOu = orgUnits.find((orgUnit) => orgUnit.id === ou.id);
    return foundOu;
  });

  return (
    <div className="h-full w-full">
      <div className="h-[50px]">
        <InputField
          valueType="TEXT"
          placeholder={t("searchFacility")}
          value={filter}
          onChange={(e) => {
            setFilter(e.value);
          }}
        />
      </div>
      <div className="w-full h-[calc(100%-50px)] overflow-auto">
        <OrganisationUnitTree
          initiallyExpanded={
            selectedOrgUnit ? [selectedOrgUnit.path] : undefined
          }
          onChange={(orgUnit) => {
            const foundOrgUnit = orgUnits.find((ou) => ou.id === orgUnit.id);
            selectOrgUnit(foundOrgUnit);
          }}
          selected={selectedOrgUnit ? [selectedOrgUnit.path] : undefined}
          roots={foundMeOrgUnits.map((ou) => ou.id)}
        />
      </div>
    </div>
  );
};

export default FacilityHierarchy;
