import {
  faCheck,
  faPenToSquare,
  faRotate,
  faScrewdriverWrench,
} from "@fortawesome/free-solid-svg-icons";

const DATA_ELEMENTS = {
  PATH: "eqSFoW6vuam",
  UID: "jDSCfb245G5",
  NAME: "z6u0MJRMxOw",
  APPROVAL_STATUS: "p4m3y1jLgpv",
  SYNCED: "m75JpouZBy8",
  ATTRIBUTE_VALUES: "rMnWeGTBnKo",
  TRANSLATIONS: "pf27agpzDak",
  APPROVED_BY: "jmUQ1B95ZP9",
  APPROVED_AT: "z3Qe8czE7LE",
  REASON_FOR_REJECT: "wetRbzCTyYO",
  ACTIVE_STATUS: "WvwRmFG7udm",
  IS_NEW_FACILITY: "guutPq3seaj",
  SHORT_NAME: "eb7SYR3EHEZ",
  OPENING_DATE: "PCoXOnxAzwr",
  CODE: "nEAFd0oKJzb",
  DESCRIPTION: "L5YKpJEzCR1",
  CLOSED_DATE: "jR58BZSMB6B",
  URL: "kDreDTHEauZ",
  CONTACT_PERSON: "XioJoxZsHVn",
  EMAIL: "Wno4M1rmwHr",
  ADDRESS: "YLxv92NmyFD",
  PHONE_NUMBER: "HAOSMsp1TXB",
  TRANSLATIONS: "pf27agpzDak",
  IMAGE: "QRaMM9LMM3y",
};
const TRACKED_ENTITY_ATTRIBUTES = {
  UID: "prbjtVvKNet",
  ACTIVE_STATUS: "PUYl7QIbEov",
  ATTRIBUTE_CODE: "d9FXpa9ndGO",
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
  DATA_ELEMENTS.APPROVED_AT,
  DATA_ELEMENTS.REASON_FOR_REJECT,
  DATA_ELEMENTS.IS_NEW_FACILITY,
];

const MANDATORY_FIELDS = [
  DATA_ELEMENTS.NAME,
  DATA_ELEMENTS.PATH,
  DATA_ELEMENTS.SHORT_NAME,
  DATA_ELEMENTS.OPENING_DATE,
];

const CUSTOM_COLUMNS_LIST_VIEW = [
  {
    id: "status",
    name: "status",
    optionSet: null,
    position: 0,
  },
  {
    id: "coordinates",
    name: "coordinates",
    optionSet: null,
    position: 2,
  },
];

const BASE_LAYER_TYPES = {
  satellite: {
    attribution: `&copy; <a href="http://www.esri.com/">Esri</a> i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community`,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
  normal: {
    attribution: `&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`,
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}.png",
  },
};

const APPROVAL_FILTERS = [
  { id: "approved" },
  { id: "pending" },
  {
    id: "isNewFacility",
  },
];

const SYNCHRONIZATION_FILTERS = [
  { id: "synced" },
  { id: "notYetSynced" },
  {
    id: "isNewFacility",
  },
];

const STEPS = [
  "welcome",
  "selectGroupSets",
  "setupAuthorities",
  "summary",
  "install",
];
const APP_ROLES = [
  {
    name: "captureRole",
    description: "captureRoleDescription",
    borderColor: "border-cyan-700",
    color: "text-cyan-700",
    icon: faPenToSquare,
  },
  {
    name: "approvalRole",
    description: "approvalRoleDescription",
    borderColor: "border-green-700",
    color: "text-green-700",
    icon: faCheck,
  },
  {
    name: "synchronizationRole",
    description: "synchronizationRoleDescription",
    borderColor: "border-red-700",
    color: "text-red-700",
    icon: faRotate,
  },
  {
    name: "adminRole",
    description: "adminRoleDescription",
    borderColor: "border-amber-600",
    color: "text-amber-600",
    icon: faScrewdriverWrench,
  },
];

const USER_GROUPS = {
  CAPTURE: "m6GidmfEK48",
  APPROVAL: "xd865kZFSRw",
  SYNCHRONIZATION: "shYXBFb3lpw",
  ADMIN: "MJK6n5PLXM6",
};

const USER_ROLE = "WdelLCFTyqe";

const MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE = {
  [DATA_ELEMENTS.PATH]: "path",
  [DATA_ELEMENTS.NAME]: "name",
  [DATA_ELEMENTS.OPENING_DATE]: "openingDate",
  [DATA_ELEMENTS.CODE]: "code",
  [DATA_ELEMENTS.DESCRIPTION]: "description",
  [DATA_ELEMENTS.CLOSED_DATE]: "closedDate",
  [DATA_ELEMENTS.URL]: "url",
  [DATA_ELEMENTS.CONTACT_PERSON]: "contactPerson",
  [DATA_ELEMENTS.UID]: "id",
  [DATA_ELEMENTS.EMAIL]: "email",
  [DATA_ELEMENTS.SHORT_NAME]: "shortName",
  [DATA_ELEMENTS.ACTIVE_STATUS]: "active",
  [DATA_ELEMENTS.ADDRESS]: "address",
  [DATA_ELEMENTS.PHONE_NUMBER]: "phoneNumber",
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
  TRACKED_ENTITY_ATTRIBUTES,
  APPROVAL_FILTERS,
  SYNCHRONIZATION_FILTERS,
  STEPS,
  APP_ROLES,
  USER_GROUPS,
  USER_ROLE,
  MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE,
};
