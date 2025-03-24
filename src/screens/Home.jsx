import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import DtFilter from "../components/DtFilter";
import CustomDatatable from "../components/CustomDatatable";
import { Column, Table, AutoSizer } from "react-virtualized";
import "react-virtualized/styles.css";
import {
  createMrpApi,
  getCurrenciesApi,
  getMrpApi,
  getNextMrpApi,
  getProvidersApi,
  getStockSummaryApi,
  removeMrpApi,
  updateMrpApi,
} from "../api/mrp";
import { getBrandApi } from "../api/brand";
import Modal from "../components/Modal";
import { useFormik } from "formik";
import * as Yup from "yup";
import Button from "../components/Button";
import useAuth from "../hooks/useAuth";
import { getSuggestedAmount } from "../helpers/math";
import DtMenu from "../components/DtMenu";
import { FiEdit, FiEye, FiPrinter, FiTrash } from "react-icons/fi";
import { isEqual, orderBy } from "lodash";
import {
  currencyFormat,
  getCurrentDate,
  getLabelNameByDateEntity,
} from "../helpers/uiFormat";
import { BiBlock } from "react-icons/bi";
import { generateReport } from "../reports";
import SearchSelect from "../components/SearchSelect";
import { FcUp } from "react-icons/fc";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import { DNA, Oval } from "react-loader-spinner";
import { PiFileDoc } from "react-icons/pi";
import { createPurchaseOrderDraftApi } from "../api/PurchaseOderDraft";
import useDisableScroll from "../hooks/useDisableScroll";

