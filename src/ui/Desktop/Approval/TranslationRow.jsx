import useMetadataStore from "@/states/metadata";
import { pickTranslation } from "@/utils";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";
import { CustomValue } from "./PendingFacilityDialog";
import { NATIVE_LANGUAGES, TRANSLATION_FIELDS } from "@/const";
import { NoticeBox, SingleSelectField, SingleSelectOption } from "@dhis2/ui";
const TranslationRow = ({ dataValue, isChangedValue }) => {
  const { t } = useTranslation();
  const { program, locale, dataStore } = useMetadataStore(
    useShallow((state) => ({
      program: state.program,
      locale: state.locale,
      dataStore: state.dataStore,
    })),
  );
  const metadataLocales = dataStore.metadataLocales || [];
  const [selectedLocale, setSelectedLocale] = useState(
    metadataLocales[0] ?? "",
  );
  const newValues = JSON.parse(dataValue.value || "[]");
  const oldValues = JSON.parse(dataValue.oldValue || "[]");

  const allKeys = [
    ...new Set(
      [...newValues, ...oldValues].map(
        (item) => `${item.property}-${item.locale}`,
      ),
    ),
  ];

  const changedProperties = allKeys
    .map((key) => {
      const [property, locale] = key.split("-");

      const newItem = newValues.find(
        (item) => item.property === property && item.locale === locale,
      );

      const oldItem = oldValues.find(
        (item) => item.property === property && item.locale === locale,
      );

      return {
        property,
        locale,
        oldValue: oldItem?.value ?? null,
        newValue: newItem?.value ?? null,
      };
    })
    .filter((item) => item.oldValue !== item.newValue);

  if (!isChangedValue) {
    return (
      <div>
        {Object.keys(TRANSLATION_FIELDS)
          .filter(
            (key) =>
              !changedProperties.some(
                (prop) =>
                  prop.property === TRANSLATION_FIELDS[key] && prop.newValue,
              ),
          )
          .map((item) => {
            const foundDataElement = program.dataElements.find(
              (de) => de.id === item,
            );
            const foundValue = JSON.parse(dataValue.oldValue || "[]").find(
              (v) =>
                v.property === TRANSLATION_FIELDS[item] &&
                v.locale === selectedLocale,
            );
            return (
              <div className="flex mb-1 gap-2 border-b pb-1 items-center">
                <div className="w-[20%]">
                  {foundDataElement
                    ? `${pickTranslation(foundDataElement, locale, "formName")} ${t("translation")}`
                    : item.property}
                </div>
                <div className="w-[40%]">
                  {selectedLocale ? (
                    <div className="flex items-center gap-2">
                      <SingleSelectField
                        className="!min-w-[150px]"
                        selected={selectedLocale}
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
                      <CustomValue isOld={isChangedValue}>
                        {foundValue ? foundValue.value : null}
                      </CustomValue>
                    </div>
                  ) : (
                    <NoticeBox
                      warning
                      title={t("emptyMetadataLocaleAlert")}
                    ></NoticeBox>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    );
  }

  const groupedByProperty = Object.groupBy(
    changedProperties,
    (item) => item.property,
  );

  return (
    <div className="flex flex-col gap-1">
      {Object.keys(groupedByProperty).map((item) => {
        const foundTranslationFields = Object.keys(TRANSLATION_FIELDS).find(
          (key) => TRANSLATION_FIELDS[key] === item,
        );
        const foundDataElement = program.dataElements.find(
          (de) => de.id === foundTranslationFields,
        );
        const changedFields = groupedByProperty[item];
        return (
          <div key={item} className="border">
            <div className="flex item-center border-b p-1 text-sm font-medium">
              {pickTranslation(foundDataElement, locale, "formName")}{" "}
              {t("translation")}
            </div>
            <div className="flex flex-col p-1 gap-1">
              {changedFields.map((field, index) => (
                <div
                  key={`${item}-${field.locale}`}
                  className={`flex gap-2 items-center ${index < changedFields.length - 1 ? "border-b" : ""}`}
                >
                  <div className="w-[20%] flex items-center gap-1">
                    <div className="text-sm flex gap-1">
                      <span
                        className={`fi fi-${NATIVE_LANGUAGES[field.locale].flag}`}
                      />
                      <span>{t(NATIVE_LANGUAGES[field.locale].name)}</span>
                    </div>
                  </div>
                  <div className="w-[40%]">
                    <CustomValue isOld={isChangedValue}>
                      {field.oldValue}
                    </CustomValue>
                  </div>
                  <div className="w-[40%]">
                    <CustomValue isNew={isChangedValue}>
                      {field.newValue}
                    </CustomValue>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TranslationRow;
