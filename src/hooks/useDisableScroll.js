import { useEffect } from "react";

const useDisableScroll = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }

    // Clean up on unmount
    return () => document.body.classList.remove("no-scroll");
  }, [isOpen]);
};

export default useDisableScroll;
