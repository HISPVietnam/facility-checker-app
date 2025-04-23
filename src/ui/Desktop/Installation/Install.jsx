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
  const [loading, setLoading] = useState({
    overall: false,
    importMetadata: false
    // importFacilities: true
  });
  const { me, schemas, orgUnitGroupSets, orgUnitGroups } = useMetadataStore(
    useShallow((state) => ({
      me: state.me,
      schemas: state.schemas,
      orgUnitGroupSets: state.orgUnitGroupSets,
      orgUnitGroups: state.orgUnitGroups
    }))
  );

  const { actions, valid, selectGroupSets, setupAuthorities, summary } = useInstallationModuleStore(
    useShallow((state) => ({
      valid: state.valid,
      actions: state.actions,
      selectGroupSets: state.selectGroupSets,
      setupAuthorities: state.setupAuthorities,
      summary: state.summary
    }))
  );
  const { metadataPackage } = summary;
  const { members, skippedOrgUnits, selectedGroupSets } = selectGroupSets;

  const changeLoading = (key, value) => {
    loading[key] = value;
    setLoading({ ...loading });
  };

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold text-[20px]">{t("install")}</div>
      <div>{t("installParagraph1")}</div>
      <br />
      <div>
        <CustomizedButton
          loading={loading.overall}
          primary
          icon={<FontAwesomeIcon icon={faPlay} />}
          onClick={async () => {
            changeLoading("overall", true);
            changeLoading("importMetadata", true);
            await pushMetadata(metadataPackage);
            changeLoading("importMetadata", false);
            changeLoading("overall", false);
          }}
        >
          {t("install")}
        </CustomizedButton>
      </div>
      <br />
      {loading.overall && <div>{t("installParagraph2")}</div>}
      <br />
      {loading.overall &&
        Object.keys(loading).map((key) => {
          if (key === "overall") {
            return null;
          }
          return (
            <div className="flex items-center">
              {loading[key] ? <CircularLoader extrasmall /> : <FontAwesomeIcon className="text-green-700 text-lg" icon={faCheck} />}&nbsp;&nbsp;
              {t(key)}
            </div>
          );
        })}
    </div>
  );
};

export default Install;
