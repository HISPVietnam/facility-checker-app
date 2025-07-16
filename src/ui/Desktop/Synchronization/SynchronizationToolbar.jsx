import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { DATA_ELEMENTS } from "@/const";
import CustomizedButton from "@/ui/common/Button";
import UserInfo from "@/ui/common/UserInfo";
import useDataStore from "@/states/data";
import useMetadataStore from "@/states/metadata";
import { useShallow } from "zustand/react/shallow";
import { pull, push } from "@/api/fetch";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  buildPayload,
  extractDataValues,
  getOrgUnitGroupUpdates,
} from "./utils";
import { getFacilityTeis } from "@/api/data";

const { APPROVAL_STATUS, SYNC_NUMBER, IS_NEW_FACILITY, UID, PATH } =
  DATA_ELEMENTS;

const SynchronizationToolbar = () => {
  const { t } = useTranslation();

  const { program, me } = useMetadataStore(
    useShallow((state) => ({
      program: state.program,
      me: state.me,
    }))
  );

  const { dataElements } = program;

  const { facilities, actions } = useDataStore(
    useShallow((state) => ({
      facilities: state.facilities,
      actions: state.actions,
    }))
  );

  const [loading, setLoading] = useState(false);

  const filteredSyncFacilities = facilities.filter((facility) =>
    facility.events.some(
      (event) => event[APPROVAL_STATUS] === "approved" && !event[SYNC_NUMBER]
    )
  );

  const filteredSyncFacilityEvents = filteredSyncFacilities
    .flatMap((f) => f.events)
    .filter(
      (event) => event[APPROVAL_STATUS] === "approved" && !event[SYNC_NUMBER]
    );

  const generatePayloads = async (facilitiesList, isNew) => {
    const results = [];

    for (const f of facilitiesList) {
      const foundFacility = filteredSyncFacilities.find((item) =>
        item.events.some((event) => event.event === f.event)
      );
      const foundOrgUnit = isNew
        ? {
            parent: {
              id: f[PATH]?.split("/")?.slice(-2)?.[0],
            },
          }
        : await pull(`/api/organisationUnits/${foundFacility.orgUnit}`);
      const payload = buildPayload(
        foundOrgUnit,
        extractDataValues(f, dataElements)
      );

      results.push(payload);
    }

    return results;
  };

  const maxSyncNumber = (
    facilities.reduce((prev, curr) => {
      const val = Number(curr[SYNC_NUMBER] || 0);
      return val > prev ? val : prev;
    }, 0) + 1
  ).toString();

  const handleSync = async () => {
    try {
      setLoading(true);
      const newFacilities = filteredSyncFacilityEvents.filter(
        (f) => f[IS_NEW_FACILITY] === "true"
      );
      const existedFacilities = filteredSyncFacilityEvents.filter(
        (f) => f[IS_NEW_FACILITY] !== "true"
      );

      const [payloadExisted, payloadNew] = await Promise.all([
        generatePayloads(existedFacilities, false),
        generatePayloads(newFacilities, true),
      ]);

      const {
        addList: addOrgUnitToOrgUnitGroupList,
        deleteList: deleteOrgUnitToOrgUnitGroupList,
      } = getOrgUnitGroupUpdates([...payloadExisted, ...payloadNew]);

      const metadataResult = await push(`/api/metadata?async=false`, {
        organisationUnits: [...payloadExisted, ...payloadNew],
        programs: [
          {
            ...program.programs[0],
            organisationUnits: [
              ...program.programs[0].organisationUnits,
              ...payloadNew.map((u) => ({ id: u.id })),
            ],
          },
        ],
      });

      const [addResults, deleteResults] = await Promise.all([
        Promise.all(
          addOrgUnitToOrgUnitGroupList.map((item) => push(item, null, "POST"))
        ),
        Promise.all(
          deleteOrgUnitToOrgUnitGroupList.map((item) =>
            push(item, null, "DELETE")
          )
        ),
      ]);

      if (
        !metadataResult.ok ||
        addResults.some((result) => !result.ok) ||
        deleteResults.some((result) => !result.ok)
      ) {
        throw new Error(t("metadataProcessFailed"));
      }
      const latestTeis = await getFacilityTeis(me.organisationUnits[0].id);
      const newTeis = newFacilities.map((facility) => {
        const tei = latestTeis.find((tei) =>
          tei.enrollments[0].events.some(
            (event) => event.event === facility.event
          )
        );
        const updatedEvents = tei.enrollments[0].events.map((event) =>
          event.event === facility.event
            ? {
                ...event,
                orgUnit: facility[UID],
                dataValues: event.dataValues.some(
                  (dv) => dv.dataElement === SYNC_NUMBER
                )
                  ? event.dataValues.map((dv) =>
                      dv.dataElement === SYNC_NUMBER
                        ? { ...dv, value: maxSyncNumber }
                        : dv
                    )
                  : [
                      ...event.dataValues,
                      { dataElement: SYNC_NUMBER, value: maxSyncNumber },
                    ],
              }
            : { ...event, orgUnit: facility[UID] }
        );
        return {
          ...tei,
          orgUnit: facility[UID],
          enrollments: [
            {
              ...tei.enrollments[0],
              orgUnit: facility[UID],
              events: updatedEvents,
            },
          ],
        };
      });

      const existedEvents = existedFacilities.map((facility) => {
        const tei = latestTeis.find((tei) =>
          tei.enrollments[0].events.some(
            (event) => event.event === facility.event
          )
        );
        const event = tei.enrollments[0].events.find(
          (e) => e.event === facility.event
        );
        return {
          ...event,
          dataValues: event.dataValues.some(
            (dv) => dv.dataElement === SYNC_NUMBER
          )
            ? event.dataValues.map((dv) =>
                dv.dataElement === SYNC_NUMBER
                  ? { ...dv, value: maxSyncNumber }
                  : dv
              )
            : [
                ...event.dataValues,
                { dataElement: SYNC_NUMBER, value: maxSyncNumber },
              ],
        };
      });

      const trackerResult = await push("/api/tracker?async=false", {
        trackedEntities: newTeis,
        events: existedEvents,
      });
      if (!trackerResult.ok) throw new Error(t("trackerProcessFailed"));
      const updatedFacilities = facilities.map((f) => {
        const isNewFacility = f.events.some((event) =>
          newFacilities.some((fe) => fe.event === event.event)
        );
        const isExistedFacility = f.events.some((event) =>
          existedFacilities.some((fe) => fe.event === event.event)
        );
        if (!isNewFacility && !isExistedFacility) return f;
        if (isNewFacility) {
          return {
            ...f,
            orgUnit: f[UID],
            [SYNC_NUMBER]: maxSyncNumber,
            events: f.events.map((e) =>
              newFacilities.some((fe) => fe.event === e.event)
                ? {
                    ...e,
                    [SYNC_NUMBER]: maxSyncNumber,
                    orgUnit: e[UID],
                  }
                : e
            ),
          };
        }
        return {
          ...f,
          [SYNC_NUMBER]: maxSyncNumber,
          events: f.events.map((e) =>
            existedFacilities.some((fe) => fe.event === e.event)
              ? { ...e, [SYNC_NUMBER]: maxSyncNumber }
              : e
          ),
        };
      });
      actions.setFacilities(updatedFacilities);

      toast.success(t("syncSuccessfully"));
    } catch (error) {
      console.error(error);
      toast.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 w-full">
      <CustomizedButton
        primary
        icon={<FontAwesomeIcon icon={faRotate} />}
        onClick={handleSync}
        disabled={filteredSyncFacilityEvents.length === 0}
        loading={loading}
      >
        {t("sync")}
      </CustomizedButton>
      <div className="ml-auto">
        <UserInfo />
      </div>
    </div>
  );
};

export default SynchronizationToolbar;
