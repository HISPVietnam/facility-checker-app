import {
  faCheck,
  faLanguage,
  faLayerGroup,
  faPenToSquare,
  faRotate,
  faScrewdriverWrench,
  faUsersGear,
} from "@fortawesome/free-solid-svg-icons";

const DATA_ELEMENTS = {
  PATH: "eqSFoW6vuam",
  UID: "jDSCfb245G5",
  NAME: "z6u0MJRMxOw",
  APPROVAL_STATUS: "p4m3y1jLgpv",
  ATTRIBUTE_VALUES: "rMnWeGTBnKo",
  TRANSLATIONS: "pf27agpzDak",
  APPROVED_BY: "jmUQ1B95ZP9",
  APPROVED_AT: "z3Qe8czE7LE",
  REJECTED_BY: "LSn3R8HJuFp",
  REJECTED_AT: "bLlrOgPdBvD",
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
  SYNC_NUMBER: "m75JpouZBy8",
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
  DATA_ELEMENTS.SYNC_NUMBER,
  DATA_ELEMENTS.APPROVAL_STATUS,
  DATA_ELEMENTS.APPROVED_BY,
  DATA_ELEMENTS.APPROVED_AT,
  DATA_ELEMENTS.REJECTED_BY,
  DATA_ELEMENTS.REJECTED_AT,
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
  { id: "rejected" },
  { id: "pending" },
  {
    id: "isNewFacility",
  },
  {
    id: "synced",
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

const DATA_STORE_NAMESPACE = "fca";

const CONFIGURATION_SUB_MODULES = [
  { key: "translations", icon: faLanguage },
  { key: "authorities", icon: faUsersGear },
  // { key: "orgUnitGroupSets", icon: faLayerGroup }
];

const NATIVE_LANGUAGES = {
  af: { name: "Afrikaans", flag: "za" },
  am: { name: "አማርኛ", flag: "et" },
  ar: { name: "العربية", flag: "sa" },
  az: { name: "Azərbaycan dili", flag: "az" },
  be: { name: "Беларуская", flag: "by" },
  bg: { name: "Български", flag: "bg" },
  bn: { name: "বাংলা", flag: "bd" },
  bs: { name: "Bosanski", flag: "ba" },
  ca: { name: "Català", flag: "es" },
  cs: { name: "Čeština", flag: "cz" },
  cy: { name: "Cymraeg", flag: "gb" },
  da: { name: "Dansk", flag: "dk" },
  de: { name: "Deutsch", flag: "de" },
  el: { name: "Ελληνικά", flag: "gr" },
  en: { name: "English", flag: "gb" },
  eo: { name: "Esperanto", flag: "eu" },
  es: { name: "Español", flag: "es" },
  et: { name: "Eesti", flag: "ee" },
  eu: { name: "Euskara", flag: "es" },
  fa: { name: "فارسی", flag: "ir" },
  fi: { name: "Suomi", flag: "fi" },
  fil: { name: "Filipino", flag: "ph" },
  fj: { name: "Vakaviti", flag: "fj" },
  fr: { name: "Français", flag: "fr" },
  ga: { name: "Gaeilge", flag: "ie" },
  gl: { name: "Galego", flag: "es" },
  gu: { name: "ગુજરાતી", flag: "in" },
  he: { name: "עברית", flag: "il" },
  hi: { name: "हिन्दी", flag: "in" },
  hr: { name: "Hrvatski", flag: "hr" },
  ht: { name: "Kreyòl ayisyen", flag: "ht" },
  hu: { name: "Magyar", flag: "hu" },
  hy: { name: "Հայերեն", flag: "am" },
  id: { name: "Bahasa Indonesia", flag: "id" },
  is: { name: "Íslenska", flag: "is" },
  it: { name: "Italiano", flag: "it" },
  ja: { name: "日本語", flag: "jp" },
  jv: { name: "Basa Jawa", flag: "id" },
  ka: { name: "ქართული", flag: "ge" },
  kk: { name: "Қазақ тілі", flag: "kz" },
  km: { name: "ខ្មែរ", flag: "kh" },
  kn: { name: "ಕನ್ನಡ", flag: "in" },
  ko: { name: "한국어", flag: "kr" },
  ku: { name: "Kurdî", flag: "iq" },
  ky: { name: "Кыргызча", flag: "kg" },
  lo: { name: "ພາສາລາວ", flag: "la" },
  lt: { name: "Lietuvių", flag: "lt" },
  lv: { name: "Latviešu", flag: "lv" },
  mk: { name: "Македонски", flag: "mk" },
  ml: { name: "മലയാളം", flag: "in" },
  mn: { name: "Монгол", flag: "mn" },
  mr: { name: "मराठी", flag: "in" },
  ms: { name: "Bahasa Melayu", flag: "my" },
  mt: { name: "Malti", flag: "mt" },
  my: { name: "မြန်မာစာ", flag: "mm" },
  ne: { name: "नेपाली", flag: "np" },
  nl: { name: "Nederlands", flag: "nl" },
  no: { name: "Norsk", flag: "no" },
  pa: { name: "ਪੰਜਾਬੀ", flag: "in" },
  pl: { name: "Polski", flag: "pl" },
  ps: { name: "پښتو", flag: "af" },
  pt: { name: "Português", flag: "pt" },
  ro: { name: "Română", flag: "ro" },
  ru: { name: "Русский", flag: "ru" },
  rw: { name: "Kinyarwanda", flag: "rw" },
  si: { name: "සිංහල", flag: "lk" },
  sk: { name: "Slovenčina", flag: "sk" },
  sl: { name: "Slovenščina", flag: "si" },
  so: { name: "Soomaali", flag: "so" },
  sq: { name: "Shqip", flag: "al" },
  sr: { name: "Српски", flag: "rs" },
  sv: { name: "Svenska", flag: "se" },
  sw: { name: "Kiswahili", flag: "tz" },
  ta: { name: "தமிழ்", flag: "in" },
  te: { name: "తెలుగు", flag: "in" },
  th: { name: "ไทย", flag: "th" },
  tl: { name: "Tagalog", flag: "ph" },
  tr: { name: "Türkçe", flag: "tr" },
  uk: { name: "Українська", flag: "ua" },
  ur: { name: "اردو", flag: "pk" },
  uz: { name: "Oʻzbekcha", flag: "uz" },
  vi: { name: "Tiếng Việt", flag: "vn" },
  xh: { name: "isiXhosa", flag: "za" },
  yi: { name: "ייִדיש", flag: "il" },
  zh: { name: "中文", flag: "cn" },
  zu: { name: "isiZulu", flag: "za" },
};
const DEFAULT_ITEM_HEIGHT_VIRTUALIZED_LIST = 40;
const DEFAULT_VISIBLE_COUNT_VIRTUALIZED_LIST = 6;
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
  DATA_STORE_NAMESPACE,
  CONFIGURATION_SUB_MODULES,
  NATIVE_LANGUAGES,
  DEFAULT_ITEM_HEIGHT_VIRTUALIZED_LIST,
  DEFAULT_VISIBLE_COUNT_VIRTUALIZED_LIST,
};
