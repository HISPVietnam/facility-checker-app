import { CircularLoader } from "@dhis2/ui";
import useMetadataStore from "@/states/metadata";
import useInstallationModuleStore from "@/states/installationModule";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useState } from "react";
import { generateUid } from "@/utils";
import _ from "lodash";
import CustomizedButton from "@/ui/common/Button";
import ErrorDialog from "@/ui/Desktop/Installation/ErrorDialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faPlay } from "@fortawesome/free-solid-svg-icons";
import { addUserRole, getUserByIds, pushMetadata } from "@/api/metadata";
import { postTeis } from "@/api/data";
import { saveDataStore } from "@/api/metadata";
import resources from "@/locales";
import { pull } from "@/api/fetch";
const Install = () => {
  const { t, i18n } = useTranslation();
  const [errorDialog, setErrorDialog] = useState(false);
  const [importMetadataLoading, setImportMetadataLoading] = useState(true);
  const [importFacilitiesLoading, setImportFacilitiesLoading] = useState(true);
  const [settingUserRoleLoading, setSettingUserRoleLoading] = useState(true);
  const { users, me } = useMetadataStore(
    useShallow((state) => ({
      users: state.users,
      me: state.me,
    }))
  );

  const {
    actions,
    valid,
    selectGroupSets,
    summary,
    status,
    refreshingMetadata,
  } = useInstallationModuleStore(
    useShallow((state) => ({
      valid: state.valid,
      actions: state.actions,
      selectGroupSets: state.selectGroupSets,
      summary: state.summary,
      status: state.status,
      refreshingMetadata: state.refreshingMetadata,
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
    const updatedUserRolesForUsers = metadataPackage.userRoles.reduce(
      (prev, curr) => {
        curr.users.forEach((user) => {
          if (prev[user.id]) prev[user.id] = [...prev[user.id], curr.id];
          else {
            const foundUser = users.find((item) => item.id === user.id);
            prev[user.id] = [
              ...foundUser.userRoles.map((ur) => ur.id),
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
    selfUser &&
      (await addUserRole(
        me.id,
        selfUser.map((item) => ({ id: item }))
      ));
  };

  const importFacilities = async (dryRun) => {
    const facilityChunks = _.chunk(data, 500);
    let conclusion = {
      failed: false,
      result: null,
    };
    for (let i = 0; i < facilityChunks.length; i++) {
      const parallelChunks = _.chunk(facilityChunks[i], 50);
      const promises = parallelChunks.map((chunk) => {
        return postTeis(chunk, dryRun);
      });
      const results = await Promise.all(promises);
      let failed = false;
      results.forEach((result) => {
        if (result.status && result.status === "ERROR") {
          failed = true;
        }
      });
      if (failed) {
        conclusion.failed = true;
        conclusion.result = results;
        break;
      }
    }
    return conclusion;
  };

  const importDataStore = async () => {
    await saveDataStore("locales", resources, "CREATE");
  };

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold text-[20px]">{t("install")}</div>
      <div>{t("installParagraph1")}</div>
      <br />
      <div>
        <CustomizedButton
          disabled={status !== "pending" || refreshingMetadata}
          primary
          icon={<FontAwesomeIcon icon={faPlay} />}
          onClick={async () => {
            setStatus("importing");
            await importDataStore();
            const metadataDryRunResult = await pushMetadata(
              metadataPackage,
              true
            );
            if (metadataDryRunResult.httpStatus === "Conflict") {
              setErrorDialog(true);
              setStepData("install", "metadataResult", metadataDryRunResult);
            } else {
              const metadataResult = await pushMetadata(metadataPackage, false);
              setImportMetadataLoading(false);

              const facilitiesDryRunResult = await importFacilities(true);
              if (facilitiesDryRunResult.failed) {
                setErrorDialog(true);
                setStepData(
                  "install",
                  "facilitiesResult",
                  facilitiesDryRunResult.result
                );
              } else {
                const facilitiesResult = await importFacilities();
                setImportFacilitiesLoading(false);
                await settingUserRole();
                setSettingUserRoleLoading(false);
                setStatus("done");
              }
            }
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
            <FontAwesomeIcon
              className="text-green-700 text-lg"
              icon={faCheck}
            />
          ) : (
            <CircularLoader extrasmall />
          )}
          &nbsp;&nbsp;
          {t("importMetadata")}
        </div>
      )}
      {(status === "importing" || status === "done") && (
        <div className="flex items-center">
          {status === "done" || !settingUserRoleLoading ? (
            <FontAwesomeIcon
              className="text-green-700 text-lg"
              icon={faCheck}
            />
          ) : (
            <CircularLoader extrasmall />
          )}
          &nbsp;&nbsp;
          {t("settingUserRole")}
        </div>
      )}
      {(status === "importing" || status === "done") && (
        <div className="flex items-center">
          {status === "done" || !importFacilitiesLoading ? (
            <FontAwesomeIcon
              className="text-green-700 text-lg"
              icon={faCheck}
            />
          ) : (
            <CircularLoader extrasmall />
          )}
          &nbsp;&nbsp;
          {t("importFacilities")}
        </div>
      )}
      <br />
      {status === "done" && <div>{t("installParagraph3")}</div>}
      {status === "done" && (
        <CustomizedButton
          onClick={async () => {
            window.location =
              "../../../dhis-web-commons-security/logout.action";
          }}
          success
        >
          {t("ok")}
        </CustomizedButton>
      )}
      {errorDialog && <ErrorDialog />}
    </div>
  );
};

export default Install;
