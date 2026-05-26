const FilterSubSection = ({ title, children, controlButtons }) => {
  return (
    <div className="mb-2">
      <div className="flex gap-2 items-center mb-1">
        <p className=" font-bold">{title}</p>
        {controlButtons && <div className="">{controlButtons}</div>}
      </div>
      <div className="overflow-auto flex flex-col gap-2">{children}</div>
    </div>
  );
};
export default FilterSubSection;
