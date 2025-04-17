import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import useMetadataStore from "@/states/metadata";
import CustomizedButton from "@/ui/common/Button";
import DataValueLabel from "@/ui/common/DataValueLabel";
import { Modal, ModalTitle, ModalContent, ModalActions, NoticeBox } from "@dhis2/ui";
import Helper from "@/ui/common/Helper";
import InputField from "@/ui/common/InputField";
import { Tooltip } from "@mui/material";
import CustomizedInputField from "@/ui/common/InputField";
import DataValueField from "@/ui/common/DataValueField";
import CustomAttributeLabel from "@/ui/common/CustomAttributeLabel";
import CustomAttributeField from "@/ui/common/CustomAttributeField";
import DataValueText from "@/ui/common/DataValueText";
import FacilityCoordinatesPickerMap from "./FacilityCoordinatesPickerMap";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useState } from "react";
import {
  getLatestValues,
  generateUid,
  convertToDhis2Event,
  convertDisplayValueForPath,
  convertTeis,
  pickTranslation,
  isInsideParent,
  findCustomAttributeValue
} from "@/utils";
import useDataStore from "@/states/data";
import { DATA_ELEMENTS, HIDDEN_DATA_ELEMENTS, MANDATORY_FIELDS, TRACKED_ENTITY_TYPE, PROGRAM_ID, TRACKED_ENTITY_ATTRIBUTES } from "@/const";
import { postEvent, postTei, getTeiById, findFacilityByCode } from "@/api/data";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faMap } from "@fortawesome/free-solid-svg-icons";
import { format } from "date-fns";
import _ from "lodash";
const { UID, APPROVAL_STATUS, PATH, NAME, ACTIVE_STATUS, SHORT_NAME, CODE, ATTRIBUTE_VALUES } = DATA_ELEMENTS;
const { ATTRIBUTE_CODE } = TRACKED_ENTITY_ATTRIBUTES;
const Row = ({ children, className }) => {
  return (
    <div className={`flex items-center py-1 border-b border-b-slate-200 ${className ? className : ""}`}>
      <div className="w-[250px] text-[15px]">{children[0]}</div>
      <div className="w-[450px] mr-3">{children[1]}</div>
    </div>
  );
};

const Closed = ({ children }) => {
  return <span className="text-[14px] p-1 rounded-md bg-red-200">{children}</span>;
};

const Open = ({ children }) => {
  return <span className="text-[14px] p-1 rounded-md bg-emerald-100 ">{children}</span>;
};

