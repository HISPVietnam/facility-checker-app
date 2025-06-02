import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleUp,
  faCancel,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@dhis2/ui";

const CustomizedMultipleSelector = ({
  disabled,
  selected,
  filterable = false,
  onChange,
  options = [],
  placeholder,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  const filteredOptions = options.filter((item) =>
    item.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  const handleInputClick = () => {
    if (!disabled) setShowDropdown(true);
  };

  const handleToggleDropdown = (e) => {
    e.stopPropagation();
    if (!disabled) setShowDropdown(!showDropdown);
  };

  const handleToggleSelect = (value) => {
    if (!selected.includes(value)) {
      onChange([...selected, value]);
    } else {
      onChange(selected.filter((v) => v !== value));
    }
    setInputValue("");
  };

  const handleRemove = (value) => {
    if (!disabled) {
      onChange(selected.filter((v) => v !== value));
    }
  };

  const handleRemoveAll = () => {
    onChange([]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={handleInputClick}
        className={`flex flex-wrap items-center gap-2 p-2 min-h-[40px] border border-slate-400 rounded-md ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-text"
        }`}
      >
        {selected.map((value) => {
          const option = options.find((o) => o.value === value);
          return (
            <div
              key={value}
              className="flex items-center py-[2px] gap-1 px-2 rounded-lg text-sm bg-[#f3f5f7]"
            >
              {option?.prefix} {option?.label} {option?.suffix}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(value);
                }}
                disabled={disabled}
                className={`ml-1 w-6 h-6 flex items-center justify-center rounded-full transition-all hover:bg-slate-300 focus:outline-none ${
                  disabled ? "pointer-events-none opacity-50" : "cursor-pointer"
                }`}
                title="Remove"
              >
                <FontAwesomeIcon icon={faClose} />
              </button>
            </div>
          );
        })}

        <input
          disabled={disabled || !filterable}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder ? placeholder : undefined}
          className="flex-1 min-w-[50px] outline-none border-none focus:ring-0 bg-transparent"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 items-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveAll();
            }}
            disabled={disabled}
            className={`ml-1 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-150 hover:bg-slate-300 focus:outline-none ${
              disabled ? "pointer-events-none opacity-50" : "cursor-pointer"
            }`}
          >
            <FontAwesomeIcon icon={faClose} />
          </button>

          <FontAwesomeIcon
            icon={faAngleDown}
            onClick={handleToggleDropdown}
            className={` ${showDropdown && "rotate-180"} transition-all  ${
              disabled ? "pointer-events-none opacity-50" : "cursor-pointer"
            }`}
          />
        </div>
      </div>

      {showDropdown && (
        <div
          className={` absolute left-0 right-0 mt-1 z-50 bg-white border rounded-md shadow max-h-60 overflow-y-auto`}
        >
          {filteredOptions.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {filteredOptions.map((item) => (
                <li
                  key={item.value}
                  onClick={() => handleToggleSelect(item.value)}
                  className="flex items-center p-1 hover:bg-gray-100 cursor-pointer text-sm"
                >
                  <Checkbox
                    checked={selected.includes(item.value)}
                    className="mr-2"
                  />
                  {item.prefix} {item.label} {item.suffix}
                </li>
              ))}
            </ul>
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
