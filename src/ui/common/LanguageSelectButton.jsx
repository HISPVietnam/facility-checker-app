import { useRef, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";
import { Popover } from "@mui/material";

import { useShallow } from "zustand/react/shallow";
import { useTranslation } from "react-i18next";

import { NATIVE_LANGUAGES } from "@/const";
import CustomizedButton from "@/ui/common/Button";
import useMetadataStore from "@/states/metadata";
import resources from "@/locales";

import "/node_modules/flag-icons/css/flag-icons.min.css";

const LanguageSelectButton = () => {
  const { t, i18n } = useTranslation();

  const localeButtonRef = useRef();

  const {
    locale,
    dataStore,
    actions: { setMetadata },
  } = useMetadataStore(
    useShallow((state) => ({
      locale: state.locale,
      actions: state.actions,
      dataStore: state.dataStore,
    }))
  );

  const [localePopover, setLocalePopover] = useState(false);

  const handleSelectLocale = (selectedLocale) => {
    setMetadata("locale", selectedLocale);
    i18n.changeLanguage(selectedLocale);
    setLocalePopover(false);
  };

  return (
    <>
      <div ref={localeButtonRef} className="inline-block">
        <CustomizedButton
          onClick={() => {
            setLocalePopover(true);
          }}
          icon={<FontAwesomeIcon icon={faGlobe} />}
        >
          {t(NATIVE_LANGUAGES[locale].name)}
        </CustomizedButton>
      </div>
      {localePopover && (
        <Popover
          open={localePopover}
          anchorEl={localeButtonRef.current}
          onClose={() => {
            setLocalePopover(false);
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
        >
          <div className="flex flex-col p-2">
            {Object.keys(dataStore?.locales || resources).map((key) => {
              return (
                <div
                  key={key}
                  onClick={() => handleSelectLocale(key)}
                  className="flex items-center gap-2 w-full p-2 hover:bg-slate-200 cursor-pointer ease-in duration-200"
                >
                  <span className={`fi fi-${NATIVE_LANGUAGES[key].flag}`} />
                  <span>{t(NATIVE_LANGUAGES[key].name)}</span>
                </div>
              );
            })}
          </div>
        </Popover>
      )}
    </>
  );
};

export default LanguageSelectButton;
