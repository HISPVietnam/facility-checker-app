import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import useMetadataStore from "@/states/metadata";

import LanguageSelectButton from "./LanguageSelectButton";

const UserInfo = () => {
  const { t } = useTranslation();

  const { me } = useMetadataStore(
    useShallow((state) => ({
      me: state.me,
    }))
  );
  const { firstName, surname } = me;

  return (
    <div className="flex items-center">
      <div className="rounded-md bg-slate-500 h-[36px] p-2 flex items-center text-white text-[14px]">
        <strong>{t("user")}:</strong>&nbsp;{firstName} {surname}
      </div>
      &nbsp;
      <div className="rounded-md bg-teal-700 h-[36px] p-2 flex items-center text-white text-[14px]">
        <strong>{t("authorities")}:</strong>&nbsp;{me.authorities.join(", ")}
      </div>
      &nbsp;
      <LanguageSelectButton />
    </div>
  );
};

export default UserInfo;
