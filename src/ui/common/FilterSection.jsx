const FilterSection = ({ children }) => {
  return (
    <div className={`ml-1 mr-1 p-1 rounded-md border border-slate-300 w-[400px] h-[450px]`}>
      <div className="h-[calc(100%-30px)] overflow-auto">{children}</div>
    </div>
  );
};
export default FilterSection;
