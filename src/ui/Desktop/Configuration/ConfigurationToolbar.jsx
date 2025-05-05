import { useTranslation } from "react-i18next";
import useConfigurationModuleStore from "@/states/configurationModule";
import { useShallow } from "zustand/react/shallow";
import CustomizedButton from "@/ui/common/Button";

const ConfigurationToolbar = () => {
  const { t } = useTranslation();
  const { selectedFunction, actions } = useConfigurationModuleStore(
    useShallow((state) => ({
      selectedFunction: state.selectedFunction,
      actions: state.actions
    }))
  );

  return (
    <div className="flex items-center w-full">
      <CustomizedButton>asdasdasd</CustomizedButton>
    </div>
  );
};

export default ConfigurationToolbar;
