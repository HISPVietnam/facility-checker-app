import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faClose } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { Checkbox, CircularLoader } from "@dhis2/ui";
import { debounce } from "lodash";
import * as _ from "lodash";

import {
  DEFAULT_ITEM_HEIGHT_VIRTUALIZED_LIST,
  DEFAULT_VISIBLE_COUNT_VIRTUALIZED_LIST,
} from "@/const";

import { useDropdownPosition } from "@/hooks/useDropDownPosition";
import { removeAccents } from "@/utils";

import VirtualizedList from "./VirtualizedList";

const DEFAULT_LIMIT_TAGS = 2;
const DROP_DOWN_GAP = 10;

const CustomizedMultipleSelector = ({
  disabled,
  selected = [],
  onChange,
  options = [],
  placeholder,
  filterable = false,
  limitTags = DEFAULT_LIMIT_TAGS,
  isServerSideFilter = false,
  getOptions,
  defaultOptions = [],
  onBlur,
  filterKey = "label",
}) => {
  const { t } = useTranslation();

  const containerRef = useRef(null);
  const requestIdRef = useRef(0);
  const debouncedSearchRef = useRef(null);

  const { triggerRef, dropdownRef, position } = useDropdownPosition(
    DEFAULT_ITEM_HEIGHT_VIRTUALIZED_LIST *
      DEFAULT_VISIBLE_COUNT_VIRTUALIZED_LIST +
      DROP_DOWN_GAP,
  );

  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filteredOptions, setFilteredOptions] = useState(
    isServerSideFilter ? defaultOptions : options,
  );

  const visibleTags = showDropdown ? selected : selected.slice(0, limitTags);

  const hiddenTagCount = selected.length - visibleTags.length;

  const toggleSelect = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }

    setInputValue("");
  };

  const removeTag = async (value) => {
    if (disabled) return;
    onChange(selected.filter((v) => v !== value));
    onBlur?.(selected.filter((v) => v !== value));
  };

  const removeAllTags = () => {
    onChange([]);
  };

  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      if (showDropdown) {
        onBlur?.();
      }
      setShowDropdown(false);
      setInputValue("");
      if (!isServerSideFilter) {
        setFilteredOptions(options);
      }
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [options]);

  /*
     Sync option updates
    */
  useEffect(() => {
    if (!isServerSideFilter) {
      setFilteredOptions(options);
    }
  }, [options, isServerSideFilter]);

  /*
      Create debounce once
    */
  useEffect(() => {
    debouncedSearchRef.current = debounce(async (value, isServerSide) => {
      const currentRequestId = ++requestIdRef.current;

      // SERVER SIDE
      if (isServerSide) {
        if (!value) {
          setLoading(false);

          setFilteredOptions(
            defaultOptions.length != 0
              ? defaultOptions
              : selected.map((item) =>
                  filteredOptions.find((option) => option.value === item),
                ),
          );

          return;
        }

        setLoading(true);

        try {
          const serverOptions = await getOptions(value);

          if (currentRequestId !== requestIdRef.current) {
            return;
          }

          setFilteredOptions(
            _.uniqBy(
              [
                ...serverOptions,
                ...selected.map((item) =>
                  filteredOptions.find((option) => option.value === item),
                ),
              ],
              "value",
            ),
          );
        } finally {
          setLoading(false);
        }

        return;
      }

      // CLIENT SIDE
      if (!value) {
        setFilteredOptions(options);
        return;
      }

      const lowerValue = value.toLowerCase();

      const accentlessValue = removeAccents(lowerValue);

      const toneMatched = options.filter((item) => {
        const filterValue = item[filterKey]?.toLowerCase?.() || "";
        const labelValue = item.label?.toLowerCase?.() || "";

        return (
          filterValue.includes(lowerValue) || labelValue.includes(lowerValue)
        );
      });

      const accentlessMatched = options.filter((item) => {
        if (toneMatched.includes(item)) return false;

        const filterValue = removeAccents(
          item[filterKey]?.toLowerCase?.() || "",
        );

        const labelValue = removeAccents(item.label?.toLowerCase?.() || "");

        return (
          filterValue.includes(accentlessValue) ||
          labelValue.includes(accentlessValue)
        );
      });

      setFilteredOptions([...toneMatched, ...accentlessMatched]);
    }, 300);

    return () => {
      debouncedSearchRef.current?.cancel();
    };
  }, [options, defaultOptions, getOptions]);

  /*
      Trigger search
    */
  useEffect(() => {
    debouncedSearchRef.current?.(inputValue.trim(), isServerSideFilter);
  }, [inputValue, isServerSideFilter]);

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={triggerRef}
        onClick={() => {
          if (disabled) return;
          if (showDropdown) {
            onBlur?.();
          }

          setShowDropdown((prev) => !prev);

          if (!isServerSideFilter) {
            setFilteredOptions(options);
          }
        }}
        className={` relative flex flex-col gap-2 p-2 min-h-[40px] border border-slate-400 rounded-md ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}`}
      >
        {filterable && (
          <input
            disabled={disabled}
            type="text"
            value={inputValue}
            placeholder={placeholder}
            className=" flex-1 min-w-[50px] outline-none border-none focus:ring-0 bg-transparent"
            onChange={(e) => {
              const value = e.target.value;

              setInputValue(value);

              if (!showDropdown) {
                setShowDropdown(true);
              }
            }}
          />
        )}

        {selected.length > 0 && (
          <div className=" flex items-center gap-2 flex-wrap max-h-[150px] overflow-auto w-[calc(100%-50px)]">
            {visibleTags.map((value) => {
              const option = (
                isServerSideFilter
                  ? _.uniqBy([...defaultOptions, ...filteredOptions], "value")
                  : options
              ).find((o) => o.value === value);

              return (
                <div
                  key={value}
                  className=" flex items-center gap-1 py-[2px] px-2 rounded-lg text-sm bg-[#f3f5f7] "
                >
                  <p
                    title={option?.label}
                    className=" whitespace-nowrap overflow-hidden text-ellipsis "
                  >
                    {option?.prefix} {option?.label} {option?.suffix}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      removeTag(value);
                    }}
                  >
                    <FontAwesomeIcon icon={faClose} />
                  </button>
                </div>
              );
            })}

            {!showDropdown && hiddenTagCount > 0 && (
              <div className="font-semibold">+{hiddenTagCount}</div>
            )}
          </div>
        )}

        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-2 items-center">
          {selected.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeAllTags();
              }}
            >
              <FontAwesomeIcon icon={faClose} />
            </button>
          )}

          <FontAwesomeIcon
            icon={faAngleDown}
            className={`transition-all ${showDropdown ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className={` absolute left-0 right-0 z-50 bg-white border rounded-md shadow ${position === "top" ? "bottom-full mb-1" : "top-full mt-1"} `}
        >
          {loading ? (
            <div
              className="flex justify-center items-center"
              style={{
                height:
                  DEFAULT_ITEM_HEIGHT_VIRTUALIZED_LIST *
                  DEFAULT_VISIBLE_COUNT_VIRTUALIZED_LIST,
              }}
            >
              <CircularLoader />
            </div>
          ) : filteredOptions.length > 0 ? (
            <VirtualizedList
              items={filteredOptions}
              selected={selected}
              onSelect={toggleSelect}
              itemHeight={DEFAULT_ITEM_HEIGHT_VIRTUALIZED_LIST}
              visibleItemCount={DEFAULT_VISIBLE_COUNT_VIRTUALIZED_LIST}
              renderItem={({ item, isSelected, onSelect }) => (
                <div
                  key={item.value}
                  onClick={() => onSelect(item.value)}
                  className="flex items-center p-1 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => onSelect(item.value)}
                  />

                  <span className="ml-2">
                    {item.prefix} {item.label} {item.suffix}
                  </span>
                </div>
              )}
            />
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              {t("noMatchFound")}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomizedMultipleSelector;
