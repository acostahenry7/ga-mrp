import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import DtFilter from "../components/DtFilter";
import CustomDatatable from "../components/CustomDatatable";
import { getMrpApi, getStockSummaryApi } from "../api/mrp";
import { getBrandApi } from "../api/brand";
import Modal from "../components/Modal";
import { useFormik } from "formik";
import Button from "../components/Button";
import useAuth from "../hooks/useAuth";
import { BiSave } from "react-icons/bi";
import { getSuggestedAmount } from "../helpers/math";

const Home = () => {
  const { session } = useAuth();
  const [data, setData] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isFormOpened, setIsFormOpened] = useState(false);

  useEffect(() => {
    const getData = () => {
      getMrpApi().then((res) => {
        setData(res);
      });
    };

    getData();
  }, []);

  useEffect(() => {
    const loadPreviousData = async () => {
      const schema = session?.userData.companyDB;
      try {
        const brandList = await getBrandApi({
          schema,
        });
        console.log(brandList);

        setBrands(brandList);
      } catch (error) {
        console.log(error);
      }
    };

    loadPreviousData();
  }, []);

  const handleOpenForm = () => {
    if (brands.length > 0) {
      setIsFormOpened(true);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpened(false);
  };

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
      {isFormOpened && (
        <MrpForm
          session={session}
          data={{}}
          onClose={handleCloseForm}
          brands={brands}
        />
      )}
      <Header
        title={"SUGERIDOS"}
        btnTitle={"Crear Sugerido"}
        btnOnClick={() => handleOpenForm()}
      />
      <DtFilter />
      <CustomDatatable columns={columns} data={data} />
    </>
  );
};

