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
  COMMENT: "h8qLZy7n2sM",
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

const TRANSLATION_FIELDS = {
  [DATA_ELEMENTS.NAME]: "NAME",
  [DATA_ELEMENTS.SHORT_NAME]: "SHORT_NAME",
  [DATA_ELEMENTS.DESCRIPTION]: "DESCRIPTION",
};

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

const SYNC_USER_ROLE = "AnxX6HxeD2R";
const CAPTURE_USER_ROLE = "WdelLCFTyqe";

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
  [DATA_ELEMENTS.TRANSLATIONS]: "translations",
  [DATA_ELEMENTS.COMMENT]: "comment",
};

const DATA_STORE_NAMESPACE = "fca";

const CONFIGURATION_SUB_MODULES = [
  { key: "translations", icon: faLanguage },
  { key: "authorities", icon: faUsersGear },
  { key: "metadataLocales", icon: faLanguage },
  // { key: "orgUnitGroupSets", icon: faLayerGroup }
];

const NATIVE_LANGUAGES = {
  af: { name: "Afrikaans", englishName: "Afrikaans", flag: "za" },
  am: { name: "አማርኛ", englishName: "Amharic", flag: "et" },
  ar: { name: "العربية", englishName: "Arabic", flag: "sa" },
  az: { name: "Azərbaycan dili", englishName: "Azerbaijani", flag: "az" },
  be: { name: "Беларуская", englishName: "Belarusian", flag: "by" },
  bg: { name: "Български", englishName: "Bulgarian", flag: "bg" },
  bn: { name: "বাংলা", englishName: "Bengali", flag: "bd" },
  bs: { name: "Bosanski", englishName: "Bosnian", flag: "ba" },
  ca: { name: "Català", englishName: "Catalan", flag: "es" },
  cs: { name: "Čeština", englishName: "Czech", flag: "cz" },
  cy: { name: "Cymraeg", englishName: "Welsh", flag: "gb" },
  da: { name: "Dansk", englishName: "Danish", flag: "dk" },
  de: { name: "Deutsch", englishName: "German", flag: "de" },
  el: { name: "Ελληνικά", englishName: "Greek", flag: "gr" },
  en: { name: "English", englishName: "English", flag: "gb" },
  eo: { name: "Esperanto", englishName: "Esperanto", flag: "eu" },
  es: { name: "Español", englishName: "Spanish", flag: "es" },
  et: { name: "Eesti", englishName: "Estonian", flag: "ee" },
  eu: { name: "Euskara", englishName: "Basque", flag: "es" },
  fa: { name: "فارسی", englishName: "Persian", flag: "ir" },
  fi: { name: "Suomi", englishName: "Finnish", flag: "fi" },
  fil: { name: "Filipino", englishName: "Filipino", flag: "ph" },
  fj: { name: "Vakaviti", englishName: "Fijian", flag: "fj" },
  fr: { name: "Français", englishName: "French", flag: "fr" },
  ga: { name: "Gaeilge", englishName: "Irish", flag: "ie" },
  gl: { name: "Galego", englishName: "Galician", flag: "es" },
  gu: { name: "ગુજરાતી", englishName: "Gujarati", flag: "in" },
  he: { name: "עברית", englishName: "Hebrew", flag: "il" },
  hi: { name: "हिन्दी", englishName: "Hindi", flag: "in" },
  hr: { name: "Hrvatski", englishName: "Croatian", flag: "hr" },
  ht: { name: "Kreyòl ayisyen", englishName: "Haitian Creole", flag: "ht" },
  hu: { name: "Magyar", englishName: "Hungarian", flag: "hu" },
  hy: { name: "Հայերեն", englishName: "Armenian", flag: "am" },
  id: { name: "Bahasa Indonesia", englishName: "Indonesian", flag: "id" },
  is: { name: "Íslenska", englishName: "Icelandic", flag: "is" },
  it: { name: "Italiano", englishName: "Italian", flag: "it" },
  ja: { name: "日本語", englishName: "Japanese", flag: "jp" },
  jv: { name: "Basa Jawa", englishName: "Javanese", flag: "id" },
  ka: { name: "ქართული", englishName: "Georgian", flag: "ge" },
  kk: { name: "Қазақ тілі", englishName: "Kazakh", flag: "kz" },
  km: { name: "ខ្មែរ", englishName: "Khmer", flag: "kh" },
  kn: { name: "ಕನ್ನಡ", englishName: "Kannada", flag: "in" },
  ko: { name: "한국어", englishName: "Korean", flag: "kr" },
  ku: { name: "Kurdî", englishName: "Kurdish", flag: "iq" },
  ky: { name: "Кыргызча", englishName: "Kyrgyz", flag: "kg" },
  lo: { name: "ພາສາລາວ", englishName: "Lao", flag: "la" },
  lt: { name: "Lietuvių", englishName: "Lithuanian", flag: "lt" },
  lv: { name: "Latviešu", englishName: "Latvian", flag: "lv" },
  mk: { name: "Македонски", englishName: "Macedonian", flag: "mk" },
  ml: { name: "മലയാളം", englishName: "Malayalam", flag: "in" },
  mn: { name: "Монгол", englishName: "Mongolian", flag: "mn" },
  mr: { name: "मराठी", englishName: "Marathi", flag: "in" },
  ms: { name: "Bahasa Melayu", englishName: "Malay", flag: "my" },
  mt: { name: "Malti", englishName: "Maltese", flag: "mt" },
  my: { name: "မြန်မာစာ", englishName: "Burmese", flag: "mm" },
  ne: { name: "नेपाली", englishName: "Nepali", flag: "np" },
  nl: { name: "Nederlands", englishName: "Dutch", flag: "nl" },
  no: { name: "Norsk", englishName: "Norwegian", flag: "no" },
  pa: { name: "ਪੰਜਾਬੀ", englishName: "Punjabi", flag: "in" },
  pl: { name: "Polski", englishName: "Polish", flag: "pl" },
  ps: { name: "پښتو", englishName: "Pashto", flag: "af" },
  pt: { name: "Português", englishName: "Portuguese", flag: "pt" },
  ro: { name: "Română", englishName: "Romanian", flag: "ro" },
  ru: { name: "Русский", englishName: "Russian", flag: "ru" },
  rw: { name: "Kinyarwanda", englishName: "Kinyarwanda", flag: "rw" },
  si: { name: "සිංහල", englishName: "Sinhala", flag: "lk" },
  sk: { name: "Slovenčina", englishName: "Slovak", flag: "sk" },
  sl: { name: "Slovenščina", englishName: "Slovenian", flag: "si" },
  so: { name: "Soomaali", englishName: "Somali", flag: "so" },
  sq: { name: "Shqip", englishName: "Albanian", flag: "al" },
  sr: { name: "Српски", englishName: "Serbian", flag: "rs" },
  sv: { name: "Svenska", englishName: "Swedish", flag: "se" },
  sw: { name: "Kiswahili", englishName: "Swahili", flag: "tz" },
  ta: { name: "தமிழ்", englishName: "Tamil", flag: "in" },
  te: { name: "తెలుగు", englishName: "Telugu", flag: "in" },
  th: { name: "ไทย", englishName: "Thai", flag: "th" },
  tl: { name: "Tagalog", englishName: "Tagalog", flag: "ph" },
  tr: { name: "Türkçe", englishName: "Turkish", flag: "tr" },
  uk: { name: "Українська", englishName: "Ukrainian", flag: "ua" },
  ur: { name: "اردو", englishName: "Urdu", flag: "pk" },
  uz: { name: "Oʻzbekcha", englishName: "Uzbek", flag: "uz" },
  vi: { name: "Tiếng Việt", englishName: "Vietnamese", flag: "vn" },
  xh: { name: "isiXhosa", englishName: "Xhosa", flag: "za" },
  yi: { name: "ייִדיש", englishName: "Yiddish", flag: "il" },
  zh: { name: "中文", englishName: "Chinese", flag: "cn" },
  zu: { name: "isiZulu", englishName: "Zulu", flag: "za" },
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
  SYNC_USER_ROLE,
  CAPTURE_USER_ROLE,
  MAPPING_DATA_ELEMENTS_INSTALLATION_MODULE,
  DATA_STORE_NAMESPACE,
  CONFIGURATION_SUB_MODULES,
  NATIVE_LANGUAGES,
  DEFAULT_ITEM_HEIGHT_VIRTUALIZED_LIST,
  DEFAULT_VISIBLE_COUNT_VIRTUALIZED_LIST,
  TRANSLATION_FIELDS,
};
