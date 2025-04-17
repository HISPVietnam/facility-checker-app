import useMetadataStore from "@/states/metadata";
import { findDataValue, pickTranslation } from "@/utils";
import { convertDisplayValue } from "@/utils";
import { useShallow } from "zustand/react/shallow";
import CustomizedInputField from "./InputField";

const CustomAttributeField = (props) => {
  const { locale, program, orgUnitGroups, orgUnitGroupSets, customAttributes } = useMetadataStore(
    useShallow((state) => ({
      locale: state.locale,
      program: state.program,
      orgUnitGroups: state.orgUnitGroups,
      orgUnitGroupSets: state.orgUnitGroupSets,
      customAttributes: state.customAttributes
    }))
  );
  const { attribute, onChange, disabled, value } = props;
  const foundAttribute = customAttributes.find((ca) => ca.id === attribute);
  const { valueType } = foundAttribute;
  return <CustomizedInputField valueType={valueType} onChange={onChange} disabled={disabled} value={value} />;
};

export default CustomAttributeField;
