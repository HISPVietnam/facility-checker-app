import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faClose } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@dhis2/ui";

import {
  DEFAULT_ITEM_HEIGHT_VIRTUALIZED_LIST,
  DEFAULT_VISIBLE_COUNT_VIRTUALIZED_LIST,
} from "@/const";
import { useDropdownPosition } from "@/hooks/useDropDownPosition";

import VirtualizedList from "./VirtualizedList";
import { removeAccents } from "@/utils";
import { debounce } from "lodash";

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
}) => {
  const { t } = useTranslation();
  const containerRef = useRef(null);
  const { triggerRef, dropdownRef, position } = useDropdownPosition(
    DEFAULT_ITEM_HEIGHT_VIRTUALIZED_LIST *
      DEFAULT_VISIBLE_COUNT_VIRTUALIZED_LIST +
      DROP_DOWN_GAP
  );

  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);

  const toggleSelect = (value) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
    setInputValue("");
  };

  const removeTag = (value) => {
    if (!disabled) {
      onChange(selected.filter((v) => v !== value));
    }
  };

  const removeAllTags = () => {
    onChange([]);
  };

  const handleClickOutside = (e) => {
    if (containerRef.current && !containerRef.current.contains(e.target)) {
      setShowDropdown(false);
      setInputValue("");
    }
  };
  const visibleTags = showDropdown ? selected : selected.slice(0, limitTags);
  const hiddenTagCount = selected.length - visibleTags.length;

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handler = debounce(() => {
      const toneMatched = options.filter((item) =>
        item.label.toLowerCase().includes(inputValue.toLowerCase())
      );

      const accentlessMatched = options.filter(
        (item) =>
          !toneMatched.includes(item) &&
          removeAccents(item.label).includes(
            removeAccents(inputValue.toLowerCase())
          )
      );

      setFilteredOptions([...toneMatched, ...accentlessMatched]);
    }, 300);

    handler();
    return () => handler.cancel();
  }, [inputValue, options]);

  return (
    <div ref={containerRef} className="relative">
      <div
        ref={triggerRef}
        onClick={() => !disabled && setShowDropdown(true)}
        className={`flex flex-col gap-2 p-2 min-h-[40px] border border-slate-400 rounded-md ${
          disabled ? "bg-gray-100 cursor-not-allowed" : ""
        }`}
      >
        {filterable && (
          <input
            disabled={disabled}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 min-w-[50px] outline-none border-none focus:ring-0 bg-transparent"
          />
        )}

        {selected.length > 0 && (
          <div
            className={`flex items-center gap-2 flex-wrap max-h-[150px] overflow-auto w-[calc(100%-50px)]`}
          >
            {visibleTags.map((value) => {
              const option = options.find((o) => o.value === value);
              return (
                <div
                  key={value}
                  className="flex items-center gap-1 py-[2px] px-2 rounded-lg text-sm bg-[#f3f5f7]"
                >
                  <p
                    className={`${
                      !showDropdown ? "max-w-[350px]" : ""
                    } whitespace-nowrap overflow-hidden text-ellipsis`}
                    title={option?.label}
                  >
                    {option?.prefix} {option?.label} {option?.suffix}
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(value);
                    }}
                    disabled={disabled}
                    className={`ml-1 w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-slate-300 focus:outline-none ${
                      disabled
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }`}
                    title="Remove"
                  >
                    <FontAwesomeIcon icon={faClose} />
                  </button>
                </div>
              );
            })}

            {!showDropdown && hiddenTagCount > 0 && (
              <div className="font-semibold text-lg">+{hiddenTagCount}</div>
            )}
          </div>
        )}

        <div className="absolute right-5 top-1/2 -translate-y-1/2 flex gap-1 items-center">
          {selected.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeAllTags();
              }}
              disabled={disabled}
              className={`w-5 h-5 flex items-center justify-center rounded-full transition-all hover:bg-slate-300 focus:outline-none ${
                disabled ? "pointer-events-none opacity-50" : "cursor-pointer"
              }`}
              title="Clear all"
            >
              <FontAwesomeIcon icon={faClose} />
            </button>
          )}
          <FontAwesomeIcon
            icon={faAngleDown}
            onClick={(e) => {
              e.stopPropagation();
              !disabled && setShowDropdown((prev) => !prev);
            }}
            className={`transition-all ${showDropdown ? "rotate-180" : ""} ${
              disabled ? "pointer-events-none opacity-50" : "cursor-pointer"
            }`}
          />
        </div>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className={`absolute left-0 right-0 z-50 bg-white border rounded-md shadow ${
            position === "top" ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {filteredOptions.length > 0 ? (
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
                    className="mr-2"
                    onChange={() => onSelect(item.value)}
                  />
                  {item.prefix} {item.label} {item.suffix}
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
