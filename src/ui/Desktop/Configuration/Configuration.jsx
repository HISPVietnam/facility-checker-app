import OrgUnitGroupSets from "./OrgUnitGroupSets";
import Authorities from "./Authorities";
import Translations from "./Translations";
import { Menu, MenuDivider, MenuItem } from "@dhis2/ui";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLanguage, faLayerGroup, faUsersGear } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import useConfigurationModuleStore from "@/states/configurationModule";
import { useShallow } from "zustand/react/shallow";
const ITEMS = [
  { key: "orgUnitGroupSets", icon: faLayerGroup },
  { key: "authorities", icon: faUsersGear },
  { key: "translations", icon: faLanguage }
];

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
          {ITEMS.map((item, index) => {
            const { key, icon } = item;
            return [
              <MenuItem
                onClick={() => {
                  selectFunction(key);
                }}
                active={selectedFunction === key}
                icon={<FontAwesomeIcon icon={icon} />}
                label={t(key)}
              />,
              index < ITEMS.length && <MenuDivider />
            ];
          })}
        </Menu>
      </div>
      <div className="h-full w-[calc(100%-200px)] p-2">
        <div className="w-full h-full bg-white rounded-md shadow-md p-1">
          {selectedFunction === "orgUnitGroupSets" && <OrgUnitGroupSets />}
          {selectedFunction === "authorities" && <Authorities />}
          {selectedFunction === "translations" && <Translations />}
        </div>
      </div>
    </div>
  );
};

export default Configuration;
