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
} from "./helpers";

export async function generateReport(params, data) {
  const fileName = params?.fileName || "generic.pdf";
  const doc = initializeReport();

  console.log(data);

  const printData = {
    ...data,
    detail: orderBy(
      data.detail
        .map((item) => ({
          ...item,
          invTransit:
            parseFloat(item.U_inv_stock) + parseFloat(item.U_inv_transit),
        }))
        .filter((item) => item.U_order_amount > 0),
      "U_detail_suggested_amount",
      "desc"
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

  createText({
    type: "title",
    text: `${getCompanyNameBySchema(
      params.userData.companyDB
    )} - PEDIDO SUGERIDO - ${formatDateSpanish(data.U_created_date)}`,
  });

  hr();
  createText({ type: "subtitle", text: `${data.U_description}` });
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
    createText({
      text: `${currencyFormat(data[f.field], false)}${
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
        type: "number",
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
      width: 50,
      type: "text",
    },
    {
      label: "Inventario",
      field: "U_inv_stock",
      width: columnDefaultWidth,
      type: "number",
    },
    {
      label: "Tránsito",
      field: "U_inv_transit",
      width: columnDefaultWidth,
      type: "number",
    },
    {
      label: "Inventario\nTotal",
      field: "invTransit",
      width: columnDefaultWidth - 5,
      type: "number",
    },
    ...getSalesFields(),
    {
      label: "Promedio\nde ventas",
      field: "U_avg_demand",
      width: columnDefaultWidth,
      type: "number",
    },
    {
      label: "Punto de\nreorden",
      field: "U_reorder_point",
      width: columnDefaultWidth,
      type: "number",
    },
    {
      label: "Cantatidad\nsugerida",
      field: "U_detail_suggested_amount",
      width: columnDefaultWidth,
      type: "number",
    },
    {
      label: "Cantidad\na pedir",
      field: "U_order_amount",
      width: columnDefaultWidth,
      type: "number",
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

  console.log(fields);

  let itemsCol = 4;
  const createTableHeader = () => {
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
  data.detail.map((item, index) => {
    left = defaultX;
    fields.map((field) => {
      let textValue = item[field.field];
      if (field.type === "number" && !field.field.includes("U_sales")) {
        textValue = currencyFormat(item[field.field], false);
      }

      if (
        textValue &&
        field.label == "Descripción" &&
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
          align: field.type == "number" ? "right" : "left",
        },
      });
      left += field.width;
    });

    if (top >= textLimit - 15) {
      doc.addPage();
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
