import { orderBy } from "lodash";
import {
  currencyFormat,
  formatDateSpanish,
  getCompanyNameBySchema,
} from "../helpers/uiFormat";
import {
  createRect,
  createText,
  initializeReport,
  saveReport,
  hr,
  setPostioning,
  setContext,
  defaultX,
  defaultY,
  createLine,
  getStringWidth,
  createImg,
} from "./helpers";
import { getMrpDetailApi } from "../api/mrp";
import logo from "./images/logo";

export async function generateReport(params, data) {
  const fileName = params?.fileName || "generic.pdf";
  const doc = initializeReport();

  const detailData = await getMrpDetailApi({ mrpId: data.U_mrp_id });

  const printData = {
    ...data,
    detail: orderBy(
      detailData
        .map((item) => ({
          ...item,
          U_avg_demand: Math.round(parseFloat(item.U_avg_demand)),
          U_reorder_point: Math.round(parseFloat(item.U_reorder_point)),
          U_inv_month:
            parseFloat(item.U_avg_demand) > 0
              ? currencyFormat(
                  Math.round(
                    parseFloat(item.sum_inv_trans) /
                      parseFloat(item.U_avg_demand)
                  ) || 0,
                  false,
                  0
                )
              : 0,
          invTransit:
            parseFloat(item.U_inv_stock) + parseFloat(item.U_inv_transit),
        }))
        .filter((item) => item.U_order_amount > 0),
      "U_description",
      "asc"
    ),
  };

  generateReportHeader(params, printData);
  const { left, top } = generateSummarySection(printData);
  generateBody(printData, left, top, doc);

  saveReport(fileName);
}

function generateReportHeader(params, data) {
  setContext("rect");
  createRect({
    color: "black",
    dim: { height: 20 },
    fill: false,
  });

  createImg(logo, "png", 7, 7, 10, 10);

  createText({
    type: "title",
    text: `${getCompanyNameBySchema(
      params.userData.companyDB
    )} - PEDIDO SUGERIDO - ${formatDateSpanish(data.U_created_date)}`,
    x: 20,
    y: 9,
  });

  hr();
  createText({ type: "subtitle", text: `${data.U_description}`, x: 20, y: 13 });
  hr();
  //   createText({
  //     type: "subtitle",
  //     text: `${formatDateSpanish(data.U_created_date)}`,
  //   });

  let lineInitX = 180;
  let lineInitY = 17;
  let lineWidth = createLine(lineInitX, lineInitY);
  let spacing = 5;
  createText({ text: "Firma Gerente", x: lineInitX + 15, y: lineInitY + 2 });
  createLine(lineInitX + lineWidth + spacing, lineInitY);
  createText({
    text: "Firma Director",
    x: lineInitX + lineWidth + 15,
    y: lineInitY + 2,
  });
  createLine(lineInitX + lineWidth * 2 + spacing * 2, lineInitY);
  createText({
    text: "Firma Presidente",
    x: lineInitX + lineWidth * 2 + 20,
    y: lineInitY + 2,
  });
}

function generateSummarySection(data) {
  let left = 5;
  let top = 28;
  let pl = 2;
  let pt = 2;
  let spacing = 4;

  const fields = [
    { label: "Código Marca", field: "U_brand_code" },
    // { label: "Descripción", field: "U_description" },
    { label: "Marca", field: "brand_description" },
    { label: "Proveedor", field: "U_provider_name" },
    { label: "Leadtime", field: "U_leadtime" },
    { label: "Moneda", field: "U_currency" },
    { label: "Cantidad a pedir", field: "U_suggested_amount" },
    { label: "Costo pedido", field: "U_price_total" },
  ];

  setContext("rect");
  createRect({
    color: "#dee2e6",
    pos: { x: left, y: top },
    dim: { width: 345, height: 24 },
    fill: true,
  });

  left += 2;
  top += 2;

  let itemsCol = 4;
  fields.map((f, index) => {
    //let textWidth = getStringWidth(f.label);
    let fractionDigits = 0;
    if (data[f.field])
      createText({ type: "subtitle", text: `${f.label}`, x: left, y: top });
    if (f.label === "Costo pedido") {
      fractionDigits = 2;
    }
    createText({
      text: `${currencyFormat(data[f.field], false, fractionDigits)}${
        f.label == "Leadtime" ? " meses" : ""
      }`,
      x: left + 75,
      y: top,
      props: {
        align: "right",
      },
    });
    if (index + 1 == itemsCol) {
      left += 100 + spacing;
      top -= itemsCol * 5;
      itemsCol = 0;
    }
    top += 5;
  });

  return { left, top };
}

