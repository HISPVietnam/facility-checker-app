import {
  getOrgUnits,
  getOrgUnitGroupSets,
  getOrgUnitGeoJson,
  getOrgUnitLevels,
  getMe,
  getProgram,
  getOrgUnitGroups,
  getCustomAttributes,
  getUsers,
  getSchemas,
  getDataStore,
  saveDataStore,
  getUserGroups,
} from "@/api/metadata";
import { getFacilityTeis } from "@/api/data";
import { useEffect, useState } from "react";
import useMetadataStore from "@/states/metadata";
import useDataStore from "@/states/data";
import { useTranslation } from "react-i18next";
import { convertTeis, convertLanguageCode } from "@/utils";
import _ from "lodash";
import { USER_GROUPS } from "@/const";
const { VITE_FCA_MODE } = import.meta.env;
const useInit = () => {
  const { i18n } = useTranslation();
  const [ready, setReady] = useState(false);
  const [firstRun, setFirstRun] = useState(false);
  const { setMetadata } = useMetadataStore((state) => state.actions);
  const { setFacilities, setTeis } = useDataStore((state) => state.actions);

  useEffect(() => {
    (async () => {
      const program = await getProgram();
      const me = await getMe();
      const orgUnits = await getOrgUnits();
      const orgUnitGroups = await getOrgUnitGroups();
      const orgUnitGroupSets = await getOrgUnitGroupSets();
      const orgUnitGeoJson = await getOrgUnitGeoJson();
      const schemas = await getSchemas();
      const users = await getUsers();
      const userGroups = await getUserGroups();

      if (program.httpStatusCode === 404 || VITE_FCA_MODE === "installation") {
        setMetadata("me", me);
        const locale = me.settings.keyUiLocale;
        setMetadata("locale", locale);
        setMetadata("orgUnits", orgUnits);
        setMetadata("orgUnitGroups", orgUnitGroups);
        setMetadata("orgUnitGroupSets", orgUnitGroupSets);
        setMetadata("orgUnitGeoJson", orgUnitGeoJson);
        setMetadata("users", users);
        setMetadata("userGroups", userGroups);
        setMetadata("schemas", schemas);
        setReady(true);
        setFirstRun(true);
      } else {
        const orgUnitLevels = await getOrgUnitLevels();
        const customAttributes = await getCustomAttributes();
        const dataStore = await getDataStore();
        const teis = await getFacilityTeis(me.organisationUnits[0].id);
        teis.forEach((tei) => {
          tei.hidden = false;
          const events = tei.enrollments[0].events;
          tei.enrollments[0].events = _.sortBy(events, "occurredAt").reverse();
        });
        const convertedDataStore = dataStore.entries.reduce((prev, current) => {
          prev[current.key] = current.value;
          return prev;
        }, {});
        setMetadata("orgUnits", orgUnits);
        setMetadata("orgUnitGroups", orgUnitGroups);
        setMetadata("orgUnitGroupSets", orgUnitGroupSets);
        setMetadata("orgUnitGeoJson", orgUnitGeoJson);
        setMetadata("users", users);
        setMetadata("schemas", schemas);
        setTeis(teis);
        setMetadata("orgUnitLevels", orgUnitLevels);
        me.authorities = [];
        Object.keys(USER_GROUPS).forEach((authorityName) => {
          const foundUg = me.userGroups.find(
            (ug) => ug.id === USER_GROUPS[authorityName]
          );
          if (foundUg) {
            me.authorities.push(authorityName);
          }
        });
        setMetadata("me", me);
        const locale = convertLanguageCode(me.settings.keyUiLocale);
        setMetadata("locale", locale);
        setMetadata("program", program);
        setMetadata("customAttributes", customAttributes);
        Object.keys(convertedDataStore.locales).forEach((locale) => {
          i18n.addResourceBundle(
            locale,
            "translation",
            convertedDataStore.locales[locale],
            true,
            true
          );
        });
        const localeDataStore = {};

        Object.keys(i18n.options.resources).forEach((language) => {
          localeDataStore[language] =
            i18n.options.resources[language].translation;
        });
        convertedDataStore.locales = localeDataStore;
        await saveDataStore("locales", localeDataStore, "UDPATE");
        setMetadata("dataStore", convertedDataStore);
        i18n.changeLanguage(locale);
        const facilities = convertTeis(teis, program);
        setFacilities(facilities);
        setReady(true);
      }
    })();
  }, []);

  return { ready, firstRun };
};

export default useInit;
