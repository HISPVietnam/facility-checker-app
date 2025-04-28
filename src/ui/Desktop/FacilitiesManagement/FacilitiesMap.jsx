import CustomizedInputField from "@/ui/common/InputField";
import { SingleSelectField, SingleSelectOption, CheckboxField, Popover, NoticeBox } from "@dhis2/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap } from "@fortawesome/free-solid-svg-icons";
import useMetadataStore from "@/states/metadata";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, Marker, Tooltip, Popup } from "react-leaflet";
import { useMap } from "react-leaflet";
import { useShallow } from "zustand/react/shallow";
import L from "leaflet";
import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import { useTranslation } from "react-i18next";
import CustomizedButton from "@/ui/common/Button";
import useLayoutStore from "@/states/layout";
import { isValidPoint, isInsideParent, convertToDhis2Event, generateUid } from "@/utils";
import useDataStore from "@/states/data";
import { DATA_ELEMENTS, BASE_LAYER_TYPES } from "@/const";
import DataValueLabel from "@/ui/common/DataValueLabel";
import FacilityProfileDialog from "./FacilityProfileDialog";
import { postEvent } from "@/api/data";
import { format } from "date-fns";
import DataValueText from "@/ui/common/DataValueText";
import { booleanPointInPolygon, point } from "@turf/turf";
import _ from "lodash";
const { UID, NAME, PATH } = DATA_ELEMENTS;

