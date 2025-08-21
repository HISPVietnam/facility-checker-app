import { useState } from "react";

const Accordion = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className=" rounded-md border border-gray-300 bg-white shadow-md">
      {/* Header */}
      <button
        className={` rounded-md flex w-full  sticky top-0 z-[10000] bg-white items-center justify-between px-2 py-[5px]  text-left  ${
          open && "border-b border-gray-300 rounded-b-none mb-1"
        }`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <span className="text-base ">{title}</span>
        <svg
          className={`size-5 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 10.17l3.71-2.94a.75.75 0 1 1 .94 1.16l-4.24 3.36a.75.75 0 0 1-.94 0L5.21 8.39a.75.75 0 0 1 .02-1.18z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {/* Content */}
      <div
        className="overflow-hidden transition-[height] duration-300"
        style={{ height: open ? "auto" : "0" }}
        aria-hidden={!open}
      >
        <div className="p-4 pt-0 text-sm text-gray-600">{children}</div>
      </div>
    </div>
  );
};

export default Accordion;
