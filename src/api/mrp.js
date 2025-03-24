import { getUrlParams } from "../helpers/api";

async function getStockSummaryApi(params) {
  return fetch(
    `${process.env.REACT_APP_API}/stock-summary${getUrlParams(params)}`
  )
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);

  //schema=${params.schema}&month=${params.month}&brand=${params.brand}&year=${params.year}
}
async function getProvidersApi(params) {
  return fetch(`${process.env.REACT_APP_API}/providers${getUrlParams(params)}`)
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}
async function getCurrenciesApi(params) {
  return fetch(`${process.env.REACT_APP_API}/currencies${getUrlParams(params)}`)
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}

async function createMrpApi(data) {
  return fetch(`${process.env.REACT_APP_API}/mrp${getUrlParams()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": new Blob([data]).size.toString(), // Set content length
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}

async function updateMrpApi(params, data) {
  return fetch(`${process.env.REACT_APP_API}/mrp${getUrlParams(params)}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": new Blob([data]).size.toString(), // Set content length
    },
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}

async function getMrpApi(params) {
  return fetch(`${process.env.REACT_APP_API}/mrp${getUrlParams(params)}`)
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => {
      throw err;
    });
}

async function removeMrpApi(params) {
  return fetch(`${process.env.REACT_APP_API}/mrp${getUrlParams(params)}`, {
    method: "DELETE",
  })
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}

async function getNextMrpApi(params) {
  return fetch(`${process.env.REACT_APP_API}/mrp/next${getUrlParams(params)}`)
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}

export {
  createMrpApi,
  updateMrpApi,
  removeMrpApi,
  getMrpApi,
  getStockSummaryApi,
  getNextMrpApi,
  getProvidersApi,
  getCurrenciesApi,
};
