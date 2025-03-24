import { useRef, useEffect, useState } from "react";
import useDataStore from "@/states/data";
import useMetadataStore from "@/states/metadata";
import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import { useShallow } from "zustand/react/shallow";
import maplibregl from "maplibre-gl";
import { bbox } from "@turf/turf";
import { DATA_ELEMENTS, BASE_LAYER_TYPES } from "@/const";
import "maplibre-gl/dist/maplibre-gl.css";

const { UID, NAME, PATH } = DATA_ELEMENTS;

const FacilityMap = () => {
  const [mapReady, setMapReady] = useState(false);
  const { orgUnitGeoJson } = useMetadataStore(
    useShallow((state) => ({
      orgUnitGeoJson: state.orgUnitGeoJson
    }))
  );
  const facilities = useDataStore((state) => state.facilities);
  const [markers, setMarkers] = useState([]);
  const { mapControl, selectedOrgUnit, draggingMode, editing, selectedFacility } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      mapControl: state.mapControl,
      selectedOrgUnit: state.selectedOrgUnit,
      draggingMode: state.draggingMode,
      selectedFacility: state.selectedFacility,
      editing: state.editing
    }))
  );

  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            "raster-tiles": {
              type: "raster",
              tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
              tileSize: 256,
              attribution: `&copy; <a href="http://www.esri.com/">Esri</a> i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community`
            }
          },
          layers: [
            {
              id: "simple-tiles",
              type: "raster",
              source: "raster-tiles",
              minzoom: 0,
              maxzoom: 22
            }
          ]
        },
        center: [0, 0],
        zoom: 1
      });
    }

    map.current.on("load", () => {
      map.current.addSource("boundaries", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] }
      });
      map.current.addLayer({
        id: "boundaries",
        type: "fill",
        source: "boundaries",
        paint: {
          "fill-outline-color": "#ffffff",
          "fill-color": "rgba(0, 128, 255, 0)"
        }
      });
      setMapReady(true);
    });
  }, []);

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
      if (mapReady) {
        map.current.getSource("boundaries").setData(transformedData);
        const bounds = bbox(transformedData);
        map.current.fitBounds(bounds, { animate: true, duration: 500, padding: 10 });
        markers.forEach((marker) => marker.remove());
        setMarkers([]);
        const currentMarkers =
          facilities &&
          facilities.length > 0 &&
          facilities
            .filter((facility) => !facility.hidden)
            .filter((facility) => facility.latitude && facility.longitude)
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
              const latitude = currentFacility.latitude;
              const longitude = currentFacility.longitude;
              const position = [longitude, latitude];
              const el = document.createElement("div");
              el.className = "rounded-full bg-cyan-700 border-[3px] border-white w-[18px] h-[18px]";
              const popup = new maplibregl.Popup({ offset: 10, closeButton: false }).setText(<div>asdasd</div>);
              const currentMarker = new maplibregl.Marker({ element: el }).setLngLat(position).setPopup(popup).addTo(map.current);
              return currentMarker;
              // return (
              //   <Marker
              //     eventHandlers={{
              //       click() {
              //         if (!draggingMode) {
              //           selectFacility(currentFacility);
              //         }
              //       },
              //       dragend() {
              //         const marker = markerRef.current;
              //         const latLng = marker.getLatLng();
              //         editSelectedFacility("latitude", latLng.lat);
              //         editSelectedFacility("longitude", latLng.lng);
              //       },
              //       popupclose() {
              //         if (!editing && !draggingMode) {
              //           selectFacility(null);
              //         }
              //       }
              //     }}
              //     draggable={draggingMode}
              //     ref={isSelectedFacility ? markerRef : null}
              //     position={position}
              //     icon={draggingMode && isSelectedFacility ? draggedFacilityIcon : facilityIcon}
              //     key={id}
              //   >
              //     <Tooltip offset={[10, 0]}>{name}</Tooltip>
              //     {isSelectedFacility && (
              //       <Popup offset={[0, 0]} maxWidth={800}>
              //         <TooltipContent />
              //       </Popup>
              //     )}
              //   </Marker>
              // );
            });

        setMarkers([...currentMarkers]);
      }
    }
  }, [selectedOrgUnit ? selectedOrgUnit.id : "", editing, mapReady, JSON.stringify(facilities)]);

  return (
    <div className="p-2 w-full h-full">
      <div ref={mapContainer} className="w-full !h-full bg-white !rounded-lg"></div>
    </div>
  );
};

export default FacilityMap;
