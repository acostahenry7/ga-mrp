function getCompanyNameBySchema(schema) {
  const companies = [
    { label: "Lasa Motors", value: "DB_LM" },
    { label: "Avant Auto", value: "DB_AA" },
    { label: "Gar 210", value: "DB_GA" },
    { label: "Motoplex", value: "DB_MP" },
    { label: "KTM Import", value: "DB_KI" },
    { label: "Cycle Lab", value: "DB_CL" },
    { label: "Avant Auto TEST", value: "DB_AA_TEST" },
  ];

  return companies
    .find((company) => company.value === schema)
    .label.toUpperCase();
}

export { getCompanyNameBySchema };
