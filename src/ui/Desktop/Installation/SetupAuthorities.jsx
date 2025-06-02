import useMetadataStore from "@/states/metadata";
import useInstallationModuleStore from "@/states/installationModule";
import {
  faCheck,
  faUser,
  faUsers,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import CustomizedInputField from "@/ui/common/InputField";
import AppRole from "./AppRole";
import { NoticeBox } from "@dhis2/ui";
import { pickTranslation } from "@/utils";
import { APP_ROLES } from "@/const";
import CustomizedMultipleSelector from "@/ui/common/CustomMultipleSelector";
const SetupAuthorities = () => {
  const { t, i18n } = useTranslation();
  const { users, userGroups } = useMetadataStore(
    useShallow((state) => ({
      users: state.users,
      userGroups: state.userGroups,
    }))
  );
  const { actions, valid, setupAuthorities, status, refreshingMetadata } =
    useInstallationModuleStore(
      useShallow((state) => ({
        valid: state.valid,
        actions: state.actions,
        setupAuthorities: state.setupAuthorities,
        status: state.status,
        refreshingMetadata: state.refreshingMetadata,
      }))
    );
  const {
    captureRoleUsers,
    approvalRoleUsers,
    synchronizationRoleUsers,
    adminRoleUsers,
  } = setupAuthorities;
  const { setValid, setStepData } = actions;
  useEffect(() => {
    if (
      captureRoleUsers &&
      JSON.parse(captureRoleUsers).length > 0 &&
      approvalRoleUsers &&
      JSON.parse(approvalRoleUsers).length > 0 &&
      synchronizationRoleUsers &&
      JSON.parse(synchronizationRoleUsers).length > 0 &&
      adminRoleUsers &&
      JSON.parse(adminRoleUsers).length > 0
    ) {
      setValid(true);
    } else {
      setValid(false);
    }
  }, [
    captureRoleUsers,
    approvalRoleUsers,
    synchronizationRoleUsers,
    adminRoleUsers,
  ]);

  const userGroupOptions = userGroups.map((ug) => {
    return {
      value: `${ug.id}-userGroup`,
      prefix: <FontAwesomeIcon icon={faUsers} className="pr-2" />,
      label: pickTranslation(ug, i18n.language, "name"),
    };
  });

  const userOptions = users.map((user) => {
    return {
      value: user.id,
      prefix: <FontAwesomeIcon icon={faUser} className="pr-2" />,

      label: `${user.username} (${user.firstName} ${user.surname})`,
    };
  });

  const mapping = {
    captureRole: captureRoleUsers,
    approvalRole: approvalRoleUsers,
    synchronizationRole: synchronizationRoleUsers,
    adminRole: adminRoleUsers,
  };

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold text-[20px]">{t("setupAuthorities")}</div>
      <div className="mb-2">{t("setupAuthoritiesParagraph1")}</div>
      <div className="flex gap-2 mb-4">
        {APP_ROLES.map((role) => {
          return <AppRole role={role} />;
        })}
      </div>
      {/* <div>{t("setupAuthoritiesParagraph2")}</div> */}
      {APP_ROLES.map((role) => {
        const { color, name } = role;
        return (
          <div className="mt-2">
            <div>
              {t("selectUsersUserGroupsFor")}&nbsp;
              <span className={`font-bold ${color}`}>{t(name)}</span>
            </div>
            <div>
              <CustomizedMultipleSelector
                disabled={status !== "pending" || refreshingMetadata}
                selected={mapping[name] ? JSON.parse(mapping[name]) : []}
                onChange={(value) => {
                  setStepData(
                    "setupAuthorities",
                    name + "Users",
                    JSON.stringify(value)
                  );
                }}
                options={[...userOptions, ...userGroupOptions]}
                filterable
                placeholder={t("selectOption")}
              />
            </div>
          </div>
        );
      })}
      {valid && <div className="mt-3">{t("validSetupAuthorities")}</div>}
    </div>
  );
};

export default SetupAuthorities;
