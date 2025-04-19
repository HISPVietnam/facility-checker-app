import useMetadataStore from "@/states/metadata";
import useInstallationModuleStore from "@/states/installationModule";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import CustomizedInputField from "@/ui/common/InputField";
import AppRole from "./AppRole";
import { NoticeBox } from "@dhis2/ui";
import { pickTranslation } from "@/utils";
import { APP_ROLES } from "@/const";
const SetupAuthorities = () => {
  const { t } = useTranslation();
  const { users } = useMetadataStore(
    useShallow((state) => ({
      users: state.users
    }))
  );
  const { actions, valid, setupAuthorities } = useInstallationModuleStore(
    useShallow((state) => ({
      valid: state.valid,
      actions: state.actions,
      setupAuthorities: state.setupAuthorities
    }))
  );
  const { captureRoleUsers, approvalRoleUsers, synchronizationRoleUsers } = setupAuthorities;
  const { setValid, setStepData } = actions;
  useEffect(() => {
    if (
      captureRoleUsers &&
      JSON.parse(captureRoleUsers).length > 0 &&
      approvalRoleUsers &&
      JSON.parse(approvalRoleUsers).length > 0 &&
      synchronizationRoleUsers &&
      JSON.parse(synchronizationRoleUsers).length > 0
    ) {
      setValid(true);
    } else {
      setValid(false);
    }
  }, [captureRoleUsers, approvalRoleUsers, synchronizationRoleUsers]);

  const userOptions = users.map((user) => {
    return {
      value: user.id,
      label: `${user.username} (${user.firstName} ${user.surname})`
    };
  });

  return (
    <div className="w-[1000px] flex flex-col">
      <div className="font-bold text-[20px]">{t("setupAuthorities")}</div>
      <div className="mb-2">{t("setupAuthoritiesParagraph1")}</div>
      <div className="flex gap-2 mb-4">
        {APP_ROLES.map((role) => {
          return <AppRole role={role} />;
        })}
      </div>
      <div>{t("setupAuthoritiesParagraph2")}</div>
      <div>
        <div>
          {t("selectUsersFor")}&nbsp;<span className="font-bold text-cyan-700">{t("captureRole")}</span>
        </div>
        <div>
          <CustomizedInputField
            value={captureRoleUsers}
            onChange={(value) => {
              setStepData("setupAuthorities", "captureRoleUsers", value);
            }}
            multiSelection={true}
            valueType="TEXT"
            options={userOptions}
          />
        </div>
      </div>
      <div className="mt-3">
        <div>
          {t("selectUsersFor")}&nbsp;<span className="font-bold text-green-700">{t("approvalRole")}</span>
        </div>
        <div>
          <CustomizedInputField
            value={approvalRoleUsers}
            onChange={(value) => {
              setStepData("setupAuthorities", "approvalRoleUsers", value);
            }}
            multiSelection={true}
            valueType="TEXT"
            options={userOptions}
          />
        </div>
      </div>
      <div className="mt-3">
        <div>
          {t("selectUsersFor")}&nbsp;<span className="font-bold text-red-700">{t("synchronizationRole")}</span>
        </div>
        <div>
          <CustomizedInputField
            value={synchronizationRoleUsers}
            onChange={(value) => {
              setStepData("setupAuthorities", "synchronizationRoleUsers", value);
            }}
            multiSelection={true}
            valueType="TEXT"
            options={userOptions}
          />
        </div>
      </div>
      {valid && <div className="mt-3">{t("validSetupAuthorities")}</div>}
    </div>
  );
};

export default SetupAuthorities;
