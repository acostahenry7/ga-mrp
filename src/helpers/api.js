export function getUrlParams(obj = {}) {
  //Get schema param from SessionStorage

  const schema = JSON.parse(sessionStorage.getItem("SESSION"))?.userData
    .companyDB;

  obj.schema = schema;

  let params = "";

  Object.entries(obj).forEach(([key, value], index) => {
    if (index == 0) params += "?";
    params += `${key}=${value}`;
    if (index < Object.entries(obj).length - 1) params += "&";
  });

  return params;
}
