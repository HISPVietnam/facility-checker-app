const RadioCheckbox = ({ checked, onChange, label }) => {
  return (
    <label
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`
                    w-4 h-4 rounded-full border
                    flex items-center justify-center
                    transition-all
                    ${checked ? "border-[#02897B]" : "border-gray-400"}
                `}
      >
        <div
          className={`
                        w-2.5 h-2.5 rounded-full bg-[#02897B]
                        transition-all
                        ${checked ? "scale-100" : "scale-0"}
                    `}
        />
      </div>
      <span className="text-sm">{label}</span>
    </label>
  );
};

export default RadioCheckbox;
