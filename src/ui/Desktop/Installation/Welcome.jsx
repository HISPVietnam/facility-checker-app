import useMetadataStore from "@/states/metadata";
import useInstallationModuleStore from "@/states/installationModule";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

const Welcome = () => {
  const { t } = useTranslation();
  const { me } = useMetadataStore(
    useShallow((state) => ({
      me: state.me
    }))
  );
  const { actions, valid } = useInstallationModuleStore(
    useShallow((state) => ({
      valid: state.valid,
      actions: state.actions
    }))
  );
  const { setValid } = actions;

  let validUserRole = false;
  let validOrgUnitAccess = false;
  me.userRoles.forEach((ur) => {
    const foundAllAuthorities = ur.authorities.find((a) => a === "ALL");
    if (foundAllAuthorities) {
      validUserRole = true;
    }
  });

  me.organisationUnits.forEach((ou) => {
    if (ou.level === 1) {
      validOrgUnitAccess = true;
    }
  });

  if (!validUserRole || !validOrgUnitAccess) {
    setValid(false);
  } else {
    setValid(true);
  }

  const Invalid = () => {
    return <FontAwesomeIcon className="text-[20px] text-red-500" icon={faXmark} />;
  };

  const Valid = () => {
    return <FontAwesomeIcon className="text-[20px] text-green-500" icon={faCheck} />;
  };

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold text-[20px]">{t("welcomeToFacilityChecker")}</div>
      <div>{t("welcomeParagraph1", { fullName: me.firstName + " " + me.surname })}</div>
      <br />
      <div>{t("welcomeParagraph2")}</div>
      <br />
      <div>{t("welcomeParagraph2.1")}</div>
      <br />
      <div>{t("welcomeParagraph3")}</div>
      <div>
        <div className="flex">
          <div className="w-[25px] flex items-center">{validUserRole ? <Valid /> : <Invalid />}</div>
          <div>
            <strong>{t("superuserRole")}</strong>
          </div>
        </div>
        <div className="flex">
          <div className="w-[25px] flex items-center">{validOrgUnitAccess ? <Valid /> : <Invalid />}</div>
          <div>
            <strong>{t("accessToRootOrgUnit")}</strong>
          </div>
        </div>
      </div>
      <br />
      {valid && <div>{t("validWelcome")}</div>}
      {!valid && <div>{t("invalidWelcome")}</div>}
    </div>
  );
};

export default Welcome;
