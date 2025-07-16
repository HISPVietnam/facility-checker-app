import { format } from "date-fns";

import {
  DATA_ELEMENTS,
  MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE,
  TRACKED_ENTITY_ATTRIBUTES,
  TRACKED_ENTITY_TYPE,
} from "@/const";

import useInstallationModuleStore from "@/states/installationModule";
import useMetadataStore from "@/states/metadata";
import { generateUid } from "@/utils";
import { sub } from "date-fns";

const convertData = (clonedMetadata) => {
  //remove when move function to component
  const { orgUnitGroups } = useMetadataStore.getState();
  const { actions, selectGroupSets } = useInstallationModuleStore.getState();
  const { setStepData } = actions;
  const { members, skippedOrgUnits } = selectGroupSets;
  //
  const filteredMembers = members.filter(
    (member) => !skippedOrgUnits.some((ou) => ou.id === member.id)
  );
  let trackedEntities = [];
  filteredMembers.forEach((member) => {
    const previousDate = format(sub(new Date(), { days: 1 }), "yyyy-MM-dd");
    const trackedEntityId = generateUid();
    const enrollmentId = generateUid();
    const eventId = generateUid();
    const trackedEntity = {
      trackedEntity: trackedEntityId,
      trackedEntityType: TRACKED_ENTITY_TYPE,
      orgUnit: member.id,
      ...(member.geometry ? { geometry: member.geometry } : {}),
      attributes: [
        {
          attribute: TRACKED_ENTITY_ATTRIBUTES.ACTIVE_STATUS, //active status
          value: "open",
        },
        {
          attribute: TRACKED_ENTITY_ATTRIBUTES.ATTRIBUTE_CODE, //code
          value: member.code,
        },
        {
          attribute: TRACKED_ENTITY_ATTRIBUTES.UID, //dhis2 uid
          value: member.name,
        },
      ],
    };
    const enrollment = {
      trackedEntity: trackedEntityId,
      enrollment: enrollmentId,
      program: clonedMetadata.programs[0].id,
      orgUnit: member.id,
      status: "ACTIVE",
      enrolledAt: previousDate,
      occurredAt: previousDate,
      ...(member.geometry ? { geometry: member.geometry } : {}),
    };
    const event = {
      trackedEntity: trackedEntityId,
      enrollment: enrollmentId,
      event: eventId,
      program: clonedMetadata.programs[0].id,
      programStage: clonedMetadata.programStages[0].id,
      occurredAt: previousDate,
      scheduledAt: previousDate,
      orgUnit: member.id,
      status: "COMPLETED",
      ...(member.geometry ? { geometry: member.geometry } : {}),
      dataValues: clonedMetadata.dataElements
        .map((de) => {
          if (de.description?.includes("FCGS")) {
            const ouGroups = member.organisationUnitGroups
              .filter((oug) => {
                const foundOuGroup = orgUnitGroups.find(
                  (ouGroup) => ouGroup.id === oug.id
                );
                if (
                  foundOuGroup.groupSets.some(
                    (gs) => gs.id === de.description.replace("FCGS:", "")
                  )
                ) {
                  return oug;
                }
              })
              .map((oug) => oug.id);
            return {
              dataElement: de.id,
              value: JSON.stringify(ouGroups),
            };
          }
          switch (de.id) {
            case DATA_ELEMENTS.ATTRIBUTE_VALUES:
              return {
                dataElement: de.id,
                value: JSON.stringify(member.attributeValues),
              };
            case DATA_ELEMENTS.TRANSLATIONS:
              return {
                dataElement: de.id,
                value: JSON.stringify(member.translations),
              };
            case DATA_ELEMENTS.CLOSED_DATE:
            case DATA_ELEMENTS.OPENING_DATE:
              return {
                dataElement: de.id,
                value: member[MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE[de.id]]
                  ? format(
                      new Date(
                        member[MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE[de.id]]
                      ),
                      "yyyy-MM-dd"
                    )
                  : "",
              };
            case DATA_ELEMENTS.ACTIVE_STATUS:
              return {
                dataElement: de.id,
                value: "open",
              };
            case DATA_ELEMENTS.REASON_FOR_REJECT:
            case DATA_ELEMENTS.IS_NEW_FACILITY:
            case DATA_ELEMENTS.APPROVED_BY:
            case DATA_ELEMENTS.APPROVAL_STATUS:
            case DATA_ELEMENTS.IMAGE:
            case DATA_ELEMENTS.APPROVED_AT:
              return;
            case DATA_ELEMENTS.SYNC_NUMBER:
              return {
                dataElement: de.id,
                value: "0",
              };
            default:
              return {
                dataElement: de.id,
                value:
                  member[MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE[de.id]] ||
                  "",
              };
          }
        })
        .filter(Boolean),
    };
    enrollment.events = [event];
    trackedEntity.enrollments = [enrollment];
    trackedEntities.push(trackedEntity);
  });
  setStepData("summary", "data", trackedEntities);
};

export default convertData;
