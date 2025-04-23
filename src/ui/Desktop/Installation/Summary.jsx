import { DataTable, DataTableHead, DataTableRow, DataTableColumnHeader, DataTableBody, DataTableCell } from "@dhis2/ui";
import useMetadataStore from "@/states/metadata";
import useInstallationModuleStore from "@/states/installationModule";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import metadata from "@/assets/metadata.json";
import { useEffect, useState } from "react";
import { generateUid } from "@/utils";
import _ from "lodash";
const Summary = () => {
  const { t } = useTranslation();
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
  const { setStepData } = actions;
  const { members, skippedOrgUnits, selectedGroupSets } = selectGroupSets;

  useEffect(() => {
    const newProgramStageDataElements = [];
    const newDataElements = [];
    const newOptionSets = [];
    const newOptions = [];
    const groupSets = JSON.parse(selectedGroupSets);
    groupSets.forEach((gs) => {
      const foundGs = orgUnitGroupSets.find((ougs) => ougs.id === gs);
      const newDataElementId = generateUid();
      const newOptionSetId = generateUid();
      newDataElements.push({
        id: newDataElementId,
        name: "FC:" + foundGs.name,
        shortName: foundGs.name,
        valueType: "TEXT",
        domainType: "TRACKER",
        aggregationType: "COUNT",
        optionSet: {
          id: newOptionSetId
        },
        sharing: {
          external: false,
          users: {},
          userGroups: {
            MJK6n5PLXM6: { access: "rw------", id: "MJK6n5PLXM6" },
            m6GidmfEK48: { access: "r-------", id: "m6GidmfEK48" },
            shYXBFb3lpw: { access: "r-------", id: "shYXBFb3lpw" },
            xd865kZFSRw: { access: "r-------", id: "xd865kZFSRw" }
          },
          public: "--------"
        }
      });
      newProgramStageDataElements.push({
        allowFutureDate: false,
        allowProvidedElsewhere: false,
        compulsory: false,
        dataElement: { id: newDataElementId },
        displayInReports: false,
        programStage: { id: "VdBma23iRTw" },
        renderOptionsAsRadio: false,
        skipAnalytics: false,
        skipSynchronization: false
      });
      const newOptionSet = {
        id: newOptionSetId,
        name: "FC:" + foundGs.name,
        shortName: foundGs.name,
        valueType: "TEXT",
        options: []
      };

      foundGs.items.forEach((item, index) => {
        const foundOug = orgUnitGroups.find((oug) => oug.id === item.id);
        const newOption = {
          id: generateUid(),
          name: foundOug.name,
          code: foundOug.id,
          sortOrder: index + 1,
          optionSet: {
            id: newOptionSetId
          }
        };
        newOptionSet.options.push(newOption);
        newOptions.push(newOption);
      });
      newOptionSets.push(newOptionSet);
    });
    const clonedMetadata = _.cloneDeep(metadata);
    clonedMetadata.programStageDataElements.push(...newProgramStageDataElements);
    clonedMetadata.dataElements.push(...newDataElements);
    clonedMetadata.optionSets.push(...newOptionSets);
    clonedMetadata.options.push(...newOptions);
    members.forEach((member) => {
      const foundInSkippedOrgUnits = skippedOrgUnits.find((sou) => sou.id === member.id);
      if (!foundInSkippedOrgUnits) {
        clonedMetadata.programs[0].organisationUnits.push({
          id: member.id
        });
      }
    });
    setStepData("summary", "metadataPackage", clonedMetadata);
  }, []);

  return (
    <div className="w-full flex flex-col">
      <div className="font-bold text-[20px]">{t("summary")}</div>
      <div>{t("summaryParagraph1")}</div>
      <br />
      {metadataPackage && (
        <div>
          <DataTable scrollHeight="450px">
            <DataTableHead>
              <DataTableRow>
                <DataTableColumnHeader fixed top="0">
                  {t("dataMetadata")}
                </DataTableColumnHeader>
                <DataTableColumnHeader fixed top="0">
                  {t("willBeImported")}
                </DataTableColumnHeader>
                <DataTableColumnHeader fixed top="0">
                  {t("willBeSkipped")}
                </DataTableColumnHeader>
                <DataTableColumnHeader fixed top="0">
                  {t("description")}
                </DataTableColumnHeader>
              </DataTableRow>
            </DataTableHead>
            <DataTableBody>
              {Object.keys(metadataPackage).map((key) => {
                console.log(key);
                const foundSchema = schemas.find((schema) => schema.plural === key);
                const currentMetadata = metadataPackage[key];
                return (
                  <DataTableRow>
                    <DataTableCell>{foundSchema.displayName}</DataTableCell>
                    <DataTableCell>{currentMetadata.length}</DataTableCell>
                    <DataTableCell>{0}</DataTableCell>
                    <DataTableCell>
                      <div className="underline cursor-pointer">{t("show")}</div>
                    </DataTableCell>
                  </DataTableRow>
                );
              })}
              <DataTableRow>
                <DataTableCell>{t("facility")}</DataTableCell>
                <DataTableCell>{members.length - skippedOrgUnits.length}</DataTableCell>
                <DataTableCell>{skippedOrgUnits.length}</DataTableCell>
                <DataTableCell>{<div className="underline cursor-pointer">{t("show")}</div>}</DataTableCell>
              </DataTableRow>
            </DataTableBody>
          </DataTable>
        </div>
      )}
      <br />
      <div>{t("validSummary")}</div>
    </div>
  );
};

export default Summary;
