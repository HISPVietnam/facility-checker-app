const FilterSubSection = ({ title, children }) => {
  return (
    <div className="mb-1">
      <div className="h-[30px] font-bold">{title}</div>
      <div className="h-[calc(100%-30px)] overflow-auto">{children}</div>
    </div>
  );
};
export default FilterSubSection;
