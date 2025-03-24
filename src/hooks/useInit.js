import { getOrgUnits, getOrgUnitGroupSets, getOrgUnitGeoJson, getOrgUnitLevels, getMe, getProgram, getOrgUnitGroups } from "@/api/metadata";
import { getFacilityTeis } from "@/api/data";
import { useEffect, useState } from "react";
import useMetadataStore from "@/states/metadata";
import useDataStore from "@/states/data";
import { useTranslation } from "react-i18next";
import { convertTeis } from "@/utils";
import _ from "lodash";

const useInit = () => {
  const { i18n } = useTranslation();
  const [ready, setReady] = useState(false);
  const { setMetadata } = useMetadataStore((state) => state.actions);
  const { setFacilities, setTeis } = useDataStore((state) => state.actions);

  useEffect(() => {
    (async () => {
      const orgUnits = await getOrgUnits();
      const orgUnitGroups = await getOrgUnitGroups();
      const orgUnitGroupSets = await getOrgUnitGroupSets();
      const orgUnitGeoJson = await getOrgUnitGeoJson();
      const orgUnitLevels = await getOrgUnitLevels();
      const program = await getProgram();
      const me = await getMe();
      const teis = await getFacilityTeis(me.organisationUnits[0].id);
      teis.forEach((tei) => {
        tei.hidden = false;
        const events = tei.enrollments[0].events;
        tei.enrollments[0].events = _.sortBy(events, "occurredAt").reverse();
      });
      setTeis(teis);
      setMetadata("orgUnits", orgUnits);
      setMetadata("orgUnitGroups", orgUnitGroups);
      setMetadata("orgUnitGroupSets", orgUnitGroupSets);
      setMetadata("orgUnitGeoJson", orgUnitGeoJson);
      setMetadata("orgUnitLevels", orgUnitLevels);
      setMetadata("me", me);
      const locale = me.settings.keyUiLocale;
      setMetadata("locale", locale);
      setMetadata("program", program);
      i18n.changeLanguage(locale);
      const foundOugs = orgUnitGroupSets.find((ougs) => ougs.id === "J5jldMd8OHv");
      const foundOrgUnits = orgUnits
        .filter((ou) => {
          let valid = false;
          ou.organisationUnitGroups.forEach((oug) => {
            const ougsGroups = foundOugs.items.map((item) => item.id);
            if (ougsGroups.includes(oug.id)) {
              valid = true;
            }
          });
          return valid;
        })
        .map((ou) => {
          const foundGeometry = orgUnitGeoJson.features.find((feature) => feature.id === ou.id);
          const newOu = { ...ou };
          if (foundGeometry) {
            newOu.geometry = foundGeometry.geometry;
          } else {
            newOu.geometry = null;
          }
          return newOu;
        });
      const facilities = convertTeis(teis, program);
      setFacilities(facilities);
      setReady(true);
    })();
  }, []);

  return ready;
};

export default useInit;
