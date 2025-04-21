import { Stepper, Step, StepLabel } from "@mui/material";
import Welcome from "./Welcome";
import SelectGroupSets from "./SelectGroupSets";
import SetupAuthorities from "./SetupAuthorities";
import Summary from "./Summary";
import CustomizedButton from "@/ui/common/Button";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBackwardStep, faCaretLeft, faCaretRight, faForwardStep } from "@fortawesome/free-solid-svg-icons";
import useInstallationModuleStore from "@/states/installationModule";
import { useShallow } from "zustand/react/shallow";
import { STEPS } from "@/const";

const Installation = () => {
  const { t } = useTranslation();
  const { step, valid, actions } = useInstallationModuleStore(
    useShallow((state) => ({
      step: state.step,
      valid: state.valid,
      actions: state.actions
    }))
  );
  const { setStep } = actions;
  return (
    <div className="w-[calc(100%-100px)] h-[calc(100%-100px)] shadow-xl border-slate-300 border rounded-md p-2 flex items-center flex-col">
      <div className="mb-8 mt-8 w-[1000px]">
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
      <div className="flex mt-2 mb-2 w-[1000px] justify-between">
        <CustomizedButton
          disabled={step === 0}
          className="w-[60px]"
          onClick={() => {
            setStep(step - 1);
          }}
        >
          <FontAwesomeIcon icon={faCaretLeft} />
          &nbsp;
          {t("back")}
        </CustomizedButton>
        <CustomizedButton
          disabled={!valid || step === STEPS.length - 1}
          className="w-[60px] justify-self-end"
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
      </div>
    </div>
  );
};

export default Installation;
