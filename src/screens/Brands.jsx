import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import CustomDatatable from "../components/CustomDatatable";
import DtFilterWrapper from "../components/DtFilterWrapper";
import { FilterWrapper } from "../components/DtFilter";
import { getBrandApi } from "../api/brand";
import useAuth from "../hooks/useAuth";
import Button from "../components/Button";
import { BiSearch } from "react-icons/bi";
import Modal from "../components/Modal";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [isFormOpened, setIsFormOpened] = useState(false);
  const { session } = useAuth();
  useEffect(() => {
    const getBrands = () => {
      getBrandApi({ schema: session?.userData.companyDB }).then((res) => {
        console.log(res);

        setBrands(res);
      });
    };

    getBrands();
  }, []);

  const columns = [
    {
      name: "Código Marca",
      selector: (row) => row.U_brand_code,
    },
    {
      name: "Marca",
      selector: (row) => row.U_description,
    },
    {
      name: "Leadtime",
      selector: (row) => row.U_leadtime + " meses",
    },
    {
      name: "Variacion del leadtime",
      selector: (row) => parseFloat(row.U_leadtime_variance_index).toFixed(2),
    },
    {
      name: "Nivel de servicio (Z)",
      selector: (row) => parseFloat(row.U_service_level).toFixed(2),
    },
  ];

  return (
    <div>
      {isFormOpened && <BrandForm />}
      <Header
        title={"MARCAS"}
        btnTitle={"Nueva Marca"}
        btnOnClick={() => handleOpenForm()}
      />
      <DtFilterWrapper>
        <FilterWrapper>
          <label htmlFor="">Búsqueda</label>
          <input className="filter-input" placeholder="Buscar..." />
        </FilterWrapper>
        <div className="self-end mb-1 w-full sm:w-[172px]">
          <Button
            title={"Buscar"}
            variant="light"
            width={"100%"}
            icon={<BiSearch size={16} />}
          />
        </div>
      </DtFilterWrapper>
      <CustomDatatable columns={columns} data={brands} />
    </div>
  );
};

const BrandForm = () => {
  return <Modal>algo</Modal>;
};

export default Brands;
