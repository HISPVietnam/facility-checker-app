import { NATIVE_LANGUAGES } from "@/const";
import useMetadataStore from "@/states/metadata";
import CustomizedButton from "@/ui/common/Button";
import { MenuItem } from "@dhis2/ui";
import { faFileExport } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Popover } from "@mui/material";
import { format } from "date-fns";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

const ExportTranslations = () => {
  const { t } = useTranslation();
  const exportTranslationButtonRef = useRef();
  const { dataStore } = useMetadataStore(
    useShallow((state) => ({
      dataStore: state.dataStore,
    }))
  );
  const { locales } = dataStore;

  const [exportTranslationPopover, setExportTranslationsPopover] =
    useState(false);
  const fileName = `fca-locales-${format(new Date(), "yyyyMMdd")}`;

  const exportTranslationsAsJson = () => {
    const json = JSON.stringify(locales, null, 2); // Pretty print with 2 spaces
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = href;
    link.download = `${fileName}.json`;
    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(href); // Free up memory
  };

  const exportTranslationsAsExcel = () => {
    // Create table headers from object keys
    const headers = Object.keys(locales);
    const tableHeaders =
      `<th></th>` +
      headers
        .map((key) => `<th>${NATIVE_LANGUAGES[key]["name"]}</th>`)
        .join("");

    // Create table rows
    const tableRows = Object.keys(locales["en"])
      .sort()
      .map(
        (key) =>
          "<tr>" +
          `<td style="font-weight:700">${key}</td>` +
          headers.map((locale) => `<td>${locales[locale][key]}</td>`).join("") +
          "</tr>"
      )
      .join("");

    // Full HTML table
    const tableHTML = `
    <table border="1">
      <thead><tr>${tableHeaders}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  `;

    // Create a Blob of the table and trigger download
    const blob = new Blob([tableHTML], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.xls`;
    a.click();

    // Cleanup
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <CustomizedButton
        primary
        ref={exportTranslationButtonRef}
        icon={<FontAwesomeIcon icon={faFileExport} />}
        onClick={() => setExportTranslationsPopover(true)}
      >
        {t("export")}
      </CustomizedButton>
      {exportTranslationPopover && (
        <Popover
          open={exportTranslationPopover}
          anchorEl={exportTranslationButtonRef.current}
          onClose={() => {
            setExportTranslationsPopover(false);
          }}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
        >
          <div className="flex p-2 flex-col gap-2">
            <MenuItem
              className="cursor-pointer"
              onClick={exportTranslationsAsJson}
              dense
              label={
                <div className="flex items-center gap-1">
                  {t("exportAsJsonFile")}
                </div>
              }
            />

            <MenuItem
              className="cursor-pointer"
              onClick={exportTranslationsAsExcel}
              dense
              label={
                <div className="flex items-center gap-1">
                  {t("exportAsExcelFile")}
                </div>
              }
            />
          </div>
        </Popover>
      )}
    </>
  );
};

export default ExportTranslations;
