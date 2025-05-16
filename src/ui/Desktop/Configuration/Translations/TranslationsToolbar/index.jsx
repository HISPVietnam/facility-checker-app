import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import useConfigurationModuleStore from "@/states/configurationModule";

import CustomizedInputField from "@/ui/common/InputField";

import ShowHideLanguages from "./ShowHideLanguages";
import AddNewLanguage from "./AddNewLanguage";

//import css for flag library
import "/node_modules/flag-icons/css/flag-icons.min.css";
import ExportTranslations from "./ExportTranslations";

const TranslationsToolbar = () => {
  const { t } = useTranslation();

  //global store
  const {
    translations: { searchTranslation },
    actions: { setSearchTranslation },
  } = useConfigurationModuleStore(
    useShallow((state) => ({
      translations: state.translations,
      actions: state.actions,
    }))
  );
  //local store

  return (
    <div className="flex items-center justify-between flex-1">
      <div className="flex items-center gap-2">
        <ShowHideLanguages />
        <AddNewLanguage />
        <CustomizedInputField
          className="!h-8"
          placeholder={t("search")}
          prefixIcon={<FontAwesomeIcon icon={faSearch} />}
          value={searchTranslation}
          onChange={(value) => setSearchTranslation(value)}
        />
      </div>
      <ExportTranslations />
    </div>
  );
};

export default TranslationsToolbar;
