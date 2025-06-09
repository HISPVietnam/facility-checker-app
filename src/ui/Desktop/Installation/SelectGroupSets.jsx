import useMetadataStore from "@/states/metadata";
import useInstallationModuleStore from "@/states/installationModule";
import { faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import CustomizedInputField from "@/ui/common/InputField";
import { NoticeBox } from "@dhis2/ui";
import { convertDisplayValueForPath, pickTranslation } from "@/utils";
import _ from "lodash";

const SelectGroupSets = () => {
  const { t } = useTranslation();
  const { orgUnitGroupSets, orgUnits, orgUnitGeoJson, locale } = useMetadataStore(
    useShallow((state) => ({
      orgUnitGroupSets: state.orgUnitGroupSets,
      orgUnits: state.orgUnits,
      orgUnitGeoJson: state.orgUnitGeoJson,
      locale: state.locale
    }))
  );
  const { refreshingMetadata, selectGroupSets, actions, valid, status } = useInstallationModuleStore(
    useShallow((state) => ({
      refreshingMetadata: state.refreshingMetadata,
      selectGroupSets: state.selectGroupSets,
      valid: state.valid,
      actions: state.actions,
      status: state.status
    }))
  );
  const { selectedGroupSets, skippedOrgUnits, members } = selectGroupSets;
  const { setValid, setStepData } = actions;
  useEffect(() => {
    if (!selectGroupSets || JSON.parse(selectedGroupSets).length === 0) {
      setValid(false);
      setStepData("selectGroupSets", "skippedOrgUnits", []);
      setStepData("selectGroupSets", "members", []);
    } else {
      const currentSkippedOrgUnits = [];
      const groupSets = JSON.parse(selectedGroupSets);
      const membersWithGeometry = orgUnits.filter((orgUnit) => {
        let isMember = false;
        groupSets.forEach((gs) => {
          const foundOugs = orgUnitGroupSets.find((ougs) => ougs.id === gs);
          const ougToBeCompared = foundOugs.items.map((i) => i.id);
          orgUnit.organisationUnitGroups.forEach((oug) => {
            if (ougToBeCompared.includes(oug.id)) {
              isMember = true;
            }
          });
        });
        return isMember;
      });
      membersWithGeometry.forEach((member) => {
        if (member.geometry && member.geometry.type !== "Point") {
          currentSkippedOrgUnits.push(member);
        }
      });
      if (membersWithGeometry.length === 0) {
        setValid(false);
      } else if (membersWithGeometry.length - currentSkippedOrgUnits.length === 0) {
        setValid(false);
      } else {
        setValid(true);
      }
      setStepData("selectGroupSets", "skippedOrgUnits", currentSkippedOrgUnits);
      setStepData("selectGroupSets", "members", membersWithGeometry);
    }
  }, [selectedGroupSets]);

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold text-[20px]">{t("selectGroupSets")}</div>
      <div>{t("selectGroupSetsParagraph1")}</div>
      <div>
        <CustomizedInputField
          disabled={status !== "pending" || refreshingMetadata}
          value={selectedGroupSets}
          onChange={(value) => {
            setStepData("selectGroupSets", "selectedGroupSets", value);
          }}
          multiSelection={true}
          valueType="TEXT"
          options={orgUnitGroupSets.map((ougs) => {
            return {
              value: ougs.id,
              label: pickTranslation(ougs, locale, "name")
            };
          })}
        />
      </div>
      {members.length > 0 && (
        <div className="mt-3 w-full">
          <NoticeBox info title={t("summary")}>
            <div>
              {t("totalOrgUnits")}: {members.length}
              <br />
              {t("willBeImported")}: {members.length - skippedOrgUnits.length}
              <br />
              {t("willBeSkipped")}: {skippedOrgUnits.length}
            </div>
          </NoticeBox>
        </div>
      )}
      {skippedOrgUnits.length > 0 && (
        <div className="mt-3 w-full">
          <NoticeBox warning title={t("skippedOrgUnits")}>
            <div className="h-[230px] w-[1140px] overflow-auto">
              {skippedOrgUnits.map((orgUnit) => {
                return (
                  <div>
                    <strong>{pickTranslation(orgUnit, locale, "name")}</strong> ({convertDisplayValueForPath(orgUnit.path)})
                  </div>
                );
              })}
            </div>
          </NoticeBox>
        </div>
      )}
      {valid && <div className="mt-3">{t("validSelectGroupSets")}</div>}
      {!valid && <div className="mt-3">{t("invalidSelectGroupSets")}</div>}
    </div>
  );
};

export default SelectGroupSets;
