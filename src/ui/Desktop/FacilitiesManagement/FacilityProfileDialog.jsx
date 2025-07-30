import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import useMetadataStore from "@/states/metadata";
import CustomizedButton from "@/ui/common/Button";
import DataValueLabel from "@/ui/common/DataValueLabel";
import { Modal, ModalTitle, ModalContent, ModalActions, NoticeBox } from "@dhis2/ui";
import Helper from "@/ui/common/Helper";
import InputField from "@/ui/common/InputField";
import { Tooltip, Popover } from "@mui/material";
import CustomizedInputField from "@/ui/common/InputField";
import DataValueField from "@/ui/common/DataValueField";
import DataValueText from "@/ui/common/DataValueText";
import CustomAttributeLabel from "@/ui/common/CustomAttributeLabel";
import CustomAttributeField from "@/ui/common/CustomAttributeField";
import FacilityCoordinatesPickerMap from "./FacilityCoordinatesPickerMap";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useState } from "react";
import { getLatestValues, generateUid, convertToDhis2Event, convertDisplayValueForPath, isInsideParent, findCustomAttributeValue } from "@/utils";
import useDataStore from "@/states/data";
import { DATA_ELEMENTS, HIDDEN_DATA_ELEMENTS, TRACKED_ENTITY_ATTRIBUTES } from "@/const";
import { postEvent, postTei, findFacilityByCode } from "@/api/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose, faMap } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import _ from "lodash";
import GeoJsonViewer from "@/ui/common/GeoJsonViewer";
const { UID, APPROVAL_STATUS, PATH, IS_NEW_FACILITY, CODE, ATTRIBUTE_VALUES } = DATA_ELEMENTS;
const { ATTRIBUTE_CODE } = TRACKED_ENTITY_ATTRIBUTES;
const Row = ({ children, className }) => {
  return (
    <div className={`flex  py-1 border-b border-b-slate-200 ${className ? className : ""}`}>
      <div className="self-center w-[250px] text-[15px]">{children[0]}</div>
      <div className="self-start w-[450px]">{children[1]}</div>
      <div className="self-start flex items-center w-[450px] h-[40px] ml-2 mr-2 p-2 rounded-md bg-slate-100 text-[14px]">{children[2]}</div>
    </div>
  );
};

const Closed = ({ children }) => {
  return <span className="text-[14px] p-1 rounded-md bg-red-200">{children}</span>;
};

const Open = ({ children }) => {
  return <span className="text-[14px] p-1 rounded-md bg-emerald-100 ">{children}</span>;
};

const New = ({ children }) => {
  return <span className="text-[14px] text-white p-1 rounded-md bg-green-700 ">{children}</span>;
};

