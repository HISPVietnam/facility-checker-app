import { Button } from "@dhis2/ui";
import MenuItem from "./MenuItem";
import { useTranslation } from "react-i18next";
import { faHome, faLocationDot, faWrench, faCheck, faBars, faRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeftLong } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";
import useLayoutStore from "@/states/layout";
import { NavLink } from "react-router";

const SideBarItem = ({ label, icon }) => {
  const { t } = useTranslation();
  return (
    <div className="w-full px-2 py-1">
      <NavLink
        to={`/${label}`}
        className={({ isActive }) => {
          return `w-full h-[50px] hover:bg-sky-50 hover:cursor-pointer hover:text-slate-700 flex items-center p-2 rounded-lg ${
            isActive ? "bg-sky-50 text-slate-700 font-bold" : ""
          }`;
        }}
      >
        <div className="w-[40px] flex items-center justify-start">
          <FontAwesomeIcon icon={icon} fontSize={18} />
        </div>
        <div>{t(label)}</div>
      </NavLink>
    </div>
  );
};

const Sidebar = () => {
  const actions = useLayoutStore((state) => state.actions);
  const { toggleSidebar } = actions;
  const [hovered, setHovered] = useState(false);
  const { t } = useTranslation();
  return (
    <div
      className="h-full w-[250px] bg-[#333739] text-white relative"
      onMouseOver={() => {
        setHovered(true);
      }}
      onMouseOut={() => {
        setHovered(false);
      }}
    >
      <div className="w-full flex items-center justify-end p-3 ">
        <div className="cursor-pointer" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} fontSize={22} />
        </div>
      </div>
      <SideBarItem label="home" icon={faHome} />
      <SideBarItem label="facility-check" icon={faLocationDot} />
      <SideBarItem label="approval" icon={faCheck} />
      <SideBarItem label="synchronization" icon={faRotate} />
      <SideBarItem label="configuration" icon={faWrench} />
    </div>
  );
};

export default Sidebar;
