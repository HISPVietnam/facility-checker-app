import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";

const AppRole = ({ role }) => {
  const { t } = useTranslation();
  const { name, description, borderColor, color, icon } = role;
  return (
    <div className={`flex-1 p-3 rounded-md border-2 ${borderColor}`}>
      <div className={`font-bold text-[18px] ${color}`}>
        <FontAwesomeIcon icon={icon} />
        &nbsp;{t(name)}
      </div>
      <div className="text-[14px]">{t(description)}</div>
    </div>
  );
};

export default AppRole;
