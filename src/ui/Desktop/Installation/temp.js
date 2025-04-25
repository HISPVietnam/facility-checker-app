import { MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE } from "@/const";
import useInstallationModuleStore from "@/states/installationModule";
import useMetadataStore from "@/states/metadata";
import { generateUid } from "@/utils";
import { format } from "date-fns";

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
    const trackedEntityId = generateUid();
    const enrollmentId = generateUid();
    const eventId = generateUid();
    const trackedEntity = {
      trackedEntity: trackedEntityId,
      trackedEntityType: clonedMetadata.trackedEntityTypes[0].id,
      orgUnit: member.id,
      ...(member.geometry ? { geometry: member.geometry } : {}),
      attributes: [
        {
          attribute: "PUYl7QIbEov", //active status
          value: "open",
        },
        {
          attribute: "d9FXpa9ndGO", //code
          value: member.code,
        },
        {
          attribute: "prbjtVvKNet", //dhis2 uid
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
      enrolledAt: format(new Date(), "yyyy-MM-dd"),
      occurredAt: format(new Date(), "yyyy-MM-dd"),
      scheduledAt: format(new Date(), "yyyy-MM-dd"),
      ...(member.geometry ? { geometry: member.geometry } : {}),
    };
    const event = {
      trackedEntity: trackedEntityId,
      enrollment: enrollmentId,
      event: eventId,
      program: clonedMetadata.programs[0].id,
      programStage: clonedMetadata.programStages[0].id,
      occurredAt: format(new Date(), "yyyy-MM-dd"),
      scheduledAt: format(new Date(), "yyyy-MM-dd"),
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
            case "rMnWeGTBnKo":
              return {
                dataElement: de.id,
                value: JSON.stringify(member.attributeValues),
              };
            case "pf27agpzDak":
              return {
                dataElement: de.id,
                value: JSON.stringify(member.translations),
              };
            case "wetRbzCTyYO":
            case "guutPq3seaj":
            case "jmUQ1B95ZP9":
            case "m75JpouZBy8":
            case "p4m3y1jLgpv":
            case "QRaMM9LMM3y":
            case "z3Qe8czE7LE":
              return;

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
