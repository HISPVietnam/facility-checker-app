import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router";

const MenuItem = ({ icon, label }) => {
  const { t } = useTranslation();
  return (
    <div className="h-[40px]">
      <NavLink
        to={`/${label}`}
        className={({ isActive }) => {
          return `h-[60px] w-full p-3 hover:text-[#4db6ac] cursor-pointer flex items-center ${isActive ? "text-[#4db6ac] font-bold" : ""}`;
        }}
      >
        <div className="pr-2 h-full text-center w-[50px]">
          <FontAwesomeIcon icon={icon} fontSize={22} />
        </div>
        <div className="h-full">{t(label)}</div>
      </NavLink>
    </div>
  );
};

export default MenuItem;
