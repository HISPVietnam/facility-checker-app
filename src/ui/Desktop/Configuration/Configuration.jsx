import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { Menu, MenuDivider, MenuItem } from "@dhis2/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { CONFIGURATION_SUB_MODULES } from "@/const";
import useConfigurationModuleStore from "@/states/configurationModule";

import OrgUnitGroupSets from "./OrgUnitGroupSets";
import Authorities from "./Authorities";
import Translations from "./Translations";

const SUB_MODULES_MAPPING = {
  translations: <Translations />,
  authorities: <Authorities />,
  orgUnitGroupSets: <OrgUnitGroupSets />
};

const Configuration = () => {
  const { t } = useTranslation();

  const { selectedFunction, actions } = useConfigurationModuleStore(
    useShallow((state) => ({
      selectedFunction: state.selectedFunction,
      actions: state.actions
    }))
  );
  const { selectFunction } = actions;

  return (
    <div className="h-full w-full flex">
      <div className="w-[200px] pt-2 h-full border-r-slate-300 border-r bg-white">
        <Menu>
          {CONFIGURATION_SUB_MODULES.map((item, index) => {
            const { key, icon } = item;
            return [
              <MenuItem
                key={key}
                onClick={() => {
                  selectFunction(key);
                }}
                active={selectedFunction === key}
                icon={<FontAwesomeIcon icon={icon} />}
                label={t(key)}
              />,
              index < CONFIGURATION_SUB_MODULES.length - 1 && <MenuDivider />
            ];
          })}
        </Menu>
      </div>
      <div className="h-full w-[calc(100%-200px)] p-2">
        <div className="w-full h-full bg-white rounded-md shadow-md">{SUB_MODULES_MAPPING[selectedFunction]}</div>
      </div>
    </div>
  );
};

export default Configuration;
