import {
  DATA_ELEMENTS,
  MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE,
} from "@/const";
import useMetadataStore from "@/states/metadata";
const {
  APPROVAL_STATUS,
  APPROVED_BY,
  APPROVED_AT,
  REJECTED_BY,
  REJECTED_AT,
  REASON_FOR_REJECT,
  ATTRIBUTE_VALUES,
  TRANSLATIONS,
  PATH,
} = DATA_ELEMENTS;
const excludeFields = [
  APPROVAL_STATUS,
  APPROVED_BY,
  APPROVED_AT,
  REJECTED_BY,
  REJECTED_AT,
  REASON_FOR_REJECT,
  ATTRIBUTE_VALUES,
];

const buildPayload = (base = {}, entries = []) => {
  const dataElementsForGroupSet = useMetadataStore
    .getState()
    .program.dataElements.filter((de) => de.description?.includes("FCGS"));
  return entries.reduce(
    (acc, { dataElement, value }) => {
      if (!value || excludeFields.includes(dataElement)) return acc;

      if (dataElementsForGroupSet.some((de) => dataElement === de.id)) {
        const id = JSON.parse(value)?.[0];
        return {
          ...acc,
          organisationUnitGroups: [...acc.organisationUnitGroups, { id }],
        };
      }

      switch (dataElement) {
        case "longitude":
        case "latitude": {
          const [lng, lat] = acc.geometry?.coordinates || [0, 0];
          const coordIndex = dataElement === "longitude" ? 0 : 1;
          const newCoords = [...[lng, lat]];
          newCoords[coordIndex] = parseFloat(value);
          return {
            ...acc,
            geometry: { type: "Point", coordinates: newCoords },
          };
        }
        case ATTRIBUTE_VALUES:
        case TRANSLATIONS:
          return {
            ...acc,
            [MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE[dataElement]]:
              JSON.parse(value),
          };

        case PATH:
          return {
            ...acc,
            parent: {
              id: value.split("/")[value.split("/").length - 2],
            },
          };
        default:
          if (MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE[dataElement]) {
            return {
              ...acc,
              [MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE[dataElement]]: value,
            };
          }
          return acc;
      }
    },
    {
      ...base,
      oldOrganisationUnitGroups: base.organisationUnitGroups || [],
      organisationUnitGroups: [],
    }
  );
};

const extractDataValues = (f, dataElements) =>
  ["latitude", "longitude", ...dataElements].map((de) => {
    const id = typeof de === "string" ? de : de.id;
    return { dataElement: id, value: f[id] || f[de] || "" };
  });

const getOrgUnitGroupUpdates = (orgUnits) => {
  const addList = [];
  const deleteList = [];

  orgUnits.forEach(
    ({ id: orgUnitId, oldOrganisationUnitGroups, organisationUnitGroups }) => {
      const oldGroupIds = oldOrganisationUnitGroups.map((g) => g.id);
      const newGroupIds = organisationUnitGroups.map((g) => g.id);

      // Add: in new but not in old
      newGroupIds.forEach((groupId) => {
        if (!oldGroupIds.includes(groupId)) {
          addList.push(
            `/api/organisationUnitGroups/${groupId}/organisationUnits/${orgUnitId}`
          );
        }
      });

      // Delete: in old but not in new
      oldGroupIds.forEach((groupId) => {
        if (!newGroupIds.includes(groupId)) {
          deleteList.push(
            `/api/organisationUnitGroups/${groupId}/organisationUnits/${orgUnitId}`
          );
        }
      });
    }
  );

  return { addList, deleteList };
};

export { buildPayload, extractDataValues, getOrgUnitGroupUpdates };
