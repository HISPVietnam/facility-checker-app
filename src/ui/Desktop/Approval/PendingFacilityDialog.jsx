import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import useMetadataStore from "@/states/metadata";
import CustomizedButton from "@/ui/common/Button";
import { Approved, New, NotYetSynced, Pending } from "@/ui/common/Labels";
import { Modal, ModalTitle, ModalContent, ModalActions, NoticeBox } from "@dhis2/ui";
import { Tooltip } from "@mui/material";
import CustomizedInputField from "@/ui/common/InputField";
import DataValueField from "@/ui/common/DataValueField";
import DataValueText from "@/ui/common/DataValueText";
import DataValueLabel from "@/ui/common/DataValueLabel";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useState } from "react";
import { getLatestValues, generateUid, convertToDhis2Event } from "@/utils";
import useDataStore from "@/states/data";
import { DATA_ELEMENTS } from "@/const";
import { postEvent } from "@/api/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import _ from "lodash";
import useApprovalModuleStore from "@/states/approvalModule";
const { UID, APPROVAL_STATUS, APPROVED_BY, APPROVED_AT, NAME, PATH, IS_NEW_FACILITY, SYNCED } = DATA_ELEMENTS;

const OldValue = ({ children }) => {
  return <span className="text-[14px] p-1 rounded-md bg-red-200">{children}</span>;
};

const NewValue = ({ children }) => {
  return <span className="text-[14px] p-1 rounded-md bg-emerald-100 ">{children}</span>;
};

