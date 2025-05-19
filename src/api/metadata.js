import { pull, push } from "./fetch";
import { DATA_STORE_NAMESPACE } from "@/const";
const getOrgUnits = async () => {
  const result = await pull(
    "/api/organisationUnits?paging=false&fields=id,name,code,openingDate,closedDate,contactPerson,attributeValues,url,address,email,active,phoneNumber,shortName,path,parent,ancestors[id,level],translations,level,organisationUnitGroups"
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
  const result = await pull("/api/organisationUnitGroupSets?fields=id,name,items,translations&paging=false");
  return result.organisationUnitGroupSets;
};

const getMe = async () => {
  const result = await pull("/api/me?fields=*,organisationUnits[id,name,level],userRoles[id,name,authorities]");
  return result;
};

const getProgram = async () => {
  const program = await pull("/api/programs/dJELklAE1ZZ/metadata");
  return program;
};

const getUsers = async () => {
  const result = await pull("/api/users?fields=id,username,firstName,surname,userGroups[id]&paging=false");
  return result.users;
};

const getCustomAttributes = async () => {
  const result = await pull("/api/attributes?paging=false&fields=organisationUnitAttribute,id,name,translations,valueType");
  return result.attributes.filter((attr) => attr.organisationUnitAttribute === true);
};

const getSchemas = async () => {
  const result = await pull("/api/schemas?fields=klass,plural,displayName");
  return result.schemas;
};

const getUserByIds = async (userIds) => {
  const result = await pull(`/api/users?fields=id,userRoles&filter=id:in:[${userIds.join(",")}]`);
  return result.users;
};

const addUserRole = async (userId, userRoles) => {
  const result = await push(
    `/api/users/${userId}`,
    [
      {
        op: "add",
        path: "/userRoles",
        value: userRoles
      }
    ],
    "PATCH",
    "application/json-patch+json"
  );
};

const pushMetadata = async (metadata) => {
  const result = await push("/api/metadata?async=false", metadata, "POST");
};
const getDataStore = async () => {
  const result = await pull(`/api/dataStore/${DATA_STORE_NAMESPACE}?fields=.&pageSize=1000`);
  return result;
};

const saveDataStore = async (key, value, type) => {
  const result = await push(`/api/dataStore/${DATA_STORE_NAMESPACE}/${key}`, value, type === "CREATE" ? "POST" : "PUT", null);
  return result;
};

const getSystemInfo = async () => {
  const result = await pull("/api/system/info");
  return result;
};

export {
  getOrgUnits,
  getOrgUnitGeoJson,
  getOrgUnitGroupSets,
  getOrgUnitLevels,
  getMe,
  getProgram,
  getUsers,
  getOrgUnitGroups,
  getCustomAttributes,
  getSchemas,
  getUserByIds,
  addUserRole,
  pushMetadata,
  getDataStore,
  saveDataStore,
  getSystemInfo
};
