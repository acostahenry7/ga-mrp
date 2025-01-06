import React from "react";

const Button = ({
  title,
  borderColor,
  variant = "light",
  width,
  height,
  onClick,
  icon,
}) => {
  const variants = {
    light: "border-black hover:bg-black hover:text-white",
    dark: "bg-black text-light-blue border-black hover:bg-red-700 hover:border-red-700 hover:text-white",
    darkLight:
      "bg-black text-light-blue border-black hover:bg-light-blue hover:border-black hover:text-black",
  };

  return (
    <button
      onClick={onClick}
      style={{ width: width || "172px", height: height || "40px" }}
      className={`relative flex items-center justify-center gap-2 font-poppins font-normal border-2 rounded-full duration-200 ${
        variants[variant || "light"]
      }`}
    >
      {title || "button"}
      <div>{icon && <div className="absolute right-4 top-3">{icon}</div>}</div>
    </button>
  );
};

export default Button;
