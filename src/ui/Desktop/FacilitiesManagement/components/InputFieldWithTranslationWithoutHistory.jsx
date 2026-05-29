import { useMemo, useState } from "react";
import { SingleSelectField, SingleSelectOption, NoticeBox } from "@dhis2/ui";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import useMetadataStore from "@/states/metadata";
import useFacilityCheckModuleStore from "@/states/facilityCheckModule";

import { pickTranslation } from "@/utils";
import { DATA_ELEMENTS, NATIVE_LANGUAGES, TRANSLATION_FIELDS } from "@/const";
import { Row } from "../NewFacilityDialog";

const { TRANSLATIONS, DESCRIPTION } = DATA_ELEMENTS;

const InputFieldWithTranslationWithoutHistory = ({ dataElement, disabled }) => {
  const { t } = useTranslation();

  const { locale, program, dataStore } = useMetadataStore(
    useShallow((state) => ({
      locale: state.locale,
      program: state.program,
      dataStore: state.dataStore,
    })),
  );

  const { selectedFacility, facilityCheckModuleActions } =
    useFacilityCheckModuleStore(
      useShallow((state) => ({
        selectedFacility: state.selectedFacility,
        facilityCheckModuleActions: state.actions,
      })),
    );
  const { editSelectedFacility } = facilityCheckModuleActions;

  const metadataLocales = dataStore.metadataLocales || [];
  const [selectedLocale, setSelectedLocale] = useState(
    metadataLocales[0] ?? "",
  );

  const translationProperty = TRANSLATION_FIELDS[dataElement];

  const translations = useMemo(
    () => JSON.parse(selectedFacility?.[TRANSLATIONS] || "[]"),
    [selectedFacility],
  );

  const previousTranslations = useMemo(() => {
    const source =
      selectedFacility?.previousValues?.[TRANSLATIONS] ??
      selectedFacility?.[TRANSLATIONS];

    return JSON.parse(source || "[]");
  }, [selectedFacility]);

  const foundDataElement = useMemo(
    () => program?.dataElements?.find((de) => de.id === dataElement),
    [program, dataElement],
  );

  const currentTranslation = useMemo(
    () =>
      translations.find(
        (item) =>
          item.property === translationProperty &&
          item.locale === selectedLocale,
      ),
    [translations, translationProperty, selectedLocale],
  );

  const handleChangeValue = (value) => {
    let updatedTranslations;

    if (currentTranslation) {
      updatedTranslations = translations.map((item) =>
        item.property === translationProperty && item.locale === selectedLocale
          ? { ...item, value }
          : item,
      );
    } else {
      updatedTranslations = [
        ...translations,
        {
          property: translationProperty,
          value,
          locale: selectedLocale,
        },
      ];
    }

    editSelectedFacility(TRANSLATIONS, JSON.stringify(updatedTranslations));
  };

  return (
    <Row>
      <span>
        {pickTranslation(foundDataElement, locale, "formName")}{" "}
        {t("translation")}
      </span>
      {selectedLocale ? (
        <div className="flex gap-2">
          <SingleSelectField
            className="!min-w-[150px]"
            selected={selectedLocale}
            disabled={disabled}
            onChange={({ selected }) => setSelectedLocale(selected)}
          >
            {metadataLocales.map((locale) => {
              const language = NATIVE_LANGUAGES[locale];

              return (
                <SingleSelectOption
                  key={locale}
                  value={locale}
                  label={
                    <div className="flex items-center gap-2">
                      <span className={`fi fi-${language.flag}`} />
                      <span>{t(language.name)}</span>
                    </div>
                  }
                />
              );
            })}
          </SingleSelectField>{" "}
        </div>
      ) : (
        <NoticeBox warning title={t("emptyMetadataLocaleAlert")}></NoticeBox>
      )}
    </Row>
  );
};

export default InputFieldWithTranslationWithoutHistory;
