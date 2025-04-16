import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faStar, faRotate, faCheck } from "@fortawesome/free-solid-svg-icons";
const Pending = ({ children }) => {
  return (
    <span className="text-[14px] text-white p-1 rounded-md bg-orange-500">
      <FontAwesomeIcon icon={faClock} />
      &nbsp;
      {children}
    </span>
  );
};
const Approved = ({ children }) => {
  return (
    <span className="text-[14px] text-white p-1 rounded-md bg-cyan-700 ">
      <FontAwesomeIcon icon={faCheck} />
      &nbsp;{children}
    </span>
  );
};

const Edited = ({ children }) => {
  return <span className="text-[14px] text-white p-1 rounded-md bg-blue-500 ">{children}</span>;
};

const New = ({ children }) => {
  return (
    <span className="text-[14px] text-white p-1 rounded-md bg-green-700 ">
      <FontAwesomeIcon icon={faStar} />
      &nbsp;{children}
    </span>
  );
};
const NotYetSynced = ({ children }) => {
  return (
    <span className="text-[14px] text-white p-1 rounded-md bg-red-500 ">
      <FontAwesomeIcon icon={faRotate} />
      &nbsp;{children}
    </span>
  );
};

export { Pending, Approved, Edited, New, NotYetSynced };
