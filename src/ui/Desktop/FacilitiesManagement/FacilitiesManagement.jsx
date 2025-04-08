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
  isWaitingForApproval
} from "@/utils";
import useDataStore from "@/states/data";
import { DATA_ELEMENTS } from "@/const";
const { PATH } = DATA_ELEMENTS;
import "./FacilityManagement.css";
import { useTranslation } from "react-i18next";

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
    facilityProfileDialog
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
      facilityProfileDialog: state.facilityProfileDialog
    }))
  );
  const { selectOrgUnit, setAllFilters } = actions;
  const { facilities, dataStoreActions } = useDataStore(
    useShallow((state) => ({
      facilities: state.facilities,
      dataStoreActions: state.actions
    }))
  );
  const { setFacilities } = dataStoreActions;

  const { me, orgUnits, program } = useMetadataStore(
    useShallow((state) => ({
      me: state.me,
      orgUnits: state.orgUnits,
      program: state.program
    }))
  );

  const foundMeOrgUnits = me.organisationUnits.map((ou) => {
    const foundOu = orgUnits.find((orgUnit) => orgUnit.id === ou.id);
    return foundOu;
  });

  useEffect(() => {
    if (selectedOrgUnit) {
      const transformed = facilities.map((facility) => {
        const newFacility = _.cloneDeep(facility);
        const path = newFacility[PATH];
        let isChild;
        let passedFilter = false;
        if (path) {
          if (path.includes(selectedOrgUnit.id)) {
            isChild = true;
          } else {
            isChild = false;
          }
        } else {
          isChild = false;
        }
        if (filters.length > 0) {
          filters.forEach((filter) => {
            let passed = false;
            let foundFilter = null;
            allFilters.forEach((f) => {
              const found = f.filters.find((element) => element.id === filter);
              if (found) {
                foundFilter = found;
              }
            });
            if (!foundFilter) {
              passed = true;
            } else {
              passed = foundFilter.function(facility);
            }
            if (passed) {
              passedFilter = true;
            }
          });
        } else {
          passedFilter = true;
        }
        newFacility.hidden = !isChild || !passedFilter;
        return newFacility;
      });
      setFacilities(transformed);
    } else {
      selectOrgUnit(foundMeOrgUnits[0]);
    }
  }, [selectedOrgUnit ? selectedOrgUnit.id : "", filters.length, facilities.length]);

  useEffect(() => {
    const filters = [
      {
        type: "spatialFilters",
        filters: [
          { id: "noCoordinates", label: t("noCoordinates"), function: isNoCoordinates },
          { id: "wrongLocation", label: t("wrongLocation"), function: isWrongLocation },
          { id: "tooCloseToEachOther", label: t("tooCloseToEachOther"), function: isTooCloseToEachOther }
        ]
      },
      {
        type: "nonSpatialFilters",
        filters: [
          { id: "multipleGroups", label: t("multipleGroups"), function: belongToMultipleGroups },
          ...program.dataElements
            .filter((de) => {
              return de.description && de.description.includes("FCGS");
            })
            .map((de) => {
              return {
                id: de.id,
                label: t("notInGroup", { group: de.formName }),
                tooltip: t("notInGroupTooltip", { group: de.formName }),
                function: (facility) => {
                  return isNotInGroup(facility, de);
                }
              };
            }),
          { id: "notSentForApproval", label: t("notSentForApproval"), function: isNotSentForApproval },
          { id: "waitingForApproval", label: t("waitingForApproval"), function: isWaitingForApproval }
        ]
      }
    ];
    setAllFilters(filters);
  }, []);

  // useEffect(() => {
  //   if (selectedOrgUnit) {
  //     const columns = ["id"];
  //     const sortedOrgUnitLevels = _.sortBy(orgUnitLevels, "level").reverse();
  //     sortedOrgUnitLevels.forEach((oul) => {
  //       columns.push(pickTranslation(oul, "en", "name"));
  //     });
  //     columns.push(...["latitude", "longitude"]);
  //     const transformedFacilities = facilities.map((ou) => {
  //       const row = { id: ou.id, ancestors: ou.ancestors };
  //       sortedOrgUnitLevels.forEach((level, levelIndex) => {
  //         let foundOrgUnit = null;
  //         if (ou.level === level.level) {
  //           foundOrgUnit = ou;
  //           row.name = pickTranslation(ou, "en", "name");
  //         } else {
  //           const foundAncestor = ou.ancestors.find((a) => a.level === level.level);
  //           if (foundAncestor) {
  //             foundOrgUnit = orgUnits.find((orgUnit) => orgUnit.id === foundAncestor.id);
  //           }
  //         }
  //         row[columns[levelIndex + 1]] = foundOrgUnit ? pickTranslation(foundOrgUnit, "en", "name") : "";
  //       });
  //       if (ou.geometry) {
  //         row.latitude = ou.geometry.coordinates[1];
  //         row.longitude = ou.geometry.coordinates[0];
  //       }
  //       return row;
  //     });
  //     let filteredFacilities = transformedFacilities.filter((ou) => {
  //       const foundAncestor = ou.ancestors.find((a) => a.id === selectedOrgUnit.id);
  //       return foundAncestor;
  //     });

  //     const foundFacility = transformedFacilities.find((f) => f.id === selectedOrgUnit.id);
  //     let finalList;
  //     if (foundFacility) {
  //       finalList = [foundFacility];
  //       selectFacility(foundFacility);
  //     } else {
  //       selectFacility(null);
  //       finalList = filteredFacilities;
  //     }
  //     setFacilityList({
  //       ready: true,
  //       columns,
  //       rows: finalList
  //     });
  //   } else {
  //     selectOrgUnit(foundMeOrgUnits[0]);
  //   }
  // }, [selectedOrgUnit ? selectedOrgUnit.id : ""]);

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
