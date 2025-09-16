import { pull, push } from "./fetch";
import { TRACKED_ENTITY_ATTRIBUTES } from "@/const";
import useMetadataStore from "@/states/metadata";
const { ATTRIBUTE_CODE } = TRACKED_ENTITY_ATTRIBUTES;

const getFacilityTeis = async (orgUnit) => {
  const { systemInfo } = useMetadataStore.getState();
  let url = "";
  if (systemInfo.version >= "2.42") {
    url = `/api/tracker/trackedEntities?program=dJELklAE1ZZ&orgUnit=${orgUnit}&ouMode=DESCENDANTS&fields=*&paging=false`;
  } else {
    url = `/api/tracker/trackedEntities?program=dJELklAE1ZZ&orgUnit=${orgUnit}&ouMode=DESCENDANTS&fields=*&skipPaging=true`;
  }

  const result = await pull(url);
  if (result.instances) {
    return result.instances;
  }
  if (result.trackedEntities) {
    return result.trackedEntities;
  }
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
    "/api/tracker?async=false&skipSideEffects=true&skipRuleEngine=true",
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
  let teis = null;
  if (result.instances) {
    teis = result.instances;
  }
  if (result.trackedEntities) {
    teis = result.trackedEntities;
  }

  if (teis && teis.length > 0) {
    if (teis[0].trackedEntity === trackedEntity) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
  }
};

export { getFacilityTeis, postEvent, postTei, getTeiById, findFacilityByCode, postTeis };
