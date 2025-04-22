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
  const { selectGroupSets, actions, valid } = useInstallationModuleStore(
    useShallow((state) => ({
      selectGroupSets: state.selectGroupSets,
      valid: state.valid,
      actions: state.actions
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
      const members = orgUnits.filter((orgUnit) => {
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
      members.forEach((member) => {
        const foundGeoJson = orgUnitGeoJson.features.find((f) => f.id === member.id);
        if (foundGeoJson && foundGeoJson.geometry.type !== "Point") {
          currentSkippedOrgUnits.push(member);
        }
      });
      if (members.length === 0) {
        setValid(false);
      } else if (members.length - currentSkippedOrgUnits.length === 0) {
        setValid(false);
      } else {
        setValid(true);
      }
      setStepData("selectGroupSets", "skippedOrgUnits", currentSkippedOrgUnits);
      setStepData("selectGroupSets", "members", members);
    }
  }, [selectedGroupSets]);

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold text-[20px]">{t("selectGroupSets")}</div>
      <div>{t("selectGroupSetsParagraph1")}</div>
      <div>
        <CustomizedInputField
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
            <div className="w-[930px] overflow-auto">
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
