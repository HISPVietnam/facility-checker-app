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
      <div className="text-[15px]">{t(description)}</div>
    </div>
  );
};

const AppRoleSelectable = ({ role, selected, onClick, completed }) => {
  const { t } = useTranslation();
  const { name, description, borderColor, color, icon } = role;
  const containerClassName = `flex flex-col flex-1 p-3 rounded-md border-2 border-slate-300 hover:border-sky-700 hover:bg-sky-50 cursor-pointer`;
  const containerSelectedClassName = `flex flex-col flex-1 p-3 rounded-md border-2 border-slate-300 border-sky-700 bg-sky-50 cursor-pointer`;
  return (
    <div className={selected ? containerSelectedClassName : containerClassName} onClick={onClick}>
      <div className={`text-[18px] ${selected && "font-bold"} ${color}`}>
        <FontAwesomeIcon icon={icon} />
        &nbsp;{t(name)}
      </div>
      <div className={`text-[15px] ${selected && "font-bold"}`}>{t(description)}</div>
      <br />
      {completed ? (
        <div className="mt-auto text-green-700 font-bold">{t("done")}</div>
      ) : (
        <div className="mt-auto text-red-700 font-bold">{t("pending")}</div>
      )}
    </div>
  );
};

export { AppRoleSelectable, AppRole };
