import useInstallationModuleStore from "@/states/installationModule";
import { Modal, ModalTitle, ModalContent, ModalActions } from "@dhis2/ui";
import { useTranslation } from "react-i18next";
const success = {
  httpStatus: "OK",
  httpStatusCode: 200,
  status: "OK",
  response: {
    status: "OK",
    stats: {
      created: 49,
      updated: 0,
      deleted: 0,
      ignored: 0,
      total: 49
    },
    typeReports: [
      {
        klass: "org.hisp.dhis.trackedentity.TrackedEntityType",
        stats: {
          created: 1,
          updated: 0,
          deleted: 0,
          ignored: 0,
          total: 1
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.program.ProgramStage",
        stats: {
          created: 1,
          updated: 0,
          deleted: 0,
          ignored: 0,
          total: 1
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.user.UserGroup",
        stats: {
          created: 4,
          updated: 0,
          deleted: 0,
          ignored: 0,
          total: 4
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.dataentryform.DataEntryForm",
        stats: {
          created: 2,
          updated: 0,
          deleted: 0,
          ignored: 0,
          total: 2
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.trackedentity.TrackedEntityAttribute",
        stats: {
          created: 3,
          updated: 0,
          deleted: 0,
          ignored: 0,
          total: 3
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.option.OptionSet",
        stats: {
          created: 2,
          updated: 0,
          deleted: 0,
          ignored: 0,
          total: 2
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.user.UserRole",
        stats: {
          created: 2,
          updated: 0,
          deleted: 0,
          ignored: 0,
          total: 2
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.program.Program",
        stats: {
          created: 1,
          updated: 0,
          deleted: 0,
          ignored: 0,
          total: 1
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.dataelement.DataElement",
        stats: {
          created: 28,
          updated: 0,
          deleted: 0,
          ignored: 0,
          total: 28
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.option.Option",
        stats: {
          created: 5,
          updated: 0,
          deleted: 0,
          ignored: 0,
          total: 5
        },
        objectReports: []
      }
    ],
    responseType: "ImportReportWebMessageResponse"
  }
};

const error = {
  httpStatus: "Conflict",
  httpStatusCode: 409,
  status: "WARNING",
  message: "One or more errors occurred, please see full details in import report.",
  response: {
    status: "ERROR",
    stats: {
      created: 0,
      updated: 0,
      deleted: 0,
      ignored: 49,
      total: 49
    },
    typeReports: [
      {
        klass: "org.hisp.dhis.trackedentity.TrackedEntityType",
        stats: {
          created: 0,
          updated: 0,
          deleted: 0,
          ignored: 1,
          total: 1
        },
        objectReports: [
          {
            klass: "org.hisp.dhis.trackedentity.TrackedEntityType",
            index: 0,
            uid: "ER5qgJDCfUh",
            displayName: "FCA:Facility",
            errorReports: [
              {
                message: "Missing required property `shortName`",
                args: ["shortName"],
                mainKlass: "org.hisp.dhis.trackedentity.TrackedEntityType",
                errorCode: "E4000",
                errorKlass: "java.lang.String",
                errorProperty: "shortName",
                errorProperties: ["shortName"]
              }
            ]
          }
        ]
      },
      {
        klass: "org.hisp.dhis.program.ProgramStage",
        stats: {
          created: 0,
          updated: 0,
          deleted: 0,
          ignored: 2,
          total: 2
        },
        objectReports: [
          {
            klass: "org.hisp.dhis.program.ProgramStage",
            index: 0,
            uid: "VdBma23iRTw",
            displayName: "Profile logs",
            errorReports: [
              {
                message: "User `Dung Nguyen [Syfgez4v6hZ] (User)` does not have read access for object `[jmUQ1B95ZP9] (DataElement)`",
                args: ["Dung Nguyen [Syfgez4v6hZ] (User)", "[jmUQ1B95ZP9] (DataElement)"],
                mainKlass: "org.hisp.dhis.dataelement.DataElement",
                errorCode: "E3012",
                errorProperties: ["Dung Nguyen [Syfgez4v6hZ] (User)", "[jmUQ1B95ZP9] (DataElement)"]
              },
              {
                message:
                  "Invalid reference [jmUQ1B95ZP9] (DataElement) on object [xH7ytgsoJ3d] (ProgramStageDataElement) for association `dataElement`",
                mainKlass: "org.hisp.dhis.program.ProgramStageDataElement",
                mainId: "xH7ytgsoJ3d",
                errorProperty: "dataElement",
                errorProperties: ["[jmUQ1B95ZP9] (DataElement)", "[xH7ytgsoJ3d] (ProgramStageDataElement)", "dataElement"],
                errorCode: "E5002",
                args: ["[jmUQ1B95ZP9] (DataElement)", "[xH7ytgsoJ3d] (ProgramStageDataElement)", "dataElement"]
              }
            ]
          }
        ]
      },
      {
        klass: "org.hisp.dhis.user.UserGroup",
        stats: {
          created: 0,
          updated: 0,
          deleted: 0,
          ignored: 4,
          total: 4
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.dataentryform.DataEntryForm",
        stats: {
          created: 0,
          updated: 0,
          deleted: 0,
          ignored: 2,
          total: 2
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.trackedentity.TrackedEntityAttribute",
        stats: {
          created: 0,
          updated: 0,
          deleted: 0,
          ignored: 3,
          total: 3
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.option.OptionSet",
        stats: {
          created: 0,
          updated: 0,
          deleted: 0,
          ignored: 2,
          total: 2
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.user.UserRole",
        stats: {
          created: 0,
          updated: 0,
          deleted: 0,
          ignored: 2,
          total: 2
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.program.Program",
        stats: {
          created: 0,
          updated: 0,
          deleted: 0,
          ignored: 1,
          total: 1
        },
        objectReports: []
      },
      {
        klass: "org.hisp.dhis.dataelement.DataElement",
        stats: {
          created: 0,
          updated: 0,
          deleted: 0,
          ignored: 27,
          total: 27
        },
        objectReports: [
          {
            klass: "org.hisp.dhis.dataelement.DataElement",
            index: 0,
            uid: "Wno4M1rmwHr",
            displayName: "FCA_Email",
            errorReports: [
              {
                message: "Missing required property `valueType`",
                args: ["valueType"],
                mainKlass: "org.hisp.dhis.dataelement.DataElement",
                errorCode: "E4000",
                errorKlass: "org.hisp.dhis.common.ValueType",
                errorProperty: "valueType",
                errorProperties: ["valueType"]
              }
            ]
          }
        ]
      },
      {
        klass: "org.hisp.dhis.option.Option",
        stats: {
          created: 0,
          updated: 0,
          deleted: 0,
          ignored: 5,
          total: 5
        },
        objectReports: []
      }
    ],
    responseType: "ImportReportWebMessageResponse"
  }
};
const ErrorDialog = () => {
  const { t } = useTranslation();
  const { install } = useInstallationModuleStore();
  return (
    <Modal open={false} onClose={() => {}} position="middle" fluid>
      <ModalTitle>{t("somethingWentWrong")}</ModalTitle>
      <ModalContent>
        <div>{t("thereAreErrorsDuringInstallation")}</div>
        <div>
          {install.metadataResult.response.typeReports.map((typeReport) => {
            return typeReport.objectReports.map((objectReport) => {
              return <code>{JSON.stringify(objectReport)}</code>;
            });
          })}
        </div>
      </ModalContent>
      <ModalActions></ModalActions>
    </Modal>
  );
};

export default ErrorDialog;
