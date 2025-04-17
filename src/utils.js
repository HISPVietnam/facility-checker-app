import { PROFILE_LOGS_PROGRAM_STAGE_ID, PROGRAM_ID, DATA_ELEMENTS, TRACKED_ENTITY_ATTRIBUTES } from "./const";
import useMetadataStore from "./states/metadata";
import useDataStore from "./states/data";
import { point, polygon, multiPolygon, booleanPointInPolygon, featureCollection, nearestPoint } from "@turf/turf";
import _ from "lodash";
const { APPROVAL_STATUS, PATH, UID, NAME } = DATA_ELEMENTS;
const { ATTRIBUTE_CODE } = TRACKED_ENTITY_ATTRIBUTES;

const pickTranslation = (object, language, field) => {
  const fieldMapping = {
    formName: "FORM_NAME",
    name: "NAME"
  };
  const foundTranslation = object.translations.find((t) => t.property === fieldMapping[field] && t.locale === language);
  return foundTranslation ? foundTranslation.value : object[field] || object["displayFormName"] || object["displayName"] || object["name"];
};

const isValidPoint = (lat, lng) => {
  return typeof lat === "number" && typeof lng === "number" && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

const isInsideParent = (path, lat, long) => {
  let isInside = true;
  const { orgUnitGeoJson } = useMetadataStore.getState();
  const currentOrgUnits = _.compact(path.split("/"));
  while (true) {
    const currentParent = currentOrgUnits.pop();
    const foundParent = orgUnitGeoJson.features.find((f) => f.id === currentParent);
    if (foundParent && foundParent.geometry && (foundParent.geometry.type === "Polygon" || foundParent.geometry.type === "MultiPolygon")) {
      const withinPolygon = booleanPointInPolygon(point([long, lat]), foundParent.geometry);
      if (!withinPolygon) {
        isInside = false;
      }
      break;
    }
    if (!currentParent) {
      break;
    }
  }
  return isInside;
};

const convertEvent = (event, dataElements) => {
  const convertedEvent = {
    occurredAt: event.occurredAt,
    latitude: "",
    longitude: "",
    status: event.status,
    isNew: false,
    event: event.event,
    completedAt: event.completedAt,
    updatedBy: event.updatedBy
  };
  if (event.geometry) {
    convertedEvent.latitude = event.geometry.coordinates[1];
    convertedEvent.longitude = event.geometry.coordinates[0];
  }
  dataElements.forEach((de) => {
    const value = findDataValue(event, de.id);
    if (value) {
      convertedEvent[de.id] = value;
    }
  });
  return convertedEvent;
};

const getLatestValues = (events, program, includeActiveEvents = true) => {
  const latestValues = {};
  let tempEvents = events;
  if (!includeActiveEvents) {
    tempEvents = events
      .filter((event) => event.status !== "ACTIVE")
      .filter((event) => event[APPROVAL_STATUS] !== "pending" && event[APPROVAL_STATUS] !== "approved");
  }
  program.dataElements.forEach((de) => {
    const foundEvent = tempEvents.find((event) => {
      const foundDataValue = event[de.id];
      if (foundDataValue) {
        return true;
      }
    });
    if (foundEvent) {
      const foundValue = foundEvent[de.id];
      latestValues[de.id] = foundValue;
    } else {
      latestValues[de.id] = "";
    }
  });
  const foundEvent = tempEvents.find((event) => event.latitude && event.longitude);
  if (foundEvent) {
    latestValues.latitude = foundEvent.latitude;
    latestValues.longitude = foundEvent.longitude;
  }

  return latestValues;
};

const convertToDhis2Event = (event, program) => {
  const convertedEvent = {
    event: event.event,
    trackedEntity: event.tei,
    enrollment: event.enr,
    orgUnit: event.orgUnit,
    programStage: PROFILE_LOGS_PROGRAM_STAGE_ID,
    program: PROGRAM_ID,
    occurredAt: event.occurredAt,
    scheduledAt: event.occurredAt,
    dataValues: [],
    status: event.status
  };

  if (event.latitude && event.longitude) {
    convertedEvent.geometry = {
      type: "Point",
      coordinates: [event.longitude, event.latitude]
    };
  }

  program.dataElements.forEach((de) => {
    if (event[de.id]) {
      convertedEvent.dataValues.push({
        dataElement: de.id,
        value: event[de.id]
      });
    }
  });
  return convertedEvent;
};

const convertTeis = (teis, program) => {
  const convertedTeis = teis.map((tei) => {
    const facility = {
      hidden: tei.hidden,
      orgUnit: tei.enrollments[0].orgUnit,
      tei: tei.trackedEntity,
      enr: tei.enrollments[0].enrollment,
      code: findAttributeValue(tei, ATTRIBUTE_CODE),
      events: tei.enrollments[0].events.map((event) => {
        return convertEvent(event, program.dataElements);
      })
    };
    const foundPendingEvent = facility.events.find((event) => event[APPROVAL_STATUS] === "pending");
    facility.isPending = foundPendingEvent ? true : false;
    const latestValues = getLatestValues(facility.events, program);
    const previousValues = getLatestValues(facility.events, program, false);
    const newFacility = {
      ...latestValues,
      ...facility,
      previousValues: previousValues
    };
    return newFacility;
  });
  return convertedTeis;
};

const findAttributeValue = (tei, attribute) => {
  const foundAttributeValue = tei.attributes.find((attr) => attr.attribute.id === attribute);
  return foundAttributeValue ? foundAttributeValue.value : "";
};

const findDataValue = (event, dataElement) => {
  const foundDataValue = event.dataValues.find((dv) => dv.dataElement === dataElement);
  return foundDataValue ? foundDataValue.value : "";
};

const findCustomAttributeValue = (attributeValues, attribute) => {
  if (!attributeValues) {
    return "";
  }
  const array = JSON.parse(attributeValues);
  if (array.length === 0) {
    return "";
  }
  const found = array.find((attr) => attr.attribute.id === attribute);
  return found ? found.value : "";
};

const convertDisplayValue = (program, field, value) => {
  let foundField = null;
  let optionSet = null;
  const foundAttribute = program.trackedEntityAttributes.find((tea) => tea.id === field);
  const foundDataElement = program.dataElements.find((de) => de.id === field);
  foundField = foundAttribute ? foundAttribute : foundDataElement;
  if (!foundField) {
    return "INVALID FIELD";
  }
  if (foundField.optionSet) {
    optionSet = program.optionSets.find((os) => os.id === foundField.optionSet.id);
  }

  switch (foundField.valueType) {
    case "INTEGER_POSITIVE":
    case "INTEGER_NEGATIVE":
    case "INTEGER_ZERO_OR_POSITIVE":
    case "PERCENTAGE":
    case "NUMBER":
    case "INTEGER":
    case "PHONE_NUMBER":
    case "TEXT-COORDINATES":
      return value;
    case "TEXT":
    case "EMAIL":
    case "LONG_TEXT":
      return value;
    case "AGE":
      return "AGE";
    case "AGE_NOW":
      return "AGE_NOW";
    case "DATE":
      return "DATE";
    case "DATETIME":
      return "DATE_TIME";
    case "BOOLEAN":
      return "BOOLEAN";
    case "TRUE_ONLY":
      return "TRUE_ONLY";
    case "CASCADER":
      return "CASCADER";
    case "ORGANISATION_UNIT":
      return "ORGANISATION_UNIT";
    case "COORDINATE":
      return "COORDINATE";
    case "IMAGE":
      return "IMAGE";
    case "FILE_RESOURCE":
      return "FILE_RESOURCE";
    case "TIME":
      return "TIME";
    default:
      return "UNSUPPORTED VALUE TYPE";
  }
};

const convertDisplayValueForPath = (value, tempValue) => {
  if (!value) return "";
  const { orgUnits, locale } = useMetadataStore.getState();
  const { facilities } = useDataStore.getState();
  const currentOrgUnits = _.compact(value.split("/"));
  // currentOrgUnits.pop();
  const foundOrgUnits = currentOrgUnits.map((ou) => {
    const foundOrgUnit = orgUnits.find((o) => o.id === ou);
    const foundFacility = facilities.find((f) => f[UID] === ou);
    if (foundFacility) {
      return foundFacility[NAME];
    } else {
      return foundOrgUnit ? pickTranslation(foundOrgUnit, locale, "name") : tempValue;
    }
  });
  return foundOrgUnits.join(" / ");
};

const sample = (d = [], fn = Math.random) => {
  if (d.length === 0) return;
  return d[Math.round(fn() * (d.length - 1))];
};

const generateUid = (limit = 11, fn = Math.random) => {
  const allowedLetters = ["abcdefghijklmnopqrstuvwxyz", "ABCDEFGHIJKLMNOPQRSTUVWXYZ"].join("");
  const allowedChars = ["0123456789", allowedLetters].join("");
  const arr = [sample(allowedLetters, fn)];
  for (let i = 0; i < limit - 1; i++) {
    arr.push(sample(allowedChars, fn));
  }
  return arr.join("");
};

const checkFacilityCode = (code) => {};

const isNoCoordinates = (facility) => {
  if (!facility.latitude || !facility.longitude) {
    return true;
  } else {
    return false;
  }
};
const isWrongLocation = (facility) => {
  if (!facility.latitude || !facility.longitude) {
    return false;
  }
  const ancestors = facility[PATH].split("/");
  ancestors.reverse();
  const orgUnitGeoJson = useMetadataStore.getState().orgUnitGeoJson;
  let isOutside = false;
  const currentPoint = point([facility.longitude, facility.latitude]);
  for (let i = 1; i < ancestors.length; i++) {
    const foundParent = orgUnitGeoJson.features.find((f) => f.id === ancestors[i]);
    if (foundParent) {
      const type = foundParent.geometry.type;
      let currentPolygon;
      if (type === "Polygon") {
        currentPolygon = polygon(foundParent.geometry.coordinates);
      }
      if (type === "MultiPolygon") {
        currentPolygon = multiPolygon(foundParent.geometry.coordinates);
      }
      isOutside = !booleanPointInPolygon(currentPoint, currentPolygon);
      break;
    }
  }
  return isOutside;
};

const isTooCloseToEachOther = (facility) => {
  if (!facility.latitude || !facility.longitude) {
    return false;
  }
  const facilities = useDataStore.getState().facilities;
  let tooCloseToOtherFacility = false;
  const currentPoint = point([facility.longitude, facility.latitude]);
  const points = featureCollection(
    facilities
      .filter((f) => f.latitude && f.longitude && f[UID] !== facility[UID])
      .map((f) => {
        return point([f.longitude, f.latitude]);
      })
  );
  const currentNearestPoint = nearestPoint(currentPoint, points);
  tooCloseToOtherFacility = currentNearestPoint.properties.distanceToPoint < 2;
  return tooCloseToOtherFacility;
};

const belongToMultipleGroups = (facility) => {
  let passed = false;
  const program = useMetadataStore.getState().program;
  const dataElements = program.dataElements.filter((de) => de.description && de.description.includes("FCGS"));
  dataElements.forEach((de) => {
    const value = facility[de.id];
    if (value) {
      const converted = JSON.parse(value);
      if (converted.length > 1) {
        passed = true;
      }
    }
  });
  return passed;
};

const isNotInGroup = (facility, de) => {
  let passed = false;
  if (!facility[de.id]) {
    passed = true;
  }
  return passed;
};

const isNotSentForApproval = (facility) => {
  let passed = false;
  const foundActiveEvent = facility.events.find((event) => event.status === "ACTIVE");
  if (foundActiveEvent) {
    passed = true;
  }
  return passed;
};

const isWaitingForApproval = (facility) => {
  let passed = false;
  const foundPendingEvent = facility.events.find((event) => event.status === "COMPLETED" && event[APPROVAL_STATUS] === "pending");
  if (foundPendingEvent) {
    passed = true;
  }
  return passed;
};

export {
  pickTranslation,
  isValidPoint,
  isInsideParent,
  convertTeis,
  findAttributeValue,
  findDataValue,
  findCustomAttributeValue,
  convertDisplayValue,
  getLatestValues,
  generateUid,
  convertToDhis2Event,
  isNoCoordinates,
  isWrongLocation,
  isTooCloseToEachOther,
  belongToMultipleGroups,
  isNotInGroup,
  isNotSentForApproval,
  isWaitingForApproval,
  convertDisplayValueForPath
};
