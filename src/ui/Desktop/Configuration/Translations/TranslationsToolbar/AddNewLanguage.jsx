import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { MenuItem } from "@dhis2/ui";
import { Popover } from "@mui/material";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { saveDataStore } from "@/api/metadata";
import { NATIVE_LANGUAGES } from "@/const";

import useConfigurationModuleStore from "@/states/configurationModule";
import useMetadataStore from "@/states/metadata";

import CustomizedButton from "@/ui/common/Button";
import CustomizedInputField from "@/ui/common/InputField";
import { cloneAndClearValues, removeVietnameseTones } from "@/utils";

const AddNewLanguage = () => {
  const { t } = useTranslation();
  const addNewLanguageButtonRef = useRef();

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
    actions: { selectLanguage },
  } = useConfigurationModuleStore(
    useShallow((state) => ({
      actions: state.actions,
    }))
  );
  const { locales } = dataStore;

  const [addNewLanguagePopover, setAddNewLanguagePopover] = useState(false);
  const [
    searchLanguageForAddNewLanguagePopover,
    setSearchLanguageForAddNewLanguagePopover,
  ] = useState("");

  const handleAddNewLanguage = async (lang) => {
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
  return (
    <>
      <CustomizedButton
        primary
        className="!h-10"
        ref={addNewLanguageButtonRef}
        icon={<FontAwesomeIcon icon={faPlus} />}
        onClick={() => setAddNewLanguagePopover(true)}
      >
        {t("addNewLanguage")}
      </CustomizedButton>
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
                      onClick={() => handleAddNewLanguage(key)}
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
    </>
  );
};

export default AddNewLanguage;
