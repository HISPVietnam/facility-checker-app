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
      <Card className="p-5 w-full h-full !flex flex-col">
        <div className="font-bold text-2xl">Welcome to Facility Checker App</div>
        <NoticeBox title={t("importantNotice")} warning>
          This app is still in an experimental phase. Please DO NOT use it in any production DHIS2. Users may encounter bugs and other issues. If you
          come across any, please report them to our project homepage:{" "}
          <a className="underline text-sky-800" href="https://projects.hispvietnam.org/projects/facility-checker-app-public" target="_blank">
            https://projects.hispvietnam.org/projects/facility-checker-app-public
          </a>
        </NoticeBox>
        <br />
        <p>
          The Facility Checker App (FCA) is a user-friendly map interface DHIS2 App which allow facility / district users to check the coordinates of
          the facilities which are often incomplete, outdated, or incorrect or located outside their district / province / country boundary. It also
          allows user to do integrity check on various orgunit groups and its group set. FCA app allow user to create new facility or edit facility
          information and its coordinates details either manually enter the facility coordinate or selecting point on the map with its district
          boundary.
        </p>
        <br />
        <p>
          Manager can review all the facility changes before synchronizing to DHIS2 organisation unit. FCA module has guide installation which allows
          DHIS2 administrator to install and import all the health facility from DHIS2 Organisation units to FCA module. FCA app contain custom filter
          which allow users to filter facility which has no coordinates or facilities coordinate outside district boundary. FCA has inbuilt
          translation module which allow user to switch language within app with out changing user setting or re-login to dhis2.
        </p>
        {noAuthorities && (
          <div className="w-full">
            <NoticeBox error title={t("importantNotice")}>
              {t("noAuthoritiesNotice")}
            </NoticeBox>
          </div>
        )}

        <div className="w-full text-[14px] mt-auto flex flex-col items-start text-slate-600">
          <div>
            {t("version")}: {version.version}
          </div>
          <div>
            {t("buildDate")}: {version.buildDate}
          </div>
          <div>
            {t("buildRevision")}: {version.buildRevision}
          </div>
          <div>
            {t("projectHomepage")}:{" "}
            <a className="underline" href="https://projects.hispvietnam.org/projects/facility-checker-app-public" target="_blank">
              https://projects.hispvietnam.org/projects/facility-checker-app-public
            </a>
          </div>
        </div>
        <div className="w-full flex items-center">
          Developed by <img className="h-[60px]" src={hispvnLogo} />
        </div>
      </Card>
    </div>
  );
};
export default Home;