const Home = () => {
  const { session } = useAuth();
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [brands, setBrands] = useState([]);
  const [providers, setProviders] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [formMode, setFormMode] = useState("");
  const [isFormOpened, setIsFormOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRowLoading, setIsRowLoading] = useState(false);
  const [currentCode, setCurrentCode] = useState(false);

  const retrieveMrp = (params) => {
    setIsLoading(true);
    getMrpApi(params)
      .then((res) => {
        setData(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };
  const handleDelete = (mrpId) => {
    removeMrpApi({ mrpId })
      .then((res) => {
        console.log(res);
      })
      .catch((err) => console.log(err))
      .finally(() => {
        retrieveMrp();
      });
  };

  const filterForm = useFormik({
    initialValues: {
      searchField: "",
      brandId: "",
      targetYear: "",
      targetMonth: "",
    },
    validateOnChange: false,
    onSubmit: (values) => {
      retrieveMrp(values);
    },
  });

  useEffect(() => {
    retrieveMrp();
  }, []);

  useEffect(() => {
    const loadPreviousData = async () => {
      try {
        const brandList = await getBrandApi();
        setBrands(brandList);
        const providersList = await getProvidersApi();
        setProviders(providersList);
        const currenciesList = await getCurrenciesApi();
        setCurrencies(currenciesList);
      } catch (error) {
        console.log(error);
      }
    };

    loadPreviousData();
  }, []);

  const handleOpenForm = (mode, row) => {
    setFormMode(mode || "CREATE");
    if (mode === "EDIT" || mode === "VIEW") {
      setCurrentData(row);
    }
    setIsFormOpened(true);
  };

  const handleCloseForm = () => {
    setIsFormOpened(false);
    retrieveMrp();
  };

  const createDraftOrderhandler = (row) => {
    setCurrentCode(row.Code);
    setIsRowLoading(true);
    createPurchaseOrderDraftApi({ mrpId: row.U_mrp_id }, row)
      .then((res) => {
        console.log(res);
        retrieveMrp();
        setIsRowLoading(false);
      })
      .catch((err) => {
        console.log(err);
      });
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
      selector: (i) => i.brand_description,
    },
    {
      name: "Leadtime",
      selector: (i) => `${i.U_leadtime} meses`,
    },
    {
      name: "A pedir",
      selector: (i) => i.U_suggested_amount,
    },
    {
      name: "Costo pedido",
      selector: (i) => (
        <span className="font-medium">
          {i.U_currency}
          {currencyFormat(Math.round(i.U_price_total), false)}
        </span>
      ),
    },
    // {
    //   name: "Período",
    //   selector: (i) =>
    //     `${i.U_start_month}/${i.U_start_year.slice(2)} - ${
    //       i.U_end_month
    //     }/${i.U_end_year.slice(2)}`,
    // },
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
      name: "Estatus",
      selector: (i) => {
        let color = "";
        let label = "";
        switch (i.U_status) {
          case "OPENED":
            color = "#39be39";
            label = "Abierto";
            break;
          case "CLOSED":
            color = "#c94747";
            label = "Cerrado";
            break;
          case "CANCELED":
            color = "#796e6e";
            label = "Cancelado";
            break;

          default:
            break;
        }

        return (
          <span
            className="px-1 py-0.5 text-white rounded-full absolute top-[14px] text-[10px]"
            style={{ backgroundColor: color }}
          >
            {label}
          </span>
        );
      },
    },
    {
      name: "Creado por",
      selector: (i) => i.U_created_by,
    },
    {
      name: "Modificado por",
      selector: (i) => i.U_last_modified_by,
    },
    {
      name: "Acciones",
      cell: (row) => {
        const options = [
          {
            label: "Editar",
            icon: <FiEdit color="#7c7c22" />,
            action: () => {
              handleOpenForm("EDIT", row);
            },
          },
          {
            label: "Imprimir",
            icon: <FiPrinter color="rgb(64 112 133)" />,
            action: () => {
              let date = getCurrentDate();
              generateReport({ fileName: `sugerido-${date}`, ...session }, row);
            },
          },
          {
            label: "Generar pedido SAP",
            icon: <PiFileDoc color="darkblue" />,
            action: () => createDraftOrderhandler(row),
          },
          {
            label: "Cancelar",
            icon: <BiBlock color="red" />,
            action: () => handleDelete(row.U_mrp_id),
          },
        ];

        return [
          <DtMenu options={options} status={row.U_status} />,
          <>
            {isRowLoading && currentCode == row.Code && (
              <Oval
                visible={true}
                height="15"
                width="15"
                strokeWidth={5}
                color="rgb(217, 30, 30)"
                secondaryColor="lightgray"
                ariaLabel="oval-loading"
                wrapperStyle={{}}
                wrapperClass="ml-4"
              />
            )}
          </>,
        ];
      },
    },
  ];

  const filterData = data?.filter((item) => {
    const searchText = filterForm.values.searchField.toLocaleLowerCase();
    const textMatch = item.U_description.toLocaleLowerCase();

    return textMatch.includes(searchText);
  });

  useDisableScroll(isFormOpened);

  return (
    <>
      {isFormOpened && (
        <MrpForm
          session={session}
          data={currentData}
          mode={formMode}
          onClose={handleCloseForm}
          brands={brands}
          providers={providers}
          currencies={currencies}
        />
      )}
      <Header
        title={"SUGERIDOS"}
        btnTitle={"Crear Sugerido"}
        btnOnClick={() => handleOpenForm()}
      />
      <DtFilter form={filterForm} data={{ brands, providers }} />
      <CustomDatatable
        columns={columns}
        data={filterData}
        isLoading={isLoading}
      />
    </>
  );
};

const MrpForm = ({
  session,
  data,
  onClose,
  brands,
  providers,
  currencies,
  mode,
}) => {
  let isCreate = mode == "CREATE";

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  //const [brands, setBrands] = useState([]);

  const [formCurr, setFormCurr] = useState([...currencies]);

  const getInitialValues = () => {
    // if (providers[0].Currency != "##") {
    //   // setFormCurr((prev) =>
    //   //   prev.filter((item) => item.CurrCode == providers[0]?.Currency)
    //   // );
    // }
    const targetCurrency = currencies?.find(
      (item) => item.CurrCode == providers[0]?.Currency
    )?.CurrCode;

    const fields = {
      mrpCode: "",
      description: `SUGERIDO ${getLabelNameByDateEntity(
        "months",
        currentMonth
      )} ${currentYear} `,
      brandId: brands[0]?.U_brand_id,
      providerCode: providers[0]?.CardCode,
      currency:
        providers[0]?.Currency == "##"
          ? currencies[0].CurrCode
          : targetCurrency,
      year: currentYear,
      month: currentMonth,
      brandName: "",
    };

    if (mode != "CREATE") {
      fields.mrpCode = data?.U_mrp_code;
      fields.description = data?.U_description;
      fields.brandId = data?.U_brand_id;
      fields.providerCode = data?.U_provider_code;
      fields.currency = data?.U_currency;

      //Year and Month
      const baseDate = data?.U_created_date.split(" ")[0];
      fields.year = baseDate.split("-")[0];
      fields.month = baseDate.split("-")[1];
    }

    return fields;
  };

  const [brandName, setBrandName] = useState(brands[0]?.U_description);
  const [stockSummary, setStockSummary] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState([]);
  const [months, setMonths] = useState([]);
  const [currentOrder, setCurrentOrder] = useState({});
  const [currencySymbol, setCurrencySymbol] = useState("RD$");
  const [isFormLoading, setIsFormLoading] = useState(false);

  const form = useFormik({
    initialValues: getInitialValues(),
    validationSchema: Yup.object({
      description: Yup.string().required("Este campo es requerido"),
      brandId: Yup.string().required("Este campo es requerido"),
      providerCode: Yup.string().required("Este campo es requerido"),
      currency: Yup.string().required("Este campo es requerido"),
    }),
    validateOnChange: false,
    onSubmit: (values) => {
      const getRowAmount = (item) => {
        let val = 0;
        if (item.order_amount) {
          val = parseFloat(item.order_amount);
        } else {
          let currentBrand = brands.find(
            (item) => item.U_brand_id == form.values.brandId
          );
          let { suggestedAmount } = getSuggestedAmount({
            ...item,
            brand: currentBrand,
          });
          val = suggestedAmount;
        }

        return val;
      };

      const getRowPrice = (item) => {
        let val = 0;
        if (item.price) {
          val = parseFloat(item.price);
        } else {
          val = parseFloat(item.last_purchase_price);
        }
        return val * getRowAmount(item);
      };

      const getCalculations = (item) => {
        const currentBrand = brands.find(
          (item) => item.U_brand_id == form.values.brandId
        );
        const calcs = getSuggestedAmount({
          ...item,
          brand: currentBrand,
        });

        return {
          ...calcs,
          leadtimeVariance: currentBrand.U_leadtime_variance_index,
        };
      };

      let providerName = providers.find(
        (p) => p.CardCode == values.providerCode
      )?.CardName;

      if (isCreate) {
        console.log(stockSummary);
        const mrp = {
          mrpCode: values.mrpCode,
          description: values.description,
          brandId: values.brandId,
          providerCode: values.providerCode,
          providerName,
          priceTotal: Math.round(
            stockSummary.reduce((acc, item) => acc + getRowPrice(item), 0)
          ),
          currency: values.currency,
          leadtime: 6,
          suggestedAmount: Math.round(
            stockSummary.reduce((acc, item) => acc + getRowAmount(item), 0)
          ),
          startYear: values.year - 1,
          startMonth: values.month,
          endYear: values.year,
          endMonth: values.month,
          createdDate: getCurrentDate(),
          lastModifiedDate: getCurrentDate(),
          createdBy: session?.userData?.UserName,
          lastModifiedBy: session?.userData?.UserName,
          status: "OPENED",
          printedTimes: 0,
          detail: stockSummary.map((item) => {
            let sales = {};
            let i = 0;
            for (let t of item.amounts) {
              let suffix = `${i + 1}`.padStart(2, "0");
              sales[`sales${suffix}`] = t;
              i++;
            }

            return {
              itemCode: item.item_code,
              factoryItemCode: item.factory_item_code || "",
              description: item.description?.replace(/'/g, "''"),
              alternativeReferences: "",
              model: item.model?.replace(/'/g, "''") || "",
              invStock: parseFloat(item.inv_stock),
              invTransit: parseFloat(item.inv_transit),
              frequency: "MEDIA",
              rating: "B",
              price: parseFloat(item.last_purchase_price),
              actualPrice: parseFloat(item.price || item.last_purchase_price),
              currency: values.currency,
              avgDemand: getCalculations(item).avgDemand,
              demandVariance: getCalculations(item).salesVariance,
              leadtimeVariance: getCalculations(item).leadtimeVariance,
              standardDeviation: getCalculations(item).standardDeviation,
              safetyStock: getCalculations(item).safetyStock,
              reorderPoint: getCalculations(item).reorderPoint,
              suggestedAmount: getCalculations(item).suggestedAmount,
              orderAmount: getRowAmount(item),
              lineTotal: getRowPrice(item),
              ...sales,
              isIncluded: "Y",
            };
          }),
        };

        console.log(mrp);
        //Call creation Api
        setIsFormLoading(true);

        createMrpApi(mrp)
          .then((res) => {
            console.log(res);
          })
          .catch((err) => console.log(err))
          .finally(() => {
            setIsFormLoading(false);
            onClose();
          });
      } else {
        const updateMrp = {
          description: values.description,
          priceTotal: Math.round(
            detailData.reduce((acc, item) => acc + getRowPrice(item), 0)
          ),
          suggestedAmount: Math.round(
            detailData.reduce((acc, item) => acc + getRowAmount(item), 0)
          ),
          currency: values.currency,
          lastModifiedBy: session?.userData?.UserName,
          detail: detailData.map((item) => {
            return {
              itemCode: item.item_code,
              orderAmount: parseFloat(item.order_amount),
              price: parseFloat(item.last_purchase_price),
              actualPrice: parseFloat(item.price || item.last_purchase_price),
              lineTotal: getRowPrice(item),
            };
          }),
        };

        setIsFormLoading(true);
        updateMrpApi({ mrpId: data.U_mrp_id }, updateMrp)
          .then((res) => {
            console.log(res);
          })
          .catch((err) => console.log(err))
          .finally(() => {
            setIsFormLoading(false);
            onClose();
          });
      }
    },
  });

  // const currentCurrency = providers.find(
  //   (item) =>
  //     item.CardCode === form.values?.providerCode ||
  //     form.initialValues.providerCode
  // )?.Currency;

  const handleMrpCodeChange = (brandId) => {
    getNextMrpApi({ brandId }).then((res) => {
      form.setFieldValue("mrpCode", res.next);
    });
  };

  useEffect(() => {
    if (!isCreate) {
      const newData = [];

      for (let item of data.detail) {
        let obj = {};
        Object.entries(item).forEach(([key, value]) => {
          let actualKey = key.replace("U_", "");

          obj[actualKey] = value;
        });

        newData.push(obj);
      }
      console.log(newData);

      setDetailData(newData);
    } else {
      handleMrpCodeChange(form.values.brandId);
    }
  }, []);

  // useEffect(() => {
  //   const loadPreviousData = async () => {
  //     const schema = session?.userData.companyDB;
  //     try {
  //       const brandList = await getBrandApi({
  //         schema,
  //       });

  //       setBrands(brandList);
  //     } catch (error) {
  //       console.log(error);
  //     }
  //   };

  //   loadPreviousData();
  // }, []);

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

  useEffect(() => {
    const loadPreviousData = async () => {
      const schema = session?.userData.companyDB;
      try {
        setIsLoading(true);

        const stockSummary = await getStockSummaryApi({
          year: form.values.year,
          month: form.values.month,
          brand: brandName,
        });
        setIsLoading(false);

        const arr = stockSummary.groupedData.map((item) => ({
          ...item,
          avgDemand: hadlePriceSuggestion(item).avgDemand,
          invTrans: parseFloat(item.inv_stock) + parseFloat(item.inv_transit),
          reorderPoint: hadlePriceSuggestion(item).reorderPoint,
          order_amount: hadlePriceSuggestion(item).suggestedAmount,
          price: parseFloat(item.last_purchase_price),
          suggestedAmount: hadlePriceSuggestion(item).suggestedAmount,
          lineTotal: (() => {
            let price = item.price || item.last_purchase_price;
            let amount =
              item.order_amount || hadlePriceSuggestion(item).suggestedAmount;

            return currencyFormat(
              parseFloat(price) * parseFloat(amount),
              false
            );
          })(),
        }));

        setStockSummary(arr);
        setMonths(stockSummary.months);
      } catch (error) {
        console.log(error);
      }
    };

    loadPreviousData();
  }, [brandName, form.values.year, form.values.month]);

  const handleUpdate = (id, value, type) => {
    let arr = [];
    if (isCreate) {
      arr = [...stockSummary];
    } else {
      arr = [...detailData];
    }

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

    isCreate ? setStockSummary(arr) : setDetailData(arr);

    setTimeout(() => {
      document.getElementById(type + arr[index + 1]?.item_code)?.focus();
    }, 5);
  };

  const CustomInput = ({ row, initialValue, type }) => {
    // if (type === "amount_edit") {
    //   let arr = {};
    //   Object.entries(row).forEach(([key, value]) => {
    //     let actualKey = key.replace("U_", "");

    //     arr[actualKey] = value;
    //   });

    //   row = { ...arr };
    // }

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

  const getSalesPerMonthCols = () => {
    const arr = [];

    months.forEach((month, index) => {
      let suffix = `0${index + 1}`;
      if (index + 1 > 9) {
        suffix = `${index + 1}`;
      }

      // arr.push({
      //   name: month,
      //   selector: (row) =>
      //     isCreate ? row.amounts[index] : row[`sales_${suffix}`],
      //   width: "70px",
      // });

      arr.push(
        <Column
          label={`${month}`}
          dataKey="description"
          cellRenderer={({ rowData: row }) =>
            isCreate ? row.amounts[index] : row[`sales_${suffix}`]
          }
        />
      );
    });

    return showDetail ? arr : [];
  };

  const totalCreationMrp = stockSummary.reduce((acc, item) => {
    let price = item.price || item.last_purchase_price;
    let amount =
      item.order_amount || hadlePriceSuggestion(item).suggestedAmount;

    return acc + parseFloat(price) * parseFloat(amount);
  }, 0);

  const totalEditionMrp = detailData.reduce((acc, item) => {
    let price = item.price || item.last_purchase_price;
    let amount = item.order_amount;

    return acc + parseFloat(price) * parseFloat(amount);
  }, 0);

  const sortDtData = (key) => {
    let arr = [];
    if (isCreate) {
      arr = [...stockSummary];
    } else {
      arr = [...detailData];
    }

    let order = "asc";
    if (currentOrder.field == key) {
      setCurrentOrder({
        field: key,
        order: currentOrder.order == "asc" ? "desc" : "asc",
      });
      order = currentOrder.order == "asc" ? "desc" : "asc";
    } else {
      setCurrentOrder({
        field: key,
        order: "asc",
      });
    }

    arr = orderBy(arr, key, order);

    isCreate ? setStockSummary(arr) : setDetailData(arr);
  };

  const headerRenderer = (dataKey, label) => {
    let up = "gray";
    let down = "gray";
    if (dataKey == currentOrder.field) {
      if (currentOrder.order == "asc") {
        up = "white";
        down = "gray";
      } else {
        up = "gray";
        down = "white";
      }
    }

    const iconSize = 10;
    return (
      <div key={dataKey} className="flex items-center gap-1">
        <span
          onClick={() => {
            sortDtData(dataKey);
          }}
        >
          {label}
        </span>
        <div>
          <FaAngleUp color={up} size={iconSize} />
          <FaAngleDown color={down} size={iconSize} />
        </div>
      </div>
    );
  };

  const firstDefaultCols = [
    <Column
      label="Codigo"
      dataKey="item_code"
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
      //width={100}
      // headerRenderer={({ label }) => (
      //   <span style={{ margin: 0 }}>{label}</span>
      // )}
    />,
    <Column
      label="Description"
      dataKey={isCreate ? "description" : "detail_description"}
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
      cellRenderer={({ rowData: row }) =>
        isCreate ? row.description : row.detail_description
      }
    />,
    <Column
      label="Modelo"
      dataKey="model"
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
    />,
    <Column
      label="Inventario"
      dataKey="inv_stock"
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
      cellRenderer={(row) => {
        return parseFloat(row.rowData.inv_stock);
      }}
    />,
    <Column
      label="Tránsito"
      dataKey="inv_transit"
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
      cellRenderer={(row) => {
        return parseFloat(row.rowData.inv_transit);
      }}
    />,
    isCreate && (
      <Column
        label="INV + TRAN"
        dataKey="invTrans"
        headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
        // cellRenderer={(row) => {
        //   return parseFloat(row.rowData.invTrans);
        // }}
      />
    ),
  ];
  const secondDefaultCols = [
    <Column
      label="Promedio venta"
      dataKey={isCreate ? "avgDemand" : "avg_demand"}
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
      cellRenderer={({ rowData: row, dataKey }) =>
        currencyFormat(Math.trunc(row[dataKey]), false)
      }
      // cellRenderer={({ rowData: row }) =>
      //   isCreate
      //     ? Math.round(hadlePriceSuggestion(row).avgDemand).toFixed(0)
      //     : Math.round(parseFloat(row.avg_demand)).toFixed(0)
      // }
    />,
    <Column
      label="Punto reorden"
      dataKey={isCreate ? "reorderPoint" : "reorder_point"}
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
      cellRenderer={({ rowData: row }) =>
        isCreate
          ? Math.round(hadlePriceSuggestion(row).reorderPoint)
          : parseFloat(row.reorder_point).toFixed(0)
      }
    />,
    <Column
      label="Sugerido"
      dataKey={isCreate ? "suggestedAmount" : "detail_suggested_amount"}
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
      cellRenderer={({ rowData: row }) =>
        isCreate
          ? Math.round(hadlePriceSuggestion(row).suggestedAmount)
          : Math.round(Number(row.detail_suggested_amount))
      }
    />,
    <Column
      label="A pedir"
      dataKey={"order_amount"}
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
      width={130}
      columnData={"order"}
      cellRenderer={({ rowData: row }) => {
        return (
          <div data-id="order">
            <CustomInput
              row={row}
              type={"amount"}
              initialValue={
                row?.order_amount || hadlePriceSuggestion(row).suggestedAmount
              }
            />
          </div>
        );
      }}
    />,
    <Column
      label="Ult. Precio compra"
      dataKey="last_purchase_price"
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
      cellRenderer={({ rowData: row }) =>
        parseFloat(row.last_purchase_price).toFixed(2)
      }
    />,
    <Column
      label="Precio"
      dataKey="price"
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
      width={130}
      cellRenderer={({ rowData: row }) => (
        <CustomInput
          row={row}
          type={"price"}
          initialValue={
            parseFloat(row.price) > 0
              ? parseFloat(row.price)
              : parseFloat(row.last_purchase_price)
          }
        />
      )}
    />,
    <Column
      label="Total"
      dataKey="lineTotal"
      headerRenderer={({ dataKey, label }) => headerRenderer(dataKey, label)}
      cellRenderer={({ rowData: row, dataKey }) => {
        let price = row.price || row.last_purchase_price;
        let amount =
          row.order_amount || hadlePriceSuggestion(row).suggestedAmount;

        return currencyFormat(parseFloat(price) * parseFloat(amount), false);

        // if (row.price || row.order_amount) {
        //   return parseFloat(row.price) * parseFloat(row.order_amount);
        // } else {
        //   return (
        //     parseFloat(row.last_purchase_price) *
        //     hadlePriceSuggestion(row).suggestedAmount
        //   );
        // }
      }}
      //   if (row.price && row.order_amount) {
      //     return parseFloat(row.price) * parseFloat(row.order_amount);
      //   } else {
      //     return (
      //       parseFloat(row.last_purchase_price) *
      //       hadlePriceSuggestion(row).suggestedAmount
      //     ).toFixed(2);
      //   }
      // }}
    />,
    // {
    //   name: "Demanda",
    //   selector: (row) =>
    //     isCreate
    //       ? Math.round(hadlePriceSuggestion(row).avgDemand).toFixed(0)
    //       : Math.round(row.avg_demand).toFixed(0),
    //   width: "100px",
    // },
    // {
    //   name: "Punto reorden",
    //   selector: (row) =>
    //     isCreate
    //       ? Math.round(hadlePriceSuggestion(row).reorderPoint)
    //       : Number(row.reorder_point).toFixed(0),
    //   width: "100px",
    // },
    // {
    //   name: "Sugerido",
    //   selector: (row) =>
    //     isCreate
    //       ? hadlePriceSuggestion(row).suggestedAmount
    //       : Number(row.detail_suggested_amount), //Is gone be a function with the calcs,
    //   width: "100px",
    // },
    // // {
    // //   name: "A pedir",
    // //   selector: (row) => isCreate ?
    // //     row.order_amount || hadlePriceSuggestion(row).suggestedAmount,
    // // },

    // {
    //   name: "A pedir",
    //   selector: (row) => {

    //     return (
    //       <CustomInput
    //         row={row}
    //         type={"amount"}
    //         initialValue={
    //           row.order_amount || hadlePriceSuggestion(row).suggestedAmount
    //         }
    //       />
    //     );
    //   },
    //   width: "160px",
    // },
    // {
    //   name: "Ult. Precio compra",
    //   selector: (row) => parseFloat(row.last_purchase_price).toFixed(2),

    //   width: "100px",
    // },
    // {
    //   name: "Precio",
    //   selector: (row) => (
    //     <CustomInput
    //       row={row}
    //       type={"price"}
    //       initialValue={
    //         row.price || parseFloat(row.last_purchase_price).toFixed(2)
    //       }
    //     />
    //   ),
    //   width: "160px",
    // },
    // {
    //   name: "Total linea",
    //   selector: (row) => {
    //     if (row.price && row.order_amount) {
    //       return parseFloat(row.price) * parseFloat(row.order_amount);
    //     } else {
    //       return (
    //         parseFloat(row.last_purchase_price) *
    //         hadlePriceSuggestion(row).suggestedAmount
    //       ).toFixed(2);
    //     }
    //   },
    //   width: "100px",
    // },
  ];
  // const [columns, setColumns] = React.useState([
  //   ...firstDefaultCols,
  //   ...secondDefaultCols,
  // ]);

  const columns = [
    ...firstDefaultCols,
    ...getSalesPerMonthCols(),
    ...secondDefaultCols,
    // <Column label="Description" dataKey="description" />,
    // <Column label="Description" dataKey="description" />,
    // <Column label="Description" dataKey="description" />,
    // <Column
    //   // width={200}
    //   label="Description"
    //   dataKey=""
    //   cellRenderer={(row) => {
    //     return (
    //       <p>
    //         {isCreate
    //           ? hadlePriceSuggestion(row.rowData).suggestedAmount
    //           : Number(row.detail_suggested_amount)}
    //       </p>
    //     );
    //   }}
    // />,
  ];

  function toggleDetails() {
    setShowDetail((prev) => !prev);
    // if (showDetail == false) {
    //   setIsLoading(true);
    //   setColumns([
    //     ...firstDefaultCols,
    //     ...getSalesPerMonthCols(),
    //     // ...secondDefaultCols,
    //   ]);
    //   setIsLoading(false);
    // } else {
    //   setColumns([
    //     ...firstDefaultCols,
    //     // ...secondDefaultCols
    //   ]);
    // }
  }

  return (
    <Modal>
      <div>
        <h4 className="text-base font-semibold text-text-primary tracking-wide">
          {isCreate ? "NUEVO SUGERIDO" : "EDITAR SUGERIDO"}
        </h4>
        <div className="mt-4 max-sm:h-[50vh] h-[70vh] overflow-y-auto overflow-x-hidden">
          <div className="form-section">
            <label htmlFor="" className="form-label">
              Marca
            </label>
            <select
              className={`form-input ${isCreate ? "" : "input-disabled"}`}
              value={form.values.brandId}
              disabled={isCreate ? "" : true}
              onChange={(e) => {
                form.setFieldValue("brandId", e.target.value);
                let currentBrand = brands.find(
                  (item) => item.U_brand_id == e.target.value
                );
                setBrandName(currentBrand.U_description);
                handleMrpCodeChange(e.target.value);
              }}
            >
              {/* <option value="">Todas las marcas</option> */}
              {brands?.map((item) => (
                <option key={item.U_brand_id} value={item.U_brand_id}>
                  {item.U_brand_code} - {item.U_description}
                </option>
              ))}
            </select>
          </div>
          <div className="form-section">
            <label htmlFor="" className="form-label">
              Proveedor
            </label>
            <SearchSelect
              options={providers}
              fields={{ key: "CardCode", value: "CardName", keyOnLabel: true }}
              variant="INPUT"
              defaultValue={form.initialValues?.providerCode || ""}
              onChange={(item) => {
                if (item?.CardCode) {
                  form.setFieldValue("providerCode", item?.CardCode);
                }
                const targetCurr = providers.find(
                  (p) => p.CardCode == item?.CardCode
                )?.Currency;

                if (targetCurr && targetCurr != "##") {
                  setFormCurr(
                    currencies.filter((item) => item.CurrCode == targetCurr)
                  );
                  setCurrencySymbol(
                    currencies.find((item) => item.CurrCode == targetCurr)
                      .DocCurrCod
                  );
                } else {
                  setFormCurr([...currencies]);
                }
              }}
            />
          </div>

          <div className="w-full flex gap-5 max-sm:gap-0 flex-wrap">
            <div className="form-section relative">
              <label htmlFor="" className="form-label">
                Código
              </label>
              <input
                type="text"
                className="form-input input-disabled"
                value={form.values.mrpCode}
                disabled
                onChange={(e) => {}}
              />
              {/* <span className="absolute right-8 top-14 text-[#B3B3B3] font-roboto font-medium tracking-wide">
                meses
              </span> */}
            </div>
            <div className="form-section">
              <label htmlFor="" className="form-label">
                Descripción
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="form-input"
                  value={form.values.description}
                  onChange={(e) =>
                    form.setFieldValue(
                      "description",
                      e.target.value.toUpperCase()
                    )
                  }
                />
                <span className="absolute right-4 -top-8 input-error opacity-80">
                  {form.errors.description}
                </span>
              </div>
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
                onChange={(e) => {
                  let currentCurrency = currencies.find(
                    (item) => item.CurrCode == e.target.value
                  );
                  setCurrencySymbol(currentCurrency.DocCurrCod);
                  form.setFieldValue("currency", e.target.value);
                }}
                name=""
                id=""
              >
                {formCurr.map(({ CurrCode, CurrName, DocCurrCod }, index) => {
                  return (
                    <option key={CurrCode} value={CurrCode}>
                      {DocCurrCod} - {CurrName}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="form-section flex gap-2">
              <div className="flex-1">
                <label htmlFor="" className="form-label">
                  Año
                </label>

                <select
                  className={`form-input ${isCreate ? "" : "input-disabled"}`}
                  value={form.values.year}
                  disabled={isCreate ? "" : true}
                  onChange={(e) => form.setFieldValue("year", e.target.value)}
                  name=""
                  id=""
                >
                  {Array(10)
                    .fill(0)
                    .map((i, index) => {
                      let val = currentYear - index;
                      return (
                        <option key={index} value={val}>
                          {val}
                        </option>
                      );
                    })}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="" className="form-label">
                  Mes
                </label>
                <select
                  className={`form-input ${isCreate ? "" : "input-disabled"}`}
                  disabled={isCreate ? "" : true}
                  value={form.values.month}
                  onChange={(e) => form.setFieldValue("month", e.target.value)}
                  name=""
                  id=""
                >
                  {Array(12)
                    .fill(0)
                    .map((i, index) => {
                      let val = index + 1;
                      return (
                        <option key={index} value={val}>
                          {val}
                        </option>
                      );
                    })}
                </select>
              </div>
            </div>
          </div>
          <div className="form-section">
            <button
              className="text-blue-400"
              onClick={() => {
                toggleDetails();
              }}
            >
              {showDetail ? "Ocultar" : "Mostrar"} detalle
            </button>
          </div>
          <div className="form-section">
            {/* <label htmlFor="" className="form-label">
              Nivel de servicio (Z)
            </label>
            <input type="text" className="form-input " /> */}
            <label htmlFor="" className="form-label">
              Ventas (últimos 12 meses)
            </label>
            {/* <CustomDatatable
              columns={columns}
              // data={stockSummary}
              data={mode != "CREATE" ? detailData : stockSummary}
              shadow={false}
              isLoading={isLoading}
            /> */}

            {isLoading && (
              <div className="w-full h-96 flex justify-center items-center">
                <DNA wrapperStyle={{ opacity: 0.6 }} height="80" width="80" />
              </div>
            )}
            {!isLoading &&
            (stockSummary.length > 0 || detailData.length > 0) ? (
              <Table
                width={800}
                height={400}
                // headerHeight={60}
                rowHeight={45}
                rowCount={
                  mode != "CREATE" ? detailData.length : stockSummary.length
                }
                rowGetter={({ index }) =>
                  mode != "CREATE" ? detailData[index] : stockSummary[index]
                }
                headerClassName="bg-black text-white"
              >
                {/* isCreate
          ? hadlePriceSuggestion(row).suggestedAmount
          : Number(row.detail_suggested_amount) */}
                {columns.map((c) => c)}
              </Table>
            ) : undefined}

            {!isLoading &&
              stockSummary.length == 0 &&
              detailData.length == 0 && (
                <div className="w-full h-96 flex justify-center items-center">
                  <p>No se encontraron resultados</p>
                </div>
              )}
          </div>
          <div className="form-section flex justify-end mt-4">
            <ul className="flex gap-2">
              <li className="bg-slate-300 p-2 rounded-full">
                <span>A pedir </span>
                <b className="dark-gray text-sm">
                  {isCreate
                    ? currencyFormat(
                        stockSummary.reduce(
                          (acc, item) => acc + parseInt(item.order_amount),
                          0
                        ),
                        false,
                        0
                      )
                    : detailData.reduce(
                        (acc, item) => acc + parseInt(item.order_amount),
                        0
                      )}
                </b>
                <span> artículos</span>
              </li>
              <li className="bg-slate-300 p-2 rounded-full">
                <span>Total pedido</span>
                <b className="dark-gray text-sm">
                  {" "}
                  {currencySymbol}
                  {isCreate
                    ? currencyFormat(totalCreationMrp, false)
                    : currencyFormat(totalEditionMrp, false)}
                </b>
              </li>
            </ul>
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
          <div className="flex items-center gap-8">
            <Button
              title={
                <p className="font-roboto tracking-wide font-medium flex items-center relative">
                  {isCreate ? "Guardar" : "Actualizar"}{" "}
                  {isFormLoading && (
                    <Oval
                      wrapperClass="opacity-80 absolute -right-[80px]"
                      color="white"
                      width={20}
                      height={20}
                      strokeWidth={4}
                      secondaryColor="lightgray"
                    />
                  )}
                </p>
              }
              variant="dark"
              width={270}
              height={55}
              onClick={() => form.handleSubmit()}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Home;
