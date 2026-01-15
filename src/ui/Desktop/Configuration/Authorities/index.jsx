import { useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { APP_ROLES, USER_GROUPS } from "@/const";
import useConfigurationModuleStore from "@/states/configurationModule";
import useMetadataStore from "@/states/metadata";
import CustomizedMultipleSelector from "@/ui/common/CustomMultipleSelector";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { NoticeBox } from "@dhis2/ui";
import { searchUsers } from "@/api/metadata";

const AppRole = ({ role }) => {
  const { t } = useTranslation();
  const { name, description, borderColor, color, icon } = role;
  return (
    <div className={`flex-1 p-3 rounded-md border-2 ${borderColor}`}>
      <div className={`font-bold text-[18px] ${color}`}>
        <FontAwesomeIcon icon={icon} />
        &nbsp;{t(name)}
      </div>
      <div className="text-[15px]">{t(description)}</div>
    </div>
  );
};

const Authorities = () => {
  const { t } = useTranslation();

  const { usersInFcaGroup } = useMetadataStore(
    useShallow((state) => ({ usersInFcaGroup: state.usersInFcaGroup }))
  );

  const {
    authorities: { selectedUsersByUserGroup },
    actions: { selectUsersByUserGroup },
  } = useConfigurationModuleStore(
    useShallow((state) => ({
      actions: state.actions,
      authorities: state.authorities,
    }))
  );

  useEffect(() => {
    Object.values(USER_GROUPS).forEach((userGroup) => {
      selectUsersByUserGroup(null, userGroup);
    });
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-2 overflow-auto">
      <div className="flex gap-2 mb-4">
        {APP_ROLES.map((role) => {
          return <AppRole role={role} />;
        })}
      </div>
      {APP_ROLES.map((role) => {
        const { color, name } = role;
        const roleName = name.replace("Role", "").toUpperCase();
        const userGroupId = USER_GROUPS[roleName];
        const userInUserGroup = usersInFcaGroup.filter((user) => {
          return user.userGroups.some(
            (userGroup) => userGroup.id === userGroupId
          );
        });
        const isAdminRole = role.name === "adminRole";

        return (
          <div className="mt-2">
            <div>
              {t("selectUsersFor")}&nbsp;
              <span className={`font-bold ${color}`}>{t(name)}</span>
            </div>
            <div>
              <CustomizedMultipleSelector
                limitTags={3}
                selected={
                  selectedUsersByUserGroup[userGroupId] ||
                  userInUserGroup.map((user) => user.id)
                }
                onChange={(value) => {
                  selectUsersByUserGroup(value, userGroupId);
                }}
                isServerSideFilter
                defaultOptions={usersInFcaGroup.map((user) => ({
                  value: user.id,
                  isSuperuser: user.userRoles
                    .flatMap((ur) => ur.authorities)
                    .includes("ALL"),
                  prefix: <FontAwesomeIcon icon={faUser} className="pr-2" />,
                  label: `${user.username} (${user.firstName} ${user.surname})`,
                }))}
                getOptions={async (searchText) => {
                  const users = await searchUsers(searchText);

                  const userOptions = users.map((user) => ({
                    value: user.id,
                    isSuperuser: user.userRoles
                      .flatMap((ur) => ur.authorities)
                      .includes("ALL"),
                    prefix: <FontAwesomeIcon icon={faUser} className="pr-2" />,
                    label: `${user.username} (${user.firstName} ${user.surname})`,
                  }));
                  if (isAdminRole) {
                    return userOptions.filter((user) => user.isSuperuser);
                  }
                  return userOptions;
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
                  <div className="flex flex-col gap-2">
                    <p>{t("adminRoleRequirement")}</p>
                    <p> {t("updatedRolesForSelfUser")}</p>
                  </div>
                </NoticeBox>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Authorities;
