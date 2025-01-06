import React from "react";

const Modal = ({ children }) => {
  return (
    <div
      className="absolute top-0 left-0 z-10 w-full h-full bg-[rgba(0,0,0,0.5)]
    flex items-center justify-center"
    >
      <div className="bg-light-blue w-[80%] min-h-[200px] p-6 rounded-lg">
        {children}
      </div>
    </div>
  );
};

export default Modal;