const TooltipContent = (props) => {
  const [loading, setLoading] = useState(false);
  const { program, orgUnitGeoJson } = useMetadataStore(
    useShallow((state) => ({
      program: state.program,
      orgUnitGeoJson: state.orgUnitGeoJson
    }))
  );
  const { selectedFacility, editing, actions, draggingMode, isReadOnly } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      selectedFacility: state.selectedFacility,
      draggingMode: state.draggingMode,
      editing: state.editing,
      actions: state.actions,
      isReadOnly: state.isReadOnly
    }))
  );
  const { facilities, dataStoreActions } = useDataStore(
    useShallow((state) => ({
      facilities: state.facilities,
      dataStoreActions: state.actions
    }))
  );
  const { save } = dataStoreActions;
  const { toggleEditing, toggleDraggingMode, selectFacility, editSelectedFacility, toggleDialog } = actions;
  const { t } = useTranslation();
  const facility = selectedFacility;
  const [lat, setLat] = useState(facility.latitude);
  const [long, setLong] = useState(facility.longitude);
  const [valid, setValid] = useState(false);
  const [isWithinParent, setIsWithinParent] = useState(false);
  const isPending = facility.isPending;
  useEffect(() => {
    setLat(facility.latitude);
    setLong(facility.longitude);
  }, [facility.latitude, facility.longitude]);

  useEffect(() => {
    let valid = true;
    let isWithinParent = true;
    if (!isValidPoint(parseFloat(lat), parseFloat(long))) {
      valid = false;
    }
    if (!valid) {
      setValid(valid);
      return;
    }
    isWithinParent = isInsideParent(facility[PATH], lat, long);
    setValid(valid);
    setIsWithinParent(isWithinParent);
  }, [lat, long]);

  const saveChanges = async () => {
    setLoading(true);
    const foundActiveEvent = facility.events.find((event) => event.status === "ACTIVE");
    let tempFacility = null;
    if (foundActiveEvent) {
      tempFacility = {
        ...foundActiveEvent,
        id: facility[UID],
        orgUnit: facility.orgUnit,
        tei: facility.tei,
        enr: facility.enr,
        latitude: lat,
        longitude: long
      };
    } else {
      tempFacility = {
        event: generateUid(),
        id: facility[UID],
        orgUnit: facility.orgUnit,
        tei: facility.tei,
        enr: facility.enr,
        status: "ACTIVE",
        occurredAt: format(new Date(), "yyyy-MM-dd"),
        latitude: lat,
        longitude: long
      };
    }
    save(tempFacility);
    const convertedEvent = convertToDhis2Event(tempFacility, program);
    const result = await postEvent(convertedEvent);
    editSelectedFacility("latitude", lat);
    editSelectedFacility("longitude", long);
    setLoading(false);
    toggleEditing();
    if (draggingMode) {
      toggleDraggingMode();
    }
  };

  return (
    <div className="w-[500px]">
      <div className="flex items-center">
        <div className="w-[100px] font-bold">
          <DataValueLabel dataElement={NAME} />:
        </div>
        &nbsp;
        <DataValueText dataElement={NAME} value={facility[NAME]} />
      </div>
      <div className="flex items-center">
        <div className="w-[100px] font-bold">
          <DataValueLabel dataElement={PATH} />:
        </div>
        &nbsp;
        <DataValueText dataElement={PATH} value={facility[PATH]} />
      </div>
      <div className="flex items-center mb-1">
        <div className="w-[100px] font-bold">{t("latitude")}:</div>
        &nbsp;
        {editing ? (
          <CustomizedInputField
            value={lat}
            dense={true}
            valueType="number"
            onChange={(value) => {
              setLat(value);
            }}
          />
        ) : (
          <DataValueText dataElement="latitude" value={facility.latitude} />
        )}
      </div>
      <div className="flex items-center">
        <div className="w-[100px] font-bold">{t("longitude")}:</div>
        &nbsp;
        {editing ? (
          <CustomizedInputField
            value={long}
            dense={true}
            valueType="number"
            onChange={(value) => {
              setLong(value);
            }}
          />
        ) : (
          <DataValueText dataElement="longitude" value={facility.longitude} />
        )}
      </div>
      <div className="mt-2 flex">
        <CustomizedButton
          small={true}
          hidden={editing}
          onClick={() => {
            toggleDialog("facilityProfileDialog");
          }}
        >
          {isPending || isReadOnly ? t("viewProfile") : t("editProfile")}
        </CustomizedButton>
        &nbsp;
        <CustomizedButton small={true} disabled={isPending || isReadOnly} onClick={toggleEditing} hidden={editing}>
          {t("editLocation")}
        </CustomizedButton>
        <CustomizedButton loading={loading} small={true} hidden={!editing} disabled={!valid || !isWithinParent} primary onClick={saveChanges}>
          {t("save")}
        </CustomizedButton>
        &nbsp;
        <CustomizedButton
          loading={loading}
          small={true}
          hidden={!editing}
          onClick={() => {
            toggleEditing();
            if (draggingMode) {
              toggleDraggingMode();
            }
            const foundSelectedFacility = facilities.find((f) => f[UID] === facility[UID]);
            selectFacility(foundSelectedFacility);
            setLat(foundSelectedFacility.latitude);
            setLong(foundSelectedFacility.longitude);
          }}
          destructive
        >
          {t("cancel")}
        </CustomizedButton>
        &nbsp;
        <CustomizedButton loading={loading} small={true} hidden={!editing || draggingMode} onClick={toggleDraggingMode}>
          {t("move")}
        </CustomizedButton>
        &nbsp;
        <CustomizedButton loading={loading} small={true} hidden={!draggingMode || !editing} disabled>
          {t("moving")}
        </CustomizedButton>
      </div>
      {!isWithinParent && (
        <div>
          <NoticeBox className="!p-[5.5px] mt-1" error>
            {t("mustBeInsideParentBoundaries")}
          </NoticeBox>
        </div>
      )}
      {isPending && (
        <div>
          <NoticeBox className="!p-[5.5px] mt-1" warning>
            {t("isPendingWarning")}
          </NoticeBox>
        </div>
      )}
    </div>
  );
};

