import { useEffect } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { APP_ROLES, USER_GROUPS } from "@/const";
import useConfigurationModuleStore from "@/states/configurationModule";
import useMetadataStore from "@/states/metadata";
import CustomizedMultipleSelector from "@/ui/common/CustomMultipleSelector";

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
  const { users } = useMetadataStore(
    useShallow((state) => ({
      users: state.users,
    }))
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

  const userOptions = users.map((user) => {
    return {
      value: user.id,
      label: `${user.username} (${user.firstName} ${user.surname})`,
    };
  });

  useEffect(() => {
    Object.values(USER_GROUPS).forEach((userGroup) => {
      selectUsersByUserGroup(null, userGroup);
    });
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-2">
      <div className="flex gap-2 mb-4">
        {APP_ROLES.map((role) => {
          return <AppRole role={role} />;
        })}
      </div>
      {APP_ROLES.map((role) => {
        const { color, name } = role;
        const roleName = name.replace("Role", "").toUpperCase();
        const userGroupId = USER_GROUPS[roleName];
        const userInUserGroup = users.filter((user) => {
          return user.userGroups.some(
            (userGroup) => userGroup.id === userGroupId
          );
        });
        return (
          <div className="mt-2">
            <div>
              {t("selectUsersFor")}&nbsp;
              <span className={`font-bold ${color}`}>{t(name)}</span>
            </div>
            <div>
              <CustomizedMultipleSelector
                selected={
                  selectedUsersByUserGroup[userGroupId] ||
                  userInUserGroup.map((user) => user.id)
                }
                onChange={(value) => {
                  selectUsersByUserGroup(value, userGroupId);
                }}
                options={userOptions}
                filterable
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Authorities;
