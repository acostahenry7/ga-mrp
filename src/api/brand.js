import { getUrlParams } from "../helpers/api";

async function createBrandApi(params, data) {
  return fetch(`${process.env.REACT_APP_API}/brand?schema=${params.schema}`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}
async function getBrandApi(params) {
  return fetch(`${process.env.REACT_APP_API}/brand${getUrlParams(params)}`)
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => {
      throw err;
    });
}

async function updateBrandApi(params, data) {
  return fetch(
    `${process.env.REACT_APP_API}/brand?schema=${params.schema}&code=${params.Code}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify(data),
    }
  )
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}

async function removeBrandApi(params) {
  return fetch(
    `${process.env.REACT_APP_API}/brand?schema=${params.schema}&code=${params.Code}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
      method: "DELETE",
    }
  )
    .then((res) => res.json())
    .then((data) => data)
    .catch((err) => err);
}

export { createBrandApi, getBrandApi, updateBrandApi, removeBrandApi };
