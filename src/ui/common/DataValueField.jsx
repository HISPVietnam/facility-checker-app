import useMetadataStore from "@/states/metadata";
import { findDataValue, pickTranslation } from "@/utils";
import { convertDisplayValue } from "@/utils";
import { useShallow } from "zustand/react/shallow";
import CustomizedInputField from "./InputField";

const DataValueField = (props) => {
  const { locale, program, orgUnitGroups, orgUnitGroupSets } = useMetadataStore(
    useShallow((state) => ({
      locale: state.locale,
      program: state.program,
      orgUnitGroups: state.orgUnitGroups,
      orgUnitGroupSets: state.orgUnitGroupSets
    }))
  );
  const { dataElement, onChange, disabled, value } = props;
  const foundDataElement = program.dataElements.find((de) => de.id === dataElement);

  const { valueType, description, optionSet } = foundDataElement;
  if (description && description.includes("FCGS")) {
    const orgUnitGroupSetId = description.replace("FCGS:", "");
    const foundOrgUnitGroupSet = orgUnitGroupSets.find((ougs) => ougs.id === orgUnitGroupSetId);
    const foundOrgUnitGroups = foundOrgUnitGroupSet.items.map((item) => {
      const foundOrgUnitGroup = orgUnitGroups.find((oug) => oug.id === item.id);
      return foundOrgUnitGroup;
    });
    const options = foundOrgUnitGroups.map((oug) => {
      return {
        label: pickTranslation(oug, locale, "name"),
        value: oug.id
      };
    });
    return (
      <CustomizedInputField valueType={valueType} onChange={onChange} disabled={disabled} value={value} options={options} multiSelection={true} />
    );
  } else if (optionSet && optionSet.id) {
    const foundOptionSet = program.optionSets.find((os) => os.id === optionSet.id);
    const options = foundOptionSet.options.map((o) => {
      const foundOption = program.options.find((option) => option.id === o.id);
      return {
        label: pickTranslation(foundOption, locale, "name"),
        value: foundOption.code
      };
    });
    return <CustomizedInputField valueType={valueType} onChange={onChange} disabled={disabled} value={value} options={options} />;
  }
  return <CustomizedInputField valueType={valueType} onChange={onChange} disabled={disabled} value={value} />;
};

export default DataValueField;