const BoundaryLayer = () => {
  const ref = useRef();
  const map = useMap();
  const layout = useLayoutStore((state) => state.layout);
  const [transformedData, setTransformedData] = useState(null);
  const { mapControl, selectedOrgUnit, draggingMode, editing, selectedFacility } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      mapControl: state.mapControl,
      selectedOrgUnit: state.selectedOrgUnit,
      draggingMode: state.draggingMode,
      selectedFacility: state.selectedFacility,
      editing: state.editing
    }))
  );
  const facilities = useDataStore((state) => state.facilities);
  const { orgUnitGeoJson } = useMetadataStore(
    useShallow((state) => ({
      orgUnitGeoJson: state.orgUnitGeoJson
    }))
  );

  useEffect(() => {
    if (selectedOrgUnit) {
      const foundSelf = orgUnitGeoJson.features.find((feature) => feature.id === selectedOrgUnit.id);
      const foundChildren = orgUnitGeoJson.features.filter((feature) => feature.properties.parent === selectedOrgUnit.id);
      const foundParent = orgUnitGeoJson.features.find((feature) => selectedOrgUnit.parent && feature.id === selectedOrgUnit.parent.id);
      const foundFacility = facilities.find((f) => {
        return f[UID] === selectedOrgUnit.id;
      });
      let finalFeatures;
      if (foundFacility) {
        finalFeatures = [foundParent];
      } else if (foundSelf && foundSelf.geometry.type !== "Point") {
        finalFeatures = [foundSelf];
        if (foundChildren) {
          const foundChildrenPolygon = foundChildren.filter((child) => child.geometry.type === "Polygon" || child.geometry.type === "MultiPolygon");
          finalFeatures.push(...foundChildrenPolygon);
        }
      } else if (foundChildren && foundChildren.length > 0) {
        finalFeatures = foundChildren;
      } else {
        finalFeatures = [foundParent];
      }
      if (editing) {
        const path = selectedFacility[PATH];
        const currentOrgUnits = _.compact(path.split("/"));
        currentOrgUnits.pop();
        const parent = currentOrgUnits.pop();
        const foundIndexInFinalFeature = finalFeatures.findIndex((f) => f.id === parent);
        const foundInFeatures = orgUnitGeoJson.features.find((feature) => feature.id === parent);
        if (foundIndexInFinalFeature !== -1) {
          finalFeatures[foundIndexInFinalFeature] = { ...finalFeatures[foundIndexInFinalFeature], highlight: true };
        } else if (foundInFeatures && (foundInFeatures.geometry.type === "Polygon" || foundInFeatures.geometry.type === "MultiPolygon")) {
          const newFeature = { ...foundInFeatures, highlight: true };
          finalFeatures.push(newFeature);
        }
      }
      const transformedData = {
        ...orgUnitGeoJson,
        features: finalFeatures
      };
      transformedData.lastUpdated = new Date().toISOString();
      setTransformedData({ ...transformedData });
    }
  }, [selectedOrgUnit ? selectedOrgUnit.id : "", editing]);

  useEffect(() => {
    try {
      const bounds = ref.current.getBounds();
      facilities
        .filter((facility) => !facility.hidden)
        .filter((facility) => facility.latitude && facility.longitude)
        .forEach((facility) => {
          bounds.extend([facility.latitude, facility.longitude]);
        });
      map.fitBounds(bounds);
    } catch (err) {
      console.log(err);
    }
  }, [transformedData ? transformedData.lastUpdated : ""]);

  useEffect(() => {
    try {
      setTimeout(() => {
        map.invalidateSize();
      }, 1000);
    } catch (err) {
      console.log(err);
    }
  }, [transformedData ? transformedData.lastUpdated : ""]);

  useEffect(() => {
    map.invalidateSize();
  }, [layout.sidebar]);

  return (
    <GeoJSON
      key={transformedData ? transformedData.lastUpdated : ""}
      ref={ref}
      data={transformedData ? transformedData.features : undefined}
      onEachFeature={(feature, layer) => {
        if (editing) {
          layer.bindTooltip(feature.properties.name, {
            permanent: true,
            direction: "center",
            className: "text-[12px] font-bold text-white bg-transparent border-0 shadow-none boundary-label"
          });
        }

        if (feature.highlight) {
          layer.setStyle({
            weight: 3,
            opacity: mapControl.boundaryLayer ? 1 : 0,
            fillOpacity: mapControl.boundaryLayer ? 0.1 : 0,
            color: "#ea580c"
          });
        } else {
          layer.setStyle({
            weight: 1,
            opacity: mapControl.boundaryLayer ? 1 : 0,
            fillOpacity: mapControl.boundaryLayer ? 0.01 : 0,
            color: mapControl.baseLayerType === "satellite" ? "#ffffff" : "#000000"
          });
        }
      }}
    ></GeoJSON>
  );
};

