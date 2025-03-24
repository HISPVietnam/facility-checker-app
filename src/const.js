const DATA_ELEMENTS = {
  PATH: "eqSFoW6vuam",
  UID: "jDSCfb245G5",
  NAME: "z6u0MJRMxOw",
  APPROVAL_STATUS: "p4m3y1jLgpv",
  SYNCED: "m75JpouZBy8",
  ATTRIBUTE_VALUES: "rMnWeGTBnKo",
  TRANSLATIONS: "pf27agpzDak",
  APPROVED_BY: "jmUQ1B95ZP9",
  REASON_FOR_REJECT: "wetRbzCTyYO",
  ACTIVE_STATUS: "WvwRmFG7udm",
  IS_NEW_FACILITY: "guutPq3seaj",
  SHORT_NAME: "eb7SYR3EHEZ",
  OPENING_DATE: "PCoXOnxAzwr",
  CODE: "nEAFd0oKJzb"
};
const TRACKED_ENTITY_ATTRIBUTES = {
  UID: "prbjtVvKNet",
  ACTIVE_STATUS: "PUYl7QIbEov",
  ATTRIBUTE_CODE: "d9FXpa9ndGO"
};
const TRACKED_ENTITY_TYPE = "ER5qgJDCfUh";
const PROFILE_LOGS_PROGRAM_STAGE_ID = "VdBma23iRTw";
const PROGRAM_ID = "dJELklAE1ZZ";
const HIDDEN_DATA_ELEMENTS = [
  DATA_ELEMENTS.UID,
  DATA_ELEMENTS.ATTRIBUTE_VALUES,
  DATA_ELEMENTS.TRANSLATIONS,
  DATA_ELEMENTS.SYNCED,
  DATA_ELEMENTS.APPROVAL_STATUS,
  DATA_ELEMENTS.APPROVED_BY,
  DATA_ELEMENTS.REASON_FOR_REJECT,
  DATA_ELEMENTS.IS_NEW_FACILITY
];

const MANDATORY_FIELDS = [DATA_ELEMENTS.NAME, DATA_ELEMENTS.PATH, DATA_ELEMENTS.SHORT_NAME, DATA_ELEMENTS.OPENING_DATE];

const CUSTOM_COLUMNS_LIST_VIEW = [
  {
    id: "status",
    name: "status",
    optionSet: null,
    position: 0
  },
  {
    id: "coordinates",
    name: "coordinates",
    optionSet: null,
    position: 2
  }
];

const BASE_LAYER_TYPES = {
  satellite: {
    attribution: `&copy; <a href="http://www.esri.com/">Esri</a> i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community`,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  },
  normal: {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png"
  }
};

export {
  DATA_ELEMENTS,
  PROFILE_LOGS_PROGRAM_STAGE_ID,
  PROGRAM_ID,
  HIDDEN_DATA_ELEMENTS,
  CUSTOM_COLUMNS_LIST_VIEW,
  BASE_LAYER_TYPES,
  MANDATORY_FIELDS,
  TRACKED_ENTITY_TYPE,
  TRACKED_ENTITY_ATTRIBUTES
};
