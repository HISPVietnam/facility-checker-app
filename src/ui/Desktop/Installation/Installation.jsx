import { NoticeBox } from "@dhis2/ui";
import { Stepper, Step, StepLabel } from "@mui/material";
import Welcome from "./Welcome";
import SelectGroupSets from "./SelectGroupSets";
import SetupAuthorities from "./SetupAuthorities";
import Summary from "./Summary";
import Install from "./Install";
import CustomizedButton from "@/ui/common/Button";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackwardStep, faCaretLeft, faCaretRight, faForwardStep, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import useInstallationModuleStore from "@/states/installationModule";
import { useShallow } from "zustand/react/shallow";
import { STEPS } from "@/const";
import { getMe, getOrgUnits, getOrgUnitGroups, getOrgUnitGroupSets, getOrgUnitGeoJson, getUsers, getSchemas } from "@/api/metadata";
import useMetadataStore from "@/states/metadata";
import LanguageSelectButton from "@/ui/common/LanguageSelectButton";

const Installation = () => {
  const { t } = useTranslation();

  const { status, step, valid, refreshingMetadata, actions } = useInstallationModuleStore(
    useShallow((state) => ({
      status: state.status,
      step: state.step,
      valid: state.valid,
      actions: state.actions,
      refreshingMetadata: state.refreshingMetadata
    }))
  );
  const metadataActions = useMetadataStore((state) => state.actions);
  const { setMetadata } = metadataActions;
  const { setStep, toggleRefreshingMetadata } = actions;

  const refreshMetadata = async () => {
    toggleRefreshingMetadata();
    const me = await getMe();
    const orgUnits = await getOrgUnits();
    const orgUnitGroups = await getOrgUnitGroups();
    const orgUnitGroupSets = await getOrgUnitGroupSets();
    const orgUnitGeoJson = await getOrgUnitGeoJson();
    const users = await getUsers();
    const schemas = await getSchemas();
    setMetadata("me", me);
    setMetadata("orgUnits", orgUnits);
    setMetadata("orgUnitGroups", orgUnitGroups);
    setMetadata("orgUnitGroupSets", orgUnitGroupSets);
    setMetadata("orgUnitGeoJson", orgUnitGeoJson);
    setMetadata("users", users);
    setMetadata("schemas", schemas);
    toggleRefreshingMetadata();
  };

  return (
    <div className="w-[calc(100%-50px)] h-[calc(100%-50px)] shadow-xl border-slate-300 border rounded-md p-1 flex items-center flex-col">
      <div className="w-[1200px]">
        <NoticeBox title={t("importantNotice")} warning>
          This app is still in an experimental phase. Please DO NOT use it in any production DHIS2. Users may encounter bugs and other issues. If you
          come across any, please report them to our project homepage:{" "}
          <a className="underline text-sky-800" href="https://projects.hispvietnam.org/projects/facility-checker-app-public" target="_blank">
            https://projects.hispvietnam.org/projects/facility-checker-app-public
          </a>
        </NoticeBox>
        <div className="mb-2 mt-2">
          <Stepper activeStep={step}>
            {STEPS.map((step) => {
              return (
                <Step>
                  <StepLabel>{t(step)}</StepLabel>
                </Step>
              );
            })}
          </Stepper>
        </div>
        <div className="flex mt-2 mb-2 justify-between">
          <CustomizedButton
            disabled={step === 0}
            className="w-[120px]"
            onClick={() => {
              setStep(step - 1);
            }}
          >
            <FontAwesomeIcon icon={faCaretLeft} />
            &nbsp;
            {t("back")}
          </CustomizedButton>
          <div className="flex items-center gap-2">
            <CustomizedButton disabled={status === "importing"} loading={refreshingMetadata} primary onClick={refreshMetadata}>
              <FontAwesomeIcon icon={faRotateRight} />
              &nbsp;
              {t("refreshMetadata")}
            </CustomizedButton>
            <LanguageSelectButton />
          </div>
          <CustomizedButton
            disabled={!valid || step === STEPS.length - 1}
            className="w-[120px] justify-self-end"
            onClick={() => {
              setStep(step + 1);
            }}
          >
            {t("next")}&nbsp;
            <FontAwesomeIcon icon={faCaretRight} />
          </CustomizedButton>
        </div>
        <div>
          {step === 0 && <Welcome />}
          {step === 1 && <SelectGroupSets />}
          {step === 2 && <SetupAuthorities />}
          {step === 3 && <Summary />}
          {step === 4 && <Install />}
        </div>
      </div>
    </div>
  );
};

export default Installation;