const MrpForm = ({ session, data, onClose, brands }) => {
  let isPrevData = Object.entries(data).length > 0;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  //const [brands, setBrands] = useState([]);
  const [brandName, setBrandName] = useState(brands[0].U_description);
  const [stockSummary, setStockSummary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [months, setMonths] = useState([]);
  const form = useFormik({
    initialValues: {
      mrpCode: "",
      description: "",
      brandId: brands[0].U_brand_id,
      currency: "DOP",
      year: currentYear,
      month: currentMonth,
      brandName: "",
    },
  });

  // useEffect(() => {
  //   const loadPreviousData = async () => {
  //     const schema = session?.userData.companyDB;
  //     try {
  //       const brandList = await getBrandApi({
  //         schema,
  //       });
  //       console.log(brandList);

  //       setBrands(brandList);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   loadPreviousData();
  // }, []);

  const currencies = [
    {
      label: "Dólar Estadounidense",
      value: "USD",
    },
    {
      label: "Peso Dominicano",
      value: "DOP",
    },
  ];

  useEffect(() => {
    const loadPreviousData = async () => {
      const schema = session?.userData.companyDB;
      try {
        setIsLoading(true);

        const stockSummary = await getStockSummaryApi({
          schema,
          year: form.values.year,
          month: form.values.month,
          brand: brandName,
        });
        setIsLoading(false);
        console.log(stockSummary.groupedData[0]);

        setStockSummary(stockSummary.groupedData);
        setMonths(stockSummary.months);
      } catch (error) {
        console.log(error);
      }
    };

    loadPreviousData();
  }, [brandName, form.values.year, form.values.month]);

  const handleUpdate = (id, value, type) => {
    const arr = [...stockSummary];

    const index = arr.findIndex((item) => item.item_code == id);

    switch (type) {
      case "amount":
        arr[index].order_amount = value;
        break;
      case "price":
        arr[index].price = value;
        break;

      default:
        break;
    }

    setStockSummary(arr);

    setTimeout(() => {
      document.getElementById(type + arr[index + 1].item_code)?.focus();
    }, 5);
  };

  const CustomInput = ({ row, initialValue, type }) => {
    const [fieldValue, setFieldValue] = useState(initialValue);

    useEffect(() => {
      const handleChange = () => {
        setFieldValue(initialValue);
      };

      handleChange();
    }, [initialValue]);

    return (
      <div className="flex items-center">
        <input
          id={`${type}${row.item_code}`}
          type="number"
          className="form-input bg-slate-50 h-8 w-26 mr-3 mt-0 rounded-md outline-none"
          value={fieldValue}
          onChange={(e) => setFieldValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              switch (type) {
                case "amount":
                  handleUpdate(row.item_code, fieldValue || 0, "amount");
                  break;
                case "price":
                  handleUpdate(row.item_code, fieldValue || 0, "price");
                  break;

                default:
                  break;
              }
            }
          }}
          onFocus={(e) => e.target.select()}
          lang="en-US"
        />

        {/* <div className="bg-green-600 h-max rounded-md p-1 hover:bg-green-700 cursor-pointer transition-colors duration-300">
          <BiSave
            color="white"
            size={23}
            onClick={() => handleUpdate(row.item_code, fieldValue || 0)}
          />
        </div> */}
      </div>
    );
  };

  const hadlePriceSuggestion = (row) => {
    let currentBrand = brands.find(
      (item) => item.U_brand_id == form.values.brandId
    );

    const { suggestedAmount, reorderPoint, avgDemand } = getSuggestedAmount({
      ...row,
      brand: currentBrand,
    });

    return { suggestedAmount, reorderPoint, avgDemand };
  };

  const getSalesPerMonthCols = () => {
    const arr = [];

    months.forEach((month, index) => {
      arr.push({
        name: month,
        selector: (row) => row.amounts[index],
        width: "70px",
      });
    });

    return arr;
  };

  const columns = [
    {
      name: "No. artículo",
      selector: (row) => row.item_code,
      width: "200px",
    },
    {
      name: "Descripción",
      selector: (row) => row.description,
      width: "200px",
    },
    {
      name: "Modelo",
      selector: (row) => row.model,
      width: "110px",
    },
    {
      name: "INV + TRAN",
      selector: (row) =>
        parseFloat(row.inv_stock) + parseFloat(row.inv_transit),
      width: "110px",
    },
    ...getSalesPerMonthCols(),
    {
      name: "Demanda",
      selector: (row) =>
        Math.round(hadlePriceSuggestion(row).avgDemand).toFixed(0),
      width: "100px",
    },
    {
      name: "Punto reorden",
      selector: (row) => Math.round(hadlePriceSuggestion(row).reorderPoint),
      width: "100px",
    },
    {
      name: "Sugerido",
      selector: (row) => hadlePriceSuggestion(row).suggestedAmount, //Is gone be a function with the calcs,
    },
    // {
    //   name: "A pedir",
    //   selector: (row) =>
    //     row.order_amount || hadlePriceSuggestion(row).suggestedAmount,
    // },

    {
      name: "A pedir",
      selector: (row) => {
        //console.log(hadlePriceSuggestion(row).suggestedAmount);

        return (
          <CustomInput
            row={row}
            type={"amount"}
            initialValue={
              row.order_amount || hadlePriceSuggestion(row).suggestedAmount
            }
          />
        );
      },
      width: "160px",
    },
    {
      name: "Ult. Precio compra",
      selector: (row) => parseFloat(row.last_purchase_price).toFixed(2),
      width: "100px",
    },
    {
      name: "Precio",
      selector: (row) => (
        <CustomInput
          row={row}
          type={"price"}
          initialValue={
            row.price || parseFloat(row.last_purchase_price).toFixed(2)
          }
        />
      ),
      width: "160px",
    },
    {
      name: "Total linea",
      selector: (row) => {
        if (row.price && row.order_amount) {
          return parseFloat(row.price) * parseFloat(row.order_amount);
        } else {
          return (
            parseFloat(row.last_purchase_price) *
            hadlePriceSuggestion(row).suggestedAmount
          ).toFixed(2);
        }
      },
      width: "100px",
    },
  ];

  return (
    <Modal>
      <div>
        <h4 className="text-base font-semibold text-text-primary tracking-wide">
          {isPrevData ? "EDITAR SUGERIDO" : "NUEVO SUGERIDO"}
        </h4>
        <div className="mt-4 max-sm:h-[50vh] h-[70vh] overflow-y-auto overflow-x-hidden">
          <div className="form-section">
            <label htmlFor="" className="form-label">
              Marca
            </label>
            <select
              className="form-input"
              value={form.values.brandId}
              onChange={(e) => {
                form.setFieldValue("brandId", e.target.value);
                let currentBrand = brands.find(
                  (item) => item.U_brand_id == e.target.value
                );
                setBrandName(currentBrand.U_description);
              }}
            >
              {/* <option value="">Todas las marcas</option> */}
              {brands?.map((item) => (
                <option key={item.U_brand_id} value={item.U_brand_id}>
                  {item.U_description}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full flex gap-5 max-sm:gap-0 flex-wrap">
            <div className="form-section relative">
              <label htmlFor="" className="form-label">
                Código
              </label>
              <input type="text" className="form-input " />
              {/* <span className="absolute right-8 top-14 text-[#B3B3B3] font-roboto font-medium tracking-wide">
                meses
              </span> */}
            </div>
            <div className="form-section">
              <label htmlFor="" className="form-label">
                Descripción
              </label>
              <input type="text" className="form-input" />
            </div>
          </div>
          <div className="w-full flex gap-5 max-sm:gap-0 flex-wrap">
            <div className="form-section relative">
              <label htmlFor="" className="form-label">
                Currency
              </label>
              <select
                className="form-input"
                value={form.values.currency}
                onChange={(e) => form.setFieldValue("currency", e.target.value)}
                name=""
                id=""
              >
                {currencies.map(({ label, value }) => {
                  return <option value={value}>{label}</option>;
                })}
              </select>
            </div>
            <div className="form-section flex gap-2">
              <div className="flex-1">
                <label htmlFor="" className="form-label">
                  Año
                </label>

                <select
                  className="form-input"
                  value={form.values.year}
                  onChange={(e) => form.setFieldValue("year", e.target.value)}
                  name=""
                  id=""
                >
                  {Array(10)
                    .fill(0)
                    .map((i, index) => {
                      let val = currentYear - index;
                      return <option value={val}>{val}</option>;
                    })}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="" className="form-label">
                  Mes
                </label>
                <select
                  className="form-input"
                  value={form.values.month}
                  onChange={(e) => form.setFieldValue("month", e.target.value)}
                  name=""
                  id=""
                >
                  {Array(12)
                    .fill(0)
                    .map((i, index) => {
                      let val = currentMonth + index;
                      return <option value={val}>{val}</option>;
                    })}
                </select>
              </div>
            </div>
          </div>
          <div className="form-section">
            {/* <label htmlFor="" className="form-label">
              Nivel de servicio (Z)
            </label>
            <input type="text" className="form-input " /> */}
            <label htmlFor="" className="form-label">
              Ventas (últimos 12 meses)
            </label>
            <CustomDatatable
              columns={columns}
              data={stockSummary}
              shadow={false}
              isLoading={isLoading}
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
            onClick={() => console.log(stockSummary)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default Home;
