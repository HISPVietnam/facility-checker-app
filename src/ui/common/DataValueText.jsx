import useMetadataStore from "@/states/metadata";
import { convertDisplayValueForPath, pickTranslation } from "@/utils";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { DATA_ELEMENTS } from "@/const";
import _ from "lodash";
const { PATH } = DATA_ELEMENTS;
const DataValueText = (props) => {
  const { t } = useTranslation();
  const { locale, program, orgUnitGroups, orgUnitGroupSets, orgUnits } = useMetadataStore(
    useShallow((state) => ({
      locale: state.locale,
      program: state.program,
      orgUnitGroups: state.orgUnitGroups,
      orgUnitGroupSets: state.orgUnitGroupSets,
      orgUnits: state.orgUnits
    }))
  );
  const { dataElement, value } = props;
  const foundDataElement = program.dataElements.find((de) => de.id === dataElement);
  if (!foundDataElement) {
    return value;
  }
  const { description } = foundDataElement;
  if (description && description.includes("FCGS")) {
    if (value) {
      const orgUnitGroupSetId = description.replace("FCGS:", "");
      const foundOrgUnitGroupSet = orgUnitGroupSets.find((ougs) => ougs.id === orgUnitGroupSetId);
      const foundOrgUnitGroups = foundOrgUnitGroupSet.items.map((item) => {
        const foundOrgUnitGroup = orgUnitGroups.find((oug) => oug.id === item.id);
        return foundOrgUnitGroup;
      });
      const mapping = {};
      foundOrgUnitGroups.forEach((oug) => {
        mapping[oug.id] = pickTranslation(oug, locale, "name");
      });
      const groups = JSON.parse(value);
      return groups
        .map((group) => {
          return mapping[group];
        })
        .join(", ");
    } else {
      return "";
    }
  } else if (foundDataElement.optionSet) {
    const foundOptions = program.options.filter((o) => o.optionSet.id === foundDataElement.optionSet.id);
    const foundOption = foundOptions.find((o) => o.code === value);
    return foundOption ? pickTranslation(foundOption, locale, "name") : "";
  } else if (foundDataElement.id === PATH) {
    return convertDisplayValueForPath(value, "");
    // const currentOrgUnits = _.compact(value.split("/"));
    // // currentOrgUnits.pop();
    // const foundOrgUnits = currentOrgUnits.map((ou) => {
    //   const foundOrgUnit = orgUnits.find((o) => o.id === ou);
    //   return pickTranslation(foundOrgUnit, locale, "name");
    // });
    // return foundOrgUnits.join(" / ");
  } else if (foundDataElement.valueType === "TRUE_ONLY") {
    return value === "true" ? t("yes") : t("no");
  }
  return value;
};

export default DataValueText;