const PendingFacilityDialog = ({ open, setPendingFacilityDialog }) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { program, me } = useMetadataStore(
    useShallow((state) => ({
      program: state.program,
      me: state.me
    }))
  );
  const actions = useDataStore((state) => state.actions);
  const { approve } = actions;
  const { approvalModuleActions, selectedFacility } = useApprovalModuleStore(
    useShallow((state) => ({
      approvalModuleActions: state.actions,
      selectedFacility: state.selectedFacility
    }))
  );
  const { selectFacility } = approvalModuleActions;
  const foundPendingEvent = selectedFacility ? selectedFacility.events.find((event) => event[APPROVAL_STATUS] === "pending") : null;
  const foundApprovedEvent = selectedFacility ? selectedFacility.events.find((event) => event[APPROVAL_STATUS] === "approved") : null;
  const finalEvent = foundPendingEvent ? foundPendingEvent : foundApprovedEvent;
  const { dataElements } = program;

  const handleApprove = async () => {
    setLoading(true);
    const { username } = me;
    const now = format(new Date(), "yyyy-MM-dd");
    approve(selectedFacility);
    const cloned = _.cloneDeep(selectedFacility);
    const foundPendingEventIndex = cloned.events.findIndex((event) => event[APPROVAL_STATUS] === "pending");
    cloned.events[foundPendingEventIndex][APPROVAL_STATUS] = "approved";
    cloned.events[foundPendingEventIndex][APPROVED_BY] = username;
    cloned.events[foundPendingEventIndex][APPROVED_AT] = now;
    cloned[APPROVAL_STATUS] = "approved";
    cloned[APPROVED_BY] = username;
    cloned[APPROVED_AT] = now;
    selectFacility(cloned);
    const convertedEvent = convertToDhis2Event(cloned.events[foundPendingEventIndex], program);
    console.log(cloned.events[foundPendingEventIndex]);
    convertedEvent.orgUnit = selectedFacility.orgUnit;
    convertedEvent.trackedEntity = selectedFacility.tei;
    convertedEvent.enrollment = selectedFacility.enr;
    const result = await postEvent(convertedEvent);
    setLoading(false);
  };
  return (
    selectedFacility && (
      <Modal fluid hide={!open}>
        <ModalTitle>{t("pendingApprovalValues")}</ModalTitle>
        <ModalContent>
          <div className="w-[1000px]">
            <div className="text-[15px]">
              <DataValueLabel dataElement={NAME} />: <DataValueText dataElement={NAME} value={selectedFacility[NAME]} />
            </div>
            <div className="text-[15px]">
              <DataValueLabel dataElement={PATH} />: <DataValueText dataElement={PATH} value={selectedFacility[PATH]} />
            </div>
            <div className="text-[15px]">
              {t("dateOfRequest")}: {format(new Date(finalEvent.completedAt), "yyyy-MM-dd")}
            </div>
            <div className="text-[15px]">
              {t("requestedBy")}: {finalEvent.updatedBy.username}
            </div>
            {selectedFacility[APPROVAL_STATUS] == "approved" && (
              <div className="text-[15px]">
                <DataValueLabel dataElement={APPROVED_BY} />: <DataValueText dataElement={APPROVED_BY} value={selectedFacility[APPROVED_BY]} />
              </div>
            )}
            {selectedFacility[APPROVAL_STATUS] == "approved" && (
              <div className="text-[15px]">
                <DataValueLabel dataElement={APPROVED_AT} />: <DataValueText dataElement={APPROVED_AT} value={selectedFacility[APPROVED_AT]} />
              </div>
            )}

            <div className="text-[15px]">
              {selectedFacility[APPROVAL_STATUS] == "pending" && (
                <span>
                  <Pending>{t("pending")}</Pending>&nbsp;
                </span>
              )}
              {selectedFacility[APPROVAL_STATUS] == "approved" && (
                <span>
                  <Approved>{t("approved")}</Approved>&nbsp;
                </span>
              )}
              {selectedFacility[IS_NEW_FACILITY] == "true" && (
                <span>
                  <New>{t("newFacility")}</New>&nbsp;
                </span>
              )}
              {!selectedFacility[SYNCED] && (
                <span>
                  <NotYetSynced>{t("notYetSynced")}</NotYetSynced>&nbsp;
                </span>
              )}
            </div>
            <br />
            <div className="mb-1 font-bold w-full border-b-slate-300 border-b">{t("changedValues")}:</div>
            {["latitude", "longitude", ...dataElements]
              .map((de) => {
                const foundValue = finalEvent[de.id] || finalEvent[de];
                return {
                  dataElement: de.id ? de.id : de,
                  value: foundValue ? foundValue : ""
                };
              })
              .filter((dataValue) => dataValue.value && ![APPROVAL_STATUS, APPROVED_BY, APPROVED_AT].includes(dataValue.dataElement))
              .map((dataValue) => {
                return (
                  <div className="flex mb-1 items-center">
                    <div className="w-[250px]">
                      <DataValueLabel dataElement={dataValue.dataElement} />
                    </div>
                    <div className="flex items-center">
                      <OldValue>
                        {selectedFacility.previousValues[dataValue.dataElement] ? (
                          <DataValueText dataElement={dataValue.dataElement} value={selectedFacility.previousValues[dataValue.dataElement]} />
                        ) : (
                          <i>{t("noValue")}</i>
                        )}
                      </OldValue>
                      &nbsp;&nbsp;
                      <FontAwesomeIcon fontSize={14} icon={faArrowRight} />
                      &nbsp;&nbsp;
                      <NewValue>
                        <DataValueText dataElement={dataValue.dataElement} value={dataValue.value} />
                      </NewValue>
                    </div>
                  </div>
                );
              })}
          </div>
        </ModalContent>
        <ModalActions>
          {foundPendingEvent && (
            <div className="flex items-center">
              <CustomizedButton loading={loading} disabled={foundApprovedEvent} primary={true} onClick={handleApprove}>
                {t("approve")}
              </CustomizedButton>
              &nbsp;
              <CustomizedButton loading={loading} disabled={foundApprovedEvent} destructive={true}>
                {t("reject")}
              </CustomizedButton>
            </div>
          )}
          {foundApprovedEvent && (
            <div className="flex items-center">
              <CustomizedButton loading={loading} primary>
                {t("sync")}
              </CustomizedButton>
            </div>
          )}
          &nbsp;
          <CustomizedButton
            loading={loading}
            onClick={() => {
              setPendingFacilityDialog(false);
            }}
          >
            {t("cancel")}
          </CustomizedButton>
        </ModalActions>
      </Modal>
    )
  );
};
export default PendingFacilityDialog;
