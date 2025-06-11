import React, { useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import DtFilter from "../components/DtFilter";
import CustomDatatable from "../components/CustomDatatable";
import { Column, Table, AutoSizer } from "react-virtualized";
import "react-virtualized/styles.css";
import {
  createMrpApi,
  getCurrenciesApi,
  getModelsApi,
  getMrpApi,
  getNextMrpApi,
  getProvidersApi,
  getStockSummaryApi,
  removeMrpApi,
  updateMrpApi,
  uploadPriceFileApi,
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
import { BiBlock, BiFile, BiSync } from "react-icons/bi";
import { generateReport } from "../reports";
import SearchSelect from "../components/SearchSelect";
import { FcUp } from "react-icons/fc";
import { FaAngleDown, FaAngleUp, FaFileExport } from "react-icons/fa";
import { DNA, Oval } from "react-loader-spinner";
import { PiFileDoc } from "react-icons/pi";
import { createPurchaseOrderDraftApi } from "../api/PurchaseOderDraft";
import useDisableScroll from "../hooks/useDisableScroll";
import { dt } from "../helpers/ui";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { BsArrowRight } from "react-icons/bs";
import ConfirmationModal from "../components/ConfirmationModal";

const Home = () => {
  const { session, signout } = useAuth();
  const [data, setData] = useState([]);
  const [currentData, setCurrentData] = useState({});
  const [models, setModels] = useState([]);
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
        const modelList = await getModelsApi();
        setModels(modelList);
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
      })
      .catch((err) => {
        if (err.message.toLowerCase().includes("session")) {
          signout();
        } else {
          console.log(err);
        }
      })
      .finally(() => {
        setIsRowLoading(false);
      });
  };

  const exportToExcel = (data, fileName = "export") => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const dataBlob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(dataBlob, `${fileName}.xlsx`);
  };

  // XLSX.utils.sheet_to_json()

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
      selector: (i) => currencyFormat(i.U_suggested_amount, false, 0),
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
    // {
    //   name: "Creado por",
    //   selector: (i) => i.U_created_by,
    // },
    // {
    //   name: "Modificado por",
    //   selector: (i) => i.U_last_modified_by,
    // },
    {
      name: "Acciones",
      cell: (row) => {
        const options = [
          {
            id: 1,
            label: "Editar",
            icon: <FiEdit color="#7c7c22" />,
            action: () => {
              handleOpenForm("EDIT", row);
            },
          },
          {
            id: 2,
            label: "Exportar a excel",
            icon: <FaFileExport color="#13b351" />,
            action: () => {
              console.log(row);

              const getDetail = (item) => {
                let targetFields = {};

                let monthNum = parseInt(row.U_start_month);
                for (let i = 0; i < 12; i++) {
                  let month = `${i + 1}`.padStart(2, "0");

                  (targetFields[getLabelNameByDateEntity("months", monthNum)] =
                    item[`U_sales_${month}`]),
                    monthNum++;
                  if (monthNum > 12) {
                    monthNum = 1;
                  }
                }

                return targetFields;
              };

              let dataSet1 = row.detail
                ?.filter((item) => item.U_order_amount > 0)
                .map((item) => ({
                  "No. artículo": item.U_item_code,
                  "Codigo Fabrica": item.U_factory_item_code,
                  Descripción: item.U_detail_description,
                  "Descrición Extrajera": item.U_factory_detail_description,
                  Modelo: item.U_model,
                  Inventario: item.U_inv_stock,
                  Tránsito: item.U_inv_transit,
                  "Inv + Trans": item.sum_inv_trans,
                  ...getDetail(item),
                  "Promedio de ventas": parseFloat(item.U_avg_demand),
                  "Punto de reorden": parseFloat(item.U_reorder_point),
                  "Cantidad sugerida": item.U_detail_suggested_amount,
                  "Cantidad a pedir": item.U_order_amount,
                  "Ult. Precio compra": parseFloat(item.last_purchase_price),
                  Precio: parseFloat(item.price),
                  Total: parseFloat(item.U_line_total),
                }));

              exportToExcel(dataSet1, `Sugerido-${row.Name}`);
            },
          },
          {
            id: 3,
            label: "Imprimir",
            icon: <FiPrinter color="rgb(64 112 133)" />,
            action: () => {
              let date = getCurrentDate();
              generateReport({ fileName: `sugerido-${date}`, ...session }, row);
            },
          },
          {
            id: 4,
            label: "Generar pedido SAP",
            icon: <PiFileDoc color="darkblue" />,
            action: () => createDraftOrderhandler(row),
          },
          {
            id: 5,
            label: "Cancelar",
            icon: <BiBlock color="red" />,
            action: () => handleDelete(row.U_mrp_id),
          },
        ];

        return (
          <>
            <DtMenu options={options} status={row.U_status} />
            {isRowLoading && currentCode == row.Code && (
              <Oval
                key={1}
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
          </>
        );
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
          models={models}
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
  //models,
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
      models: "",
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
      fields.models = data?.models;
      fields.providerCode = data?.U_provider_code;
      fields.currency = data?.U_currency;

      //Year and Month
      const baseDate = data?.U_created_date.split(" ")[0];
      fields.year = baseDate.split("-")[0];
      fields.month = baseDate.split("-")[1];
    }

    return fields;
  };

  const [brandName, setBrandName] = useState(brands[0]?.U_brand_code);
  const [modelList, setModelList] = useState([]);
  const [models, setModels] = useState([]);
  const [stockSummary, setStockSummary] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showDetail, setShowDetail] = useState(false);
  const [amountOfMonths, setAmountOfMonths] = useState(6);
  const [detailData, setDetailData] = useState([]);
  const [toUpdate, setToUpdate] = useState([]);
  const [months, setMonths] = useState([]);
  const [currentOrder, setCurrentOrder] = useState({});
  const [currencySymbol, setCurrencySymbol] = useState(data?.U_currency);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [keepUpdateOpened, setKeepUpdateOpened] = useState(true);
  const [fetchNewRefs, setFetchNewRefs] = useState(false);
  const [detailSearch, setDetailSearch] = useState("");
  const [priceFile, setPriceFile] = useState(undefined);
  const [isConfirmationOpened, setIsConfirmationOpened] = useState(false);
  const [refsToZero, setRefsToZero] = useState(false);

  const hadlePriceSuggestion = (row) => {
    let currentBrand = brands.find(
      (item) => item.U_brand_id == form.values.brandId
    );

    const {
      stock,
      avgDemand,
      salesVariance,
      standardDeviation,
      safetyStock,
      reorderPoint,
      suggestedAmount,
    } = getSuggestedAmount({
      ...row,
      brand: currentBrand,
    });

    return {
      stock,
      avgDemand,
      salesVariance,
      standardDeviation,
      safetyStock,
      reorderPoint,
      suggestedAmount,
    };
  };

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
          models: values.models || "all",
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
              factoryDetailDescription: item.factory_description?.replace(
                /'/g,
                "''"
              ),
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
          providerCode: values.providerCode,
          resetRefs: refsToZero,
          detail: toUpdate
            .filter((item) => !item.isNewItem)
            .map((item) => {
              return {
                itemCode: item.item_code,
                orderAmount: parseFloat(item.order_amount),
                price: parseFloat(item.last_purchase_price),
                actualPrice: parseFloat(item.price || item.last_purchase_price),
                lineTotal: getRowPrice(item),
              };
            }),
          newItems: [...detailData]
            .filter((item) => item.isNewItem)
            .map((item) => {
              // let sales = {};
              // let i = 0;
              // for (let t of item.amounts) {
              //   let suffix = `${i + 1}`.padStart(2, "0");
              //   sales[`sales${suffix}`] = t;
              //   i++;
              // }

              return {
                itemCode: item.item_code,
                factoryItemCode: item.factory_item_code || "",
                description: item.detail_description?.replace(/'/g, "''"),
                factoryDetailDescription:
                  item.U_factory_detail_description?.replace(/'/g, "''"),
                alternativeReferences: item.alternative_references || "",
                model: item.model?.replace(/'/g, "''") || "",
                invStock: parseFloat(item.inv_stock),
                invTransit: parseFloat(item.inv_transit),
                frequency: "MEDIA",
                rating: "B",
                price: parseFloat(item.last_purchase_price),
                actualPrice: parseFloat(item.price || item.last_purchase_price),
                currency: item.currency,
                avgDemand: item.avg_demand,
                demandVariance: getCalculations(item).salesVariance || 0,
                leadtimeVariance: getCalculations(item).leadtimeVariance || 0,
                standardDeviation: getCalculations(item).standardDeviation || 0,
                safetyStock: getCalculations(item).safetyStock || 0,
                reorderPoint: item.reorder_point,
                suggestedAmount: item.detail_suggested_amount,
                orderAmount: item.order_amount,
                lineTotal: item.line_total,
                sales_01: item.sales_01,
                sales_02: item.sales_02,
                sales_03: item.sales_03,
                sales_04: item.sales_04,
                sales_05: item.sales_05,
                sales_06: item.sales_06,
                sales_07: item.sales_07,
                sales_08: item.sales_08,
                sales_09: item.sales_09,
                sales_10: item.sales_10,
                sales_11: item.sales_11,
                sales_12: item.sales_12,
                isIncluded: item.is_included,
              };
            }),
        };

        console.log("UPDATING...", updateMrp);

        setIsFormLoading(true);
        updateMrpApi({ mrpId: data.U_mrp_id }, updateMrp)
          .then((res) => {
            console.log(res);
          })
          .catch((err) => console.log(err))
          .finally(() => {
            setIsFormLoading(false);
            if (keepUpdateOpened == false) {
              onClose();
            }
            setRefsToZero(false);
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
    const loadFieldOptions = async () => {
      const modelList = await getModelsApi();
      setModels(modelList);
    };
    loadFieldOptions();
  }, []);

  useEffect(() => {
    if (mode == "EDIT") {
      const newData = [];

      for (let item of data.detail) {
        let obj = {};
        Object.entries(item).forEach(([key, value]) => {
          let actualKey = key.replace("U_", "");

          obj[actualKey] = value;
        });

        newData.push(obj);
      }

      setDetailData(newData);
      setIsLoading(false);
    } else {
      handleMrpCodeChange(form.values.brandId);
    }
  }, []);

  const filterData = () => {
    let arr = [];
    if (mode == "CREATE") {
      arr = [...stockSummary];
    } else {
      arr = [...detailData];
    }

    return arr.filter((item) => {
      let description = item.description || item.detail_description;
      let match = item?.item_code + description + item?.model;

      let searchedText = detailSearch.split(",");
      return searchedText.some((keyword) => match.includes(keyword));
      //return match.includes(detailSearch);
    });
  };

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
  //console.log(data);

  const loadPreviousData = async () => {
    //console.log(data);

    try {
      setIsLoading(true);

      const sm = await getStockSummaryApi({
        year: form.values.year,
        month: form.values.month,
        brand: isCreate ? brandName : data.U_brand_code,
        models: isCreate ? form.values.models || "" : data.U_models || "",
      });
      setIsLoading(false);

      const arr = sm.groupedData.map((item) => ({
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

          return currencyFormat(parseFloat(price) * parseFloat(amount), false);
        })(),
      }));

      if (isCreate) {
        setStockSummary(arr);
      } else {
        console.log(arr);

        let newArr = [];
        for (let item of sm.groupedData) {
          newArr.push({
            item_code: item.item_code,
            factory_item_code: item.factory_item_code || "",
            detail_description: item.description,
            alternative_references: "",
            model: item.model,
            inv_stock: item.inv_stock,
            inv_transit: item.inv_transit,
            sum_inv_trans:
              parseFloat(item.inv_stock) + parseFloat(item.inv_transit),
            frequency: "MEDIA",
            avg_demand: hadlePriceSuggestion(item).avgDemand,
            reorder_point: hadlePriceSuggestion(item).reorderPoint,
            rating: "B",
            last_purchase_price: parseFloat(item.last_purchase_price),
            price: parseFloat(item.actual_price),
            currency: item.currency,
            detail_suggested_amount: hadlePriceSuggestion(item).suggestedAmount,
            order_amount: parseInt(item.order_amount), //hadlePriceSuggestion(item).suggestedAmount,
            line_total: (() => {
              let price = item.price || item.last_purchase_price;
              let amount =
                item.order_amount || hadlePriceSuggestion(item).suggestedAmount;

              return currencyFormat(
                parseFloat(price) * parseFloat(amount),
                false
              );
            })(),
            sales_01: item.amounts[0],
            sales_02: item.amounts[1],
            sales_03: item.amounts[2],
            sales_04: item.amounts[3],
            sales_05: item.amounts[4],
            sales_06: item.amounts[5],
            sales_07: item.amounts[6],
            sales_08: item.amounts[7],
            sales_09: item.amounts[8],
            sales_10: item.amounts[9],
            sales_11: item.amounts[10],
            sales_12: item.amounts[11],
            is_included: "Y",
            isNewItem: true,
          });
        }

        if (fetchNewRefs == true) {
          setToUpdate((prev) => [
            ...prev,
            ...newArr.filter((item) => {
              if (
                detailData.some(
                  (sbItem) => item.item_code == sbItem.item_code
                ) == false
              ) {
                return item;
              }
            }),
          ]);

          setDetailData((prev) => [
            ...prev,
            ...newArr.filter((item) => {
              if (
                prev.some((sbItem) => item.item_code == sbItem.item_code) ==
                false
              ) {
                return item;
              }
            }),
          ]);

          setFetchNewRefs(false);
        }
      }
      setMonths(sm.months);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (mode == "CREATE" || fetchNewRefs == true) {
      loadPreviousData();
    }
  }, [
    form.values.models,
    brandName,
    form.values.year,
    form.values.month,
    fetchNewRefs,
  ]);

  const handleUpdate = (id, value, type, targetElementId) => {
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

    if (isCreate == false) {
      let tempUpdate = [...toUpdate];
      let prevIndex = tempUpdate.findIndex(
        (item) => item.item_code == arr[index].item_code
      );

      if (prevIndex >= 0) {
        tempUpdate[prevIndex].order_amount = arr[index].order_amount;
        //tempUpdate[prevIndex].price == arr[index].price;
        tempUpdate[prevIndex].actual_price = arr[index].price;
      } else {
        tempUpdate.push(arr[index]);
      }

      setToUpdate(tempUpdate);
    }

    if (!targetElementId) {
      console.log("hi");

      setTimeout(() => {
        document.getElementById(type + arr[index + 1]?.item_code)?.focus();
      }, 5);
    } else {
      setTimeout(() => {
        //document.activeElement.blur();
        console.log("hi");
        console.log(targetElementId);

        document.getElementById(targetElementId)?.focus();
      }, 5);
    }
  };

  const CustomInput = ({ index, row, initialValue, type }) => {
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
          className="form-input bg-slate-50 h-8 w-26 mr-3 mt-0 rounded-md "
          value={fieldValue}
          onBlur={(e) => {
            switch (type) {
              case "amount":
                handleUpdate(
                  row.item_code,
                  fieldValue || 0,
                  "amount",
                  e.relatedTarget.id
                );
                break;
              case "price":
                handleUpdate(
                  row.item_code,
                  fieldValue || 0,
                  "price",
                  e.relatedTarget.id
                );
                break;

              default:
                break;
            }
            //}
          }}
          onChange={(e) => {
            setFieldValue(e.target.value);
          }}
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

      arr.push({
        label: month,
        width: dt.width.amount_detail,
        dataKey: `sales_${suffix}`,
        cellRenderer: (row, dataKey) =>
          isCreate ? (
            <div data-id="detail">{row.amounts[index]}</div>
          ) : (
            <div data-id="detail">{row[`sales_${suffix}`]}</div>
          ),
      });
    });

    return showDetail ? arr.slice(12 - amountOfMonths, 12) : [];
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
    console.log(stockSummary);

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
    {
      label: "Codigo",
      width: dt.width.id,
      dataKey: "item_code",
      cellRenderer: (row) => (
        <span
          onClick={() => navigator.clipboard.writeText(row.item_code)}
          className="cursor-pointer font-medium hover:text-green-600 py-3 box-border rounded-full active:text-green-800 duration-200"
        >
          {row.item_code}
        </span>
      ),
    },
    {
      label: "Codigo anterior",
      width: dt.width.id,
      dataKey: "factory_item_code",
      cellRenderer: (row) => (
        <span
          onClick={() => navigator.clipboard.writeText(row.factory_item_code)}
          className="cursor-pointer font-medium hover:text-green-600 py-3 box-border rounded-full active:text-green-800 duration-200"
        >
          {row.factory_item_code}
        </span>
      ),
    },
    {
      label: "Description",
      width: dt.width.description,
      dataKey: isCreate ? "description" : "detail_description",
      cellRenderer: (row, dataKey) =>
        isCreate ? row.description : row.detail_description,
    },
    {
      label: "Modelo",
      width: dt.width.name,
      dataKey: "model",
      cellRenderer: (row) => (
        <span
          onClick={() => navigator.clipboard.writeText(row.model)}
          className="cursor-pointer font-medium hover:text-green-600 py-3 box-border rounded-full active:text-green-800 duration-200"
        >
          {row.model}
        </span>
      ),
    },
    {
      label: "Inventario",
      width: dt.width.amount,
      dataKey: "inv_stock",
      cellRenderer: (row) => parseFloat(row.inv_stock),
    },
    {
      label: "Tránsito",
      width: dt.width.amount,
      dataKey: "inv_transit",
      cellRenderer: (row) => parseFloat(row.inv_transit),
    },
    {
      label: "INV + TRAN",
      width: dt.width.amount,
      dataKey: isCreate ? "invTrans" : "sum_inv_trans",
      cellRenderer: (row) =>
        isCreate ? parseFloat(row.invTrans) : parseFloat(row.sum_inv_trans),
    },
  ];
  const secondDefaultCols = [
    {
      label: "Promedio venta",
      width: dt.width.amount,
      dataKey: isCreate ? "avgDemand" : "avg_demand",
      cellRenderer: (row, dataKey) =>
        Math.round(row[dataKey]) == 0
          ? parseFloat(row[dataKey])?.toFixed(2)
          : Math.round(row[dataKey]),
    },
    {
      label: "Punto reorden",
      width: dt.width.amount,
      dataKey: isCreate ? "reorderPoint" : "reorder_point",
      cellRenderer: (row, dataKey) =>
        isCreate
          ? Math.round(hadlePriceSuggestion(row).reorderPoint)
          : parseFloat(row.reorder_point).toFixed(0),
    },
    {
      label: "Sugerido",
      width: dt.width.amount,
      dataKey: isCreate ? "suggestedAmount" : "detail_suggested_amount",
      cellRenderer: (row, dataKey) =>
        isCreate
          ? Math.round(hadlePriceSuggestion(row).suggestedAmount)
          : Math.round(Number(row.detail_suggested_amount)),
    },
    {
      label: "A pedir",
      width: dt.width.input,
      dataKey: "order_amount",
      cellRenderer: (row, dataKey, rowIndex) => {
        return (
          <div data-id="order">
            <CustomInput
              index={rowIndex}
              row={row}
              type={"amount"}
              initialValue={
                row?.order_amount || hadlePriceSuggestion(row).suggestedAmount
              }
            />
          </div>
        );
      },
    },
    {
      label: "Ult. Precio compra",
      width: dt.width.price,
      dataKey: "last_purchase_price",
      cellRenderer: (row, dataKey) =>
        parseFloat(row.last_purchase_price).toFixed(2),
    },
    {
      label: "Precio",
      width: dt.width.input,
      dataKey: "price",
      cellRenderer: (row, dataKey) => (
        <CustomInput
          row={row}
          type={"price"}
          initialValue={
            parseFloat(row.price) > 0
              ? parseFloat(row.price)
              : parseFloat(row.last_purchase_price)
          }
        />
      ),
    },
    {
      label: "Total",
      width: dt.width.price,
      dataKey: isCreate ? "lineTotal" : "line_total",
      cellRenderer: (row, dataKey) => {
        let price = row.price || row.last_purchase_price;
        let amount =
          row.order_amount || hadlePriceSuggestion(row).suggestedAmount;

        return currencyFormat(parseFloat(price) * parseFloat(amount), false);
      },
    },
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

  const dtWidth = columns.reduce((acc, item) => acc + item.width + 10, 0);

  function toggleDetails() {
    setAmountOfMonths(6);
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

  const uploadPriceFile = () => {
    //uploconst test = XLSX.readFile(priceFile);
    console.log(priceFile);
    let arr;

    setIsLoading(true);
    uploadPriceFileApi({
      file: priceFile,
      filename: priceFile.name,
    })
      .then((res) => {
        if (mode == "CREATE") {
          arr = [...stockSummary];

          if (refsToZero) {
            arr.forEach((item) => {
              item.order_amount = 0;
              item.price = 0;
              item.lineTotal = 0;
            });
          }

          res.forEach((item) => {
            let index = arr.findIndex(
              (el) => el.factory_item_code == item.item_code
            );

            console.log(index);

            if (index >= 0) {
              arr[index].order_amount = item.amount;
              arr[index].price = item.price;
              arr[index].lineTotal = item.line_total;
            }
          });

          console.log(arr);

          setStockSummary(arr);
        } else {
          console.log(detailData);
          arr = [...detailData];
          let found = [];

          let wasUpdated = false;

          if (refsToZero) {
            arr.forEach((item) => {
              item.order_amount = 0;
              item.price = 0;
              item.line_total = 0;
            });
          }

          res.forEach((item) => {
            let index = arr.findIndex(
              (el) => el.factory_item_code == item.item_code
            );

            if (index >= 0) {
              arr[index].order_amount = item.amount;
              arr[index].price = item.price;
              arr[index].line_total = item.line_total;
              arr[index].actual_price = item.price;
              wasUpdated = true;
              found.push(arr[index]);
            } else {
            }
          });
          if (wasUpdated) {
            setDetailData(arr);
            console.log(found);

            setToUpdate(found);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
        setIsConfirmationOpened(false);
      });

    console.log(priceFile);
  };

  console.log(toUpdate);

  return (
    <>
      <Modal>
        <div className="">
          <h4 className="text-base font-semibold text-text-primary tracking-wide">
            {isCreate ? "NUEVO SUGERIDO" : "EDITAR SUGERIDO"}
          </h4>
          <div className="mt-4 max-sm:h-[50vh] h-[80vh] overflow-y-auto overflow-x-hidden">
            <div className="flex gap-5 max-sm:gap-0 flex-wrap">
              <div className="form-section">
                <label htmlFor="" className="form-label">
                  Marca
                </label>
                <select
                  id="brand-select"
                  className={`form-input ${isCreate ? "" : "input-disabled"}`}
                  value={form.values.brandId}
                  disabled={isCreate ? "" : true}
                  onChange={(e) => {
                    form.setFieldValue("brandId", e.target.value);
                    let currentBrand = brands.find(
                      (item) => item.U_brand_id == e.target.value
                    );
                    setBrandName(currentBrand.U_brand_code);
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
                  Modelos
                </label>
                <SearchSelect
                  customId="model-select"
                  options={
                    mode == "CREATE"
                      ? models
                      : data?.U_models?.length > 0
                      ? data?.U_models?.split(",").map((item) => ({
                          model: item,
                          selected: true,
                        }))
                      : []
                  }
                  fields={{
                    key: "model",
                    value: "model",
                    keyOnLabel: false,
                  }}
                  variant="INPUT"
                  multiple
                  defaultValue={""}
                  onChange={(item) => {
                    if (mode == "CREATE") {
                      let modelStr = item
                        ?.map((item) => item.model.replace(/'/g, ""))
                        ?.join(",");
                      console.log(data);

                      form.setFieldValue("models", modelStr);
                    }
                  }}
                />
              </div>
            </div>
            <div className="form-section">
              <label htmlFor="" className="form-label">
                Proveedor
              </label>
              <SearchSelect
                customId="provider-select"
                options={providers}
                fields={{
                  key: "CardCode",
                  value: "CardName",
                  keyOnLabel: true,
                }}
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
                    id="description"
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
                  id="currency-select"
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
                    id="year"
                    className={`form-input ${isCreate ? "" : "input-disabled"}`}
                    value={form.values.year}
                    disabled={isCreate ? "" : true}
                    onChange={(e) => form.setFieldValue("year", e.target.value)}
                    name=""
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
                    id="month"
                    className={`form-input ${isCreate ? "" : "input-disabled"}`}
                    disabled={isCreate ? "" : true}
                    value={form.values.month}
                    onChange={(e) =>
                      form.setFieldValue("month", e.target.value)
                    }
                    name=""
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
              <div className="flex gap-3 justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setFetchNewRefs(true)}
                    className="flex items-center hover:bg-slate-200 bg-light-blue  duration-200 px-3 text-dark font-medium rounded-full active:bg-slate-300"
                  >
                    <BiSync size={20} /> Cargar nuevas referencias
                  </button>
                  <div className="flex items-center">
                    {/* <BiFile size={20} />{" "} */}
                    <input
                      type="file"
                      onChange={(e) => setPriceFile(e.target.files[0])}
                      className="self-center"
                    />
                  </div>
                  <button
                    className="flex items-center hover:bg-slate-200 bg-light-blue  duration-200 px-3 text-dark font-medium rounded-full active:bg-slate-300"
                    onClick={() => setIsConfirmationOpened(true)}
                  >
                    Subir archivo
                  </button>
                  <button
                    className={` hover:bg-slate-200 bg-light-blue duration-200 px-3 text-dark font-medium rounded-full active:bg-slate-300 ${
                      showDetail ? "bg-slate-200" : ""
                    }`}
                    onClick={() => {
                      toggleDetails();
                    }}
                  >
                    {showDetail ? "Ocultar" : "Mostrar"} detalle
                  </button>
                  {showDetail && (
                    <select
                      className=" cursor-pointer hover:bg-slate-200 bg-light-blue  duration-200 px-3 text-dark font-medium rounded-full active:bg-slate-300"
                      onChange={(e) => setAmountOfMonths(e.target.value)}
                    >
                      <option value={3}>3 meses</option>
                      <option selected value={6}>
                        6 meses
                      </option>
                      <option value={12}>12 meses</option>
                    </select>
                  )}
                </div>
                <div>
                  <span className="text-dark-gray">Buscar</span>
                  <input
                    id="detail-search"
                    type="search"
                    className="ml-3 form-input w-[500px] h-10"
                    placeholder="Codigo, descripción, modelo (ej, x1, x2, xn)"
                    value={detailSearch}
                    onChange={(e) =>
                      setDetailSearch(e.target.value.toLocaleUpperCase())
                    }
                  />
                </div>
              </div>
            </div>
            <div className="form-section overflow-x-auto w-full">
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
                <AutoSizer disableHeight>
                  {({ width }) => [
                    // <span>
                    //   {dtWidth} vs {window.screen.width * 0.9}
                    // </span>,
                    <Table
                      width={Math.max(dtWidth, window.screen.width * 0.9)}
                      height={400}
                      rowHeight={45}
                      rowCount={
                        mode != "CREATE"
                          ? filterData().length
                          : filterData().length
                      }
                      rowGetter={({ index }) =>
                        mode != "CREATE"
                          ? filterData()[index]
                          : filterData()[index]
                      }
                      headerClassName="bg-black text-white"
                    >
                      {/* isCreate
          ? hadlePriceSuggestion(row).suggestedAmount
          : Number(row.detail_suggested_amount) */}
                      {columns.map((c) => (
                        <Column
                          key={c.key}
                          width={c.width}
                          label={c.label}
                          dataKey={c.dataKey}
                          headerRenderer={({ dataKey, label }) =>
                            headerRenderer(dataKey, label)
                          }
                          {...(c.cellRenderer
                            ? {
                                cellRenderer: ({
                                  rowData: row,
                                  dataKey,
                                  rowIndex,
                                }) => c.cellRenderer(row, dataKey, rowIndex),
                              }
                            : {})}
                        />
                      ))}
                    </Table>,
                  ]}
                </AutoSizer>
              ) : undefined}

              {!isLoading &&
                stockSummary.length == 0 &&
                detailData.length == 0 && (
                  <div className="w-full h-96 flex justify-center items-center">
                    <p>No se encontraron resultados</p>
                  </div>
                )}
            </div>
            <div className="form-section flex justify-between mt-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                Cantidad de referencias{" "}
                <p className="bg-slate-300 p-2 rounded-full px-4 text-center">
                  <b>
                    {mode != "CREATE"
                      ? currencyFormat(filterData().length, false, 0)
                      : currencyFormat(filterData().length, false, 0)}
                  </b>
                </p>
              </div>
              <div>
                <ul className="flex gap-2">
                  <li className="bg-slate-300 p-2 rounded-full text-center">
                    <span>A pedir </span>
                    <b className="dark-gray text-sm ">
                      {isCreate
                        ? currencyFormat(
                            stockSummary.reduce(
                              (acc, item) => acc + parseInt(item.order_amount),
                              0
                            ),
                            false,
                            0
                          )
                        : currencyFormat(
                            detailData.reduce(
                              (acc, item) => acc + parseInt(item.order_amount),
                              0
                            ),
                            false,
                            0
                          )}
                    </b>
                    <span> artículos</span>
                  </li>
                  <li className="bg-slate-300 p-2 rounded-full text-center">
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
          </div>
          <div className="pt-6 pb-3 flex justify-between gap-4">
            <Button
              title={
                <p className="font-roboto tracking-wide font-medium">
                  Cancelar
                </p>
              }
              width={240}
              height={55}
              onClick={onClose}
            />
            <div className="flex items-center gap-8">
              {!isCreate && (
                <div className="flex items-center gap-2">
                  <input
                    checked={keepUpdateOpened}
                    onChange={() => setKeepUpdateOpened((prev) => !prev)}
                    type="checkbox"
                    className="w-4 h-4"
                  />
                  <p className="text-dark-gray font-medium -mb-1">
                    {" "}
                    Mantener abierto
                  </p>
                </div>
              )}
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
                onClick={() => {
                  setDetailSearch("");
                  form.handleSubmit();
                }}
              />
            </div>
          </div>
        </div>
      </Modal>
      {isConfirmationOpened && (
        <ConfirmationModal
          desc="Estás a punto de actualizar las cantidades y precios en el MRP"
          condition="Establecer cantidades en 0 para las referencias no encontradas"
          onClose={() => {
            setIsConfirmationOpened(false);
          }}
          onSend={() => uploadPriceFile()}
          checked={refsToZero}
          onToggleCondition={() => setRefsToZero((prev) => !prev)}
        />
      )}
    </>
  );
};

export default Home;
