const TrackerPropertyText = ({ object, property, withState }) => {
  switch (property) {
    case "latitude":
      if (object.geometry) {
        return object.geometry.coordinates[1];
      } else {
        return "";
      }
    case "longitude":
      if (object.geometry) {
        return object.geometry.coordinates[0];
      } else {
        return "";
      }
  }
};

export default TrackerPropertyText;
