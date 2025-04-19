import { InputField, MultiSelect, SingleSelect, SingleSelectOption, MultiSelectOption, OrganisationUnitTree, Popover } from "@dhis2/ui";
import { useTranslation } from "react-i18next";
import { DayPicker } from "react-day-picker";
import { useRef, useState } from "react";
import { format } from "date-fns";
import CustomizedButton from "./Button";
import useMetadataStore from "@/states/metadata";
import { useShallow } from "zustand/react/shallow";
import { pickTranslation } from "@/utils";
import DataValueText from "./DataValueText";

const CustomizedInputField = (props) => {
  const { t } = useTranslation();
  const {
    value,
    displayValue,
    valueType,
    options,
    multiSelection,
    multiSelectionRestriction,
    onChange,
    disabled,
    filter,
    error,
    validationText,
    roots
  } = props;
  if (options && multiSelection) {
    return (
      <MultiSelect
        disabled={disabled}
        selected={value ? JSON.parse(value) : []}
        className="select"
        filterable
        noMatchText={t("noMatchFound")}
        onChange={(value) => {
          if (multiSelectionRestriction) {
            if (value.selected.length > 1) {
              onChange(JSON.stringify([value.selected.pop()]));
            } else {
              onChange(JSON.stringify(value.selected));
            }
          } else {
            onChange(JSON.stringify(value.selected));
          }
        }}
      >
        {options.map((option) => {
          return <MultiSelectOption label={option.label} value={option.value} />;
        })}
      </MultiSelect>
    );
  } else if (options) {
    return (
      <SingleSelect
        disabled={disabled}
        selected={value}
        className="select"
        filterable
        noMatchText={t("noMatchFound")}
        onChange={(value) => {
          onChange(value.selected);
        }}
      >
        {options.map((option) => {
          return <SingleSelectOption label={option.label} value={option.value} />;
        })}
      </SingleSelect>
    );
  }
  switch (valueType) {
    case "DATE":
      return (() => {
        const divRef = useRef();
        const [open, setOpen] = useState(false);
        const [selected, setSelected] = useState(null);
        return (
          <div>
            <div ref={divRef}>
              <InputField
                disabled={disabled}
                value={value}
                onFocus={() => {
                  setOpen(true);
                }}
              />
            </div>
            {open && (
              <Popover
                placement="bottom"
                reference={divRef.current}
                onClickOutside={() => {
                  setOpen(false);
                }}
              >
                <div className="p-3">
                  <DayPicker
                    selected={selected}
                    mode="single"
                    captionLayout="dropdown"
                    onSelect={(value) => {
                      setSelected(value);
                    }}
                  />
                  <div className="flex">
                    <CustomizedButton
                      primary
                      onClick={() => {
                        onChange(selected ? format(selected, "yyyy-MM-dd") : "");
                        setOpen(false);
                      }}
                    >
                      {t("ok")}
                    </CustomizedButton>
                    &nbsp;
                    <CustomizedButton
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      {t("cancel")}
                    </CustomizedButton>
                  </div>
                </div>
              </Popover>
            )}
          </div>
        );
      })();
    case "ORGANISATION_UNIT":
      return (() => {
        const divRef = useRef();
        const { locale, me, orgUnits } = useMetadataStore(
          useShallow((state) => ({
            locale: state.locale,
            me: state.me,
            orgUnits: state.orgUnits
          }))
        );
        const [open, setOpen] = useState(false);
        const foundOu = orgUnits.find((ou) => ou.path === value);
        const roots = orgUnits.filter((orgUnit) => orgUnit.level === 1).map((orgUnit) => orgUnit.id);

        return (
          <div>
            <div ref={divRef}>
              <InputField
                disabled={disabled}
                onFocus={() => {
                  setOpen(true);
                }}
                value={displayValue ? displayValue : foundOu ? pickTranslation(foundOu, locale, "name") : ""}
                className="font-normal"
              />
            </div>
            {open && (
              <Popover
                maxWidth={500}
                reference={divRef.current}
                onClickOutside={() => {
                  setOpen(false);
                }}
              >
                <div className="p-3 w-[500px] h-[500px] overflow-auto">
                  <OrganisationUnitTree
                    filter={filter}
                    initiallyExpanded={value ? [value] : []}
                    onChange={(orgUnit) => {
                      if (orgUnit.path === value) {
                        onChange("");
                      } else {
                        onChange(orgUnit);
                      }
                    }}
                    selected={value ? [value] : []}
                    roots={roots ? roots : me.organisationUnits.map((orgUnit) => orgUnit.id)}
                  />
                </div>
              </Popover>
            )}
          </div>
        );
      })();

    case "COORDINATES":
      return (() => {
        const changeCoordinates = (type, changedValue) => {
          let newValue;
          if (type === "longitude") {
            newValue = [changedValue, value[1]];
          }
          if (type === "latitude") {
            newValue = [value[0], changedValue];
          }
          onChange(newValue);
        };
        return [
          <div className="w-full flex">
            <div className="w-[50%]">
              <InputField
                type="number"
                {...props}
                value={value[1]}
                onChange={(value) => {
                  changeCoordinates("latitude", value.value);
                }}
                className="font-normal"
                error={error}
              />
            </div>
            &nbsp;
            <div className="w-[50%]">
              <InputField
                error={error}
                type="number"
                {...props}
                value={value[0]}
                onChange={(value) => {
                  changeCoordinates("longitude", value.value);
                }}
                className="font-normal"
              />
            </div>
          </div>
        ];
      })();
    case "GEOJSON":
      return null;
    case "TEXT":
    case "NUMBER":
    default:
      return (
        <InputField
          {...props}
          onChange={(value) => {
            onChange(value.value);
          }}
          className="font-normal"
        />
      );
  }
};

export default CustomizedInputField;