const NewFacilityDialog = () => {
  const [valid, setValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [orgUnit, setOrgUnit] = useState("");
  const [helpers, setHelpers] = useState([]);
  const [isDuplicated, setIsDuplicated] = useState(false);
  const { t } = useTranslation();
  const { facilities, actions } = useDataStore(
    useShallow((state) => ({
      facilities: state.facilities,
      actions: state.actions
    }))
  );
  const [facilityCoordinatesPicker, setFacilityCoordinatesPicker] = useState(false);

  const { program, orgUnits, locale, me, customAttributes } = useMetadataStore(
    useShallow((state) => ({
      program: state.program,
      orgUnits: state.orgUnits,
      locale: state.locale,
      me: state.me,
      customAttributes: state.customAttributes
    }))
  );
  const { selectedFacility, facilityCheckModuleActions } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      facilityCheckModuleActions: state.actions,
      selectedFacility: state.selectedFacility
    }))
  );

  const { addNewFacilityToList, addNewTeiToList, save } = actions;
  const { editSelectedFacility, toggleDialog, selectFacility } = facilityCheckModuleActions;

  const changeValue = (field, value) => {
    editSelectedFacility(field, value);
  };

  const changeAttributeValue = (attribute, value) => {
    const currentAttributeValues = selectedFacility[ATTRIBUTE_VALUES];
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
    editSelectedFacility(ATTRIBUTE_VALUES, JSON.stringify(finalValue));
  };

  const changeCoordinates = (value) => {
    editSelectedFacility("latitude", value[1]);
    editSelectedFacility("longitude", value[0]);
  };

  const saveChanges = async () => {
    const foundDuplicated = await findFacilityByCode(selectedFacility.tei, selectedFacility[CODE]);
    if (foundDuplicated) {
      setIsDuplicated(true);
      return;
    } else {
      setIsDuplicated(false);
    }
    const event = { ...selectedFacility };
    const today = format(new Date(), "yyyy-MM-dd");
    event.occurredAt = today;
    event.scheduledAt = today;
    event.orgUnit = orgUnit;
    editSelectedFacility("occurredAt", today);
    editSelectedFacility("scheduledAt", today);
    editSelectedFacility("orgUnit", orgUnit);
    const tei = {
      trackedEntity: event.tei,
      trackedEntityType: TRACKED_ENTITY_TYPE,
      orgUnit: orgUnit,
      attributes: [
        {
          attribute: TRACKED_ENTITY_ATTRIBUTES.UID,
          value: event[UID]
        },
        {
          attribute: TRACKED_ENTITY_ATTRIBUTES.ACTIVE_STATUS,
          value: event[ACTIVE_STATUS]
        }
      ],
      enrollments: [
        {
          enrollment: event.enr,
          trackedEntity: event.tei,
          program: PROGRAM_ID,
          status: "ACTIVE",
          orgUnit: orgUnit,
          enrolledAt: today,
          occurredAt: today,
          events: [convertToDhis2Event(event, program)]
        }
      ]
    };
    if (event[CODE]) {
      tei.attributes.push({ attribute: ATTRIBUTE_CODE, value: event[CODE] });
    }
    if (event.latitude && event.longitude) {
      tei.geometry = { coordinates: [event.longitude, event.latitude], type: "Point" };
      tei.enrollments[0].geometry = { coordinates: [event.longitude, event.latitude], type: "Point" };
    }
    await postTei(tei);
    const newTei = await getTeiById(tei.trackedEntity);
    const convertedNewTei = convertTeis([newTei], program)[0];
    addNewFacilityToList(convertedNewTei);
    addNewTeiToList(newTei);
    selectFacility(convertedNewTei);
    toggleDialog("newFacilityDialog");
    toggleDialog("facilityProfileDialog");
  };

  const complete = async () => {
    await saveChanges();
    let newFacility = { ...selectedFacility };
    const today = format(new Date(), "yyyy-MM-dd");
    newFacility.occurredAt = today;
    newFacility.scheduledAt = today;
    newFacility.orgUnit = orgUnit;
    changeValue(APPROVAL_STATUS, "pending");
    changeValue("status", "COMPLETED");
    changeValue("isPending", true);
    changeValue("completedAt", format(new Date(), "yyyy-MM-dd"));
    editSelectedFacility("isPending", true);
    newFacility.id = newFacility[UID];
    newFacility[APPROVAL_STATUS] = "pending";
    newFacility.status = "COMPLETED";
    newFacility.isPending = true;
    newFacility.completedAt = format(new Date(), "yyyy-MM-dd");
    newFacility.updatedBy = {
      firstName: me.firstName,
      surname: me.surname
    };
    save(newFacility);
    const convertedEvent = convertToDhis2Event(newFacility, program);
    const result = await postEvent(convertedEvent);
  };

  useEffect(() => {
    let valid = true;
    const currentHelpers = [
      {
        type: "HELPER",
        target: PATH,
        value: t("pleaseSelectFacilityParent")
      }
    ];
    MANDATORY_FIELDS.forEach((field) => {
      if (!selectedFacility || !selectedFacility[field]) {
        currentHelpers.push({
          target: "",
          type: "ERROR",
          value: t("missingMandatoryFields")
        });
        valid = false;
      }
    });
    let orgUnit = "";
    if (selectedFacility) {
      const pathOrgUnits = _.compact(selectedFacility[PATH].split("/").reverse());
      pathOrgUnits.forEach((pathOrgUnit, index) => {
        const foundInAssignedOrgUnits = program.programs[0].organisationUnits.find((ou) => ou.id === pathOrgUnit);
        if (foundInAssignedOrgUnits && !orgUnit) {
          orgUnit = foundInAssignedOrgUnits.id;
        }
        if (index === 1) {
          const foundOu = orgUnits.find((ou) => ou.id === pathOrgUnit);
          const foundChildrenFacilities = facilities.filter((f) => f[PATH].includes(pathOrgUnit));
          const ouName = foundOu.name;
          const ouShortName = foundOu.shortName;
          if (ouName && selectedFacility[NAME]) {
            if (selectedFacility[NAME].toLowerCase() === ouName.toLowerCase()) {
              currentHelpers.push({
                target: NAME,
                type: "ERROR",
                value: t("facilityCannotHaveTheSameNameAsItsParent")
              });
              valid = false;
            }
          }
          if (selectedFacility[NAME]) {
            const foundSameName = foundChildrenFacilities.find((fcf) => {
              return fcf[NAME].toLowerCase() === selectedFacility[NAME].toLowerCase();
            });
            if (foundSameName) {
              currentHelpers.push({
                target: NAME,
                type: "ERROR",
                value: t("facilityNameInSameParentHasBeenTaken")
              });
              valid = false;
            }
          }
          if (ouShortName && selectedFacility[SHORT_NAME]) {
            if (selectedFacility[SHORT_NAME].toLowerCase() === ouShortName.toLowerCase()) {
              currentHelpers.push({
                target: SHORT_NAME,
                type: "ERROR",
                value: t("facilityCannotHaveTheSameShortNameAsItsParent")
              });
              valid = false;
            }
          }
          if (selectedFacility[SHORT_NAME]) {
            const foundSameName = foundChildrenFacilities.find((fcf) => {
              return fcf[SHORT_NAME].toLowerCase() === selectedFacility[SHORT_NAME].toLowerCase();
            });
            if (foundSameName) {
              currentHelpers.push({
                target: SHORT_NAME,
                type: "ERROR",
                value: t("facilityShortNameInSameParentHasBeenTaken")
              });
              valid = false;
            }
          }
        }
      });
      if (!orgUnit) {
        currentHelpers.push({
          target: PATH,
          type: "ERROR",
          value: t("parentNotAssignedToFcaProgram")
        });
        valid = false;
      }

      const path = selectedFacility[PATH];
      if (selectedFacility.latitude && selectedFacility.longitude && path) {
        const isInside = isInsideParent(path, selectedFacility.latitude, selectedFacility.longitude);
        if (!isInside) {
          currentHelpers.push({
            target: "coordinates",
            type: "ERROR",
            value: t("mustBeInsideParentBoundaries")
          });
          valid = false;
        }
      }
    }

    setValid(valid);
    setOrgUnit(orgUnit);
    setHelpers([...currentHelpers]);
  }, [selectedFacility ? Object.values(selectedFacility).join(";") : ""]);

  const foundCoordinatesError = helpers.find((h) => h.target === "coordinates" && h.type === "ERROR");
  return (
    selectedFacility && (
      <Modal fluid>
        <ModalTitle>{t("newFacility")}</ModalTitle>
        <ModalContent>
          <div className="h-[700px]">
            <div className="w-full h-[80px]">
              {["z6u0MJRMxOw", "jDSCfb245G5", "WvwRmFG7udm"].map((de) => {
                const value = selectedFacility[de];
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
                    ) : (
                      <DataValueText dataElement={de} value={value} />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center py-1 border-b-2 border-b-slate-400 font-bold text-[15px] h-[35px]">
              <div className="w-[250px]">{t("field")}</div>
              <div className="w-[450px]">{t("value")}</div>
            </div>
            <div className="h-[calc(100%-115px)] overflow-auto">
              {(() => {
                const value = selectedFacility[PATH];
                const tempValue = selectedFacility[NAME] ? selectedFacility[NAME] : t("newFacilityName");
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
                    if (!foundInFacilities) {
                      return true;
                    } else {
                      return false;
                    }
                  })
                  .map((orgUnit) => orgUnit.path);
                return (
                  <Row>
                    <DataValueLabel dataElement={PATH} mandatory={true} />
                    <div>
                      <InputField
                        roots={orgUnits.filter((orgUnit) => orgUnit.level === 1).map((orgUnit) => orgUnit.id)}
                        filter={filter}
                        displayValue={convertDisplayValueForPath(value, tempValue)}
                        valueType="ORGANISATION_UNIT"
                        value={value}
                        onChange={(orgUnit) => {
                          changeValue(PATH, orgUnit.path + "/" + selectedFacility[UID]);
                        }}
                      />
                      {helpers
                        .filter((h) => h.target === PATH)
                        .map((h) => {
                          return (
                            <div>
                              <Helper type={h.type} value={h.value} />
                            </div>
                          );
                        })}
                    </div>
                  </Row>
                );
              })()}
              <Row className="mt-auto">
                <span>{t("coordinates")}</span>
                <div className="w-full">
                  <div className="flex w-full">
                    <CustomizedInputField
                      valueType="COORDINATES"
                      disabled={loading}
                      value={[selectedFacility.longitude, selectedFacility.latitude]}
                      onChange={(value) => {
                        changeCoordinates(value);
                      }}
                      error={foundCoordinatesError ? true : false}
                      helpers={[foundCoordinatesError]}
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
              </Row>
              {program.programStages[0].programStageDataElements
                .filter((psde) => {
                  return !HIDDEN_DATA_ELEMENTS.includes(psde.dataElement.id) && psde.dataElement.id !== PATH;
                })
                .map((psde) => {
                  const de = psde.dataElement;
                  return (
                    <Row>
                      <DataValueLabel dataElement={de.id} mandatory={MANDATORY_FIELDS.includes(de.id)} />
                      <div>
                        <DataValueField
                          dataElement={de.id}
                          disabled={loading || de.id === ACTIVE_STATUS}
                          value={selectedFacility[de.id]}
                          onChange={(value) => {
                            changeValue(de.id, value);
                          }}
                        />
                        {helpers
                          .filter((h) => h.target === de.id)
                          .map((h) => {
                            return (
                              <div>
                                <Helper type={h.type} value={h.value} />
                              </div>
                            );
                          })}
                      </div>
                    </Row>
                  );
                })}
              {customAttributes.map((customAttribute) => {
                const { id } = customAttribute;
                return (
                  <Row>
                    <CustomAttributeLabel attribute={id} />
                    <div>
                      <CustomAttributeField
                        attribute={id}
                        value={findCustomAttributeValue(selectedFacility[ATTRIBUTE_VALUES], id)}
                        onChange={(value) => {
                          changeAttributeValue(id, value);
                        }}
                      />
                    </div>
                  </Row>
                );
              })}
            </div>
          </div>
          <FacilityCoordinatesPickerMap
            open={facilityCoordinatesPicker}
            setOpen={setFacilityCoordinatesPicker}
            changeCoordinates={changeCoordinates}
            path={selectedFacility[PATH]}
          />
        </ModalContent>
        <ModalActions>
          {isDuplicated && (
            <NoticeBox className="!p-[5.5px]" error>
              {t("thisCodeHasBeenTaken")}
            </NoticeBox>
          )}
          <div className="flex items-center">
            &nbsp;
            <CustomizedButton
              icon={saved ? <FontAwesomeIcon icon={faCheck} /> : undefined}
              loading={loading}
              disabled={loading || !valid}
              primary={true}
              onClick={saveChanges}
            >
              {t("save")}
            </CustomizedButton>
            &nbsp;
            <CustomizedButton loading={loading} disabled={loading || !valid} onClick={complete}>
              {t("applyForApproval")}
            </CustomizedButton>
            &nbsp;
            <CustomizedButton
              disabled={loading}
              onClick={() => {
                toggleDialog("newFacilityDialog");
              }}
            >
              {t("close")}
            </CustomizedButton>
          </div>
        </ModalActions>
      </Modal>
    )
  );
};
export default NewFacilityDialog;
