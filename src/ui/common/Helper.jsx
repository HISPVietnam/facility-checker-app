const Helper = ({ type, value }) => {
  let className = "";
  switch (type) {
    case "HELPER":
      className = "text-[14px] font-bold text-blue-600";
      break;
    case "WARNING":
      className = "text-[14px] font-bold text-orange-600";
      break;
    case "ERROR":
      className = "text-[14px] font-bold text-red-600";
      break;
  }

  return <span className={className}>{value}</span>;
};
export default Helper;
