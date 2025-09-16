import useInstallationModuleStore from "@/states/installationModule";
import { Modal, ModalTitle, ModalContent, ModalActions, Button } from "@dhis2/ui";
import { useTranslation } from "react-i18next";

const ErrorDialog = () => {
  const { t } = useTranslation();
  const { install } = useInstallationModuleStore();
  return (
    <Modal
      open={false}
      onClose={() => {
        window.location.reload();
      }}
      position="middle"
      fluid
    >
      <ModalTitle>{t("somethingWentWrong")}</ModalTitle>
      <ModalContent>
        <div>{t("thereAreErrorsDuringInstallation")}</div>
        <div>
          {install.metadataResult &&
            install.metadataResult.response.typeReports.map((typeReport) => {
              return typeReport.objectReports.map((objectReport) => {
                return <div className="!font-mono break-all text-sm bg-gray-100 p-2 my-2 rounded">{JSON.stringify(objectReport)}</div>;
              });
            })}
          {install.facilitiesResult &&
            install.facilitiesResult.map((result) => {
              return result.validationReport.errorReports.map((objectReport) => {
                return <div className="!font-mono break-all text-sm bg-gray-100 p-2 my-2 rounded">{JSON.stringify(objectReport)}</div>;
              });
            })}
        </div>
      </ModalContent>
      <ModalActions>
        <Button
          onClick={() => {
            window.location.reload();
          }}
        >
          {t("close")}
        </Button>
      </ModalActions>
    </Modal>
  );
};

export default ErrorDialog;
