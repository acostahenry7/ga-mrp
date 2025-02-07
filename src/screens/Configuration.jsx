import React from "react";
import Header from "../components/Header";
import ConfigCard from "../components/ConfigCard";
import { LuTag } from "react-icons/lu";

const Configuration = () => {
  const iconClasses = `text-[24px]`;
  const items = [
    {
      label: "MARCAS",
      icon: <LuTag className={iconClasses} />,
      path: "brands",
    },
  ];

  return (
    <div>
      <Header title={"CONFIGURACIÓN"} />
      {items.map(({ label, icon, path }) => (
        <ConfigCard key={label} label={label} icon={icon} path={path} />
      ))}
    </div>
  );
};

export default Configuration;
