import { useRef, useState } from "react";

import { Popover } from "@mui/material";
import { Tag } from "@dhis2/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGlobe } from "@fortawesome/free-solid-svg-icons";

import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import useMetadataStore from "@/states/metadata";
import CustomizedButton from "@/ui/common/Button";
import { LOCALES_MAPPING } from "@/const";

import "/node_modules/flag-icons/css/flag-icons.min.css";

const UserInfo = () => {
  const { t, i18n } = useTranslation();

  const localeButtonRef = useRef();

  const {
    me,
    locale,
    actions: { setMetadata }
  } = useMetadataStore(
    useShallow((state) => ({
      me: state.me,
      locale: state.locale,
      actions: state.actions
    }))
  );
  const { firstName, surname, authorities } = me;

  const [localePopover, setLocalePopover] = useState(false);

  const handleSelectLocale = (selectedLocale) => {
    setMetadata("locale", selectedLocale);
    i18n.changeLanguage(selectedLocale);
    setLocalePopover(false);
  };

  return (
    <div className="flex items-center">
      <div className="rounded-md bg-slate-500 h-[36px] p-2 flex items-center text-white text-[14px]">
        <strong>{t("user")}:</strong>&nbsp;{firstName} {surname}
      </div>
      &nbsp;
      <div className="rounded-md bg-teal-700 h-[36px] p-2 flex items-center text-white text-[14px]">
        <strong>{t("authorities")}:</strong>&nbsp;{me.authorities.join(", ")}
      </div>
      &nbsp;
      <div ref={localeButtonRef} className="inline-block">
        <CustomizedButton
          onClick={() => {
            setLocalePopover(true);
          }}
          icon={<FontAwesomeIcon icon={faGlobe} />}
        >
          {t(LOCALES_MAPPING[locale].name)}
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
            horizontal: "right"
          }}
        >
          <div className="flex flex-col p-2">
            {Object.keys(LOCALES_MAPPING).map((key) => {
              return (
                <div
                  key={key}
                  onClick={() => handleSelectLocale(key)}
                  className="flex items-center gap-2 w-full p-2 hover:bg-slate-200 cursor-pointer ease-in duration-200"
                >
                  <span className={`fi fi-${LOCALES_MAPPING[key].flag}`} />
                  <span>{t(LOCALES_MAPPING[key].name)}</span>
                </div>
              );
            })}
          </div>
        </Popover>
      )}
    </div>
  );
};

export default UserInfo;