const FacilitiesLayer = () => {
  const facilityIcon = new L.divIcon({
    className: "rounded-full bg-cyan-700 w-[14px] h-[14px] border-[3px] border-white",
    // iconAnchor: [7, 7],
    iconSize: [18, 18],
    html: `<div></div>`
  });
  const draggedFacilityIcon = new L.divIcon({
    className: "rounded-full bg-orange-600 w-[14px] h-[14px] border-[3px] border-white",
    // iconAnchor: [7, 7],
    iconSize: [18, 18],
    html: `<div></div>`
  });
  const map = useMap();
  const markerRef = useRef();
  const { selectedFacility, draggingMode, actions, editing } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      editing: state.editing,
      selectedFacility: state.selectedFacility,
      actions: state.actions,
      draggingMode: state.draggingMode
    }))
  );

  const { selectFacility, editSelectedFacility, toggleEditing, toggleDraggingMode } = actions;
  const facilities = useDataStore((state) => state.facilities);
  useEffect(() => {
    if (editing) {
      toggleEditing();
    }
    if (draggingMode) {
      toggleDraggingMode();
    }
  }, [selectedFacility ? selectedFacility[UID] : ""]);

  useEffect(
    () => {
      if (selectedFacility) {
        const { latitude, longitude } = selectedFacility;
        if (latitude && longitude) {
          setTimeout(() => {
            map.panTo([latitude, longitude]);
            markerRef.current.openPopup();
          }, 100);
        }
      }
    },
    selectedFacility ? [selectedFacility[UID], selectedFacility.latitude, selectedFacility.longitude] : ["", "", ""]
  );
  return (
    facilities &&
    facilities.length > 0 &&
    facilities
      .filter((facility) => !facility.hidden)
      .map((facility) => {
        let currentFacility = facility;
        const id = currentFacility[UID];
        const name = currentFacility[NAME];
        const isSelectedFacility = selectedFacility && selectedFacility[UID] === id;
        if (isSelectedFacility) {
          currentFacility = selectedFacility;
        }
        // if (!isSelectedFacility && draggingMode) {
        //   return null;
        // }
        if (currentFacility.latitude && currentFacility.longitude) {
          const latitude = currentFacility.latitude;
          const longitude = currentFacility.longitude;
          const position = [latitude, longitude];
          return (
            <Marker
              eventHandlers={{
                click() {
                  if (!draggingMode) {
                    selectFacility(currentFacility);
                  }
                },
                dragend() {
                  const marker = markerRef.current;
                  const latLng = marker.getLatLng();
                  editSelectedFacility("latitude", latLng.lat);
                  editSelectedFacility("longitude", latLng.lng);
                },
                popupclose() {
                  if (!editing && !draggingMode) {
                    selectFacility(null);
                  }
                }
              }}
              draggable={draggingMode}
              ref={isSelectedFacility ? markerRef : null}
              position={position}
              icon={draggingMode && isSelectedFacility ? draggedFacilityIcon : facilityIcon}
              key={id}
            >
              <Tooltip offset={[10, 0]}>{name}</Tooltip>
              {isSelectedFacility && (
                <Popup offset={[0, 0]} maxWidth={800}>
                  <TooltipContent />
                </Popup>
              )}
            </Marker>
          );
        } else {
          return null;
        }
      })
  );
};

