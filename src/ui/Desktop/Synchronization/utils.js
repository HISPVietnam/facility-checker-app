import {
  DATA_ELEMENTS,
  MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE,
} from "@/const";
const {
  APPROVAL_STATUS,
  APPROVED_BY,
  APPROVED_AT,
  REJECTED_BY,
  REJECTED_AT,
  REASON_FOR_REJECT,
  ATTRIBUTE_VALUES,
  TRANSLATIONS,
  OWNERSHIP,
  TYPE,
  LOCATION,
  EMAIL,
  URL,
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

const buildPayload = (base = {}, entries = []) =>
  entries.reduce((acc, { dataElement, value }) => {
    if (!value || excludeFields.includes(dataElement)) return acc;

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
      case OWNERSHIP:
      case TYPE:
      case LOCATION: {
        const id = JSON.parse(value)?.[0];
        const currentGroups = acc.organisationUnitGroups || [];
        const alreadyExists = currentGroups.some((g) => g.id === id);
        return {
          ...acc,
          organisationUnitGroups: alreadyExists
            ? currentGroups
            : [...currentGroups, { id }],
        };
      }
      case EMAIL:
        return { ...acc, email: "test@gmail.com" };
      case URL:
        return { ...acc, url: "http://example.com" };
      default:
        if (MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE[dataElement]) {
          return {
            ...acc,
            [MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE[dataElement]]: value,
          };
        }
        return acc;
    }
  }, base);

const extractDataValues = (f, dataElements) =>
  ["latitude", "longitude", ...dataElements].map((de) => {
    const id = typeof de === "string" ? de : de.id;
    return { dataElement: id, value: f[id] || f[de] || "" };
  });

export { buildPayload, extractDataValues };
