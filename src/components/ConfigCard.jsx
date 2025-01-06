import React from "react";
import { useNavigate } from "react-router";

const ConfigCard = ({ label, icon, path }) => {
  const navigate = useNavigate();
  return (
    <div
      className="max-sm:w-full w-[350px] h-[165px] bg-[#1E1E1E] rounded-xl text-light-blue font-roboto flex items-center justify-center tracking-wide font-medium text-xl gap-3 cursor-pointer hover:bg-red-700 hover:text-light-blue hover:border-red-700  icon-text-light-blue icon-hover:text-primary transition-colors duration-300"
      onClick={() => {
        navigate(`/settings/${path}`);
      }}
    >
      <div className="icon">{icon}</div>
      {label}
    </div>
  );
};

export default ConfigCard;
