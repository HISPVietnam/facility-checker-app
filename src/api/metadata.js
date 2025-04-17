import { pull } from "./fetch";

const getOrgUnits = async () => {
  const result = await pull(
    "/api/organisationUnits?paging=false&fields=id,name,shortName,path,parent,ancestors[id,level],translations,level,organisationUnitGroups"
  );
  return result.organisationUnits;
};
const getOrgUnitGeoJson = async () => {
  const orgUnitLevelResult = await pull("/api/organisationUnitLevels?paging=false");
  let orgUnitGeoJsonUrl = "/api/organisationUnits.geojson";
  const levels = [];
  for (let i = 1; i <= orgUnitLevelResult.organisationUnitLevels.length; i++) {
    levels.push(i);
  }
  if (levels.length > 0) {
    orgUnitGeoJsonUrl += `?${levels.map((level) => `level=${level}`).join("&")}`;
  }

  const result = await pull(orgUnitGeoJsonUrl);
  return result;
};
const getOrgUnitLevels = async () => {
  const result = await pull("/api/organisationUnitLevels?paging=false&fields=*");
  return result.organisationUnitLevels;
};
const getOrgUnitGroups = async () => {
  const result = await pull("/api/organisationUnitGroups?paging=false&fields=*,!organisationUnits");
  return result.organisationUnitGroups;
};
const getOrgUnitGroupSets = async () => {
  const result = await pull("/api/organisationUnitGroupSets?fields=id,name,items&paging=false");
  return result.organisationUnitGroupSets;
};

const getMe = async () => {
  const result = await pull("/api/me?fields=*");
  return result;
};

const getProgram = async () => {
  const program = await pull("/api/programs/dJELklAE1ZZ/metadata");
  return program;
};

const getCustomAttributes = async () => {
  const result = await pull("/api/attributes?paging=false&fields=organisationUnitAttribute,id,name,translations,valueType");
  return result.attributes.filter((attr) => attr.organisationUnitAttribute === true);
};

export { getOrgUnits, getOrgUnitGeoJson, getOrgUnitGroupSets, getOrgUnitLevels, getMe, getProgram, getOrgUnitGroups, getCustomAttributes };
