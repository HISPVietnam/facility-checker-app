const FilterSection = ({ children }) => {
  return (
    <div
      className={` ml-1 mr-1 p-2 rounded-md border border-slate-300 w-[400px] h-[500px]`}
    >
      <div className="h-full overflow-auto ">{children}</div>
    </div>
  );
};
export default FilterSection;
