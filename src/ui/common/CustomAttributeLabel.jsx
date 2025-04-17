import useMetadataStore from "@/states/metadata";
import { pickTranslation } from "@/utils";
import { useShallow } from "zustand/react/shallow";
import { useTranslation } from "react-i18next";

const CustomAttributeLabel = (props) => {
  const { t } = useTranslation();
  const { locale, customAttributes } = useMetadataStore(
    useShallow((state) => ({
      locale: state.locale,
      customAttributes: state.customAttributes
    }))
  );
  const { attribute } = props;
  const foundAttribute = customAttributes.find((ca) => ca.id === attribute);
  const { mandatory } = foundAttribute;
  return foundAttribute ? (
    <span>
      {pickTranslation(foundAttribute, locale, "name")}
      {mandatory && <span className="text-red-500"> &#42;</span>}
    </span>
  ) : (
    <span>{t(attribute)}</span>
  );
};

export default CustomAttributeLabel;
