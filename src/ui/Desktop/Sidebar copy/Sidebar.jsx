import { Button } from "@dhis2/ui";
import MenuItem from "./MenuItem";
import { useTranslation } from "react-i18next";
import { faHome, faLocationDot, faWrench, faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import useLayoutStore from "@/states/layout";

const Sidebar = () => {
  const actions = useLayoutStore((state) => state.actions);
  const { toggleSidebar } = actions;
  const [hovered, setHovered] = useState(false);
  const { t } = useTranslation();
  return (
    <div
      className="h-full w-[300px] bg-[#212934] text-white relative"
      onMouseOver={() => {
        setHovered(true);
      }}
      onMouseOut={() => {
        setHovered(false);
      }}
    >
      <div className="p-3 w-full cursor-pointer flex items-center justify-center hover:bg-slate-700" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faLeftLong} fontSize={22} />
      </div>
      <MenuItem label="home" icon={faHome} />
      <MenuItem label="facility-check" icon={faLocationDot} />
      <MenuItem label="approval" icon={faCheck} />
      <MenuItem label="configuration" icon={faWrench} />
    </div>
  );
};

export default Sidebar;
