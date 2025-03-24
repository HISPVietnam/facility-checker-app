import { Tooltip } from "@dhis2/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

const CollapsedMenuItem = ({ icon, label }) => {
  const { t } = useTranslation();
  return (
    <div className="h-[50px]">
      <Tooltip content={t(label)} placement="right">
        <NavLink
          to={`/${label}`}
          className={({ isActive }) => {
            return ` w-full p-3 hover:text-[#4db6ac] cursor-pointer flex justify-center items-center ${isActive ? "text-[#4db6ac]" : ""}`;
          }}
        >
          <FontAwesomeIcon className="w-full" icon={icon} fontSize={22} />
        </NavLink>
      </Tooltip>
    </div>
  );
};

export default CollapsedMenuItem;
