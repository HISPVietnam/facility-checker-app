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
  getUsersByQuery,
} from "@/api/metadata";
import { getFacilityTeis } from "@/api/data";
import { useEffect, useState } from "react";
import useMetadataStore from "@/states/metadata";
import useDataStore from "@/states/data";
import { useTranslation } from "react-i18next";
import { convertTeis, convertLanguageCode } from "@/utils";
import _ from "lodash";
import { USER_GROUPS, DATA_ELEMENTS } from "@/const";
import { useShallow } from "zustand/react/shallow";
const { PATH } = DATA_ELEMENTS;
const { VITE_FCA_MODE } = import.meta.env;
const useInit = () => {
  const { i18n } = useTranslation();
  const [ready, setReady] = useState(false);
  const [firstRun, setFirstRun] = useState(false);
  const { actions, systemInfo } = useMetadataStore(
    useShallow((state) => ({
      actions: state.actions,
      systemInfo: state.systemInfo,
    }))
  );
  const { setMetadata } = actions;
  const { setFacilities, setTeis } = useDataStore((state) => state.actions);

  useEffect(() => {
    (async () => {
      if (!systemInfo) return;
      const program = await getProgram();
      const me = await getMe();
      const orgUnits = await getOrgUnits();
      const orgUnitGroups = await getOrgUnitGroups();
      const orgUnitGroupSets = await getOrgUnitGroupSets();
      const orgUnitGeoJson = await getOrgUnitGeoJson();
      const schemas = await getSchemas();
      const userGroups = await getUserGroups();

      orgUnits.forEach((ou) => {
        const foundGeoJson = orgUnitGeoJson.features.find(
          (f) => f.id === ou.id
        );
        if (foundGeoJson && foundGeoJson.geometry) {
          ou.geometry = foundGeoJson.geometry;
        }
      });

      if (program.httpStatusCode === 404 || VITE_FCA_MODE === "installation") {
        setMetadata("me", me);
        const locale = me.settings.keyUiLocale;
        setMetadata("locale", locale);
        setMetadata("orgUnits", orgUnits);
        setMetadata("orgUnitGroups", orgUnitGroups);
        setMetadata("orgUnitGroupSets", orgUnitGroupSets);
        setMetadata("orgUnitGeoJson", orgUnitGeoJson);
        // setMetadata("users", users);
        setMetadata("userGroups", userGroups);
        setMetadata("schemas", schemas);
        setReady(true);
        setFirstRun(true);
      } else {
        const orgUnitLevels = await getOrgUnitLevels();
        const customAttributes = await getCustomAttributes();
        const dataStore = await getDataStore();
        const listUserInFcaGroup = _.uniq(
          userGroups
            .filter((ug) => Object.values(USER_GROUPS).includes(ug.id))
            .map((ug) => ug.users.map((u) => u.id))
            .flat()
        );
        const userIdChunks = _.chunk(listUserInFcaGroup, 25);

        const usersInFcaGroup = (
          await Promise.all(
            userIdChunks.map((chunk) =>
              getUsersByQuery(`filter=id:in:[${chunk.join(",")}]`)
            )
          )
        ).flat();
        let teis = [];
        let page = 0;
        const startAll = Date.now();

        while (true) {
          const results = await Promise.all(
            Array.from({ length: 10 }, (_, i) => i + 1).map((i) =>
              getFacilityTeis(me.organisationUnits[0].id, page + i)
            )
          );
          results.forEach((res) => {
            teis = [...teis, ...res];
          });
          if (results.find((res) => res.length === 0)) {
            break;
          }

          page += 10;
        }

        teis.forEach((tei) => {
          tei.hidden = false;
          const events = tei.enrollments[0].events;
          tei.enrollments[0].events = _.sortBy(events, "occurredAt").reverse();
        });
        const convertedDataStore = dataStore.entries.reduce((prev, current) => {
          prev[current.key] = current.value;
          return prev;
        }, {});
        // setMetadata("orgUnits", orgUnits);
        setMetadata("orgUnitGroups", orgUnitGroups);
        setMetadata("orgUnitGroupSets", orgUnitGroupSets);
        setMetadata("orgUnitGeoJson", orgUnitGeoJson);
        setMetadata("usersInFcaGroup", usersInFcaGroup);
        setMetadata("userGroups", userGroups);
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
        facilities.forEach((f) => {
          const foundInOrgUnits = orgUnits.find((ou) => ou.path === f[PATH]);
          if (foundInOrgUnits) {
            foundInOrgUnits.isFacility = true;
          }
        });
        setMetadata("orgUnits", orgUnits);
        setFacilities(facilities);
        setReady(true);
      }
    })();
  }, [systemInfo]);

  return { ready, firstRun };
};

export default useInit;
