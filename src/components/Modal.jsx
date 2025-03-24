import React from "react";

const Modal = ({ children }) => {
  return (
    <div
      className="absolute top-0 left-0 z-10 w-full h-full bg-[rgba(0,0,0,0.5)]
    flex items-center justify-center font-roboto overflow-hidden"
    >
      <div className="bg-light-blue max-xl:max-w-[1800px] md:max-w-[100%] w-[90%] max-sm:w-[90%] min-h-[200px] px-9 py-6 rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default Modal;
