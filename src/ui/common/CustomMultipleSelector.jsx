import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
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

  const handleSelect = (value) => {
    if (!selected.includes(value)) {
      onChange([...selected, value]);
    }
  };

  const handleRemove = (value) => {
    if (!disabled) {
      onChange(selected.filter((v) => v !== value));
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div
        onClick={handleInputClick}
        className={`flex flex-wrap items-center gap-2 p-2 min-h-[40px] border rounded-md ${
          disabled ? "bg-gray-100 cursor-not-allowed" : "cursor-text"
        }`}
      >
        {selected.map((value) => {
          const option = options.find((o) => o.value === value);
          return (
            <div
              key={value}
              style={{
                background:
                  "linear-gradient(rgb(21, 101, 192) 0%, rgb(6, 80, 163) 100%) rgb(43, 97, 179)",
              }}
              className="flex items-center gap-1 text-white px-3 py-1 rounded-full text-sm"
            >
              {option?.prefix} {option?.label} {option?.suffix}
              <button
                onClick={() => handleRemove(value)}
                disabled={disabled}
                className={`ml-1 w-6 h-6 flex items-center justify-center rounded-full text-white hover:bg-blue-800 focus:outline-none ${
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
          placeholder={t("selectOption")}
          className="flex-1 min-w-[50px] outline-none border-none focus:ring-0 bg-transparent"
        />

        <FontAwesomeIcon
          icon={faAngleDown}
          onClick={handleToggleDropdown}
          className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1 z-50 bg-white border rounded-md shadow max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            <ul className="divide-y divide-gray-100">
              {filteredOptions.map((item) => (
                <li
                  key={item.value}
                  onClick={() => handleSelect(item.value)}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
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
