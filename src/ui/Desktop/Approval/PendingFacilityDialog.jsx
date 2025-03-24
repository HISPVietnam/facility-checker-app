import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import useMetadataStore from "@/states/metadata";
import CustomizedButton from "@/ui/common/Button";
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
const { UID, APPROVAL_STATUS, NAME, PATH } = DATA_ELEMENTS;

const OldValue = ({ children }) => {
  return <span className="text-[14px] p-1 rounded-md bg-red-200">{children}</span>;
};

const NewValue = ({ children }) => {
  return <span className="text-[14px] p-1 rounded-md bg-emerald-100 ">{children}</span>;
};

const PendingFacilityDialog = ({ open, setPendingFacilityDialog }) => {
  const { t } = useTranslation();
  const program = useMetadataStore((state) => state.program);
  const selectedFacility = useApprovalModuleStore((state) => state.selectedFacility);
  const foundPendingEvent = selectedFacility ? selectedFacility.events.find((event) => event[APPROVAL_STATUS] === "pending") : null;
  const { dataElements } = program;
  return (
    selectedFacility && (
      <Modal fluid hide={!open}>
        <ModalTitle>{t("pendingApprovalValues")}</ModalTitle>
        <ModalContent>
          <div className="w-[1000px]">
            <div className="text-[15px]">
              <DataValueLabel dataElement={NAME} />: <DataValueText dataElement={NAME} value={selectedFacility.previousValues[NAME]} />
            </div>
            <div className="text-[15px]">
              <DataValueLabel dataElement={PATH} />: <DataValueText dataElement={PATH} value={selectedFacility[PATH]} />
            </div>
            <div className="text-[15px]">
              {t("dateOfRequest")}: {format(new Date(foundPendingEvent.completedAt), "yyyy-MM-dd")}
            </div>
            <div className="text-[15px]">
              {t("requestedBy")}: {foundPendingEvent.updatedBy.firstName + " " + foundPendingEvent.updatedBy.surname}
            </div>
            <br />
            <div className="mb-1 font-bold w-full border-b-slate-300 border-b">{t("changedValues")}:</div>
            {["latitude", "longitude", ...dataElements]
              .map((de) => {
                const foundValue = foundPendingEvent[de.id] || foundPendingEvent[de];
                return {
                  dataElement: de.id ? de.id : de,
                  value: foundValue ? foundValue : ""
                };
              })
              .filter((dataValue) => dataValue.value && dataValue.dataElement !== APPROVAL_STATUS)
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
          <div className="flex items-center">
            <CustomizedButton primary={true}>{t("approve")}</CustomizedButton>
            &nbsp;
            <CustomizedButton destructive={true}>{t("reject")}</CustomizedButton>
            &nbsp;
            <CustomizedButton
              onClick={() => {
                setPendingFacilityDialog(false);
              }}
            >
              {t("cancel")}
            </CustomizedButton>
          </div>
        </ModalActions>
      </Modal>
    )
  );
};
export default PendingFacilityDialog;