const FacilityProfileDialog = () => {
  const [geoJsonViewer, setGeoJsonViewer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDuplicated, setIsDuplicated] = useState(false);
  const { t } = useTranslation();
  const { teis, facilities, actions } = useDataStore(
    useShallow((state) => ({
      teis: state.teis,
      facilities: state.facilities,
      actions: state.actions
    }))
  );
  const [facilityCoordinatesPicker, setFacilityCoordinatesPicker] = useState(false);
  const { program, me, orgUnits, customAttributes } = useMetadataStore(
    useShallow((state) => ({
      me: state.me,
      program: state.program,
      orgUnits: state.orgUnits,
      customAttributes: state.customAttributes
    }))
  );
  const [currentFacility, setCurrentFacility] = useState({});
  const { selectedFacility, facilityCheckModuleActions, isReadOnly } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      facilityCheckModuleActions: state.actions,
      selectedFacility: state.selectedFacility,
      isReadOnly: state.isReadOnly
    }))
  );

  const { save } = actions;
  const { editSelectedFacility, toggleDialog } = facilityCheckModuleActions;
  const isPending = selectedFacility.isPending;

  const changeValue = (field, value) => {
    const cloned = _.cloneDeep(currentFacility);
    cloned[field] = value;
    setCurrentFacility({ ...cloned });
  };
  const changeAttributeValue = (attribute, value) => {
    const currentAttributeValues = currentFacility[ATTRIBUTE_VALUES];
    let finalValue = [];
    if (!currentAttributeValues && value) {
      finalValue.push({
        attribute: {
          id: attribute
        },
        value: value
      });
    } else {
      finalValue = JSON.parse(currentAttributeValues);
      const foundIndex = finalValue.findIndex((v) => v.attribute.id === attribute);
      if (foundIndex === -1) {
        finalValue.push({
          attribute: {
            id: attribute
          },
          value: value
        });
      } else {
        finalValue[foundIndex].value = value;
      }
    }
    changeValue(ATTRIBUTE_VALUES, JSON.stringify(finalValue));
  };

  const changeCoordinates = (value) => {
    const cloned = _.cloneDeep(currentFacility);
    cloned.longitude = value[0] ? parseFloat(value[0]) : "";
    cloned.latitude = value[1] ? parseFloat(value[1]) : "";
    setCurrentFacility({ ...cloned });
  };

  useEffect(() => {
    const foundActiveEvent = selectedFacility.events.find((event) => event.status === "ACTIVE");
    const foundPendingEvent = selectedFacility.events.find((event) => event.status === "COMPLETED" && event[APPROVAL_STATUS] === "pending");
    setSaved(false);
    setLoading(false);
    if (foundActiveEvent) {
      setCurrentFacility({
        ...foundActiveEvent,
        id: selectedFacility[UID],
        orgUnit: selectedFacility.orgUnit,
        tei: selectedFacility.tei,
        enr: selectedFacility.enr
      });
    } else if (foundPendingEvent) {
      setCurrentFacility({
        ...foundPendingEvent,
        id: selectedFacility[UID],
        orgUnit: selectedFacility.orgUnit,
        tei: selectedFacility.tei,
        enr: selectedFacility.enr
      });
    } else {
      setCurrentFacility({
        event: generateUid(),
        id: selectedFacility[UID],
        orgUnit: selectedFacility.orgUnit,
        tei: selectedFacility.tei,
        enr: selectedFacility.enr,
        status: "ACTIVE",
        occurredAt: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS")
      });
    }
  }, [selectedFacility ? selectedFacility[UID] : "", selectedFacility.lastUpdated]);

  const saveChanges = async () => {
    setSaved(false);
    setLoading(true);
    const foundDuplicated = await checkDuplicatedCode();
    if (foundDuplicated) {
      setLoading(false);
      return;
    }
    await updateTei();
    save(currentFacility);
    const convertedEvent = convertToDhis2Event(currentFacility, program);
    const result = await postEvent(convertedEvent);
    setLoading(false);
    setSaved(true);
  };

  const complete = async () => {
    setSaved(false);
    setLoading(true);
    const foundDuplicated = await checkDuplicatedCode();
    if (foundDuplicated) {
      setLoading(false);
      return;
    }
    await updateTei();
    changeValue(APPROVAL_STATUS, "pending");
    changeValue("status", "COMPLETED");
    changeValue("isPending", true);
    changeValue("completedAt", format(new Date(), "yyyy-MM-dd"));
    editSelectedFacility("isPending", true);
    currentFacility[APPROVAL_STATUS] = "pending";
    currentFacility.status = "COMPLETED";
    currentFacility.isPending = true;
    currentFacility.completedAt = format(new Date(), "yyyy-MM-dd");
    currentFacility.updatedBy = {
      firstName: me.firstName,
      surname: me.surname,
      username: me.username
    };
    save(currentFacility);
    const convertedEvent = convertToDhis2Event(currentFacility, program);
    const result = await postEvent(convertedEvent);
    setLoading(false);
    setSaved(true);
  };

  const updateTei = async () => {
    if (currentFacility[CODE] !== selectedFacility[CODE]) {
      const foundTei = teis.find((tei) => tei.trackedEntity === currentFacility.tei);
      if (foundTei) {
        const clonedTei = _.cloneDeep(foundTei);
        const foundAttributeIndex = clonedTei.attributes.findIndex((attr) => attr.attribute === ATTRIBUTE_CODE);
        if (foundAttributeIndex === -1) {
          clonedTei.attributes.push({
            attribute: ATTRIBUTE_CODE,
            value: currentFacility[CODE]
          });
        } else {
          clonedTei.attributes[foundAttributeIndex].value = currentFacility[CODE];
        }
        delete clonedTei.enrollments;
        await postTei(clonedTei);
      }
    }
  };

  const checkDuplicatedCode = async () => {
    let foundDuplicated = false;
    if (currentFacility[CODE]) {
      foundDuplicated = await findFacilityByCode(selectedFacility.tei, currentFacility[CODE]);
    }
    if (foundDuplicated) {
      setIsDuplicated(true);
      return true;
    } else {
      setIsDuplicated(false);
      return false;
    }
  };

  const [helpers, setHelpers] = useState([]);

  useEffect(() => {
    const path = currentFacility[PATH] ? currentFacility[PATH] : selectedFacility.previousValues[PATH];
    const currentHelpers = [];
    if (!currentFacility.latitude && !currentFacility.longitude) {
      setHelpers(currentHelpers);
      return;
    }
    if (path) {
      const isInside = isInsideParent(path, currentFacility.latitude, currentFacility.longitude);
      if (!isInside) {
        currentHelpers.push({
          target: "coordinates",
          type: "error",
          value: t("mustBeInsideParentBoundaries")
        });
      }
    }
    setHelpers(currentHelpers);
  }, [JSON.stringify(currentFacility)]);

  const foundCoordinatesError = helpers.find((h) => h.type === "error" && h.target === "coordinates");
  return (
    <Modal fluid>
      <ModalTitle>{t("facilityProfile")}</ModalTitle>
      <ModalContent>
        <div className="h-[550px]">
          <div className="w-full h-[80px]">
            {["z6u0MJRMxOw", "jDSCfb245G5", "WvwRmFG7udm"].map((de) => {
              const value = currentFacility[de]
                ? selectedFacility.previousValues[de]
                  ? selectedFacility.previousValues[de]
                  : selectedFacility[de]
                : selectedFacility[de];
              return (
                <div>
                  <DataValueLabel dataElement={de} />
                  :&nbsp;
                  {de === "WvwRmFG7udm" ? (
                    value === "open" ? (
                      <Open>
                        <DataValueText dataElement={de} value={value} />
                      </Open>
                    ) : (
                      <Closed>
                        <DataValueText dataElement={de} value={value} />
                      </Closed>
                    )
                  ) : de === "z6u0MJRMxOw" ? (
                    <>
                      <DataValueText dataElement={de} value={value} />
                      &nbsp;
                      {selectedFacility[IS_NEW_FACILITY] === "true" && <New>{t("newFacility")}</New>}
                    </>
                  ) : (
                    <DataValueText dataElement={de} value={value} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center py-1 border-b-2 border-b-slate-400 font-bold text-[15px] h-[35px]">
            <div className="w-[250px]">{t("field")}</div>
            <div className="w-[450px]">{isPending ? t("awaitingApprovalValue") : t("newValue")}</div>
            <div className="w-[450px] ml-2">{isPending ? t("previousValue") : t("currentValue")}</div>
          </div>
          <div className="h-[calc(100%-115px)] overflow-auto">
            {(() => {
              const de = PATH;
              const currentValue = currentFacility[de];
              const value = currentValue ? selectedFacility.previousValues[de] : selectedFacility[de];
              const filter = orgUnits
                .filter((orgUnit) => {
                  let valid = false;
                  me.organisationUnits.forEach((meOrgUnit) => {
                    if (orgUnit.path.includes(meOrgUnit.id)) {
                      valid = true;
                    }
                  });
                  if (orgUnit.level === 1) {
                    valid = true;
                  }
                  return valid;
                })
                .filter((orgUnit) => {
                  const foundInFacilities = facilities.find((f) => f[PATH] === orgUnit.path);
                  return !foundInFacilities;
                })
                .map((orgUnit) => orgUnit.path);
              return (
                <Row>
                  <DataValueLabel dataElement={de} />
                  <div>
                    <InputField
                      disabled={isPending || loading || isReadOnly}
                      filter={filter}
                      displayValue={convertDisplayValueForPath(currentValue)}
                      valueType="ORGANISATION_UNIT"
                      value={currentValue}
                      onChange={(orgUnit) => {
                        changeValue(de, orgUnit.path + "/" + selectedFacility[UID]);
                      }}
                    />
                    {currentValue && currentValue !== value && value !== "" && <Helper type="WARNING" value={t("outsideBoundaryHelper")} />}
                  </div>
                  {value ? <DataValueText dataElement={de} value={value} /> : <span>&nbsp;</span>}
                </Row>
              );
            })()}
            <Row className="mt-auto">
              <span>{t("coordinates")}</span>
              <div className="w-full">
                <div className="flex w-full">
                  <CustomizedInputField
                    error={foundCoordinatesError ? true : false}
                    valueType="COORDINATES"
                    disabled={isPending || loading || isReadOnly}
                    value={[currentFacility.longitude, currentFacility.latitude]}
                    onChange={(value) => {
                      changeCoordinates(value);
                    }}
                  />
                  <div className="h-full mt-auto ml-1">
                    <CustomizedButton
                      icon={<FontAwesomeIcon icon={faMap} />}
                      className="!h-[40px]"
                      onClick={() => {
                        setFacilityCoordinatesPicker(true);
                      }}
                    >
                      {t("map")}
                    </CustomizedButton>
                  </div>
                </div>
                {foundCoordinatesError && <Helper type="ERROR" value={foundCoordinatesError.value} />}
              </div>
              <span>
                {selectedFacility.previousValues.longitude && selectedFacility.previousValues.latitude ? (
                  `[ ${selectedFacility.previousValues.latitude} , ${selectedFacility.previousValues.longitude} ]`
                ) : (
                  <div>&nbsp;</div>
                )}
              </span>
            </Row>
            {program.programStages[0].programStageDataElements
              .filter((psde) => {
                return !HIDDEN_DATA_ELEMENTS.includes(psde.dataElement.id) && psde.dataElement.id !== PATH;
              })
              .map((psde) => {
                const de = psde.dataElement;
                const currentValue = currentFacility[de.id];
                let value = currentValue ? selectedFacility.previousValues[de.id] : selectedFacility[de.id];
                if (currentFacility[IS_NEW_FACILITY] === "true" && !currentValue) {
                  value = "";
                }
                return (
                  <Row>
                    <DataValueLabel dataElement={de.id} />
                    <DataValueField
                      dataElement={de.id}
                      disabled={isPending || loading || isReadOnly}
                      value={currentFacility[de.id]}
                      onChange={(value) => {
                        changeValue(de.id, value);
                      }}
                    />
                    {value ? <DataValueText dataElement={de.id} value={value} /> : <span>&nbsp;</span>}
                  </Row>
                );
              })}
            {customAttributes.map((customAttribute) => {
              const { id, valueType } = customAttribute;
              const currentValue = findCustomAttributeValue(currentFacility[ATTRIBUTE_VALUES], id);
              const value = currentValue
                ? findCustomAttributeValue(selectedFacility.previousValues[ATTRIBUTE_VALUES], id)
                : findCustomAttributeValue(selectedFacility[ATTRIBUTE_VALUES], id);
              return (
                <Row>
                  <CustomAttributeLabel attribute={id} />
                  <div>
                    <CustomAttributeField
                      disabled={isPending || loading || isReadOnly}
                      attribute={id}
                      value={currentValue}
                      onChange={(value) => {
                        changeAttributeValue(id, value);
                      }}
                    />
                  </div>
                  {value ? (
                    valueType === "GEOJSON" ? (
                      <div>
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
                                  point={[
                                    currentFacility.latitude ? currentFacility.latitude : selectedFacility.previousValues.latitude,
                                    currentFacility.longitude ? currentFacility.longitude : selectedFacility.previousValues.longitude
                                  ]}
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
                      </div>
                    ) : (
                      <span>{value}</span>
                    )
                  ) : (
                    <span>&nbsp;</span>
                  )}
                </Row>
              );
            })}
          </div>
        </div>
        <FacilityCoordinatesPickerMap
          open={facilityCoordinatesPicker}
          setOpen={setFacilityCoordinatesPicker}
          changeCoordinates={changeCoordinates}
          path={currentFacility[PATH] ? currentFacility[PATH] : selectedFacility.previousValues[PATH]}
        />
      </ModalContent>
      <ModalActions>
        <div className="flex items-center">
          {isPending && (
            <NoticeBox className="!p-[5.5px]" warning>
              {t("isPendingWarning")}
            </NoticeBox>
          )}
          {isDuplicated && (
            <NoticeBox className="!p-[5.5px]" error>
              {t("thisCodeHasBeenTaken")}
            </NoticeBox>
          )}
          {saved && (
            <NoticeBox className="!p-[5.5px]" valid>
              {t("facilityHaveBeenSaved")}
            </NoticeBox>
          )}
          &nbsp;
          <CustomizedButton
            loading={loading}
            disabled={loading || isPending || helpers.find((h) => h.type === "error") || isReadOnly}
            primary={true}
            onClick={saveChanges}
          >
            {t("save")}
          </CustomizedButton>
          &nbsp;
          <CustomizedButton
            loading={loading}
            disabled={loading || isPending || helpers.find((h) => h.type === "error") || isReadOnly}
            onClick={complete}
          >
            {t("applyForApproval")}
          </CustomizedButton>
          &nbsp;
          <CustomizedButton
            disabled={loading}
            onClick={() => {
              toggleDialog("facilityProfileDialog");
            }}
          >
            {t("close")}
          </CustomizedButton>
        </div>
      </ModalActions>
    </Modal>
  );
};
export default FacilityProfileDialog;
