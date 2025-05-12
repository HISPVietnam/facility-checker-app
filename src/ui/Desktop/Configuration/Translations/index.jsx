import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faClose } from "@fortawesome/free-solid-svg-icons";
import { DataTable, DataTableBody, DataTableCell, DataTableHead, DataTableRow } from "@dhis2/ui";

import { NATIVE_LANGUAGES } from "@/const";
import { saveDataStore } from "@/api/metadata";
import { removeVietnameseTones } from "@/utils";

import useMetadataStore from "@/states/metadata";
import useConfigurationModuleStore from "@/states/configurationModule";

import CustomizedButton from "@/ui/common/Button";
import CustomizedInputField from "@/ui/common/InputField";

import "./index.css";

const Translations = () => {
  const { t, i18n } = useTranslation();
  //global store
  const {
    dataStore,
    locale,
    actions: { setMetadata }
  } = useMetadataStore(
    useShallow((state) => ({
      dataStore: state.dataStore,
      locale: state.locale,
      actions: state.actions
    }))
  );
  const { locales } = dataStore;

  const {
    translations: { selectedLanguages, searchTranslation },
    actions: { selectLanguage, setSearchTranslation }
  } = useConfigurationModuleStore(
    useShallow((state) => ({
      translations: state.translations,
      actions: state.actions
    }))
  );
  //local store
  const [editedKeys, setEditedKeys] = useState({});
  const [savingLoading, setSavingLoading] = useState(false);

  const handleEdit = (key, lang, value) => {
    setEditedKeys((prevEditedKeys) => ({
      ...prevEditedKeys,
      [lang]: { ...prevEditedKeys[lang], [key]: value }
    }));
  };

  const handleCancel = (key, lang) => {
    setEditedKeys((prevEditedKeys) => ({
      ...prevEditedKeys,
      [lang]: { ...prevEditedKeys[lang], [key]: undefined }
    }));
  };

  const handleSave = async (key, lang) => {
    try {
      setSavingLoading(true);
      const newLocales = {
        ...locales,
        [lang]: { ...locales[lang], [key]: editedKeys[lang][key] }
      };
      const result = await saveDataStore("locales", newLocales, "UPDATED");
      if (result.ok) {
        setMetadata("dataStore", { ...dataStore, locales: newLocales });
        i18n.addResourceBundle(lang, "translation", newLocales[lang], true, true);
        // will show toast success message
      } else {
        // will show toast error message
        console.log("Error saving data store", result.error);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setSavingLoading(false);
      setEditedKeys((prevEditedKeys) => ({
        ...prevEditedKeys,
        [lang]: { ...prevEditedKeys[lang], [key]: undefined }
      }));
    }
  };

  useEffect(() => {
    // Set default languages show in table and reset search key
    setSearchTranslation("");
    selectLanguage("en");
    locale !== "en" && selectLanguage(locale);
  }, []);

  return (
    <div className="w-full h-full overflow-auto">
      <DataTable className="translations-config-table" scrollHeight="100%">
        <DataTableHead>
          <DataTableRow>
            <DataTableCell className="!font-bold !text-center w-[200px]" top="0" fixed>
              {t("key")}
            </DataTableCell>
            {selectedLanguages.map((lang) => (
              <DataTableCell className="!font-bold !text-center min-w-[300px]" top="0" fixed>
                {NATIVE_LANGUAGES[lang]["name"]}
              </DataTableCell>
            ))}
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {Object.keys(locales["en"])
            .sort()
            .filter(
              (key) =>
                removeVietnameseTones(key.toLowerCase()).includes(removeVietnameseTones(searchTranslation.toLowerCase())) ||
                // Check if any of the selected languages contain the search key
                Object.keys(locales).some((lang) =>
                  removeVietnameseTones(locales[lang][key]?.toLowerCase() || "").includes(removeVietnameseTones(searchTranslation.toLowerCase()))
                )
            )
            .map((key) => {
              return (
                <DataTableRow key={key}>
                  <DataTableCell bordered>{key}</DataTableCell>
                  {selectedLanguages.map((lang) => {
                    let valueType = "TEXT";
                    if (editedKeys[lang] && editedKeys[lang][key] && editedKeys[lang][key].length > 100) {
                      valueType = "LONG_TEXT";
                    }
                    return (
                      <DataTableCell
                        className="cursor-pointer"
                        onClick={() => {
                          if (editedKeys[lang]?.[key] !== undefined) {
                            return;
                          }
                          handleEdit(key, lang, locales[lang][key]);
                        }}
                      >
                        {editedKeys[lang]?.[key] !== undefined ? (
                          <div className="flex items-center gap-1">
                            <div className="flex-1">
                              <CustomizedInputField
                                disabled={savingLoading}
                                valueType={valueType}
                                value={editedKeys[lang][key]}
                                onChange={(value) => {
                                  handleEdit(key, lang, value);
                                }}
                              />
                            </div>
                            <CustomizedButton
                              disabled={savingLoading}
                              className="!h-8 aspect-square !border-[#a0adba]"
                              success
                              onClick={() => {
                                handleSave(key, lang);
                              }}
                              icon={<FontAwesomeIcon className="text-white text-xl" icon={faCheck} />}
                            />
                            <CustomizedButton
                              disabled={savingLoading}
                              destructive
                              className="!h-8 aspect-square !border-[#a0adba] "
                              onClick={() => {
                                handleCancel(key, lang);
                              }}
                              icon={<FontAwesomeIcon className="text-white text-xl" icon={faClose} />}
                            />
                          </div>
                        ) : (
                          locales[lang][key]
                        )}
                      </DataTableCell>
                    );
                  })}
                </DataTableRow>
              );
            })}
        </DataTableBody>
      </DataTable>
    </div>
  );
};
export default Translations;
