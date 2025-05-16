import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { Checkbox } from "@dhis2/ui";
import { Popover } from "@mui/material";
import { faSearch, faSliders } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { NATIVE_LANGUAGES } from "@/const";

import useConfigurationModuleStore from "@/states/configurationModule";
import useMetadataStore from "@/states/metadata";

import CustomizedButton from "@/ui/common/Button";
import CustomizedInputField from "@/ui/common/InputField";
import { removeVietnameseTones } from "@/utils";

const ShowHideLanguages = () => {
  const { t } = useTranslation();
  const showHideLanguagesButtonRef = useRef();

  const { dataStore } = useMetadataStore(
    useShallow((state) => ({
      dataStore: state.dataStore,
    }))
  );
  const { locales } = dataStore;

  const {
    translations: { selectedLanguages },
    actions: { toggleSelectedLanguages },
  } = useConfigurationModuleStore(
    useShallow((state) => ({
      translations: state.translations,
      actions: state.actions,
    }))
  );

  const [showHideLanguagesPopover, setShowHideLanguagesPopover] =
    useState(false);
  const [searchLanguage, setSearchLanguage] = useState("");

  return (
    <>
      <CustomizedButton
        className="!h-10"
        ref={showHideLanguagesButtonRef}
        icon={<FontAwesomeIcon icon={faSliders} />}
        onClick={() => setShowHideLanguagesPopover(true)}
      >
        {t("showHideLanguages")}
      </CustomizedButton>
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
    </>
  );
};

export default ShowHideLanguages;
