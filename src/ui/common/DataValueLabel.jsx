import useMetadataStore from "@/states/metadata";
import { pickTranslation } from "@/utils";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
const { VITE_MODE } = import.meta.env;

const DataValueLabel = ({ dataElement, mandatory }) => {
  const { t } = useTranslation();
  const { program, locale } = useMetadataStore(
    useShallow((state) => ({
      program: state.program,
      locale: state.locale
    }))
  );
  const dataElements = program.dataElements;
  const foundDataElement = dataElements.find((de) => de.id === dataElement);
  return foundDataElement ? (
    <span>
      {pickTranslation(foundDataElement, locale, "formName")}
      {mandatory && <span className="text-red-500"> &#42;</span>}
      {/* {VITE_MODE === "development" && (
        <div>
          <strong>{dataElement}</strong>
        </div>
      )} */}
    </span>
  ) : (
    <span>{t(dataElement)}</span>
  );
};

export default DataValueLabel;
