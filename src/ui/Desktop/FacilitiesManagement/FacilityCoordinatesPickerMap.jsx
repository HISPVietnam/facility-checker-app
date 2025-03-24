import { useRef, useEffect, useState } from "react";
import { Modal, ModalTitle, ModalContent, ModalActions, NoticeBox } from "@dhis2/ui";
import DataValueLabel from "@/ui/common/DataValueLabel";
import DataValueText from "@/ui/common/DataValueText";
import CustomizedButton from "@/ui/common/Button";
import { useMap, useMapEvents, MapContainer, TileLayer, GeoJSON, Marker, Tooltip, Popup } from "react-leaflet";
import { useTranslation } from "react-i18next";
import useMetadataStore from "@/states/metadata";
import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import { useShallow } from "zustand/react/shallow";
import { BASE_LAYER_TYPES, DATA_ELEMENTS } from "@/const";
import _ from "lodash";
const { PATH, UID } = DATA_ELEMENTS;

const BoundaryLayer = ({ mapOpen }) => {
  const ref = useRef();
  const map = useMap();
  const { selectedFacility } = useFacilityCheckModuleStore(useShallow((state) => ({ selectedFacility: state.selectedFacility })));
  const [data, setData] = useState(null);
  const { orgUnitGeoJson } = useMetadataStore(
    useShallow((state) => ({
      orgUnitGeoJson: state.orgUnitGeoJson
    }))
  );
  useEffect(() => {
    const path = selectedFacility[PATH];
    if (!path) return;
    const currentOrgUnits = _.compact(path.split("/"));
    const self = currentOrgUnits.pop();
    const parent = currentOrgUnits.pop();
    const foundSelfFeature = orgUnitGeoJson.features.find((f) => f.id === self);
    const foundParentFeature = orgUnitGeoJson.features.find((f) => f.id === parent);
    const foundChildrenFeatures1 = orgUnitGeoJson.features.filter((f) => f.properties.parent === parent);
    const foundChildrenFeatures2 = orgUnitGeoJson.features.filter((f) => f.properties.parent === self);
    let finalFeatures;
    if (foundParentFeature) {
      finalFeatures = [foundParentFeature];
    } else if (foundSelfFeature) {
      finalFeatures = [foundSelfFeature];
    } else if (foundChildrenFeatures1.length > 0) {
      finalFeatures = foundChildrenFeatures1;
    } else if (foundChildrenFeatures2.length > 0) {
      finalFeatures = foundChildrenFeatures2;
    } else {
      finalFeatures = [];
    }
    setData({
      lastUpdated: new Date().toISOString(),
      features: finalFeatures
    });
  }, [selectedFacility[UID], selectedFacility[PATH]]);

  useEffect(() => {
    if (mapOpen) {
      try {
        const bounds = ref.current.getBounds();
        if (selectedFacility.longitude && selectedFacility.latitude) {
          bounds.extend([selectedFacility.latitude, selectedFacility.longitude]);
        }
        map.fitBounds(bounds);
      } catch (err) {
        console.log(err);
      }
    }
  }, [data ? data.lastUpdated : "", mapOpen]);

  return (
    <GeoJSON
      key={data ? data.lastUpdated : ""}
      ref={ref}
      data={data ? data.features : undefined}
      onEachFeature={(feature, layer) => {
        layer.bindTooltip(feature.properties.name, {
          permanent: true,
          direction: "center",
          className: "text-[12px] font-bold text-white bg-transparent border-0 shadow-none boundary-label"
        });
        layer.setStyle({
          weight: 3,
          opacity: 1,
          fillOpacity: 0.1,
          color: "#ea580c"
        });
      }}
    ></GeoJSON>
  );
};

const FacilitiesLayer = ({ position, setPosition }) => {
  const draggedFacilityIcon = new L.divIcon({
    className: "rounded-full bg-orange-600 w-[14px] h-[14px] border-[3px] border-white",
    // iconAnchor: [7, 7],
    iconSize: [18, 18],
    html: `<div></div>`
  });
  const { selectedFacility, actions } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      selectedFacility: state.selectedFacility,
      actions: state.actions
    }))
  );
  const isPending = selectedFacility ? selectedFacility.isPending : true;

  const map = useMapEvents({
    click(e) {
      if (!isPending) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      }
    }
  });
  const markerRef = useRef();

  useEffect(() => {
    if (selectedFacility.longitude && selectedFacility.latitude) {
      setPosition([selectedFacility.latitude, selectedFacility.longitude]);
    } else {
      setPosition(null);
    }
  }, [selectedFacility[UID]]);

  const { editSelectedFacility } = actions;
  return (
    position && (
      <Marker
        eventHandlers={{
          dragend() {
            const marker = markerRef.current;
            const latLng = marker.getLatLng();
            setPosition([latLng.lat, latLng.lng]);
          }
        }}
        draggable={!isPending}
        position={position}
        icon={draggedFacilityIcon}
        key={selectedFacility[UID]}
      />
    )
  );
};

const FacilityCoordinatesPickerMap = ({ open, setOpen, changeCoordinates }) => {
  const { t } = useTranslation();
  const [position, setPosition] = useState(null);

  const { coordinatesPickerMapControl, selectedFacility } = useFacilityCheckModuleStore(
    useShallow((state) => ({ coordinatesPickerMapControl: state.coordinatesPickerMapControl, selectedFacility: state.selectedFacility }))
  );
  const { baseLayerType } = coordinatesPickerMapControl;
  const Closed = ({ children }) => {
    return <span className="text-[14px] p-1 rounded-md bg-red-200">{children}</span>;
  };

  const Open = ({ children }) => {
    return <span className="text-[14px] p-1 rounded-md bg-emerald-100 ">{children}</span>;
  };
  if (!selectedFacility) return null;
  const isPending = selectedFacility ? selectedFacility.isPending : true;

  return (
    <Modal fluid hide={!open}>
      <ModalTitle>{t("chooseLocation")}</ModalTitle>
      <ModalContent>
        <div className="h-[1000px] w-[1000px]">
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
          {!isPending && (
            <div className="w-full h-[60px]">
              <NoticeBox warning title={t("dragTheMarker")} />
            </div>
          )}
          <div className="w-full h-[calc(100%-140px)]">
            <MapContainer
              key={selectedFacility ? selectedFacility[UID] : ""}
              minZoom={6}
              maxZoom={17}
              className="rounded-lg"
              // zoomSnap={0.25}
              // zoomDelta={1}
            >
              <TileLayer {...BASE_LAYER_TYPES[baseLayerType]} />
              <TileLayer
                attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`}
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png"
              />
              <FacilitiesLayer position={position} setPosition={setPosition} changeCoordinates={changeCoordinates} />
              <BoundaryLayer mapOpen={open} />
            </MapContainer>
          </div>
        </div>
      </ModalContent>
      <ModalActions>
        <div className="flex items-center">
          {!isPending && (
            <CustomizedButton
              disabled={position ? false : true}
              primary={true}
              onClick={() => {
                changeCoordinates([position[1], position[0]]);
                setOpen(false);
              }}
            >
              {t("apply")}
            </CustomizedButton>
          )}
          &nbsp;
          <CustomizedButton
            onClick={() => {
              setOpen(false);
            }}
          >
            {t("cancel")}
          </CustomizedButton>
        </div>
      </ModalActions>
    </Modal>
  );
};

export default FacilityCoordinatesPickerMap;