function generateBody(data, left, top, doc) {
  left = 5;
  top += 20;
  let spacing = 4;
  let columnDefaultWidth = 14;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const textLimit =
    doc.internal.pageSize.orientation === "landscape" ? pageWidth : pageHeight;

  const getSalesFields = () => {
    let targetFields = [];

    let monthNum = parseInt(data.U_start_month);
    for (let i = 0; i < 12; i++) {
      let month = `${i + 1}`.padStart(2, "0");
      let width = 7;
      targetFields.push({
        label: `${monthNum}`,
        field: `U_sales_${month}`,
        width: i == 11 ? width + 7 : width,
        type: "amount",
      });

      monthNum++;
      if (monthNum > 12) {
        monthNum = 1;
      }
    }

    return targetFields;
  };

  const fields = [
    { label: "No. artículo", field: "U_item_code", width: 25, type: "text" },
    // {
    //   label: "Año",
    //   field: "U_year",
    //   width: 45,
    //   type: "text",
    // },
    {
      label: "Descripción",
      field: "U_detail_description",
      width: 50,
      type: "text",
    },

    {
      label: "Modelo",
      field: "U_model",
      width: 50 - 15,
      type: "text",
    },
    {
      label: "Inventario",
      field: "U_inv_stock",
      width: columnDefaultWidth,
      type: "amount",
    },
    {
      label: "Tránsito",
      field: "U_inv_transit",
      width: columnDefaultWidth + 2,
      type: "amount",
    },

    ...getSalesFields(),
    {
      label: "Inv +\nTrans",
      field: "invTransit",
      width: columnDefaultWidth,
      type: "amount",
    },
    {
      label: "Promedio\nde ventas",
      field: "U_avg_demand",
      width: columnDefaultWidth,
      type: "amount",
    },
    {
      label: "Meses de\n inventario",
      field: "U_inv_month",
      width: columnDefaultWidth,
      type: "amount",
    },
    {
      label: "Punto de\nreorden",
      field: "U_reorder_point",
      width: columnDefaultWidth,
      type: "amount",
    },
    {
      label: "Cantatidad\nsugerida",
      field: "U_detail_suggested_amount",
      width: columnDefaultWidth,
      type: "amount",
    },
    {
      label: "Cantidad\na pedir",
      field: "U_order_amount",
      width: columnDefaultWidth,
      type: "amount",
    },
    {
      label: "Ult. Precio\ncompra",
      field: "last_purchase_price",
      width: columnDefaultWidth,
      type: "number",
    },
    {
      label: "Precio",
      field: "price",
      width: columnDefaultWidth,
      type: "number",
    },
    {
      label: "Total",
      field: "U_line_total",
      width: columnDefaultWidth,
      type: "number",
    },
  ];
  console.log(data.detail.length / 38);

  const addPageNum = (num) => {
    createText({
      text: `${num} de ${Math.round(data.detail.length / 38) + 1}`,
      x: 344,
      y: 210,
      props: { align: "right" },
    });
  };

  let itemsCol = 4;
  const createTableHeader = () => {
    createText({
      type: "subtitle",
      text: "Ventas (últimos 12 meses)",
      y: top - 5,
      x: 170,
    });
    fields.map((field, index) => {
      createText({
        type: "subtitle",
        text: field.label,
        x: left,
        y: field.label.split("\n").length > 1 ? top - 5 : top,
        props: {
          align: index > 2 ? "right" : "left",
        },
      });
      left += field.width;
    });
    top += 5;
    createLine(defaultX, top, pageWidth - defaultX * 2);
  };
  createTableHeader();
  top += 2;
  let currentPage = 1;
  addPageNum(currentPage);
  data.detail.map((item, index) => {
    left = defaultX;
    fields.map((field) => {
      let textValue = item[field.field];
      if (field.type === "number") {
        textValue = currencyFormat(item[field.field], false);
      }
      if (field.type === "amount") {
        textValue = currencyFormat(item[field.field], false, 0);
      }

      if (
        textValue &&
        (field.label == "Descripción" || field.label == "Modelo") &&
        getStringWidth(textValue.toString()) > (field.width * 72) / 100
      ) {
        let preValue = textValue || "";
        textValue = "";
        for (let c of preValue) {
          if (getStringWidth(textValue) < (field.width * 72) / 100) {
            textValue += c;
          }
        }
        textValue += "...";
      }

      createText({
        text: `${textValue}` || "",
        x: left,
        y: top,
        props: {
          align:
            field.type == "number" || field.type == "amount" ? "right" : "left",
        },
      });
      left += field.width;
    });

    if (top >= textLimit - 15) {
      doc.addPage();
      currentPage += 1;
      addPageNum(currentPage);
      top = 10;
      left = defaultX;
      createTableHeader();
      top += 2;
    } else {
      top += 5;
    }

    // createText({
    //   text: `${currencyFormat(data[f.field], false)}`,
    //   x: left + 55,
    //   y: top,
    //   props: {
    //     align: "right",
    //   },
    // });
    // if (index + 1 == itemsCol) {
    //   left += 55 + spacing;
    //   top -= itemsCol * 5;
    //   itemsCol = 0;
    // }
  });
}

//   span({ type: "title", text: "Marca: " });
//   span({ type: "title", text: data?.brand_description });
//   p({ type: "title", text: "Marca: " });
//   span({ type: "title", text: data?.brand_description });
