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
import { pushMetadata } from "@/api/metadata";

const Install = () => {
  const { t } = useTranslation();
  const { me, schemas, orgUnitGroupSets, orgUnitGroups } = useMetadataStore(
    useShallow((state) => ({
      me: state.me,
      schemas: state.schemas,
      orgUnitGroupSets: state.orgUnitGroupSets,
      orgUnitGroups: state.orgUnitGroups
    }))
  );

  const { actions, valid, selectGroupSets, setupAuthorities, summary, install, status } = useInstallationModuleStore(
    useShallow((state) => ({
      valid: state.valid,
      actions: state.actions,
      selectGroupSets: state.selectGroupSets,
      setupAuthorities: state.setupAuthorities,
      summary: state.summary,
      status: state.status,
      install: state.install
    }))
  );
  const { loading } = install;
  const { setStatus, setStepData } = actions;
  const { metadataPackage } = summary;
  const { members, skippedOrgUnits, selectedGroupSets } = selectGroupSets;

  const changeLoading = (key, value) => {
    const cloned = _.cloneDeep(loading);
    cloned[key] = value;
    setStepData("install", "loading", cloned);
  };

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold text-[20px]">{t("install")}</div>
      <div>{t("installParagraph1")}</div>
      <br />
      <div>
        <CustomizedButton
          disabled={status !== "pending"}
          loading={loading.overall}
          primary
          icon={<FontAwesomeIcon icon={faPlay} />}
          onClick={async () => {
            setStatus("importing");
            changeLoading("importMetadata", true);
            await pushMetadata(metadataPackage);
            changeLoading("importMetadata", false);
            setStatus("done");
          }}
        >
          {t("install")}
        </CustomizedButton>
      </div>
      {status === "importing" && <div>{t("installParagraph2")}</div>}
      <br />
      {(status === "importing" || status === "done") &&
        Object.keys(loading).map((key) => {
          if (key === "status") {
            return null;
          }
          return (
            <div className="flex items-center">
              {loading[key] ? <CircularLoader extrasmall /> : <FontAwesomeIcon className="text-green-700 text-lg" icon={faCheck} />}&nbsp;&nbsp;
              {t(key)}
            </div>
          );
        })}
      <br />
      {status === "done" && <div>{t("installParagraph3")}</div>}
    </div>
  );
};

export default Install;
