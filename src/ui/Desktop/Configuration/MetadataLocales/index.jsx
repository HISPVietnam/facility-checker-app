import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { useShallow } from "zustand/react/shallow";

import { NATIVE_LANGUAGES } from "@/const";
import CustomizedMultipleSelector from "@/ui/common/CustomMultipleSelector";
import Button from "@/ui/common/Button";

import { getDataStore, saveDataStore } from "@/api/metadata";
import useMetadataStore from "@/states/metadata";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSave } from "@fortawesome/free-solid-svg-icons";

const MetadataLocales = () => {
  const { t } = useTranslation();

  const {
    dataStore,
    actions: { setMetadata },
  } = useMetadataStore(
    useShallow((state) => ({
      dataStore: state.dataStore,
      actions: state.actions,
    })),
  );

  const [loading, setLoading] = useState(false);

  const [selectedLocales, setSelectedLocales] = useState(
    dataStore?.metadataLocales || [],
  );

  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    setPortalContainer(document.getElementById("metadata-locales-toolbar"));
  }, []);

  const handleSaveMetadataLocales = async () => {
    try {
      setLoading(true);

      const res = await getDataStore("metadataLocales");

      const foundMetadataLocalesEntry = res?.entries?.find(
        (entry) => entry.key === "metadataLocales",
      );
      let result;

      if (foundMetadataLocalesEntry) {
        result = await saveDataStore(
          "metadataLocales",
          selectedLocales,
          "UPDATE",
        );
      } else {
        result = await saveDataStore(
          "metadataLocales",
          selectedLocales,
          "CREATE",
        );
      }

      if (result?.status === "OK") {
        setMetadata("dataStore", {
          ...dataStore,
          metadataLocales: selectedLocales,
        });

        toast.success(
          t(
            foundMetadataLocalesEntry
              ? "metadataLocalesUpdated"
              : "metadataLocalesCreated",
          ),
        );
      } else {
        console.error("Failed to save metadata locales:", result?.error);

        toast.error(
          t(
            foundMetadataLocalesEntry
              ? "updateMetadataLocalesFailed"
              : "createMetadataLocalesFailed",
          ),
        );
      }
    } catch (error) {
      console.error("Error saving metadata locales:", error);

      toast.error(t("updateMetadataLocalesFailed"));
    } finally {
      setLoading(false);
    }
  };

  const languageOptions = Object.keys(NATIVE_LANGUAGES).map((language) => ({
    value: language,
    prefix: <span className={`fi fi-${NATIVE_LANGUAGES[language].flag}`} />,
    label: NATIVE_LANGUAGES[language].name,
    filterBy: NATIVE_LANGUAGES[language].englishName,
  }));

  return (
    <>
      <div className="flex flex-col gap-1 p-2">
        <p>Metadata Locales</p>
        <CustomizedMultipleSelector
          limitTags={3}
          selected={selectedLocales}
          onChange={setSelectedLocales}
          options={languageOptions}
          filterable
          placeholder={t("selectLocales")}
          loading={loading}
          filterKey="filterBy"
        />
      </div>

      {portalContainer &&
        createPortal(
          <Button
            icon={<FontAwesomeIcon icon={faSave} />}
            loading={loading}
            primary
            onClick={handleSaveMetadataLocales}
          >
            {t("save")}
          </Button>,
          portalContainer,
        )}
    </>
  );
};

export default MetadataLocales;
