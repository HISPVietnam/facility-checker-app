import { useShallow } from "zustand/react/shallow";

import useConfigurationModuleStore from "@/states/configurationModule";

import OrgUnitGroupSetsToolbar from "./OrgUnitGroupSets/OrgUnitGroupSetsToolbar";
import AuthoritiesToolbar from "./Authorities/AuthoritiesToolbar";
import TranslationsToolbar from "./Translations/TranslationsToolbar";

const SUB_MODULES_TOOLBAR_MAPPING = {
  orgUnitGroupSets: <OrgUnitGroupSetsToolbar />,
  authorities: <AuthoritiesToolbar />,
  translations: <TranslationsToolbar />,
};

const ConfigurationToolbar = () => {
  const { selectedFunction } = useConfigurationModuleStore(
    useShallow((state) => ({
      selectedFunction: state.selectedFunction,
    }))
  );

  return (
    <div className="flex items-center w-full">
      {SUB_MODULES_TOOLBAR_MAPPING[selectedFunction]}
    </div>
  );
};

export default ConfigurationToolbar;
