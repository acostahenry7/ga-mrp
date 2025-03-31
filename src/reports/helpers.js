import { jsPDF } from "jspdf";

const baseColor = "#58585a";
const baseFontSize = 6;
const subtitleFontSize = baseFontSize + 1;
const titleFontSize = baseFontSize + 2;

const docWidth = 215.9;
const docHeight = 355.6;

export const defaultX = 5;
export const defaultY = 5;

let doc;
let orientation = "landscape";

let xPosition, yPosition;
let xCol, yCol;
let wordSpacing = 2;
let pSpacing = 5;
let padding = 0;
export function initializeReport(params) {
  doc = new jsPDF({
    orientation: params?.oridentation || orientation,
    unit: params?.unit || "mm",
    format: params?.format || [docWidth, docHeight],
  });

  if (params?.orientation) {
    orientation = params.orientation;
  }

  setPostioning(5, 5);
  setColumnPosition(0, 0);
  return doc;
}

export function saveReport(fileName) {
  doc.save(fileName);
}

// export function createTitle(text, left, top, props) {
//   let color = baseColor;

//   doc.setFontSize(titleFontSize);
//   doc.setFont("helvetica", "normal", "bold");
//   doc.setTextColor(color);
//   doc.text(text, left, top, { ...props });
// }

// export function p({ type, text, props }) {
//   createText({ type, text, props }, "p");
// }
// export function span({ type, text, props }) {
//   createText({ type, text, props }, "l");
// }
// function createText({ type, text, x, y, props }, node) {
//   const stack = new Error().stack.split("\n");
//   let context = 0;

//   if (stack[3].toLowerCase().includes("header")) {
//     context = wordSpacing;
//   }

//   let color = baseColor;
//   switch (type) {
//     case "title":
//       doc.setFontSize(titleFontSize);
//       doc.setFont("helvetica", "normal", "bold");

//       break;
//     case "subtitle":
//       doc.setFontSize(subtitleFontSize);
//       doc.setFont("helvetica", "normal", "normal");
//       break;

//     default:
//       doc.setFontSize(baseFontSize);
//       doc.setFont("helvetica", "normal", "normal");
//       break;
//   }

//   doc.setTextColor(color);

//   doc.text(
//     text,
//     node == "p" ? defaultX + context : xPosition,
//     node == "p" ? yPosition + pSpacing : yPosition,
//     {
//       ...props,
//       baseline: "top",
//     }
//   );

//   //Updating cursor
//   const textWidth = doc.getTextWidth(text);
//   if (node == "p") {
//     let y = yPosition + pSpacing;
//     setPostioning(defaultX + context + textWidth + wordSpacing, y);
//   } else {
//     let x = xPosition + textWidth + wordSpacing;
//     setPostioning(x);
//   }
// }

export function createText({ type, text, x, y, props }) {
  let color = baseColor;
  let paddingTop = 0.5;
  switch (type) {
    case "title":
      doc.setFontSize(titleFontSize);
      doc.setFont("helvetica", "normal", "bold");
      paddingTop = 0;
      break;
    case "subtitle":
      doc.setFontSize(subtitleFontSize);
      doc.setFont("helvetica", "normal", "bold");
      paddingTop = 1;
      break;
    default:
      doc.setFontSize(baseFontSize);
      doc.setFont("helvetica", "normal", "normal");
      break;
  }

  doc.setTextColor(color);

  doc.text(text, x || xPosition, y || yPosition + paddingTop, {
    ...props,
    baseline: "top",
  });

  const textWidth = doc.getTextWidth(text);
  const newX = xPosition + textWidth + wordSpacing;

  setPostioning(newX);

  const newColX = xPosition + textWidth; // + wordSpacing;
  setColumnPosition(xPosition, yPosition);

  //Updating cursor
  //
  //   if (node == "p") {
  //     let y = yPosition + pSpacing;
  //     setPostioning(defaultX + context + textWidth + wordSpacing, y);
  //   } else {
  //     let x = xPosition + textWidth + wordSpacing;
  //     setPostioning(x);
  //   }
}

/**
 *
 * @param {object} params
 * @param {number} params.pos.x - The position on x
 * @param {number} params.pos.x - The position on y
 * @param {number} params.dim.width - Shape width
 * @param {number} params.dim.height - Shape Height
 * @param {boolean} params.fill - Accept true or false to fill the shape
 */
export function createRect(params) {
  doc.setFillColor(params.color || "#f0f0f0");
  doc.rect(
    params?.pos?.x ?? xPosition,
    params?.pos?.y ?? yPosition,
    params?.dim?.width ||
      (orientation == "portrait"
        ? docWidth - xPosition * 2
        : docHeight - yPosition * 2),
    params?.dim?.height || (orientation == "portrait" ? docHeight : docWidth),
    params?.fill == true ? "F" : undefined
  );

  if (params?.pos?.x) {
    setPostioning(xPosition + params.pos.x + padding);
  } else {
    setPostioning(xPosition + padding);
  }
  if (params?.pos?.y) {
    setPostioning(undefined, yPosition + params.pos.y + padding);
  } else {
    setPostioning(undefined, yPosition + padding);
  }
}

export function createLine(x, y, w) {
  if (!w) w = 50;
  doc.line(x, y, x + w, y);

  return w;
}

export function setPostioning(x, y) {
  if (x) xPosition = x;
  if (y) yPosition = y;
}

function setColumnPosition(x, y) {
  if (x) xCol = x;
  if (y) yCol = y;
}

export function hr() {
  setPostioning(defaultX + padding, yPosition + pSpacing);
}

export function addColumn() {
  setPostioning(xCol + wordSpacing);
  setContext("column");
}

export function endColumn(ctx) {
  setContext(ctx || "");
  setPostioning(defaultX + padding, yPosition + pSpacing);
}

export function setContext(ctx) {
  switch (ctx) {
    case "rect":
      padding = 2;
      break;
    case "column":
      padding = xCol - 3;
      break;
    default:
      padding = 0;
      break;
  }
}

export function getStringWidth(str) {
  return doc.getTextWidth(str);
}

/** */
