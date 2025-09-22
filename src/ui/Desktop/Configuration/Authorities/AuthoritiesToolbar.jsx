import React, { useState } from "react";

import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { addUserRole, getMe, getUsers, pushMetadata } from "@/api/metadata";
import CustomizedButton from "@/ui/common/Button";
import useConfigurationModuleStore from "@/states/configurationModule";
import useMetadataStore from "@/states/metadata";

import metadata from "@/assets/metadata.json";
import { toast } from "react-toastify";
import { CAPTURE_USER_ROLE, SYNC_USER_ROLE, USER_GROUPS } from "@/const";
import _ from "lodash";

const AuthoritiesToolbar = () => {
  const { t } = useTranslation();
  const {
    users,
    me,
    actions: { setMetadata },
  } = useMetadataStore(
    useShallow((state) => ({
      users: state.users,
      actions: state.actions,
      me: state.me,
    }))
  );
  const {
    authorities: { selectedUsersByUserGroup },
    actions: { selectUsersByUserGroup },
  } = useConfigurationModuleStore(
    useShallow((state) => ({
      authorities: state.authorities,
      actions: state.actions,
    }))
  );
  const [loading, setLoading] = useState(false);
  const removeUserRole = async () => {
    const usersInRole = users.filter(
      (user) =>
        user.userRoles.some((ur) =>
          [CAPTURE_USER_ROLE, SYNC_USER_ROLE].includes(ur.id)
        ) && user.id !== me.id
    );
    const deletedUserRolesForUsers = usersInRole.map((user) => ({
      ...user,
      userRoles: user.userRoles.filter(
        (ur) => ![CAPTURE_USER_ROLE, SYNC_USER_ROLE].includes(ur.id)
      ),
    }));
    const deletedUserChunks = _.chunk(deletedUserRolesForUsers, 10);
    for (let i = 0; i < deletedUserChunks.length; i++) {
      const promises = deletedUserChunks[i].map((user) =>
        addUserRole(
          user.id,
          user.userRoles.map((item) => ({ id: item.id }))
        )
      );
      await Promise.all(promises);
    }
  };
  const settingUserRole = async (userGroups) => {
    const userRoles = userGroups.reduce((prev, curr) => {
      if (curr.id === USER_GROUPS.SYNCHRONIZATION) {
        prev[SYNC_USER_ROLE] = prev[SYNC_USER_ROLE] || {
          id: SYNC_USER_ROLE,
          users: [],
        };
        prev[SYNC_USER_ROLE].users = _.uniqBy(
          [...prev[SYNC_USER_ROLE].users, ...curr.users],
          "id"
        );
      }
      if (curr.id !== USER_GROUPS.ADMIN) {
        prev[CAPTURE_USER_ROLE] = prev[CAPTURE_USER_ROLE] || {
          id: CAPTURE_USER_ROLE,
          users: [],
        };
        prev[CAPTURE_USER_ROLE].users = _.uniqBy(
          [...prev[CAPTURE_USER_ROLE].users, ...curr.users],
          "id"
        );
      }
      return prev;
    }, {});
    const updatedUserRolesForUsers = Object.values(userRoles).reduce(
      (prev, curr) => {
        curr.users.forEach((user) => {
          if (prev[user.id]) prev[user.id] = [...prev[user.id], curr.id];
          else {
            const foundUser = users.find((item) => item.id === user.id);
            prev[user.id] = [
              ...foundUser.userRoles
                .map((ur) => ur.id)
                .filter(
                  (ur) => ![SYNC_USER_ROLE, CAPTURE_USER_ROLE].includes(ur)
                ),
              curr.id,
            ];
          }
        });
        return prev;
      },
      {}
    );
    const selfUser = updatedUserRolesForUsers[me.id];
    if (selfUser) {
      delete updatedUserRolesForUsers[me.id];
    }
    const userKeyChunks = _.chunk(Object.keys(updatedUserRolesForUsers), 10);
    const userValueChunks = _.chunk(
      Object.values(updatedUserRolesForUsers),
      10
    );

    for (let i = 0; i < userKeyChunks.length; i++) {
      const promises = userKeyChunks[i].map((user, index) =>
        addUserRole(
          user,
          userValueChunks[i][index].map((item) => ({ id: item }))
        )
      );
      await Promise.all(promises);
    }

    const selfUserInRole = users.find(
      (user) =>
        user.userRoles.some((ur) =>
          [CAPTURE_USER_ROLE, SYNC_USER_ROLE].includes(ur.id)
        ) && user.id === me.id
    );

    selfUser
      ? await addUserRole(
          me.id,
          selfUser.map((item) => ({ id: item }))
        )
      : selfUserInRole &&
        (await addUserRole(
          me.id,
          selfUserInRole.userRoles.map((ur) => ({ id: ur.id }))
        ));
    if (selfUser || selfUserInRole) return true;
  };
  const handleSave = async () => {
    try {
      setLoading(true);
      const userGroupsPayload = {
        userGroups: Object.keys(selectedUsersByUserGroup).map((key) => {
          return {
            id: key,
            name: metadata.userGroups.find((ug) => ug.id === key).name,
            users: selectedUsersByUserGroup[key]
              ? selectedUsersByUserGroup[key].map((user) => ({ id: user }))
              : users
                  .filter((user) =>
                    user.userGroups.some((userGroup) => userGroup.id === key)
                  )
                  .map((user) => ({ id: user.id })),
          };
        }),
      };

      await pushMetadata(userGroupsPayload);
      await removeUserRole();

      const isUpdatedSelf = await settingUserRole(userGroupsPayload.userGroups);
      if (isUpdatedSelf) {
        toast.success(t("savedAuthoritiesSuccessfully"));
        window.location = "../../../dhis-web-commons-security/logout.action";
      }
      const newUsers = await getUsers();
      const newMe = await getMe();
      newMe.authorities = [];

      toast.success(t("savedAuthoritiesSuccessfully"));
      Object.keys(USER_GROUPS).forEach((authorityName) => {
        const foundUg = newMe.userGroups.find(
          (ug) => ug.id === USER_GROUPS[authorityName]
        );
        if (foundUg) {
          newMe.authorities.push(authorityName);
        }
      });
      setMetadata("me", newMe);
      setMetadata("users", newUsers);
      Object.values(USER_GROUPS).forEach((userGroup) => {
        selectUsersByUserGroup(null, userGroup);
      });
    } catch (error) {
      console.error(error);
      toast.error(t("savedAuthoritiesFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CustomizedButton
        loading={loading}
        disabled={Object.values(selectedUsersByUserGroup).every(
          (users) => !users
        )}
        icon={<FontAwesomeIcon icon={faSave} />}
        primary
        onClick={handleSave}
      >
        {t("save")}
      </CustomizedButton>
    </div>
  );
};

export default AuthoritiesToolbar;
