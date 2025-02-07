import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import CustomDatatable from "../components/CustomDatatable";
import DtFilterWrapper from "../components/DtFilterWrapper";
import { FilterWrapper } from "../components/DtFilter";
import {
  createBrandApi,
  getBrandApi,
  removeBrandApi,
  updateBrandApi,
} from "../api/brand";
import useAuth from "../hooks/useAuth";
import Button from "../components/Button";
import { BiEdit, BiSearch, BiTrash } from "react-icons/bi";
import Modal from "../components/Modal";
import { useFormik } from "formik";
import { DNA } from "react-loader-spinner";

const Brands = () => {
  const [brands, setBrands] = useState([]);
  const [isFormOpened, setIsFormOpened] = useState(false);
  const [toggleSearch, setToggleSearch] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentBrand, setCurrentBrand] = useState({});
  const { session } = useAuth();
  useEffect(() => {
    const getBrands = () => {
      setIsLoading(true);
      getBrandApi({ schema: session?.userData.companyDB }).then((res) => {
        setBrands(res);
        setTimeout(() => setIsLoading(false), 500);
      });
    };

    getBrands();
  }, [toggleSearch]);

  const handleOpenForm = (data) => {
    if (data) {
      setCurrentBrand(data);
    }
    setIsFormOpened(true);
  };

  const handleCloseForm = () => {
    setIsFormOpened(false);
  };

  const handleUpsertBrand = (data, mode) => {
    if (mode == "create") {
      createBrandApi({ schema: session?.userData.companyDB }, data)
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setIsFormOpened(false);
          setToggleSearch((prev) => !prev);
        });
    } else {
      updateBrandApi(
        { schema: session?.userData.companyDB, Code: data.Code },
        data
      )
        .then((res) => {
          console.log(res);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setIsFormOpened(false);
          setToggleSearch((prev) => !prev);
        });
    }
  };

  const removeBrand = (Code) => {
    removeBrandApi({ schema: session?.userData.companyDB, Code })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setToggleSearch((prev) => !prev);
      });
  };

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
    {
      name: "Acciones",
      selector: (row) => (
        <div className="flex gap-4">
          <BiEdit
            className="cursor-pointer text-slate-500"
            size={25}
            onClick={() => handleOpenForm(row)}
          />
          <BiTrash
            className="cursor-pointer text-red-400"
            size={25}
            onClick={() => removeBrand(row.Code)}
          />
        </div>
      ),
    },
  ];

  return (
    <div>
      {isFormOpened && (
        <BrandForm
          data={currentBrand}
          handleSubmit={handleUpsertBrand}
          onClose={handleCloseForm}
        />
      )}
      <Header
        title={"MARCAS"}
        btnTitle={"Nueva Marca"}
        btnOnClick={() => handleOpenForm({})}
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
            onClick={() => setToggleSearch((prev) => !prev)}
            icon={<BiSearch size={16} />}
          />
        </div>
      </DtFilterWrapper>

      <CustomDatatable columns={columns} data={brands} isLoading={isLoading} />
    </div>
  );
};

const BrandForm = ({ data, handleSubmit, onClose }) => {
  let isPrevData = Object.entries(data).length > 0;

  const form = useFormik({
    initialValues: {
      brandCode: data.U_brand_code || "",
      description: data.U_description || "",
      leadtime: data.U_leadtime || 3,
      leadtimeVarianceIndex: parseFloat(data.U_leadtime_variance_index) || 0,
      serviceLevel: parseFloat(data.U_service_level) || 1,
    },
    validateOnChange: false,
    onSubmit: (values) => {
      if (isPrevData) {
        handleSubmit({ Code: data.Code, ...values }, "edit");
      } else {
        handleSubmit(values, "create");
      }
    },
  });

  // useEffect(() => {
  //   const fillForm = () => {
  //     form.setFieldValue("brandCode", data.brandCode);
  //   };

  //   fillForm();
  // }, [data]);

  return (
    <Modal>
      <div>
        <h4 className="text-base font-semibold text-text-primary tracking-wide">
          {isPrevData ? "EDITAR MARCA" : "NUEVA MARCA"}
        </h4>
        <div className="mt-4 max-sm:h-[60vh] overflow-y-auto overflow-x-hidden">
          <div className="form-section">
            <label htmlFor="" className="form-label">
              Código de Marca
            </label>
            <input
              type="text"
              className="form-input bg-slate-200"
              value={form.values.brandCode}
              onChange={(e) => form.setFieldValue("brandCode", e.target.value)}
            />
          </div>
          <div className="form-section">
            <label htmlFor="" className="form-label">
              Descripción
            </label>
            <input
              type="text"
              className="form-input"
              value={form.values.description}
              onChange={(e) =>
                form.setFieldValue("description", e.target.value)
              }
            />
          </div>
          {/* <div className="form-section">
            <label htmlFor="" className="form-label">
              Descripción
            </label>
            <textarea
              type="text"
              className="form-input h-24"
              value={form.values.description}
              onChange={(e) =>
                form.setFieldValue("description", e.target.value)
              }
            />
          </div> */}
          <div className="w-full flex gap-5 max-sm:gap-0 flex-wrap">
            <div className="form-section relative">
              <label htmlFor="" className="form-label">
                Leadtime
              </label>
              <input
                type="number"
                className="form-input "
                value={form.values.leadtime}
                onChange={(e) => form.setFieldValue("leadtime", e.target.value)}
              />
              <span className="absolute right-8 top-14 text-[#B3B3B3] font-roboto font-medium tracking-wide">
                meses
              </span>
            </div>
            <div className="form-section">
              <label htmlFor="" className="form-label">
                Indice de variación del leadtime
              </label>
              <input
                type="text"
                className="form-input"
                value={form.values.leadtimeVarianceIndex}
                onChange={(e) =>
                  form.setFieldValue("leadtimeVarianceIndex", e.target.value)
                }
              />
            </div>
          </div>
          <div className="form-section">
            <label htmlFor="" className="form-label">
              Nivel de servicio (Z)
            </label>
            <input
              type="text"
              className="form-input "
              value={form.values.serviceLevel}
              onChange={(e) =>
                form.setFieldValue("serviceLevel", e.target.value)
              }
            />
          </div>
        </div>
        <div className="pt-6 pb-3 flex justify-between gap-4">
          <Button
            title={
              <p className="font-roboto tracking-wide font-medium">Cancelar</p>
            }
            width={240}
            height={55}
            onClick={onClose}
          />
          <Button
            title={
              <p className="font-roboto tracking-wide font-medium">Guardar</p>
            }
            variant="dark"
            width={270}
            height={55}
            onClick={form.handleSubmit}
          />
        </div>
      </div>
    </Modal>
  );
};

export default Brands;
