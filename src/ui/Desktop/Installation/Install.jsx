import { CircularLoader } from "@dhis2/ui";
import useMetadataStore from "@/states/metadata";
import useInstallationModuleStore from "@/states/installationModule";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useState } from "react";
import { generateUid } from "@/utils";
import _ from "lodash";
import CustomizedButton from "@/ui/common/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlay } from "@fortawesome/free-solid-svg-icons";
import { addUserRole, getUserByIds, pushMetadata } from "@/api/metadata";

const Install = () => {
  const { t } = useTranslation();
  const [importMetadataLoading, setImportMetadataLoading] = useState(true);
  const [importFacilitiesLoading, setImportFacilitiesLoading] = useState(true);
  const [settingUserRoleLoading, setSettingUserRoleLoading] = useState(true);
  const { me, schemas, orgUnitGroupSets, orgUnitGroups } = useMetadataStore(
    useShallow((state) => ({
      me: state.me,
      schemas: state.schemas,
      orgUnitGroupSets: state.orgUnitGroupSets,
      orgUnitGroups: state.orgUnitGroups
    }))
  );

  const { actions, valid, selectGroupSets, setupAuthorities, summary, status } = useInstallationModuleStore(
    useShallow((state) => ({
      valid: state.valid,
      actions: state.actions,
      selectGroupSets: state.selectGroupSets,
      setupAuthorities: state.setupAuthorities,
      summary: state.summary,
      status: state.status
    }))
  );
  const { setStatus, setStepData } = actions;
  const { metadataPackage, data } = summary;
  const { members, skippedOrgUnits, selectedGroupSets } = selectGroupSets;

  const changeLoading = (key, value) => {
    const cloned = _.cloneDeep(loading);
    cloned[key] = value;
    setStepData("install", "loading", cloned);
  };

  const settingUserRole = async () => {
    const userChunks = _.chunk(metadataPackage.userRoles[0].users, 10);
    for (let i = 0; i < userChunks.length; i++) {
      const users = await getUserByIds(userChunks[i].map((user) => user.id));
      const promises = [];
      users.forEach((user) => {
        user.userRoles.push({ id: metadataPackage.userRoles[0].id });
        promises.push(addUserRole(user.id, user.userRoles));
      });
      await Promise.all(promises);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold text-[20px]">{t("install")}</div>
      <div>{t("installParagraph1")}</div>
      <br />
      <div>
        <CustomizedButton
          disabled={status !== "pending"}
          primary
          icon={<FontAwesomeIcon icon={faPlay} />}
          onClick={async () => {
            setStatus("importing");
            await pushMetadata(metadataPackage);
            setImportMetadataLoading(false);
            await settingUserRole();
            setSettingUserRoleLoading(false);
            setImportFacilitiesLoading(false);
            setStatus("done");
          }}
        >
          {t("install")}
        </CustomizedButton>
      </div>
      {status === "importing" && <div>{t("installParagraph2")}</div>}
      <br />
      {(status === "importing" || status === "done") && (
        <div className="flex items-center">
          {status === "done" || !importMetadataLoading ? (
            <FontAwesomeIcon className="text-green-700 text-lg" icon={faCheck} />
          ) : (
            <CircularLoader extrasmall />
          )}
          &nbsp;&nbsp;
          {t("importMetadata")}
        </div>
      )}
      {(status === "importing" || status === "done") && (
        <div className="flex items-center">
          {status === "done" || !importFacilitiesLoading ? (
            <FontAwesomeIcon className="text-green-700 text-lg" icon={faCheck} />
          ) : (
            <CircularLoader extrasmall />
          )}
          &nbsp;&nbsp;
          {t("importFacilities")}
        </div>
      )}
      {(status === "importing" || status === "done") && (
        <div className="flex items-center">
          {status === "done" || !settingUserRole ? (
            <FontAwesomeIcon className="text-green-700 text-lg" icon={faCheck} />
          ) : (
            <CircularLoader extrasmall />
          )}
          &nbsp;&nbsp;
          {t("settingUserRole")}
        </div>
      )}
      <br />
      {status === "done" && <div>{t("installParagraph3")}</div>}
    </div>
  );
};

export default Install;
