import useMetadataStore from "@/states/metadata";
import CustomizedButton from "@/ui/common/Button";
import {
  Approved,
  New,
  NotYetSynced,
  Pending,
  Rejected,
} from "@/ui/common/Labels";
import { Modal, ModalTitle, ModalContent, ModalActions } from "@dhis2/ui";
import DataValueField from "@/ui/common/DataValueField";
import DataValueText from "@/ui/common/DataValueText";
import DataValueLabel from "@/ui/common/DataValueLabel";
import GeoJsonViewer from "@/ui/common/GeoJsonViewer";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useState } from "react";
import {
  convertToDhis2Event,
  findCustomAttributeValue,
  convertDisplayValueForPath,
  convertDisplayValueForAllField,
  generateParentFeatures,
  getLatestValues,
} from "@/utils";
import useDataStore from "@/states/data";
import { DATA_ELEMENTS, HIDDEN_DATA_ELEMENTS } from "@/const";
import { postEvent } from "@/api/data";
import { format } from "date-fns";
import _ from "lodash";
import useApprovalModuleStore from "@/states/approvalModule";
import CustomAttributeLabel from "@/ui/common/CustomAttributeLabel";
import MiniMap from "../FacilitiesManagement/MiniMap";
import Accordion from "@/ui/common/Accordion";
import { toast } from "react-toastify";
const {
  APPROVAL_STATUS,
  APPROVED_BY,
  APPROVED_AT,
  NAME,
  PATH,
  IS_NEW_FACILITY,
  SYNC_NUMBER,
  ATTRIBUTE_VALUES,
  REJECTED_BY,
  REJECTED_AT,
  REASON_FOR_REJECT,
} = DATA_ELEMENTS;

const CustomValue = ({ isOld = false, isNew = false, children }) => {
  return (
    <div
      className={`bg-slate-100 ${isOld && "!bg-red-200"} ${
        isNew && "!bg-emerald-100"
      } text-[14px] p-2 min-h-[40px] rounded-md flex-1 flex items-center`}
    >
      {children}
    </div>
  );
};

