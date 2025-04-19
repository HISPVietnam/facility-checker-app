import useMetadataStore from "@/states/metadata";
import useInstallationModuleStore from "@/states/installationModule";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

const Summary = () => {
  const { t } = useTranslation();
  const { me } = useMetadataStore(
    useShallow((state) => ({
      me: state.me
    }))
  );
  const { actions, valid } = useInstallationModuleStore(
    useShallow((state) => ({
      valid: state.valid,
      actions: state.actions
    }))
  );
  const { setValid } = actions;

  return (
    <div className="w-[1000px] flex flex-col">
      <div className="font-bold text-[20px]">{t("summary")}</div>
      <div>{t("summaryParagraph1")}</div>
    </div>
  );
};

export default Summary;
