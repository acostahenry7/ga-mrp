import React from "react";
import Header from "../components/Header";
import ConfigCard from "../components/ConfigCard";
import { LuLayoutDashboard, LuTag } from "react-icons/lu";

const Configuration = () => {
  const iconClasses = `text-[24px]`;
  const items = [
    {
      label: "MARCAS",
      icon: <LuTag className={iconClasses} />,
      path: "brands",
    },
    {
      label: "INTERFAZ",
      icon: <LuLayoutDashboard className={iconClasses} />,
      path: "brands",
    },
  ];

  return (
    <div>
      <Header title={"CONFIGURACIÓN"} />
      <div className="flex gap-3 flex-wrap flex-shrink-[210px]">
        {items.map(({ label, icon, path }) => (
          <ConfigCard key={label} label={label} icon={icon} path={path} />
        ))}
      </div>
    </div>
  );
};

export default Configuration;
