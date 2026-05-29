import { useMemo, useState } from "react";
import { SingleSelectField, SingleSelectOption, NoticeBox } from "@dhis2/ui";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import useMetadataStore from "@/states/metadata";
import useFacilityCheckModuleStore from "@/states/facilityCheckModule";

import CustomizedInputField from "@/ui/common/InputField";
import { pickTranslation } from "@/utils";
import { DATA_ELEMENTS, NATIVE_LANGUAGES, TRANSLATION_FIELDS } from "@/const";

const { TRANSLATIONS, DESCRIPTION } = DATA_ELEMENTS;

const InputFieldWithTranslation = ({
  dataElement,
  currentFacility,
  disabled,
  setCurrentFacility,
}) => {
  const { t } = useTranslation();

  const { locale, program, dataStore } = useMetadataStore(
    useShallow((state) => ({
      locale: state.locale,
      program: state.program,
      dataStore: state.dataStore,
    })),
  );

  const { selectedFacility } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      selectedFacility: state.selectedFacility,
    })),
  );

  const metadataLocales = dataStore.metadataLocales || [];
  const [selectedLocale, setSelectedLocale] = useState(
    metadataLocales[0] ?? "",
  );

  const translationProperty = TRANSLATION_FIELDS[dataElement];

  const translations = useMemo(
    () => JSON.parse(currentFacility?.[TRANSLATIONS] || "[]"),
    [currentFacility],
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

  const previousTranslation = useMemo(
    () =>
      previousTranslations.find(
        (item) =>
          item.property === translationProperty &&
          item.locale === selectedLocale,
      ),
    [previousTranslations, translationProperty, selectedLocale],
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

    setCurrentFacility({
      ...currentFacility,
      [TRANSLATIONS]: JSON.stringify(updatedTranslations),
    });
  };

  return (
    <div className={`flex  py-1 border-b border-b-slate-200 items-stretch`}>
      <div className="self-center w-[20%] text-[15px]">
        {" "}
        <span>
          {pickTranslation(foundDataElement, locale, "formName")}{" "}
          {t("translation")}
        </span>
      </div>
      <div className="self-start w-[40%]">
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
            </SingleSelectField>

            <div className="flex-1">
              <CustomizedInputField
                valueType={dataElement === DESCRIPTION ? "LONG_TEXT" : "TEXT"}
                disabled={disabled}
                value={currentTranslation?.value || ""}
                onChange={handleChangeValue}
              />
            </div>
          </div>
        ) : (
          <NoticeBox warning title={t("emptyMetadataLocaleAlert")}></NoticeBox>
        )}
      </div>
      <div className="flex flex-col w-[40%] ml-2">
        {selectedLocale ? (
          <div className="flex item-center gap-1 h-full text-sm">
            <div className="flex items-center gap-2">
              <span
                className={`fi fi-${NATIVE_LANGUAGES[selectedLocale].flag}`}
              />
              <span>{t(NATIVE_LANGUAGES[selectedLocale].name)}</span>
            </div>
            <div className="flex-1 h-full bg-slate-100 rounded-md flex items-center p-2 text-[14px]">
              {previousTranslation?.value || ""}
            </div>
          </div>
        ) : (
          <div className="flex-1 h-full bg-slate-100 rounded-md flex items-center p-2 text-[14px]"></div>
        )}
      </div>
    </div>
  );
};

export default InputFieldWithTranslation;
