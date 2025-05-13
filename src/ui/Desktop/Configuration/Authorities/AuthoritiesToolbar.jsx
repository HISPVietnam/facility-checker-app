import { getUsers, pushMetadata } from "@/api/metadata";
import useConfigurationModuleStore from "@/states/configurationModule";
import useMetadataStore from "@/states/metadata";
import CustomizedButton from "@/ui/common/Button";
import { faSave } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import metadata from "@/assets/metadata.json";

const AuthoritiesToolbar = () => {
  const { t } = useTranslation();
  const {
    users,
    actions: { setMetadata },
  } = useMetadataStore(
    useShallow((state) => ({
      users: state.users,
      actions: state.actions,
    }))
  );
  const {
    authorities: { selectedUsersByUserGroup },
  } = useConfigurationModuleStore(
    useShallow((state) => ({
      authorities: state.authorities,
    }))
  );
  const [loading, setLoading] = useState(false);
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
      const newUsers = await getUsers();
      setMetadata("users", newUsers);
    } catch (error) {
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
