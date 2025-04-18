import { useRef, useEffect } from "react";
import { MapContainer, TileLayer, useMap, GeoJSON, Marker } from "react-leaflet";

const BoundaryLayer = ({ data }) => {
  const ref = useRef();
  const map = useMap();

  useEffect(() => {
    try {
      const bounds = ref.current.getBounds();
      // if (selectedFacility.longitude && selectedFacility.latitude) {
      //   bounds.extend([selectedFacility.latitude, selectedFacility.longitude]);
      // }
      map.fitBounds(bounds);
    } catch (err) {
      console.log(err);
    }
  }, [JSON.stringify(data)]);

  return (
    <GeoJSON
      key={Math.random()}
      ref={ref}
      data={data ? [data] : undefined}
      onEachFeature={(feature, layer) => {
        // layer.bindTooltip(feature.properties.name, {
        //   permanent: true,
        //   direction: "center",
        //   className: "text-[12px] font-bold text-white bg-transparent border-0 shadow-none boundary-label"
        // });
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

const FacilitiesLayer = ({ point }) => {
  const facilityIcon = new L.divIcon({
    className: "rounded-full bg-cyan-700 w-[14px] h-[14px] border-[3px] border-white",
    // iconAnchor: [7, 7],
    iconSize: [18, 18],
    html: `<div></div>`
  });

  return <Marker position={point} icon={facilityIcon} />;
};

const GeoJsonViewer = ({ data, point }) => {
  return (
    <MapContainer
      key={JSON.stringify(point)}
      minZoom={6}
      maxZoom={17}
      className="rounded-lg"
      // zoomSnap={0.25}
      // zoomDelta={1}
    >
      <TileLayer
        attribution={`&copy; <a href="http://www.esri.com/">Esri</a> i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community`}
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />
      <TileLayer
        attribution={`&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>`}
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png"
      />
      {/* <FacilitiesLayer position={position} setPosition={setPosition} changeCoordinates={changeCoordinates} /> */}
      <BoundaryLayer data={data} />
      {point && <FacilitiesLayer point={point} />}
    </MapContainer>
  );
};
export default GeoJsonViewer;
