const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

function getCompanyNameBySchema(schema) {
  const companies = [
    { label: "Lasa Motors", value: "DB_LM" },
    { label: "Avant Auto", value: "DB_AA" },
    { label: "Gar 210", value: "DB_GA" },
    { label: "Motoplex", value: "DB_MP" },
    { label: "KTM Import", value: "DB_KI" },
    { label: "Cycle Lab", value: "DB_CL" },
    { label: "Avant Auto TEST", value: "DB_AA_TEST02" },
  ];

  return (
    companies
      .find((company) => company.value === schema)
      ?.label?.toUpperCase() || "INVALID SCHEMA NAME"
  );
}

function getCurrentDate() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

function formatDateSpanish(date) {
  if (date instanceof Date == false) date = new Date(date);

  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} de ${month} del ${year}`;
}

function getLabelNameByDateEntity(entity, value) {
  let result = undefined;
  switch (entity) {
    case "months":
      result = months.find((item, index) => index == value - 1).toUpperCase();
      break;

    default:
      break;
  }
  return result;
}

export function currencyFormat(input, showCurrencySign, fractionDigits) {
  if (isNaN(input)) {
    return input;
  }

  let options = {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: fractionDigits ?? 2,
  };

  if (showCurrencySign == false) {
    options.style = undefined;
    options.currency = undefined;
  }

  return new Intl.NumberFormat("es-DO", options).format(input);
}
export {
  getCompanyNameBySchema,
  getCurrentDate,
  formatDateSpanish,
  getLabelNameByDateEntity,
};
