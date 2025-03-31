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
import { useEffect, useState, useMemo } from "react";
import { data } from "react-router";

const FacilityHierarchy = () => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [filterOU, setFiterOU] = useState([]);
  const [key, setKey] = useState("");
  const [orgUnitData, setOrgUnitData] = useState(null);
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
  const orgUnitInternalState = JSON.parse(JSON.stringify(orgUnits));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (orgUnitInternalState && searchValue) {
        setFiterOU(
          orgUnitInternalState
            .filter(({ name }) =>
              name.toLowerCase().includes(searchValue.toLocaleLowerCase())
            )
            .map(({ path }) => path)
        );
      }
      if (!searchValue) {
        setFiterOU([]);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [searchValue]);

  const cutString = (str, start) =>
    str.includes(start) ? str.substring(str.indexOf(start)) : "";

  const foundMeOrgUnits = me.organisationUnits.map((ou) => {
    const foundOu = orgUnitInternalState.find(
      (orgUnit) => orgUnit.id === ou.id
    );
    return foundOu;
  });

  useEffect(() => {
    orgUnitInternalState.forEach((value) => {
      const foundRoot = foundMeOrgUnits.find((root) =>
        value.path.includes(root.id)
      );
      if (foundRoot) {
        value.path = cutString(value.path, `/${foundRoot.id}`);
      }
    });
    setOrgUnitData(orgUnitInternalState);
    if (filterOU.length > 0) {
      const newKey = filterOU.join("") + new Date().getTime();
      if (key !== newKey) {
        setKey(newKey);
      }
    } else if (key !== "default") {
      setKey("default");
    }
  }, [filterOU]);

  const returnFilterWithOuRoots = () => {
    if (orgUnitData && filterOU.length > 0) {
      let newFilter = [];
      filterOU.forEach((f) => {
        const foundRoot = foundMeOrgUnits.find((root) => f.includes(root.id));
        if (foundRoot) {
          f = cutString(f, `/${foundRoot.id}`);
          newFilter.push(f);
        }
      });
      return newFilter;
    } else return [];
  };

  return (
    <div className="h-full w-full">
      <div className="h-[50px]">
        <InputField
          valueType="TEXT"
          placeholder={t("searchFacility")}
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.value);
          }}
        />
      </div>
      <div className="w-full h-[calc(100%-50px)] overflow-auto">
        <OrganisationUnitTree
          initiallyExpanded={
            filterOU && filterOU.length > 0
              ? returnFilterWithOuRoots()
              : selectedOrgUnit
              ? [selectedOrgUnit.path]
              : undefined
          }
          highlighted={
            filterOU && filterOU.length > 0 ? returnFilterWithOuRoots() : []
          }
          filter={returnFilterWithOuRoots()}
          key={key}
          onChange={(orgUnit) => {
            const foundOrgUnit = orgUnitInternalState.find(
              (ou) => ou.id === orgUnit.id
            );
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
