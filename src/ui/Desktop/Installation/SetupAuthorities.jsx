import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { NoticeBox } from "@dhis2/ui";
import { faUser, faUsers } from "@fortawesome/free-solid-svg-icons";
import { useShallow } from "zustand/react/shallow";
import useInstallationModuleStore from "@/states/installationModule";
import useMetadataStore from "@/states/metadata";
import { pickTranslation } from "@/utils";
import { APP_ROLES } from "@/const";
import CustomizedMultipleSelector from "@/ui/common/CustomMultipleSelector";
import { AppRole, AppRoleSelectable } from "./AppRole";
import { getUsersByQuery, searchUsers } from "@/api/metadata";

const SetupAuthorities = () => {
  const [selectedRole, setSelectedRole] = useState(0);
  const { t, i18n } = useTranslation();
  const { userGroups } = useMetadataStore(
    useShallow((state) => ({
      userGroups: state.userGroups,
    })),
  );

  const { actions, valid, setupAuthorities, status, refreshingMetadata } =
    useInstallationModuleStore(
      useShallow((state) => ({
        valid: state.valid,
        actions: state.actions,
        setupAuthorities: state.setupAuthorities,
        status: state.status,
        refreshingMetadata: state.refreshingMetadata,
      })),
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

  const mapping = {
    captureRole: captureRoleUsers,
    approvalRole: approvalRoleUsers,
    synchronizationRole: synchronizationRoleUsers,
    adminRole: adminRoleUsers,
  };

  useEffect;

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold text-[20px]">{t("setupAuthorities")}</div>
      <div className="mb-1">{t("setupAuthoritiesParagraph1")}</div>
      <div className="flex gap-2 mb-4">
        {APP_ROLES.map((role, index) => {
          const { name } = role;
          return (
            <AppRoleSelectable
              key={index}
              role={role}
              onClick={() => {
                setSelectedRole(index);
              }}
              selected={selectedRole === index}
              completed={JSON.parse(mapping[name]).length > 0}
            />
          );
        })}
      </div>
      {/* <div>{t("setupAuthoritiesParagraph2")}</div> */}
      <div className="flex flex-wrap gap-1 justify-between">
        {APP_ROLES.map((role, index) => {
          const { color, name } = role;
          const isAdminRole = role.name === "adminRole";
          if (selectedRole === index) {
            return (
              <div className="w-full">
                <div>
                  {t("selectUsersUserGroupsFor")}&nbsp;
                  <span className={`font-bold ${color}`}>{t(name)}</span>
                </div>
                <div className="h-full">
                  <CustomizedMultipleSelector
                    limitTags={6}
                    disabled={status !== "pending" || refreshingMetadata}
                    selected={mapping[name] ? JSON.parse(mapping[name]) : []}
                    onChange={(value) => {
                      setStepData(
                        "setupAuthorities",
                        name + "Users",
                        JSON.stringify(value),
                      );
                    }}
                    isServerSideFilter
                    getOptions={async (searchText) => {
                      if (!searchText) {
                        const selected = mapping[name]
                          ? JSON.parse(mapping[name])
                          : [];
                        const users = await getUsersByQuery(
                          `filter=id:in:[${selected.join(",")}]`,
                        );
                        const userOptions = users.map((user) => ({
                          value: user.id,
                          isSuperuser: user.userRoles
                            .flatMap((ur) => ur.authorities)
                            .includes("ALL"),
                          prefix: (
                            <FontAwesomeIcon icon={faUser} className="pr-2" />
                          ),
                          label: `${user.username} (${user.firstName} ${user.surname})`,
                        }));
                        if (isAdminRole) {
                          return userOptions.filter((user) => user.isSuperuser);
                        }
                        return userOptions;
                      }
                      const users = await searchUsers(searchText);

                      const userOptions = users.map((user) => ({
                        value: user.id,
                        isSuperuser: user.userRoles
                          .flatMap((ur) => ur.authorities)
                          .includes("ALL"),
                        prefix: (
                          <FontAwesomeIcon icon={faUser} className="pr-2" />
                        ),
                        label: `${user.username} (${user.firstName} ${user.surname})`,
                      }));
                      if (isAdminRole) {
                        return userOptions.filter((user) => user.isSuperuser);
                      }
                      return [
                        ...userOptions,
                        ...userGroupOptions.filter((ugo) =>
                          ugo.label
                            .toLowerCase()
                            .includes(searchText.toLowerCase()),
                        ),
                      ];
                    }}
                    filterable
                    placeholder={t("selectOption")}
                  />
                  {isAdminRole && (
                    <NoticeBox
                      title={t("importantNotice")}
                      warning
                      className="my-4"
                    >
                      {t("adminRoleRequirement")}
                    </NoticeBox>
                  )}
                </div>
              </div>
            );
          } else {
            return null;
          }
        })}
      </div>
      {valid && <div className="mt-3">{t("validSetupAuthorities")}</div>}
    </div>
  );
};

export default SetupAuthorities;
