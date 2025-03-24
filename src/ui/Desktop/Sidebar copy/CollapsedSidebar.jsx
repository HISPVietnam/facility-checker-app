import CollapsedMenuItem from "./CollapsedMenuItem";
import { Tooltip } from "@dhis2/ui";
import { NavLink } from "react-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { faHome, faLocationDot, faWrench, faCheck, faRightLong } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useLayoutStore from "@/states/layout";

const CollapsedSidebar = () => {
  const actions = useLayoutStore((state) => state.actions);
  const { toggleSidebar } = actions;
  const [hovered, setHovered] = useState(false);
  const { t } = useTranslation();
  return (
    <div
      className="h-full w-[50px] bg-[#212934] text-white flex items-center flex-col relative"
      onMouseOver={() => {
        setHovered(true);
      }}
      onMouseOut={() => {
        setHovered(false);
      }}
    >
      <div className="p-3 w-full cursor-pointer flex items-center justify-center hover:bg-slate-700" onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faRightLong} fontSize={22} />
      </div>
      <CollapsedMenuItem label="home" icon={faHome} />
      <CollapsedMenuItem label="facility-check" icon={faLocationDot} />
      <CollapsedMenuItem label="approval" icon={faCheck} />
      <CollapsedMenuItem label="configuration" icon={faWrench} />
    </div>
  );
};

export default CollapsedSidebar;
