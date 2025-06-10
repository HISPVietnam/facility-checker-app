import { useEffect, useRef, useState } from "react";

export const useDropdownPosition = (dropdownHeight) => {
  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [position, setPosition] = useState("bottom"); // or 'top'
  useEffect(() => {
    const checkPosition = () => {
      if (!triggerRef.current || (!dropdownHeight && !dropdownRef.current))
        return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const dropdownRectHeight =
        dropdownHeight || dropdownRef.current.getBoundingClientRect().height;
      const viewportHeight = window.innerHeight;

      const spaceBelow = viewportHeight - triggerRect.bottom;
      const spaceAbove = triggerRect.top;

      if (spaceBelow < dropdownRectHeight && spaceAbove > dropdownRectHeight) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    };

    checkPosition();
    window.addEventListener("resize", checkPosition);
    window.addEventListener("scroll", checkPosition, true);

    return () => {
      window.removeEventListener("resize", checkPosition);
      window.removeEventListener("scroll", checkPosition, true);
    };
  }, [
    triggerRef.current?.getBoundingClientRect?.()?.height,
    dropdownRef.current,
    dropdownHeight,
  ]);

  return { triggerRef, dropdownRef, position };
};
