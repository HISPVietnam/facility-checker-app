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
      <div className="mb-5 mt-5 w-[1200px]">
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
      <div className="flex mt-2 mb-2 w-[1200px] justify-between">
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
      <div className="w-[1200px]">
        {step === 0 && <Welcome />}
        {step === 1 && <SelectGroupSets />}
        {step === 2 && <SetupAuthorities />}
        {step === 3 && <Summary />}
        {step === 4 && <Install />}
      </div>
    </div>
  );
};

export default Installation;