const MapControl = () => {
  const { t } = useTranslation();
  const mapControlRef = useRef();
  const [mapControlPopover, setMapControlPopover] = useState(false);
  const { mapControl, selectedOrgUnit, actions } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      mapControl: state.mapControl,
      actions: state.actions
    }))
  );
  const { setMapControl, selectOrgUnit } = actions;
  return [
    <div ref={mapControlRef} className="leaflet-top leaflet-right z-999">
      <div className="leaflet-control">
        <CustomizedButton
          onClick={() => {
            setMapControlPopover(true);
          }}
          icon={<FontAwesomeIcon icon={faMap} />}
        >
          {t("mapControl")}
        </CustomizedButton>
      </div>
    </div>,
    mapControlPopover && (
      <Popover
        arrow
        maxWidth={700}
        placement="bottom-start"
        reference={mapControlRef.current}
        onClickOutside={() => {
          setMapControlPopover(false);
        }}
      >
        <div className="w-[700px]">
          <div className="flex w-full items-center p-2">
            <div className="w-[30%]">{t("baseLayerType")}</div>
            <div className="w-[70%] flex">
              <SingleSelectField
                className="w-full"
                selected={mapControl.baseLayerType}
                onChange={(data) => {
                  setMapControl("baseLayerType", data.selected);
                }}
              >
                <SingleSelectOption label={t("satellite")} value="satellite" />
                <SingleSelectOption label={t("normal")} value="normal" />
              </SingleSelectField>
            </div>
          </div>
          <div className="flex w-full items-center p-2">
            <div className="w-[30%]">{t("layers")}</div>
            <div className="w-[70%] flex">
              {/* <CheckboxField
                checked={mapControl.baseLayer}
                label={t("baseLayer")}
                value="baseLayer"
                onChange={(data) => {
                  setMapControl("baseLayer", data.checked);
                }}
              />
              &nbsp; */}
              <CheckboxField
                checked={mapControl.labelLayer}
                label={t("labelLayer")}
                value="labelLayer"
                onChange={(data) => {
                  setMapControl("labelLayer", data.checked);
                }}
              />
              &nbsp;
              <CheckboxField
                checked={mapControl.facilityLayer}
                label={t("facilityLayer")}
                value="facilityLayer"
                onChange={(data) => {
                  setMapControl("facilityLayer", data.checked);
                }}
              />
              {/* &nbsp;
              <CheckboxField
                checked={mapControl.boundaryLayer}
                label={t("boundaryLayer")}
                value="boundaryLayer"
                onChange={(data) => {
                  setMapControl("boundaryLayer", data.checked);
                }}
              /> */}
            </div>
          </div>
        </div>
      </Popover>
    )
  ];
};

const FacilityMap = () => {
  const { mapControl, selectedFacility } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      mapControl: state.mapControl,
      selectedFacility: state.selectedFacility
    }))
  );
  const { boundaryLayer, facilityLayer, baseLayer, labelLayer, baseLayerType } = mapControl;

  return (
    <div className="p-2 w-full h-full">
      <div className="w-full !h-full bg-white !rounded-lg">
        <MapContainer
          // minZoom={6}
          // maxZoom={17}
          className="rounded-lg"
          // zoomSnap={0.25}
          // zoomDelta={1}
          key={[
            // boundaryLayer,
            // facilityLayer,
            // baseLayer,
            baseLayerType
            //  selectedFacility ? selectedFacility.id : ""
          ].join(";")}
        >
          <MapControl />
          <TileLayer {...BASE_LAYER_TYPES[baseLayerType]} />
          {labelLayer && (
            <TileLayer
              attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`}
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png"
            />
          )}
          <BoundaryLayer />
          {facilityLayer && <FacilitiesLayer />}
        </MapContainer>
      </div>
    </div>
  );
};

export default FacilityMap;
