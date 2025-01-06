import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import DtFilter from "../components/DtFilter";
import CustomDatatable from "../components/CustomDatatable";
import { getMrpApi } from "../api/mrp";

const Home = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    const getData = () => {
      getMrpApi().then((res) => {
        setData(res);
      });
    };

    getData();
  }, []);

  console.log(data);

  const columns = [
    {
      name: "Código",
      selector: (i) => i.U_mrp_code,
    },
    {
      name: "Descripción",
      selector: (i) => i.U_description,
    },
    {
      name: "Marca",
      selector: (i) => i.U_brand_name,
    },
    {
      name: "Leadtime",
      selector: (i) => `${i.U_leadtime} meses`,
    },
    {
      name: "Monto Sugerido",
      selector: (i) => i.U_suggested_amount,
    },
    {
      name: "Marca",
      selector: (i) => i.U_brand_name,
    },
    {
      name: "Período",
      selector: (i) =>
        `${i.U_start_month}/${i.U_start_year.slice(2)} - ${
          i.U_end_month
        }/${i.U_end_year.slice(2)}`,
    },
    {
      name: "Fecha creación",
      selector: (i) => {
        const options = {
          // weekday: "numeric",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        };
        const date = new Date(i.U_created_date);

        return `${date.toLocaleDateString("es-ES", options)}`;
      },
    },
    {
      name: "Marca",
      selector: (i) => i.U_created_by,
    },
    {
      name: "Acciones",
      selector: (i) => <span>menu</span>,
    },
  ];

  return (
    <>
      <Header title={"SUGERIDOS"} btnTitle={"Crear Sugerido"} />
      <DtFilter />
      <CustomDatatable columns={columns} data={data} />
    </>
  );
};

export default Home;
