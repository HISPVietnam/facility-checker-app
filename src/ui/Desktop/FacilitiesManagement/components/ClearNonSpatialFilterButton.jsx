import useFacilityCheckModuleStore from "@/states/facilityCheckModule";
import useMetadataStore from "@/states/metadata";
import { Button } from "@dhis2/ui";
import React from "react";
import { useTranslation } from "react-i18next";
import { useShallow } from "zustand/react/shallow";

const ClearNonSpatialFilterButton = () => {
  const { t } = useTranslation();
  const { filters, actions } = useFacilityCheckModuleStore(
    useShallow((state) => ({
      filters: state.filters,
      actions: state.actions,
    })),
  );
  const { program } = useMetadataStore(
    useShallow((state) => ({
      program: state.program,
    })),
  );
  const { setFilters } = actions;
  const handleClearNonSpatialFilters = () => {
    const newFilters = filters.filter(
      (f) =>
        !program.dataElements
          .filter((de) => {
            return de.description && de.description.includes("FCGS");
          })
          .map((de) => de.id)
          .includes(f.id),
    );
    setFilters(newFilters);
  };
  return (
    <Button
      onClick={handleClearNonSpatialFilters}
      className="!p-1 !h-[30px] text-sm"
    >
      {t("clear")}
    </Button>
  );
};

export default ClearNonSpatialFilterButton;
