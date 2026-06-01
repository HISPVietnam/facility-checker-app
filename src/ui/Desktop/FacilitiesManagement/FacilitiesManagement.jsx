import { useEffect } from "react";
import FacilitiesList from "./FacilitiesList";
import FacilitiesMap from "./FacilitiesMap";
import NewFacilityDialog from "./NewFacilityDialog";
import FacilityProfileDialog from "./FacilityProfileDialog";
import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import useMetadataStore from "@/states/metadata";
import { useShallow } from "zustand/react/shallow";
import _ from "lodash";
import {
  isNoCoordinates,
  isWrongLocation,
  isTooCloseToEachOther,
  belongToMultipleGroups,
  isNotInGroup,
  isNotSentForApproval,
  isWaitingForApproval,
  isInGroups,
} from "@/utils";
import useDataStore from "@/states/data";
import { DATA_ELEMENTS } from "@/const";
const { PATH } = DATA_ELEMENTS;
import "./FacilityManagement.css";
import { useTranslation } from "react-i18next";
import ClearNonSpatialFilterButton from "./components/ClearNonSpatialFilterButton";

const FacilitiesManagement = () => {
  const { t } = useTranslation();
  const {
    allFilters,
    filters,
    selectedFacility,
    facilityList,
    selectedOrgUnit,
    hierarchyExpanded,
    view,
    actions,
    newFacilityDialog,
    facilityProfileDialog,
  } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      allFilters: state.allFilters,
      filters: state.filters,
      facilityList: state.facilityList,
      selectedFacility: state.selectedFacility,
      actions: state.actions,
      selectedOrgUnit: state.selectedOrgUnit,
      hierarchyExpanded: state.hierarchyExpanded,
      view: state.view,
      newFacilityDialog: state.newFacilityDialog,
      facilityProfileDialog: state.facilityProfileDialog,
    })),
  );

  const { selectOrgUnit, setAllFilters, setIsReadOnly } = actions;
  const { facilities, dataStoreActions } = useDataStore(
    useShallow((state) => ({
      facilities: state.facilities,
      dataStoreActions: state.actions,
    })),
  );
  const { setFacilities } = dataStoreActions;

  const { me, orgUnits, program, locale } = useMetadataStore(
    useShallow((state) => ({
      me: state.me,
      orgUnits: state.orgUnits,
      program: state.program,
      locale: state.locale,
    })),
  );

  const foundMeOrgUnits = me.organisationUnits.map((ou) => {
    const foundOu = orgUnits.find((orgUnit) => orgUnit.id === ou.id);
    return foundOu;
  });

  useEffect(() => {
    if (!me.authorities.includes("CAPTURE")) {
      setIsReadOnly(true);
    }
  }, []);
  useEffect(() => {
    if (!selectedOrgUnit) {
      selectOrgUnit(foundMeOrgUnits[0]);
      return;
    }

    const filterMap = allFilters
      .flatMap((group) => group.filters)
      .reduce((acc, filter) => {
        acc[filter.id] = filter;
        return acc;
      }, {});

    const transformed = facilities.map((facility) => {
      const path = facility[PATH];

      const isChild =
        typeof path === "string" && path.includes(selectedOrgUnit.id);

      const passedFilter =
        filters.length === 0 ||
        filters.every((filter) => {
          const foundFilter = filterMap[filter.id || filter];

          return !foundFilter ? true : foundFilter.function(facility, filter);
        });

      return {
        ...facility,
        hidden: !isChild || !passedFilter,
      };
    });

    setFacilities(transformed);
  }, [selectedOrgUnit?.id, filters, allFilters, facilities.length]);
  useEffect(() => {
    const filters = [
      {
        type: "spatialFilters",
        filters: [
          {
            id: "noCoordinates",
            label: t("noCoordinates"),
            function: isNoCoordinates,
          },
          {
            id: "wrongLocation",
            label: t("wrongLocation"),
            function: isWrongLocation,
          },
          {
            id: "tooCloseToEachOther",
            label: t("tooCloseToEachOther"),
            function: isTooCloseToEachOther,
          },
        ],
      },
      {
        type: "nonSpatialFilters",
        controlButtons: [<ClearNonSpatialFilterButton key="clear" />],
        filters: [
          ...program.dataElements
            .filter((de) => {
              return de.description && de.description.includes("FCGS");
            })
            .map((de) => {
              return {
                id: de.id,
                label: t("notInGroup", { group: de.formName }),
                tooltip: t("notInGroupTooltip", { group: de.formName }),
                function: (facility, filter) => {
                  if (filter.type === "notInAnyGroup") {
                    return isNotInGroup(facility, de);
                  }
                  if (filter.type === "inMultipleGroups") {
                    return belongToMultipleGroups(facility, de);
                  }
                  return isInGroups(facility, filter.value);
                },
              };
            }),
        ],
      },
      {
        type: "editedFacilities",
        filters: [
          {
            id: "notSentForApproval",
            label: t("notSentForApproval"),
            function: isNotSentForApproval,
          },
          {
            id: "waitingForApproval",
            label: t("waitingForApproval"),
            function: isWaitingForApproval,
          },
        ],
      },
    ];
    setAllFilters(filters);
  }, [locale]);

  return (
    <div className="w-full h-full flex">
      {view === "mapView" && <FacilitiesMap />}
      {view === "listView" && <FacilitiesList />}
      {newFacilityDialog && <NewFacilityDialog />}
      {facilityProfileDialog && <FacilityProfileDialog />}
    </div>
  );
};
export default FacilitiesManagement;
