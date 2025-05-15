import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { Checkbox, MenuItem } from "@dhis2/ui";
import {
  faFileExport,
  faPlus,
  faSearch,
  faSliders,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Popover } from "@mui/material";

import { NATIVE_LANGUAGES } from "@/const";
import { cloneAndClearValues, removeVietnameseTones } from "@/utils";

import useMetadataStore from "@/states/metadata";
import useConfigurationModuleStore from "@/states/configurationModule";

import CustomizedButton from "@/ui/common/Button";
import CustomizedInputField from "@/ui/common/InputField";

import { saveDataStore } from "@/api/metadata";

//import css for flag library
import "/node_modules/flag-icons/css/flag-icons.min.css";
import { format } from "date-fns";

const TranslationsToolbar = () => {
  const { t } = useTranslation();
  const showHideLanguagesButtonRef = useRef();
  const addNewLanguageButtonRef = useRef();

  //global store
  const {
    dataStore,
    actions: { setMetadata },
  } = useMetadataStore(
    useShallow((state) => ({
      dataStore: state.dataStore,
      actions: state.actions,
    }))
  );
  const {
    translations: { selectedLanguages, searchTranslation },
    actions: { toggleSelectedLanguages, setSearchTranslation, selectLanguage },
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
  const [addNewLanguagePopover, setAddNewLanguagePopover] = useState(false);
  const [searchLanguage, setSearchLanguage] = useState("");
  const [
    searchLanguageForAddNewLanguagePopover,
    setSearchLanguageForAddNewLanguagePopover,
  ] = useState("");

  const addNewLanguageHandle = async (lang) => {
    try {
      const newLocales = {
        ...locales,
        [lang]: cloneAndClearValues(locales["en"]),
      };
      const result = await saveDataStore("locales", newLocales, "UPDATED");
      if (result.ok) {
        setMetadata("dataStore", {
          ...dataStore,
          locales: newLocales,
        });
        selectLanguage(lang);
        // will show toast success message
      } else {
        // will show toast error message
        console.log("Error saving data store", result.error);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setAddNewLanguagePopover(false);
    }
  };

  const exportTranslationByJson = () => {
    const fileName = `fca-locales-${format(new Date(), "yyyyMMdd")}.json`;
    const json = JSON.stringify(locales, null, 2); // Pretty print with 2 spaces
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = href;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href); // Free up memory
  };

  return (
    <div className="flex items-center justify-between flex-1">
      <div className="flex items-center gap-2">
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
          ref={addNewLanguageButtonRef}
          icon={<FontAwesomeIcon icon={faPlus} />}
          onClick={() => setAddNewLanguagePopover(true)}
        >
          {t("addNewLanguage")}
        </CustomizedButton>
        <CustomizedInputField
          className="!h-8"
          placeholder={t("search")}
          prefixIcon={<FontAwesomeIcon icon={faSearch} />}
          value={searchTranslation}
          onChange={(value) => setSearchTranslation(value)}
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
        {addNewLanguagePopover && (
          <Popover
            open={addNewLanguagePopover}
            anchorEl={addNewLanguageButtonRef.current}
            onClose={() => {
              setAddNewLanguagePopover(false);
            }}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <div className="flex p-2 flex-col gap-2 w-[300px]">
              <CustomizedInputField
                placeholder={t("searchLanguage")}
                prefixIcon={<FontAwesomeIcon icon={faSearch} />}
                value={searchLanguageForAddNewLanguagePopover}
                onChange={(value) =>
                  setSearchLanguageForAddNewLanguagePopover(value)
                }
              />
              <div className="overflow-auto h-[300px]">
                {Object.keys(NATIVE_LANGUAGES)
                  .sort()
                  .filter((key) => !locales[key])
                  .filter((key) =>
                    removeVietnameseTones(NATIVE_LANGUAGES[key].name)
                      .toLowerCase()
                      .includes(
                        removeVietnameseTones(
                          searchLanguageForAddNewLanguagePopover.toLowerCase()
                        )
                      )
                  )
                  .map((key) => {
                    return (
                      <MenuItem
                        onClick={() => addNewLanguageHandle(key)}
                        className="cursor-pointer"
                        key={key}
                        dense
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
      <CustomizedButton
        primary
        icon={<FontAwesomeIcon icon={faFileExport} />}
        onClick={exportTranslationByJson}
      >
        {t("export")}
      </CustomizedButton>
    </div>
  );
};

export default TranslationsToolbar;
