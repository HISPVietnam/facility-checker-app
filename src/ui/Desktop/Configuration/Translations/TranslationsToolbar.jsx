import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { Checkbox } from "@dhis2/ui";
import { faPlus, faSearch, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Popover } from "@mui/material";

import { NATIVE_LANGUAGES } from "@/const";
import { removeVietnameseTones } from "@/utils";

import useMetadataStore from "@/states/metadata";
import useConfigurationModuleStore from "@/states/configurationModule";

import CustomizedButton from "@/ui/common/Button";
import CustomizedInputField from "@/ui/common/InputField";
//import css for flag library
import "/node_modules/flag-icons/css/flag-icons.min.css";

const TranslationsToolbar = () => {
  const { t } = useTranslation();
  const showHideLanguagesButtonRef = useRef();
  //global store
  const { dataStore } = useMetadataStore(
    useShallow((state) => ({
      dataStore: state.dataStore,
    }))
  );
  const {
    translations: { selectedLanguages, searchKey },
    actions: { toggleSelectedLanguages, setSearchKey },
  } = useConfigurationModuleStore(
    useShallow((state) => ({
      translations: state.translations,
      actions: state.actions,
    }))
  );
  const { locales } = dataStore;
  //local store
  const [showHideLanguagesPopover, setShowHideLanguagesPopover] =
    useState(false);
  const [searchLanguage, setSearchLanguage] = useState("");

  return (
    <div className="flex items-center gap-2 w-full">
      <CustomizedButton
        className="!h-10"
        ref={showHideLanguagesButtonRef}
        icon={<FontAwesomeIcon icon={faSliders} />}
        onClick={() => setShowHideLanguagesPopover(true)}
      >
        {t("showHideLanguages")}
      </CustomizedButton>
      <CustomizedButton
        primary
        className="!h-10"
        ref={showHideLanguagesButtonRef}
        icon={<FontAwesomeIcon icon={faPlus} />}
        onClick={() => {}}
      >
        {t("addNewLanguage")}
      </CustomizedButton>
      <CustomizedInputField
        className="!h-8"
        placeholder={t("searchKey")}
        prefixIcon={<FontAwesomeIcon icon={faSearch} />}
        value={searchKey}
        onChange={(value) => setSearchKey(value)}
      />
      {showHideLanguagesPopover && (
        <Popover
          open={showHideLanguagesPopover}
          anchorEl={showHideLanguagesButtonRef.current}
          onClose={() => {
            setShowHideLanguagesPopover(false);
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <div className="flex p-2 flex-col gap-2">
            <CustomizedInputField
              placeholder={t("searchLanguage")}
              prefixIcon={<FontAwesomeIcon icon={faSearch} />}
              value={searchLanguage}
              onChange={(value) => setSearchLanguage(value)}
            />
            <div className="max-h-40 overflow-auto">
              {Object.keys(locales)
                .sort()
                .filter((key) =>
                  removeVietnameseTones(NATIVE_LANGUAGES[key].name)
                    .toLowerCase()
                    .includes(
                      removeVietnameseTones(searchLanguage.toLowerCase())
                    )
                )
                .map((key) => {
                  return (
                    <Checkbox
                      value={key}
                      disabled={key === "en"}
                      checked={selectedLanguages.includes(key)}
                      onChange={() => {
                        toggleSelectedLanguages(key);
                      }}
                      label={
                        <div className="flex items-center gap-1">
                          <span
                            className={`fi fi-${NATIVE_LANGUAGES[key].flag}`}
                          />
                          <span>{NATIVE_LANGUAGES[key].name}</span>
                        </div>
                      }
                    />
                  );
                })}
            </div>
          </div>
        </Popover>
      )}
    </div>
  );
};

export default TranslationsToolbar;
