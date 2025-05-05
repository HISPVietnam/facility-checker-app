import { pull, push } from "./fetch";
import { TRACKED_ENTITY_ATTRIBUTES, DATA_STORE_NAMESPACE } from "@/const";
import useMetadataStore from "@/states/metadata";
const { ATTRIBUTE_CODE } = TRACKED_ENTITY_ATTRIBUTES;

const getFacilityTeis = async (orgUnit) => {
  const result = await pull(`/api/tracker/trackedEntities?program=dJELklAE1ZZ&orgUnit=${orgUnit}&ouMode=ACCESSIBLE&fields=*&skipPaging=true`);
  return result.instances;
};

const getTeiById = async (teiId) => {
  const result = await pull(`/api/tracker/trackedEntities/${teiId}?program=dJELklAE1ZZ&fields=*`);
  return result;
};

const postEvent = async (event) => {
  const result = await push(
    "/api/tracker?async=false",
    {
      events: [event]
    },
    "POST"
  );
  return result;
};

const postTei = async (tei) => {
  const result = await push(
    "/api/tracker?async=false",
    {
      trackedEntities: [tei]
    },
    "POST"
  );
  return result;
};

const postTeis = async (teis) => {
  const result = await push(
    "/api/tracker?async=false",
    {
      trackedEntities: teis
    },
    "POST"
  );
  return result;
};

const findEventByDataElement = async (dataElement, value) => {
  const result = await pull(`/api/tracker/events?program=dJELklAE1ZZ&ouMode=ACCESSIBLE&fields=*&skipPaging=true`);
  return result.instances;
};

const findFacilityByCode = async (trackedEntity, code) => {
  const { orgUnits } = useMetadataStore.getState();
  const root = orgUnits.find((ou) => ou.level === 1);
  const result = await pull(
    `/api/tracker/trackedEntities?orgUnit=${root.id}&ouMode=DESCENDANTS&program=dJELklAE1ZZ&filter=${ATTRIBUTE_CODE}:eq:${code}`
  );
  if (result.instances.length > 0) {
    if (result.instances[0].trackedEntity === trackedEntity) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

const getDataStore = async () => {
  const result = await pull(`/api/dataStore/${DATA_STORE_NAMESPACE}?fields=.`);
};

const saveDataStore = async (key, value, type) => {
  const result = await push(`/api/dataStore/${DATA_STORE_NAMESPACE}/${key}`, value, type === "CREATE" ? "POST" : "PUT", null);
  return result;
};

export { getFacilityTeis, postEvent, postTei, getTeiById, findFacilityByCode, postTeis, getDataStore, saveDataStore };
