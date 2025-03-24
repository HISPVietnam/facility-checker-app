import { Button } from "@dhis2/ui";

const CustomizedButton = (props) => {
  const { className, children, hidden, success } = props;
  const classNameMapping = {
    success: "!bg-[#3ca137] !border-[#2f802b] !hover:bg-sky-700 !text-white !font-bold"
  };
  let newClassName = className;
  if (success) {
    newClassName += " " + classNameMapping.success;
  }

  return (
    <div className={`${hidden && "hidden"}`}>
      <Button {...props} className={newClassName}>
        {children}
      </Button>
    </div>
  );
};
export default CustomizedButton;
