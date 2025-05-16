import { Card, NoticeBox } from "@dhis2/ui";
import appIcon from "@/assets/icon.png";
import hispvnLogo from "@/assets/hispvn.png";
import version from "@/assets/version.json";
import { useTranslation } from "react-i18next";
import useMetadataStore from "@/states/metadata";
const Home = () => {
  const { t } = useTranslation();
  const me = useMetadataStore((state) => state.me);

  const noAuthorities = me.authorities.length === 0;
  return (
    <div className="p-5 w-full h-full">
      <Card className="p-10 w-full h-full !flex !items-center flex-col">
        <div>
          <img className="w-[80px]" src={appIcon}></img>
        </div>
        <div className="font-bold text-[30px]">Welcome to Facility Checker App</div>
        <br />
        <div className="w-full text-left font-bold">Getting started:</div>
        <br />
        <div className="w-full text-justify">
          - Facilities management: A user-friendly map interface that allows district officers to zoom in on their district boundaries and visualize
          facility locations, labeled by name, with satellite or/and OpenStreetmap imagery in the background for reference.
        </div>
        <br />
        <div className="w-full text-justify">- Administration: Used for settings of the app, e.g: translations...</div>
        <br />
        {noAuthorities && (
          <div className="w-full">
            <NoticeBox warning title={t("importantNotice")}>
              {t("noAuthoritiesNotice")}
            </NoticeBox>
          </div>
        )}
        <div className="w-full mt-auto flex items-center">
          Developed by <img className="h-[60px]" src={hispvnLogo} />
        </div>
        <div className="w-full text-[12px] flex flex-col items-start text-slate-400">
          <div>
            {t("version")}: {version.version}
          </div>
          <div>
            {t("buildDate")}: {version.buildDate}
          </div>
          <div>
            {t("buildRevision")}: {version.buildRevision}
          </div>
        </div>
      </Card>
    </div>
  );
};
export default Home;
