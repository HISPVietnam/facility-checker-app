import React from "react";
import { pickTranslation } from "@/utils";
import useMetadataStore from "@/states/metadata";
import { useShallow } from "zustand/react/shallow";
import { Checkbox, Radio } from "@dhis2/ui";
import { useTranslation } from "react-i18next";
import Accordion from "@/ui/common/Accordion";
import "./FacilitiesNonSpatialFilterSelection.css";
import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import RadioCheckbox from "@/ui/common/RadioCheckBox";

const FacilitiesNonSpatialFilterSelection = ({ groupSet, de }) => {
  const { t } = useTranslation();

  const { filters, actions } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      filters: state.filters,
      actions: state.actions,
    })),
  );
  const { setFilters } = actions;
  const { locale, orgUnitGroups } = useMetadataStore(
    useShallow((state) => ({
      locale: state.locale,
      orgUnitGroups: state.orgUnitGroups,
    })),
  );
  const foundFilter = filters.find((f) => f.id === de);
  const groupOptions = groupSet.items.map((groups) => {
    const foundOuGroup = orgUnitGroups.find((oug) => oug.id === groups.id);
    return {
      label: pickTranslation(foundOuGroup, locale, "name"),
      id: groups.id,
    };
  });
  const options = [
    { id: "notInAnyGroup", label: t("notInAnyGroup") },
    { id: "inMultipleGroups", label: t("inMultipleGroups") },
    { id: "byGroups", label: t("byGroups") },
  ];
  return (
    <Accordion
      title={pickTranslation(groupSet, locale, "name")}
      className="max-h-[300px] overflow-y-auto !p-1 flex flex-col gap-0.5"
      titleClassName="!text-sm font-medium"
    >
      {options.map((option) => {
        return (
          <RadioCheckbox
            key={option.id}
            label={option.label}
            checked={foundFilter?.type === option.id}
            onChange={(checked) => {
              if (checked) {
                const newFilters = foundFilter
                  ? filters.map((f) =>
                      f.id === de ? { ...f, value: [], type: option.id } : f,
                    )
                  : [
                      ...filters,
                      {
                        id: de,
                        type: option.id,
                        value: [],
                      },
                    ];

                setFilters(newFilters);
              } else {
                const newFilters = filters.filter((f) => f.id !== de);
                setFilters(newFilters);
              }
            }}
          />
        );
      })}
      {/* <div className="h-1 border-t -mx-4 mt-1 border-gray-500" /> */}
      {foundFilter?.type === "byGroups" &&
        groupOptions.map((groupOption, index) => {
          return (
            <Checkbox
              onChange={(value) => {
                if (value.checked) {
                  const foundFilter = filters.find((f) => f.id === de);
                  const newFilters = foundFilter
                    ? filters.map((f) => {
                        return f.id === de
                          ? { ...f, value: [...f.value, groupOption.id] }
                          : f;
                      })
                    : [
                        ...filters,
                        { id: de, type: "byGroups", value: [groupOption.id] },
                      ];
                  setFilters(newFilters);
                } else {
                  const foundFilter = filters.find((f) => f.id === de);
                  const newFilters = foundFilter
                    ? filters.map((f) => {
                        return f.id === de
                          ? {
                              ...f,
                              value: f.value.filter(
                                (id) => id !== groupOption.id,
                              ),
                            }
                          : f;
                      })
                    : filters;
                  setFilters(newFilters);
                }
              }}
              checked={foundFilter.value.includes(groupOption.id)}
              className="pl-6"
              key={groupOption.id}
              label={groupOption.label}
              value={groupOption.id}
            />
          );
        })}
    </Accordion>
  );
};

export default FacilitiesNonSpatialFilterSelection;