const PendingFacilityDialog = ({ open, setPendingFacilityDialog }) => {
  const [rejectDialog, setRejectDialog] = useState(false);
  const [reasonForReject, setReasonForReject] = useState("");
  const [geoJsonViewer, setGeoJsonViewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { program, me, customAttributes } = useMetadataStore(
    useShallow((state) => ({
      program: state.program,
      me: state.me,
      customAttributes: state.customAttributes,
    }))
  );
  const { actions, facilities } = useDataStore(
    useShallow((state) => ({
      actions: state.actions,
      facilities: state.facilities,
    }))
  );
  const { approve, reject } = actions;
  const {
    approvalModuleActions,
    selectedFacility,
    selectedEventId,
    isReadOnly,
  } = useApprovalModuleStore(
    useShallow((state) => ({
      approvalModuleActions: state.actions,
      selectedFacility: state.selectedFacility,
      selectedEventId: state.selectedEventId,
      isReadOnly: state.isReadOnly,
    }))
  );
  const { selectFacility } = approvalModuleActions;
  const finalEvent = selectedFacility
    ? selectedFacility.events.find((event) => event.event === selectedEventId)
    : null;

  const previousValues = selectedFacility
    ? finalEvent.previousValues ||
      getLatestValues(
        facilities.find((facility) => facility.tei === selectedFacility.tei)
          .events,
        program,
        finalEvent
      )
    : null;

  const listDataElementDataValue = selectedFacility
    ? [
        PATH,
        "latitude",
        "longitude",
        ...program.programStages[0].programStageDataElements.filter((psde) => {
          return (
            !HIDDEN_DATA_ELEMENTS.includes(psde.dataElement.id) &&
            psde.dataElement.id !== PATH
          );
        }),
        ...customAttributes,
      ].map((item) => {
        const foundValue =
          findCustomAttributeValue(finalEvent[ATTRIBUTE_VALUES], item.id) ||
          finalEvent[item.dataElement?.id] ||
          finalEvent[item];
        const previousValue = item.id
          ? previousValues[ATTRIBUTE_VALUES]
            ? findCustomAttributeValue(
                previousValues[ATTRIBUTE_VALUES],
                item.id
              )
            : ""
          : previousValues[item.dataElement?.id] || previousValues[item];
        return {
          id: item.dataElement?.id || item.id || item,
          value: foundValue ? foundValue : "",
          isChangedValue: foundValue && previousValue !== foundValue,
          valueType: item.id && item.valueType,
          oldValue: previousValue,
        };
      })
    : [];

  const handleApprove = async () => {
    try {
      setLoading(true);
      const { username } = me;
      const now = format(new Date(), "yyyy-MM-dd");
      approve(selectedFacility);
      const cloned = _.cloneDeep(selectedFacility);
      const foundPendingEventIndex = cloned.events.findIndex(
        (event) => event[APPROVAL_STATUS] === "pending"
      );
      cloned.events[foundPendingEventIndex][APPROVAL_STATUS] = "approved";
      cloned.events[foundPendingEventIndex][APPROVED_BY] = username;
      cloned.events[foundPendingEventIndex][APPROVED_AT] = now;
      cloned[APPROVAL_STATUS] = "approved";
      cloned[APPROVED_BY] = username;
      cloned[APPROVED_AT] = now;
      selectFacility(cloned, selectedEventId);
      const convertedEvent = convertToDhis2Event(
        cloned.events[foundPendingEventIndex],
        program
      );
      convertedEvent.orgUnit = selectedFacility.orgUnit;
      convertedEvent.trackedEntity = selectedFacility.tei;
      convertedEvent.enrollment = selectedFacility.enr;
      await postEvent(convertedEvent);
      toast.success(t("approvedFacilityChangesSuccessfully"));
    } catch (error) {
      console.error(error);
      toast.error(t("approvedFacilityChangesFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    try {
      setLoading(true);
      const { username } = me;
      const now = format(new Date(), "yyyy-MM-dd");
      reject(selectedFacility, reasonForReject);
      const cloned = _.cloneDeep(selectedFacility);
      const foundPendingEventIndex = cloned.events.findIndex(
        (event) => event[APPROVAL_STATUS] === "pending"
      );
      cloned.events[foundPendingEventIndex][APPROVAL_STATUS] = "rejected";
      cloned.events[foundPendingEventIndex][REJECTED_BY] = username;
      cloned.events[foundPendingEventIndex][REJECTED_AT] = now;
      cloned.events[foundPendingEventIndex][REASON_FOR_REJECT] =
        reasonForReject;
      cloned[APPROVAL_STATUS] = "rejected";
      cloned[REJECTED_BY] = username;
      cloned[REJECTED_AT] = now;
      cloned[REASON_FOR_REJECT] = reasonForReject;
      selectFacility(cloned, selectedEventId);
      const convertedEvent = convertToDhis2Event(
        cloned.events[foundPendingEventIndex],
        program
      );
      convertedEvent.orgUnit = selectedFacility.orgUnit;
      convertedEvent.trackedEntity = selectedFacility.tei;
      convertedEvent.enrollment = selectedFacility.enr;
      await postEvent(convertedEvent);
      toast.success("rejectedFacilityChangesSuccessfully");
    } catch (error) {
      console.error(error);
      toast.error("rejectedFacilityChangesFailed");
    } finally {
      setLoading(false);
      setRejectDialog(false);
    }
  };

  return (
    selectedFacility && (
      <Modal key={selectedFacility?.tei} fluid hide={!open}>
        <ModalTitle>{t("pendingApprovalValues")}</ModalTitle>
        <ModalContent>
          <div className="h-[65vh] w-[85vw] flex flex-col gap-2">
            {/* Change log */}
            <div>
              <div className="flex gap-10">
                <div>
                  <div className="text-[15px]">
                    <DataValueLabel dataElement={NAME} />:{" "}
                    <DataValueText
                      dataElement={NAME}
                      value={finalEvent[NAME] || previousValues[NAME]}
                    />
                  </div>
                  <div className="text-[15px]">
                    <DataValueLabel dataElement={PATH} />:{" "}
                    <DataValueText
                      dataElement={PATH}
                      value={finalEvent[PATH] || previousValues[PATH]}
                    />
                  </div>
                </div>
                <div>
                  <div className="text-[15px]">
                    {t("dateOfRequest")}:{" "}
                    {format(new Date(finalEvent.completedAt), "yyyy-MM-dd")}
                  </div>
                  <div className="text-[15px]">
                    {t("requestedBy")}: {finalEvent.updatedBy.username}
                  </div>
                </div>
              </div>
              <div className="text-[15px]">
                {finalEvent[APPROVAL_STATUS] == "pending" && (
                  <span>
                    <Pending>{t("pending")}</Pending>&nbsp;
                  </span>
                )}
                {finalEvent[APPROVAL_STATUS] == "approved" && (
                  <span>
                    <Approved>{t("approved")}</Approved>&nbsp;
                  </span>
                )}
                {finalEvent[APPROVAL_STATUS] == "rejected" && (
                  <span>
                    <Rejected>{t("rejected")}</Rejected>&nbsp;
                  </span>
                )}
                {finalEvent[IS_NEW_FACILITY] == "true" && (
                  <span>
                    <New>{t("newFacility")}</New>&nbsp;
                  </span>
                )}
                {!finalEvent[SYNC_NUMBER] &&
                  finalEvent[APPROVAL_STATUS] == "approved" && (
                    <span>
                      <NotYetSynced>{t("notYetSynced")}</NotYetSynced>&nbsp;
                    </span>
                  )}
              </div>
              <div className="flex gap-5">
                {finalEvent[APPROVAL_STATUS] == "approved" && (
                  <div className="text-[15px]">
                    <DataValueLabel dataElement={APPROVED_BY} />:{" "}
                    <DataValueText
                      dataElement={APPROVED_BY}
                      value={finalEvent[APPROVED_BY]}
                    />
                  </div>
                )}
                {finalEvent[APPROVAL_STATUS] == "rejected" && (
                  <div className="text-[15px]">
                    <DataValueLabel dataElement={REJECTED_BY} />:{" "}
                    <DataValueText
                      dataElement={REJECTED_BY}
                      value={finalEvent[REJECTED_BY]}
                    />
                  </div>
                )}
                {finalEvent[APPROVAL_STATUS] == "approved" && (
                  <div className="text-[15px]">
                    <DataValueLabel dataElement={APPROVED_AT} />:{" "}
                    <DataValueText
                      dataElement={APPROVED_AT}
                      value={finalEvent[APPROVED_AT]}
                    />
                  </div>
                )}
                {finalEvent[APPROVAL_STATUS] == "rejected" && (
                  <div className="text-[15px]">
                    <DataValueLabel dataElement={REJECTED_AT} />:{" "}
                    <DataValueText
                      dataElement={REJECTED_AT}
                      value={finalEvent[REJECTED_AT]}
                    />
                  </div>
                )}
                {finalEvent[APPROVAL_STATUS] == "rejected" && (
                  <div className="text-[15px]">
                    <DataValueLabel dataElement={REASON_FOR_REJECT} />:{" "}
                    <DataValueText
                      dataElement={REASON_FOR_REJECT}
                      value={finalEvent[REASON_FOR_REJECT]}
                    />
                  </div>
                )}
              </div>
            </div>
            {/* Table value */}
            <div className="flex items-center mb-1 border-b-2 border-b-slate-400 font-bold text-[15px] h-[35px] gap-2">
              <div className="w-[20%]">{t("field")}</div>
              <div className="w-[40%]">{t("currentValue")}</div>
              <div className="w-[40%] ml-2">{t("newValue")}</div>
            </div>
            <div className="flex-1 overflow-auto flex flex-col gap-2">
              {/* <div className="mb-1 font-bold w-full">{t("changedValues")}:</div> */}
              <Accordion
                key={`${selectFacility.tei}-changed`}
                title={t("changedValues")}
                defaultOpen={true}
              >
                {listDataElementDataValue
                  .filter((dataValue) => dataValue.isChangedValue)
                  .map((dataValue) => {
                    if (dataValue.valueType) {
                      const { id, valueType, value, oldValue } = dataValue;

                      return (
                        <div className="flex mb-1 gap-2 border-b pb-1 items-center">
                          <div className="w-[20%]">
                            <CustomAttributeLabel attribute={id} />
                          </div>
                          <div className="w-[40%]">
                            {valueType === "GEOJSON" ? (
                              <CustomValue isOld={!!value}>
                                <span
                                  className="underline cursor-pointer"
                                  onClick={() => {
                                    setGeoJsonViewer(true);
                                  }}
                                >
                                  {t("clickToView")}
                                </span>
                                {geoJsonViewer && (
                                  <Modal fluid>
                                    <ModalTitle>
                                      <CustomAttributeLabel attribute={id} />
                                    </ModalTitle>
                                    <ModalContent>
                                      <div className="w-[1000px] h-[600px]">
                                        <GeoJsonViewer
                                          data={JSON.parse(oldValue)}
                                        />
                                      </div>
                                    </ModalContent>
                                    <ModalActions>
                                      <CustomizedButton
                                        onClick={() => {
                                          setGeoJsonViewer(false);
                                        }}
                                      >
                                        {t("close")}
                                      </CustomizedButton>
                                    </ModalActions>
                                  </Modal>
                                )}
                              </CustomValue>
                            ) : (
                              <CustomValue
                                isOld={!!(value && oldValue !== value)}
                              >
                                {oldValue}
                              </CustomValue>
                            )}
                          </div>
                          <div className="w-[40%]">
                            {valueType === "GEOJSON" ? (
                              value && (
                                <CustomValue
                                  isNew={!!(value && oldValue !== value)}
                                >
                                  <span
                                    className="underline cursor-pointer"
                                    onClick={() => {
                                      setGeoJsonViewer(true);
                                    }}
                                  >
                                    {t("clickToView")}
                                  </span>
                                  {geoJsonViewer && (
                                    <Modal fluid>
                                      <ModalTitle>
                                        <CustomAttributeLabel attribute={id} />
                                      </ModalTitle>
                                      <ModalContent>
                                        <div className="w-[1000px] h-[600px]">
                                          <GeoJsonViewer
                                            data={JSON.parse(value)}
                                          />
                                        </div>
                                      </ModalContent>
                                      <ModalActions>
                                        <CustomizedButton
                                          onClick={() => {
                                            setGeoJsonViewer(false);
                                          }}
                                        >
                                          {t("close")}
                                        </CustomizedButton>
                                      </ModalActions>
                                    </Modal>
                                  )}
                                </CustomValue>
                              )
                            ) : (
                              <CustomValue
                                isNew={!!(value && oldValue !== value)}
                              >
                                {value}
                              </CustomValue>
                            )}
                          </div>
                        </div>
                      );
                    }
                    if (dataValue.id === "longitude") return;
                    if (dataValue.id === "latitude") {
                      const longitudeDataValue = listDataElementDataValue.find(
                        (item) => item.id === "longitude"
                      );
                      const pathDataValue = listDataElementDataValue.find(
                        (item) => item.id === PATH
                      );
                      return (
                        <div className="flex mb-1 gap-2 border-b pb-1 items-center">
                          <div className="w-[20%]">
                            <DataValueLabel dataElement={"coordinates"} />
                          </div>
                          <div className="w-[40%]">
                            <div className=" flex gap-1">
                              <CustomValue
                                isOld={longitudeDataValue.isChangedValue}
                              >
                                {previousValues["longitude"]}
                              </CustomValue>
                              <CustomValue isOld={dataValue.isChangedValue}>
                                {previousValues["latitude"]}
                              </CustomValue>
                            </div>
                            <div className="w-full h-[300px] mt-2">
                              <MiniMap
                                data={generateParentFeatures(
                                  previousValues[PATH]
                                )}
                                point={
                                  previousValues.longitude &&
                                  previousValues.latitude
                                    ? [
                                        previousValues.latitude,
                                        previousValues.longitude,
                                      ]
                                    : [0, 0]
                                }
                                showPoint={
                                  !previousValues.longitude ||
                                  !previousValues.latitude
                                    ? false
                                    : true
                                }
                              />
                            </div>
                          </div>
                          <div className="w-[40%]">
                            <div className=" flex gap-1">
                              <CustomValue
                                isNew={longitudeDataValue.isChangedValue}
                              >
                                {longitudeDataValue.value}
                              </CustomValue>
                              <CustomValue isNew={dataValue.isChangedValue}>
                                {dataValue.value}
                              </CustomValue>
                            </div>
                            <div className="w-full h-[300px] mt-2">
                              <MiniMap
                                data={generateParentFeatures(
                                  pathDataValue.value || previousValues[PATH]
                                )}
                                point={
                                  longitudeDataValue.value && dataValue.value
                                    ? [
                                        dataValue.value,
                                        longitudeDataValue.value,
                                      ]
                                    : [0, 0]
                                }
                                showPoint={
                                  !longitudeDataValue.value || !dataValue.value
                                    ? false
                                    : true
                                }
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="flex mb-1 gap-2 border-b pb-1 items-center">
                        <div className="w-[20%]">
                          <DataValueLabel dataElement={dataValue.id} />
                        </div>
                        <div className="w-[40%]">
                          <CustomValue isOld={dataValue.isChangedValue}>
                            {dataValue.id === PATH
                              ? convertDisplayValueForPath(
                                  previousValues[dataValue.id]
                                )
                              : ["latitude", "longitude"].includes(dataValue.id)
                              ? previousValues[dataValue.id]
                              : convertDisplayValueForAllField(
                                  dataValue.id,
                                  previousValues[dataValue.id]
                                )}
                          </CustomValue>
                        </div>
                        <div className="w-[40%]">
                          <CustomValue isNew={dataValue.isChangedValue}>
                            {convertDisplayValueForAllField(
                              dataValue.id,
                              dataValue.value
                            )}
                          </CustomValue>
                        </div>
                      </div>
                    );
                  })}
              </Accordion>
              <Accordion
                key={`${selectFacility.tei}-not-changed`}
                title={t("notChangedValues")}
              >
                {listDataElementDataValue
                  .filter((dataValue) => !dataValue.isChangedValue)
                  .map((dataValue) => {
                    if (dataValue.valueType) {
                      const { id, valueType, value, oldValue } = dataValue;

                      return (
                        <div className="flex mb-1 gap-2 border-b pb-1 items-center">
                          <div className="w-[20%]">
                            <CustomAttributeLabel attribute={id} />
                          </div>
                          <div className="w-[40%]">
                            {valueType === "GEOJSON" ? (
                              <CustomValue isOld={!!value}>
                                {finalEvent[IS_NEW_FACILITY] !== "true" && (
                                  <span
                                    className="underline cursor-pointer"
                                    onClick={() => {
                                      setGeoJsonViewer(true);
                                    }}
                                  >
                                    {t("clickToView")}
                                  </span>
                                )}
                                {geoJsonViewer && (
                                  <Modal fluid>
                                    <ModalTitle>
                                      <CustomAttributeLabel attribute={id} />
                                    </ModalTitle>
                                    <ModalContent>
                                      <div className="w-[1000px] h-[600px]">
                                        <GeoJsonViewer
                                          data={JSON.parse(oldValue)}
                                        />
                                      </div>
                                    </ModalContent>
                                    <ModalActions>
                                      <CustomizedButton
                                        onClick={() => {
                                          setGeoJsonViewer(false);
                                        }}
                                      >
                                        {t("close")}
                                      </CustomizedButton>
                                    </ModalActions>
                                  </Modal>
                                )}
                              </CustomValue>
                            ) : (
                              <CustomValue
                                isOld={!!(value && oldValue !== value)}
                              >
                                {oldValue}
                              </CustomValue>
                            )}
                          </div>
                        </div>
                      );
                    }
                    if (dataValue.id === "longitude") return;
                    if (dataValue.id === "latitude") {
                      const longitudeDataValue = listDataElementDataValue.find(
                        (item) => item.id === "longitude"
                      );
                      const pathDataValue = listDataElementDataValue.find(
                        (item) => item.id === PATH
                      );
                      return (
                        <div className="flex mb-1 gap-2 border-b pb-1 items-center">
                          <div className="w-[20%]">
                            <DataValueLabel dataElement={"coordinates"} />
                          </div>
                          <div className="w-[40%]">
                            <div className=" flex gap-1">
                              <CustomValue
                                isOld={longitudeDataValue.isChangedValue}
                              >
                                {previousValues["longitude"]}
                              </CustomValue>
                              <CustomValue isOld={dataValue.isChangedValue}>
                                {previousValues["latitude"]}
                              </CustomValue>
                            </div>
                            <div className="w-full h-[300px] mt-2">
                              <MiniMap
                                data={generateParentFeatures(
                                  previousValues[PATH]
                                )}
                                point={
                                  previousValues.longitude &&
                                  previousValues.latitude
                                    ? [
                                        previousValues.latitude,
                                        previousValues.longitude,
                                      ]
                                    : [0, 0]
                                }
                                showPoint={
                                  !previousValues.longitude ||
                                  !previousValues.latitude
                                    ? false
                                    : true
                                }
                              />
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="flex mb-1 gap-2 border-b pb-1 items-center">
                        <div className="w-[20%]">
                          <DataValueLabel dataElement={dataValue.id} />
                        </div>
                        <div className="w-[40%]">
                          <CustomValue isOld={dataValue.isChangedValue}>
                            {dataValue.id === PATH
                              ? convertDisplayValueForPath(
                                  previousValues[dataValue.id]
                                )
                              : ["latitude", "longitude"].includes(dataValue.id)
                              ? previousValues[dataValue.id]
                              : convertDisplayValueForAllField(
                                  dataValue.id,
                                  previousValues[dataValue.id]
                                )}
                          </CustomValue>
                        </div>
                      </div>
                    );
                  })}
              </Accordion>
            </div>
          </div>
        </ModalContent>
        <ModalActions>
          {finalEvent[APPROVAL_STATUS] === "pending" && (
            <div className="flex items-center">
              <CustomizedButton
                loading={loading}
                disabled={isReadOnly}
                primary={true}
                onClick={handleApprove}
              >
                {t("approve")}
              </CustomizedButton>
              &nbsp;
              <CustomizedButton
                loading={loading}
                disabled={isReadOnly}
                destructive={true}
                onClick={() => {
                  setRejectDialog(true);
                }}
              >
                {t("reject")}
              </CustomizedButton>
              {rejectDialog && (
                <Modal>
                  <ModalTitle>
                    <DataValueLabel dataElement={REASON_FOR_REJECT} />
                  </ModalTitle>
                  <ModalContent>
                    <DataValueField
                      dataElement={REASON_FOR_REJECT}
                      value={reasonForReject}
                      onChange={(value) => {
                        setReasonForReject(value);
                      }}
                    />
                  </ModalContent>
                  <ModalActions>
                    <CustomizedButton primary onClick={handleReject}>
                      {t("ok")}
                    </CustomizedButton>
                    &nbsp;
                    <CustomizedButton
                      destructive
                      onClick={() => {
                        setRejectDialog(false);
                      }}
                    >
                      {t("cancel")}
                    </CustomizedButton>
                  </ModalActions>
                </Modal>
              )}
            </div>
          )}
          {/* {foundApprovedEvent && (
            <div className="flex items-center">
              <CustomizedButton loading={loading} primary>
                {t("sync")}
              </CustomizedButton>
            </div>
          )} */}
          &nbsp;
          <CustomizedButton
            loading={loading}
            onClick={() => {
              setPendingFacilityDialog(false);
            }}
          >
            {t("close")}
          </CustomizedButton>
        </ModalActions>
      </Modal>
    )
  );
};
export default PendingFacilityDialog;
